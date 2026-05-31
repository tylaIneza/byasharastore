import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type") ?? "";
  const status = searchParams.get("status") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = 20;

  const where: Record<string, unknown> = {};
  if (type === "INCOMING" || type === "OUTGOING") where.type = type;
  if (status) where.status = status;

  const [transactions, total] = await Promise.all([
    prisma.paymentTransaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.paymentTransaction.count({ where }),
  ]);

  const [totalIn, totalOut, pending] = await Promise.all([
    prisma.paymentTransaction.aggregate({ where: { type: "INCOMING", status: "Successful" }, _sum: { amount: true } }),
    prisma.paymentTransaction.aggregate({ where: { type: "OUTGOING", status: "Successful" }, _sum: { amount: true } }),
    prisma.paymentTransaction.count({ where: { status: "Pending" } }),
  ]);

  return NextResponse.json({
    success: true,
    data: transactions,
    total,
    page,
    stats: {
      totalReceived: Number(totalIn._sum.amount ?? 0),
      totalWithdrawn: Number(totalOut._sum.amount ?? 0),
      pendingCount: pending,
    },
  });
}
