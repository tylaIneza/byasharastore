"use client";
import { useEffect, useState } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import DashboardStats from "@/components/admin/DashboardStats";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { TrendingUp, Eye, ShoppingCart, BarChart2, Calendar } from "lucide-react";

interface AnalyticsData {
  stats: {
    totalRevenue: number; totalOrders: number; totalCustomers: number; totalProducts: number;
    revenueChange: number; ordersChange: number; customersChange: number; productsChange: number;
    allTimeRevenue: number; todayOrders: number; totalViews: number; todayViews: number; viewsChange: number;
  };
  topProducts: { id: string; name: string; trendingScore: number; viewCount: number; image?: string | null }[];
  revenueByDay: { date: string; revenue: number; orders: number }[];
  revenueByMonth: { month: string; revenue: number; orders: number }[];
  ordersByStatus: { status: string; count: number }[];
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: "#F59E0B", CONFIRMED: "#3B82F6", PROCESSING: "#8B5CF6",
  DISPATCHED: "#06B6D4", DELIVERED: "#10B981", CANCELLED: "#EF4444",
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-xl text-xs space-y-1 min-w-[140px]">
      <p className="text-slate-400 border-b border-slate-100 dark:border-slate-700 pb-1 mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex justify-between gap-4">
          <span className="text-slate-500 capitalize">{p.name}:</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {p.name === "revenue" ? formatCurrency(p.value) : formatNumber(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"daily" | "monthly">("daily");

  useEffect(() => {
    fetch("/api/analytics").then((r) => r.json()).then((d) => {
      if (d.success) setData(d.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-5">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-40 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      ))}
    </div>
  );
  if (!data) return <p className="text-red-500 py-8 text-center">Failed to load analytics.</p>;

  const chartData = tab === "daily" ? data.revenueByDay : data.revenueByMonth;
  const totalOrders = data.ordersByStatus.reduce((a, s) => a + s.count, 0);
  const conversionRate = data.stats.totalViews > 0
    ? ((data.stats.totalOrders / data.stats.totalViews) * 100).toFixed(2)
    : "0.00";

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Store performance overview</p>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats stats={data.stats} />

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Eye,          label: "Total Visits",       value: formatNumber(data.stats.totalViews),    sub: `${formatNumber(data.stats.todayViews)} today`,       color: "text-pink-500",    bg: "bg-pink-50 dark:bg-pink-900/20" },
          { icon: ShoppingCart, label: "Conversion Rate",    value: `${conversionRate}%`,                   sub: "visits → orders",                                    color: "text-[#2563EB]",   bg: "bg-blue-50 dark:bg-blue-900/20" },
          { icon: BarChart2,    label: "Avg. Order Value",   value: data.stats.totalOrders > 0 ? formatCurrency(data.stats.allTimeRevenue / data.stats.totalOrders) : "—", sub: "all time",          color: "text-purple-500",  bg: "bg-purple-50 dark:bg-purple-900/20" },
          { icon: Calendar,     label: "Orders Today",       value: formatNumber(data.stats.todayOrders),   sub: `${formatNumber(data.stats.totalOrders)} this month`,  color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
            <div className={`w-9 h-9 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <p className={`text-xl font-black ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{kpi.label}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">Revenue Overview</h2>
            <p className="text-xs text-slate-400 mt-0.5">{tab === "daily" ? "Last 30 days" : "Last 6 months"}</p>
          </div>
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            {(["daily", "monthly"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  tab === t ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t === "daily" ? "Daily" : "Monthly"}
              </button>
            ))}
          </div>
        </div>
        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400 text-sm">No revenue data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
              <XAxis
                dataKey={tab === "daily" ? "date" : "month"}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false} tickLine={false}
                interval="preserveStartEnd"
                tickFormatter={(v) => tab === "daily"
                  ? new Date(v).toLocaleDateString("en", { day: "numeric", month: "short" })
                  : new Date(v + "-01").toLocaleDateString("en", { month: "short", year: "2-digit" })
                }
              />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={55}
                tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5}
                fill="url(#revGrad)" dot={false}
                activeDot={{ r: 5, fill: "#2563EB", stroke: "white", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Orders by Status + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Order Status Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="font-bold text-slate-900 dark:text-white mb-5">Orders by Status</h2>
          {data.ordersByStatus.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">No orders yet</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data.ordersByStatus.map((s) => ({ name: s.status.charAt(0) + s.status.slice(1).toLowerCase(), count: s.count, color: STATUS_COLOR[s.status] ?? "#94a3b8" }))} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {data.ordersByStatus.map((s) => (
                      <Cell key={s.status} fill={STATUS_COLOR[s.status] ?? "#94a3b8"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {data.ordersByStatus.map((s) => (
                  <div key={s.status} className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLOR[s.status] ?? "#94a3b8" }} />
                      <span className="text-xs text-slate-600 dark:text-slate-400">{s.status.charAt(0) + s.status.slice(1).toLowerCase()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{s.count}</span>
                      <span className="text-[10px] text-slate-400">{totalOrders > 0 ? Math.round((s.count / totalOrders) * 100) : 0}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-[#FF6B00]" />
            <h2 className="font-bold text-slate-900 dark:text-white">Trending Products</h2>
          </div>
          {data.topProducts.length === 0 ? (
            <p className="text-slate-400 text-sm py-8 text-center">No products yet</p>
          ) : (
            <div className="space-y-3">
              {data.topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                    i === 0 ? "bg-yellow-100 text-yellow-700" : i === 1 ? "bg-slate-100 text-slate-600" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-slate-50 text-slate-400"
                  }`}>{i + 1}</span>
                  {p.image
                    ? <img src={p.image} alt={p.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                    : <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm flex-shrink-0">📦</div>}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{p.name}</p>
                    <p className="text-xs text-slate-400">{formatNumber(p.viewCount)} views</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-black text-[#FF6B00]">{Number(p.trendingScore).toFixed(0)}</p>
                    <p className="text-[10px] text-slate-400">score</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Daily breakdown table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-bold text-slate-900 dark:text-white">Daily Revenue Breakdown</h2>
          <p className="text-xs text-slate-400 mt-0.5">Last 30 days</p>
        </div>
        {data.revenueByDay.length === 0 ? (
          <p className="text-slate-400 text-sm py-12 text-center">No revenue data yet</p>
        ) : (
          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800">
                <tr>
                  {["Date", "Revenue", "Orders", "Avg. Order Value"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {[...data.revenueByDay].reverse().map((row) => (
                  <tr key={row.date} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3 text-slate-700 dark:text-slate-300 font-medium">
                      {new Date(row.date).toLocaleDateString("en", { weekday: "short", day: "numeric", month: "short" })}
                    </td>
                    <td className="px-5 py-3 font-bold text-slate-900 dark:text-white">{formatCurrency(row.revenue)}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{row.orders}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{row.orders > 0 ? formatCurrency(row.revenue / row.orders) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
