import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const [products, movements] = await Promise.all([
      prisma.product.findMany({
        where: { status: "ACTIVE" },
        select: {
          id: true, name: true, sku: true, stock: true, minOrderQty: true,
          images: { where: { isPrimary: true }, take: 1 },
        },
        orderBy: { stock: "asc" },
      }),
      prisma.stockMovement.findMany({
        orderBy: { createdAt: "desc" },
        take: 30,
        include: {
          product: { select: { name: true, sku: true } },
          createdBy: { select: { name: true } },
        },
      }),
    ]);

    const lowStock = products.filter((p) => p.stock <= p.minOrderQty * 3 && p.stock > 0);
    const outOfStock = products.filter((p) => p.stock === 0);

    return NextResponse.json({
      success: true,
      data: {
        products,
        movements: movements.map((m) => ({ ...m, product: m.product, createdBy: m.createdBy })),
        lowStock,
        outOfStock,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch warehouse data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { productId, type, quantity, notes } = await req.json();
    if (!productId || !type || !quantity) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });

    const previous = product.stock;
    let newStock = previous;
    if (type === "IN" || type === "RETURN") newStock += Number(quantity);
    else if (type === "OUT") newStock = Math.max(0, previous - Number(quantity));
    else if (type === "ADJUSTMENT") newStock = Number(quantity);

    await prisma.product.update({ where: { id: productId }, data: { stock: newStock } });
    const movement = await prisma.stockMovement.create({
      data: {
        productId,
        type,
        quantity: Number(quantity),
        previousStock: previous,
        newStock,
        notes,
        createdById: session.user.id,
      },
    });

    // Low stock notification
    if (newStock <= product.minOrderQty * 3 && newStock > 0) {
      await prisma.notification.create({
        data: {
          title: "Low Stock Alert",
          message: `${product.name} is running low — only ${newStock} units left.`,
          type: "STOCK",
          link: "/admin/warehouse",
        },
      });
    }

    return NextResponse.json({ success: true, data: movement }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update stock" }, { status: 500 });
  }
}
