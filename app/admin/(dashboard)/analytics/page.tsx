"use client";
import { useEffect, useState } from "react";
import RevenueChart from "@/components/admin/RevenueChart";
import DashboardStats from "@/components/admin/DashboardStats";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
  const [data, setData] = useState<{ stats: { totalRevenue: number; totalOrders: number; totalCustomers: number; totalProducts: number; revenueChange: number; ordersChange: number; customersChange: number; productsChange: number }; revenueByDay: { date: string; revenue: number; orders: number }[]; topProducts: { id: string; name: string; trendingScore: number; viewCount: number; image?: string }[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics").then((r) => r.json()).then((d) => {
      if (d.success) setData(d.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-slate-400 py-12 text-center">Loading analytics…</div>;
  if (!data) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-slate-500">Store performance overview</p>
      </div>

      <DashboardStats stats={data.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
          <h2 className="font-bold text-slate-900 dark:text-white mb-6">Revenue — Last 30 Days</h2>
          <RevenueChart data={data.revenueByDay} />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-[#FF6B00]" />
            <h2 className="font-bold text-slate-900 dark:text-white">Trending Products</h2>
          </div>
          <div className="space-y-4">
            {data.topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="w-5 text-xs font-bold text-slate-400">{i + 1}</span>
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                ) : <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs">📦</div>}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{p.name}</p>
                  <p className="text-[10px] text-slate-400">{formatNumber(p.viewCount)} views</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-[#FF6B00]">{Number(p.trendingScore).toFixed(0)}</p>
                  <p className="text-[10px] text-slate-400">score</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue summary table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <h2 className="font-bold text-slate-900 dark:text-white p-5 border-b border-slate-100 dark:border-slate-800">Daily Revenue Breakdown</h2>
        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white dark:bg-slate-900">
              <tr className="border-b border-slate-100 dark:border-slate-800">
                {["Date", "Revenue", "Orders", "Avg. Order Value"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/80">
              {[...data.revenueByDay].reverse().map((row) => (
                <tr key={row.date} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-3 text-slate-700 dark:text-slate-300">{row.date}</td>
                  <td className="px-5 py-3 font-bold text-slate-900 dark:text-white">{formatCurrency(row.revenue)}</td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{row.orders}</td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{row.orders > 0 ? formatCurrency(row.revenue / row.orders) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
