import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalRevenue, lastMonthRevenue,
      totalOrders, lastMonthOrders,
      totalCustomers, lastMonthCustomers,
      totalProducts,
      recentOrders,
      topProducts,
      revenueByDay,
    ] = await Promise.all([
      // Revenue this month
      prisma.order.aggregate({
        where: { createdAt: { gte: startOfMonth }, status: { not: "CANCELLED" } },
        _sum: { total: true },
      }),
      // Revenue last month
      prisma.order.aggregate({
        where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }, status: { not: "CANCELLED" } },
        _sum: { total: true },
      }),
      // Orders this month
      prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.order.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
      // Customers
      prisma.customer.count(),
      prisma.customer.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
      // Products
      prisma.product.count({ where: { status: "ACTIVE" } }),
      // Recent orders
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { customer: { select: { name: true } } },
      }),
      // Top products by views
      prisma.product.findMany({
        where: { status: "ACTIVE" },
        orderBy: { trendingScore: "desc" },
        take: 5,
        select: { id: true, name: true, trendingScore: true, viewCount: true, images: { where: { isPrimary: true }, take: 1 } },
      }),
      // Revenue last 30 days grouped by day (simplified)
      prisma.order.groupBy({
        by: ["createdAt"],
        where: { createdAt: { gte: new Date(Date.now() - 30 * 86400000) }, status: { not: "CANCELLED" } },
        _sum: { total: true },
        _count: true,
      }),
    ]);

    const pctChange = (current: number, last: number) =>
      last === 0 ? 100 : ((current - last) / last) * 100;

    const currentRevenue = Number(totalRevenue._sum.total ?? 0);
    const prevRevenue = Number(lastMonthRevenue._sum.total ?? 0);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalRevenue: currentRevenue,
          totalOrders,
          totalCustomers,
          totalProducts,
          revenueChange: pctChange(currentRevenue, prevRevenue),
          ordersChange: pctChange(totalOrders, lastMonthOrders),
          customersChange: lastMonthCustomers,
        },
        recentOrders: recentOrders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          status: o.status,
          total: Number(o.total),
          customerName: o.customer?.name,
          createdAt: o.createdAt,
        })),
        topProducts: topProducts.map((p) => ({
          ...p,
          trendingScore: Number(p.trendingScore),
          image: p.images[0]?.url,
        })),
        revenueByDay: revenueByDay.map((r) => ({
          date: r.createdAt,
          revenue: Number(r._sum.total ?? 0),
          orders: r._count,
        })),
      },
    });
  } catch (err) {
    console.error("analytics error:", err);
    return NextResponse.json({ success: false, error: "Failed to load analytics" }, { status: 500 });
  }
}
