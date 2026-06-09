import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from "@/lib/mailer";
import { sendWhatsAppOrderNotification } from "@/lib/whatsapp";
import { z } from "zod";

const orderItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  productSku: z.string(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
  totalPrice: z.number().min(0),
});

const placeOrderSchema = z.object({
  customer: z.object({
    name: z.string().optional(),
    phone: z.string().min(9),
    email: z.string().email().optional(),
    country: z.string().optional().default("Rwanda"),
    city: z.string().optional().default(""),
    address: z.string(),
  }),
  items: z.array(orderItemSchema).min(1),
  subtotal: z.number().min(0),
  deliveryFee: z.number().min(0),
  total: z.number().min(0),
  deliveryAddress: z.string(),
  city: z.string().optional().default(""),
  country: z.string().optional().default("Rwanda"),
  notes: z.string().optional(),
  paymentMethod: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = placeOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const { customer, items, subtotal, deliveryFee, total, deliveryAddress, city, country, notes, paymentMethod } = parsed.data;

    // Upsert customer
    let dbCustomer = await prisma.customer.findFirst({
      where: { phone: customer.phone },
    });

    const customerName = customer.name || customer.phone;

    if (dbCustomer) {
      dbCustomer = await prisma.customer.update({
        where: { id: dbCustomer.id },
        data: {
          name: customerName,
          email: customer.email || dbCustomer.email,
          totalOrders: { increment: 1 },
          totalSpent: { increment: total },
        },
      });
    } else {
      dbCustomer = await prisma.customer.create({
        data: {
          name: customerName,
          phone: customer.phone,
          email: customer.email,
          country: customer.country ?? "Rwanda",
          city: customer.city ?? "",
          address: customer.address,
          totalOrders: 1,
          totalSpent: total,
        },
      });
    }

    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: dbCustomer.id,
        subtotal,
        deliveryFee,
        total,
        deliveryAddress,
        city,
        country,
        notes,
        paymentMethod,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            productSku: item.productSku,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        },
      },
      include: { items: true, customer: true },
    });

    // Update product stock + engagement
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
          engagementScore: { increment: 5 },
          trendingScore: { increment: 5 },
        },
      });
      await prisma.productEngagement.create({
        data: { productId: item.productId, type: "PURCHASE" },
      });
    }

    // Create admin notification
    await prisma.notification.create({
      data: {
        title: "New Order Received",
        message: `Order ${orderNumber} from ${customerName} — ${new Intl.NumberFormat("en").format(total)} RWF`,
        type: "ORDER",
        link: `/admin/orders`,
        metadata: JSON.stringify({ orderNumber, total, customerName: customer.name }),
      },
    });

    // Notify admins (email + WhatsApp) — non-fatal
    try {
      await sendAdminOrderNotification({
        orderNumber,
        customerName,
        customerPhone: customer.phone,
        items: items.map((i) => ({ productName: i.productName, quantity: i.quantity, totalPrice: i.totalPrice })),
        total,
        deliveryAddress,
        paymentMethod,
      });
    } catch (e) { console.error("Admin email error:", e); }

    try {
      await sendWhatsAppOrderNotification({
        orderNumber,
        customerName,
        customerPhone: customer.phone,
        total,
        deliveryAddress,
        itemCount: items.length,
      });
    } catch { /* non-fatal */ }

    // Send email confirmation if customer provided email
    if (customer.email) {
      try {
        await sendOrderConfirmationEmail(customer.email, customer.name ?? customer.phone, orderNumber, total);
      } catch { /* non-fatal */ }
    }

    return NextResponse.json({ success: true, data: { orderNumber, orderId: order.id } }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("POST /api/orders error:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = req.nextUrl;
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 20)));
    const status = searchParams.get("status") ?? "";
    const search = searchParams.get("search") ?? "";
    const paymentMethodFilter = searchParams.get("paymentMethod") ?? "";

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (paymentMethodFilter) where.paymentMethod = paymentMethodFilter;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { phone: { contains: search } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: true,
          items: { include: { product: { select: { name: true, images: { where: { isPrimary: true }, take: 1 } } } } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.order.count({ where }),
    ]);

    const data = orders.map((o) => ({
      ...o,
      subtotal: Number(o.subtotal),
      deliveryFee: Number(o.deliveryFee),
      total: Number(o.total),
      paymentMethod: o.paymentMethod ?? null,
      items: o.items.map((i) => ({
        ...i,
        unitPrice: Number(i.unitPrice),
        totalPrice: Number(i.totalPrice),
      })),
      customer: {
        ...o.customer,
        totalSpent: Number(o.customer.totalSpent),
      },
    }));

    return NextResponse.json({ success: true, data, total, page, pageSize });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 });
  }
}
