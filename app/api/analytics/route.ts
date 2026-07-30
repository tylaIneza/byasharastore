import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const now = new Date();
    const startOfMonth    = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth   = new Date(now.getFullYear(), now.getMonth(), 0);
    const thirtyDaysAgo   = new Date(Date.now() - 30 * 86400000);
    const startOfToday    = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalRevenue, lastMonthRevenue,
      totalOrders, lastMonthOrders,
      totalCustomers, lastMonthCustomers,
      totalProducts,
      topProducts,
      revenueByDay,
      allTimeRevenue,
      todayOrders,
      totalViews,
      todayViews,
      lastMonthViews,
      ordersByStatus,
      revenueByMonth,
    ] = await Promise.all([
      prisma.order.aggregate({ where: { createdAt: { gte: startOfMonth }, status: { not: "CANCELLED" } }, _sum: { total: true } }),
      prisma.order.aggregate({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }, status: { not: "CANCELLED" } }, _sum: { total: true } }),
      prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.order.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
      prisma.customer.count(),
      prisma.customer.count({ where: { createdAt: { lte: endOfLastMonth } } }),
      prisma.product.count({ where: { status: "ACTIVE" } }),
      prisma.product.findMany({
        where: { status: "ACTIVE" },
        orderBy: { trendingScore: "desc" },
        take: 5,
        select: { id: true, name: true, trendingScore: true, viewCount: true, images: { where: { isPrimary: true }, take: 1 } },
      }),
      // Daily revenue — grouped by date using raw SQL
      prisma.$queryRaw<{ date: Date; revenue: number; orders: bigint }[]>`
        SELECT DATE(createdAt) as date,
               SUM(total)      as revenue,
               COUNT(*)        as orders
        FROM orders
        WHERE createdAt >= ${thirtyDaysAgo} AND status != 'CANCELLED'
        GROUP BY DATE(createdAt)
        ORDER BY date ASC
      `,
      prisma.order.aggregate({ where: { status: { not: "CANCELLED" } }, _sum: { total: true } }),
      prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*) as count FROM page_views`,
      prisma.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*) as count FROM page_views WHERE createdAt >= ${startOfToday}`,
      prisma.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*) as count FROM page_views WHERE createdAt >= ${startOfLastMonth} AND createdAt <= ${endOfLastMonth}`,
      prisma.order.groupBy({ by: ["status"], _count: { id: true } }),
      // Revenue by month — last 6 months
      prisma.$queryRaw<{ month: string; revenue: number; orders: bigint }[]>`
        SELECT DATE_FORMAT(createdAt, '%Y-%m') as month,
               SUM(total)                      as revenue,
               COUNT(*)                        as orders
        FROM orders
        WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH) AND status != 'CANCELLED'
        GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
        ORDER BY month ASC
      `,
    ]);

    const pct = (c: number, l: number) => l === 0 ? 100 : +((c - l) / l * 100).toFixed(1);
    const currentRev  = Number(totalRevenue._sum.total ?? 0);
    const prevRev     = Number(lastMonthRevenue._sum.total ?? 0);
    const totalViewsN = Number((totalViews as [{ count: bigint }])[0]?.count ?? 0);
    const todayViewsN = Number((todayViews as [{ count: bigint }])[0]?.count ?? 0);
    const lastMonthViewsN = Number((lastMonthViews as [{ count: bigint }])[0]?.count ?? 0);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalRevenue: currentRev,
          totalOrders,
          totalCustomers,
          totalProducts,
          revenueChange: pct(currentRev, prevRev),
          ordersChange: pct(totalOrders, lastMonthOrders),
          customersChange: pct(totalCustomers, lastMonthCustomers),
          productsChange: 0,
          allTimeRevenue: Number(allTimeRevenue._sum.total ?? 0),
          todayOrders,
          totalViews: totalViewsN,
          todayViews: todayViewsN,
          viewsChange: pct(totalViewsN, lastMonthViewsN),
        },
        topProducts: topProducts.map((p) => ({
          ...p,
          trendingScore: Number(p.trendingScore),
          image: p.images[0]?.url ?? null,
        })),
        revenueByDay: (revenueByDay as { date: Date; revenue: number; orders: bigint }[]).map((r) => ({
          date: r.date.toISOString().split("T")[0],
          revenue: Number(r.revenue),
          orders: Number(r.orders),
        })),
        revenueByMonth: (revenueByMonth as { month: string; revenue: number; orders: bigint }[]).map((r) => ({
          month: r.month,
          revenue: Number(r.revenue),
          orders: Number(r.orders),
        })),
        ordersByStatus: ordersByStatus.map((s) => ({ status: s.status, count: s._count.id })),
      },
    });
  } catch (err) {
    console.error("analytics error:", err);
    return NextResponse.json({ success: false, error: "Failed to load analytics" }, { status: 500 });
  }
}
