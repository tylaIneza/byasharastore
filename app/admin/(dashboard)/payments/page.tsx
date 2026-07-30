"use client";
import { useState, useEffect, useCallback } from "react";
import {
  ArrowDownCircle, RefreshCw, ExternalLink, Clock, CheckCircle2, XCircle,
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";

type AfriPayOrder = {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
  customer: { name: string | null; phone: string };
};

type Stats = { totalRevenue: number; orderCount: number; pendingCount: number };

const STATUS_COLORS: Record<string, string> = {
  PENDING:    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  PROCESSING: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  DELIVERED:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  CANCELLED:  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function AdminPaymentsPage() {
  const [orders, setOrders] = useState<AfriPayOrder[]>([]);
  const [stats, setStats] = useState<Stats>({ totalRevenue: 0, orderCount: 0, pendingCount: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), paymentMethod: "AFRIPAY", limit: "20" });
      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
        setTotal(data.total ?? 0);
        const allTotal = data.data.reduce((sum: number, o: AfriPayOrder) => sum + Number(o.total), 0);
        const pending = data.data.filter((o: AfriPayOrder) => o.status === "PENDING").length;
        setStats({ totalRevenue: allTotal, orderCount: data.total ?? data.data.length, pendingCount: pending });
      }
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Payments</h1>
          <p className="text-sm text-slate-500">AfriPay gateway — orders paid via AfriPay</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:border-[#2563EB] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <a
            href="https://www.afripay.africa"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#059669] text-white text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <ExternalLink className="w-4 h-4" />
            AfriPay Dashboard
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#059669] to-emerald-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <ArrowDownCircle className="w-5 h-5 opacity-80" />
            <span className="text-sm font-semibold opacity-80">Total Revenue</span>
          </div>
          <p className="text-3xl font-black">{formatCurrency(stats.totalRevenue)}</p>
          <p className="text-xs opacity-60 mt-1">AfriPay orders (this page)</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-semibold text-slate-500">Total Orders</span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.orderCount}</p>
          <p className="text-xs text-slate-400 mt-1">Paid via AfriPay</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-sm font-semibold text-slate-500">Pending</span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.pendingCount}</p>
          <p className="text-xs text-slate-400 mt-1">Awaiting processing</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-bold text-slate-900 dark:text-white">AfriPay Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                {["Order #", "Customer", "Phone", "Amount", "Status", "Date"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/80">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-5 py-3">
                          <div className="h-4 bg-slate-100 dark:bg-slate-800 animate-pulse rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                : orders.length === 0
                ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center">
                      <XCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">No AfriPay orders yet</p>
                    </td>
                  </tr>
                )
                : orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs font-bold text-[#2563EB]">{order.orderNumber}</td>
                    <td className="px-5 py-3 text-slate-700 dark:text-slate-300">{order.customer?.name ?? "—"}</td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">{order.customer?.phone}</td>
                    <td className="px-5 py-3 font-bold text-slate-900 dark:text-white">{formatCurrency(Number(order.total))}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${STATUS_COLORS[order.status] ?? STATUS_COLORS.PENDING}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-400 whitespace-nowrap">{formatDateTime(order.createdAt)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {total > 20 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-500">{orders.length} of {total}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 text-sm disabled:opacity-40">Prev</button>
              <button onClick={() => setPage(p => p + 1)} disabled={orders.length < 20} className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 text-sm disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
