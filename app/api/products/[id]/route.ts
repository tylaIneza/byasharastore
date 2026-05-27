import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { emitStoreUpdate } from "@/lib/events";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true, pricingTiers: { orderBy: { minQty: "asc" } }, category: true },
    });
    if (!product) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({
      success: true,
      data: {
        ...product,
        basePrice: Number(product.basePrice),
        pricingTiers: product.pricingTiers.map((t) => ({ ...t, price: Number(t.price) })),
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  try {
    const body = await req.json();
    const { pricingTiers, images, ...data } = body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        slug: data.name ? slugify(data.name) : undefined,
        pricingTiers: pricingTiers ? { deleteMany: {}, create: pricingTiers } : undefined,
        images: images ? { deleteMany: {}, create: images } : undefined,
      },
      include: { images: { orderBy: { sortOrder: "asc" } }, pricingTiers: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as { id?: string }).id ?? null,
        action: "UPDATE",
        entityType: "Product",
        entityId: id,
        changes: JSON.stringify(data),
      },
    });

    emitStoreUpdate("product");
    return NextResponse.json({ success: true, data: product });
  } catch (err) {
    console.error("PUT /api/products/[id] error:", err);
    return NextResponse.json({ success: false, error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  try {
    await prisma.product.update({ where: { id }, data: { status: "ARCHIVED" } });
    await prisma.auditLog.create({
      data: {
        userId: (session.user as { id?: string }).id ?? null,
        action: "DELETE",
        entityType: "Product",
        entityId: id,
        changes: JSON.stringify({ status: "ARCHIVED" }),
      },
    });
    emitStoreUpdate("product");
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("DELETE /api/products/[id] error:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
