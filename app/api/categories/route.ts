import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { categorySchema } from "@/lib/validators/product";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const active = req.nextUrl.searchParams.get("active");
    const where = active === "true" ? { isActive: true } : {};

    const categories = await prisma.category.findMany({
      where,
      include: { _count: { select: { products: { where: { status: "ACTIVE" } } } } },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ success: true, data: categories });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0]?.message }, { status: 400 });
    }

    const slug = slugify(parsed.data.name);
    const category = await prisma.category.create({
      data: { ...parsed.data, slug },
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to create category" }, { status: 500 });
  }
}
