import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardStats from "@/components/admin/DashboardStats";
import RevenueChart from "@/components/admin/RevenueChart";
import OrderStatusChart from "@/components/admin/OrderStatusChart";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight, TrendingUp, AlertTriangle, Clock, Plus, ShoppingBag } from "lucide-react";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalRevenue, lastMonthRevenue,
    totalOrders, lastMonthOrders,
    totalCustomers, lastMonthCustomers,
    totalProducts,
    recentOrders,
    topProducts,
    dailyRevenue,
    orderStatusCounts,
    lowStockProducts,
    allTimeRevenue,
    todayOrders,
    totalViews,
    todayViews,
    lastMonthViews,
  ] = await Promise.all([
    prisma.order.aggregate({ where: { createdAt: { gte: startOfMonth }, status: { not: "CANCELLED" } }, _sum: { total: true } }),
    prisma.order.aggregate({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }, status: { not: "CANCELLED" } }, _sum: { total: true } }),
    prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.order.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
    prisma.customer.count(),
    prisma.customer.count({ where: { createdAt: { lte: endOfLastMonth } } }),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.order.findMany({
      take: 8, orderBy: { createdAt: "desc" },
      include: { customer: { select: { name: true } }, items: { select: { quantity: true } } },
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
    prisma.order.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.product.findMany({
      where: { status: "ACTIVE", stock: { lte: 10 } },
      orderBy: { stock: "asc" },
      take: 6,
      select: { id: true, name: true, stock: true, sku: true, images: { where: { isPrimary: true }, take: 1 } },
    }),
    prisma.order.aggregate({ where: { status: { not: "CANCELLED" } }, _sum: { total: true } }),
    prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*) as count FROM page_views`,
    prisma.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*) as count FROM page_views WHERE createdAt >= ${startOfToday}`,
    prisma.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*) as count FROM page_views WHERE createdAt >= ${startOfLastMonth} AND createdAt <= ${endOfLastMonth}`,
  ]);

  const pct = (c: number, l: number) => l === 0 ? 100 : +((c - l) / l * 100).toFixed(1);
  const currentRev = Number(totalRevenue._sum.total ?? 0);
  const prevRev = Number(lastMonthRevenue._sum.total ?? 0);
  const totalViewsNum = Number((totalViews as [{ count: bigint }])[0]?.count ?? 0);
  const todayViewsNum = Number((todayViews as [{ count: bigint }])[0]?.count ?? 0);
  const lastMonthViewsNum = Number((lastMonthViews as [{ count: bigint }])[0]?.count ?? 0);

  return {
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
      totalViews: totalViewsNum,
      todayViews: todayViewsNum,
      viewsChange: pct(totalViewsNum, lastMonthViewsNum),
    },
    recentOrders: recentOrders.map((o) => ({
      id: o.id, orderNumber: o.orderNumber, status: o.status,
      total: Number(o.total),
      customerName: o.customer?.name ?? "—",
      items: o.items.reduce((a, i) => a + i.quantity, 0),
      createdAt: o.createdAt.toISOString(),
    })),
    topProducts: topProducts.map((p) => ({
      ...p,
      trendingScore: Number(p.trendingScore),
      image: p.images[0]?.url ?? null,
    })),
    dailyRevenue: (dailyRevenue as { date: Date; revenue: number; orders: bigint }[]).map((r) => ({
      date: r.date.toISOString().split("T")[0],
      revenue: Number(r.revenue),
      orders: Number(r.orders),
    })),
    orderStatusCounts: orderStatusCounts.map((s) => ({ status: s.status, count: s._count.id })),
    lowStockProducts: lowStockProducts.map((p) => ({ ...p, image: p.images[0]?.url ?? null })),
  };
}

export default async function AdminDashboard() {
  const [session, data] = await Promise.all([auth(), getDashboardData()]);

  const adminName = session?.user?.name?.split(" ")[0] ?? "Admin";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const pendingCount = data.orderStatusCounts.find((s) => s.status === "PENDING")?.count ?? 0;

  return (
    <div className="space-y-7">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {greeting}, {adminName} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {new Date().toLocaleDateString("en", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {pendingCount > 0 && (
            <Link
              href="/admin/orders?status=PENDING"
              className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-xl text-sm font-semibold border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
            >
              <Clock className="w-4 h-4" />
              {pendingCount} pending {pendingCount === 1 ? "order" : "orders"}
            </Link>
          )}
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-semibold hover:bg-[#1D4ED8] transition-colors shadow-sm shadow-blue-200 dark:shadow-none"
          >
            <Plus className="w-4 h-4" />
            New Product
          </Link>
        </div>
      </div>

      {/* Stats */}
      <DashboardStats stats={data.stats} />

      {/* Revenue Chart + Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">Revenue Overview</h2>
              <p className="text-xs text-slate-400 mt-0.5">Last 30 days</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#2563EB] rounded-full inline-block" />
                Revenue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#10B981] rounded-full inline-block" />
                Orders
              </span>
            </div>
          </div>
          <RevenueChart data={data.dailyRevenue} />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">Order Status</h2>
              <p className="text-xs text-slate-400 mt-0.5">All time breakdown</p>
            </div>
            <Link href="/admin/orders" className="text-xs font-semibold text-[#2563EB] hover:underline">View all</Link>
          </div>
          <OrderStatusChart data={data.orderStatusCounts} />
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5 text-[#2563EB]" />
            </div>
            <h2 className="font-bold text-slate-900 dark:text-white">Recent Orders</h2>
          </div>
          <Link href="/admin/orders" className="text-xs font-semibold text-[#2563EB] flex items-center gap-1 hover:gap-2 transition-all">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                {["Order #", "Customer", "Items", "Total", "Status", "Date"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {data.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">No orders yet</td>
                </tr>
              ) : data.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-3.5 font-mono text-xs font-bold text-[#2563EB]">
                    <Link href={`/admin/orders/${order.id}`} className="hover:underline">{order.orderNumber}</Link>
                  </td>
                  <td className="px-6 py-3.5 font-medium text-slate-800 dark:text-slate-200">{order.customerName}</td>
                  <td className="px-6 py-3.5 text-slate-500 text-xs">{order.items} item{order.items !== 1 ? "s" : ""}</td>
                  <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white">{formatCurrency(order.total)}</td>
                  <td className="px-6 py-3.5"><OrderStatusBadge status={order.status} /></td>
                  <td className="px-6 py-3.5 text-slate-400 text-xs whitespace-nowrap">{formatDateTime(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trending + Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Trending Products */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#FF6B00]" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">Trending Products</h2>
              <p className="text-xs text-slate-400">By trending score</p>
            </div>
          </div>

          {data.topProducts.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No trending products yet</p>
          ) : (
            <div className="space-y-2">
              {data.topProducts.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/admin/products/${p.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                    i === 0 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                    i === 1 ? "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300" :
                    i === 2 ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" :
                    "bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                  }`}>{i + 1}</span>
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                    {p.image
                      ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-[#2563EB] transition-colors">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.viewCount.toLocaleString()} views · {p.stock} in stock</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-black text-[#FF6B00]">{Number(p.trendingScore).toFixed(0)}</p>
                    <p className="text-[10px] text-slate-400">score</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">Low Stock Alerts</h2>
                <p className="text-xs text-slate-400">Products with ≤ 10 units</p>
              </div>
            </div>
            <Link href="/admin/products" className="text-xs font-semibold text-[#2563EB] hover:underline">View all</Link>
          </div>

          {data.lowStockProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-slate-400">
              <span className="text-3xl">✅</span>
              <p className="text-sm font-medium">All products are well stocked</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.lowStockProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/products/${p.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                    {p.image
                      ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-[#2563EB] transition-colors">{p.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{p.sku}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex-shrink-0 ${
                    p.stock === 0
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : p.stock <= 5
                        ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}>
                    {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
