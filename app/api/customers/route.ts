import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = req.nextUrl;
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const pageSize = 20;
    const search = searchParams.get("search") ?? "";

    const where = search ? {
      OR: [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ],
    } : {};

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { totalSpent: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.customer.count({ where }),
    ]);

    const data = customers.map((c) => ({ ...c, totalSpent: Number(c.totalSpent), createdAt: c.createdAt.toISOString(), updatedAt: c.updatedAt.toISOString() }));

    return NextResponse.json({ success: true, data, total, page, pageSize });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch customers" }, { status: 500 });
  }
}
