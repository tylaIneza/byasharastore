import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardStats from "@/components/admin/DashboardStats";
import RevenueChart from "@/components/admin/RevenueChart";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

  const [
    totalRevenue, lastMonthRevenue,
    totalOrders, lastMonthOrders,
    totalCustomers,
    totalProducts,
    recentOrders,
    topProducts,
    dailyRevenue,
  ] = await Promise.all([
    prisma.order.aggregate({ where: { createdAt: { gte: startOfMonth }, status: { not: "CANCELLED" } }, _sum: { total: true } }),
    prisma.order.aggregate({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }, status: { not: "CANCELLED" } }, _sum: { total: true } }),
    prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.order.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
    prisma.customer.count(),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.order.findMany({
      take: 8, orderBy: { createdAt: "desc" },
      include: { customer: { select: { name: true, phone: true } }, items: { select: { quantity: true } } },
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { trendingScore: "desc" },
      take: 5,
      select: { id: true, name: true, trendingScore: true, viewCount: true, stock: true, images: { where: { isPrimary: true }, take: 1 } },
    }),
    prisma.$queryRaw`
      SELECT DATE(createdAt) as date,
             SUM(total) as revenue,
             COUNT(*) as orders
      FROM orders
      WHERE createdAt >= ${thirtyDaysAgo} AND status != 'CANCELLED'
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `,
  ]);

  const pct = (c: number, l: number) => l === 0 ? 100 : +((c - l) / l * 100).toFixed(1);
  const currentRev = Number(totalRevenue._sum.total ?? 0);
  const prevRev = Number(lastMonthRevenue._sum.total ?? 0);

  return {
    stats: {
      totalRevenue: currentRev,
      totalOrders,
      totalCustomers,
      totalProducts,
      revenueChange: pct(currentRev, prevRev),
      ordersChange: pct(totalOrders, lastMonthOrders),
      customersChange: 0,
      productsChange: 0,
    },
    recentOrders: recentOrders.map((o) => ({
      id: o.id, orderNumber: o.orderNumber, status: o.status,
      total: Number(o.total),
      customerName: o.customer?.name,
      items: o.items.reduce((a, i) => a + i.quantity, 0),
      createdAt: o.createdAt.toISOString(),
    })),
    topProducts: topProducts.map((p) => ({
      ...p, trendingScore: Number(p.trendingScore),
      image: p.images[0]?.url ?? null,
    })),
    dailyRevenue: (dailyRevenue as { date: Date; revenue: number; orders: bigint }[]).map((r) => ({
      date: r.date.toISOString().split("T")[0],
      revenue: Number(r.revenue),
      orders: Number(r.orders),
    })),
  };
}

export default async function AdminDashboard() {
  const data = await getDashboardData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Overview of your store performance this month.</p>
      </div>

      <DashboardStats stats={data.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-slate-900 dark:text-white">Revenue (Last 30 days)</h2>
          </div>
          <RevenueChart data={data.dailyRevenue} />
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-[#FF6B00]" />
            <h2 className="font-bold text-slate-900 dark:text-white">Trending Products</h2>
          </div>
          <div className="space-y-4">
            {data.topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="w-5 text-xs font-bold text-slate-400">{i + 1}</span>
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                  {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <span className="w-full h-full flex items-center justify-center text-slate-300">📦</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{p.name}</p>
                  <p className="text-[10px] text-slate-400">{p.viewCount} views</p>
                </div>
                <span className="text-xs font-bold text-[#FF6B00]">{Number(p.trendingScore).toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-bold text-slate-900 dark:text-white">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs font-semibold text-[#2563EB] flex items-center gap-1 hover:gap-2 transition-all">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                {["Order #", "Customer", "Items", "Total", "Status", "Date"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {data.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-3 font-mono text-xs font-semibold text-[#2563EB]">
                    <Link href={`/admin/orders/${order.id}`}>{order.orderNumber}</Link>
                  </td>
                  <td className="px-6 py-3 font-medium text-slate-800 dark:text-slate-200">{order.customerName}</td>
                  <td className="px-6 py-3 text-slate-500">{order.items} items</td>
                  <td className="px-6 py-3 font-bold text-slate-900 dark:text-white">{formatCurrency(order.total)}</td>
                  <td className="px-6 py-3"><OrderStatusBadge status={order.status} /></td>
                  <td className="px-6 py-3 text-slate-400 text-xs">{formatDateTime(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
