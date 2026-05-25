import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { productSchema } from "@/lib/validators/product";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? 12)));
    const search = searchParams.get("search") ?? "";
    const category = searchParams.get("category") ?? "";
    const status = searchParams.get("status") ?? "";
    const featured = searchParams.get("featured");
    const sort = searchParams.get("sort") ?? "newest";

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    else where.status = { not: "ARCHIVED" };
    if (featured === "true") where.featured = true;
    if (category) where.category = { slug: category };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const orderBy: Record<string, string> = {};
    if (sort === "newest") { orderBy.createdAt = "desc"; }
    else if (sort === "price_asc") { orderBy.basePrice = "asc"; }
    else if (sort === "price_desc") { orderBy.basePrice = "desc"; }
    else if (sort === "trending") { orderBy.trendingScore = "desc"; }
    else { orderBy.createdAt = "desc"; }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          pricingTiers: { orderBy: { minQty: "asc" } },
          category: true,
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    const data = products.map((p) => ({
      ...p,
      basePrice: Number(p.basePrice),
      engagementScore: Number(p.engagementScore),
      trendingScore: Number(p.trendingScore),
      pricingTiers: p.pricingTiers.map((t) => ({ ...t, price: Number(t.price) })),
    }));

    return NextResponse.json({ success: true, data, total, page, pageSize });
  } catch (err) {
    console.error("GET /api/products error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { pricingTiers, images, ...rest } = body;
    const parsed = productSchema.safeParse(rest);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0]?.message }, { status: 400 });
    }

    const slug = slugify(parsed.data.name);
    const { pricingTiers: _pt, ...productData } = parsed.data;
    const product = await prisma.product.create({
      data: {
        ...productData,
        slug,
        pricingTiers: pricingTiers?.length ? { create: pricingTiers } : undefined,
        images: images?.length ? { create: images } : undefined,
      },
      include: { images: { orderBy: { sortOrder: "asc" } }, pricingTiers: true, category: true },
    });

    try {
      await prisma.auditLog.create({
        data: {
          userId: (session.user as { id?: string }).id ?? null,
          action: "CREATE",
          entityType: "Product",
          entityId: product.id,
          changes: JSON.stringify({ name: product.name }),
        },
      });
    } catch { /* non-fatal */ }

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("POST /api/products error:", err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
