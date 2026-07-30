import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const orderNumber = req.nextUrl.searchParams.get("orderNumber")?.trim().toUpperCase();
  const phone = req.nextUrl.searchParams.get("phone")?.trim();

  if (!orderNumber) {
    return NextResponse.json({ error: "Order number is required" }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: { select: { productName: true, productSku: true, quantity: true, unitPrice: true, totalPrice: true } },
        customer: { select: { name: true, phone: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify by phone if provided (optional security check)
    if (phone && order.customer.phone && !order.customer.phone.replace(/\s/g, "").includes(phone.replace(/\s/g, ""))) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      orderNumber: order.orderNumber,
      status: order.status,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      city: order.city,
      country: order.country,
      total: Number(order.total),
      deliveryFee: Number(order.deliveryFee),
      customerName: order.customer.name,
      items: order.items.map((i) => ({
        productName: i.productName,
        productSku: i.productSku,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        totalPrice: Number(i.totalPrice),
      })),
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
