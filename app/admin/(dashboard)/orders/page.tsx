"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Eye } from "lucide-react";
import { Order } from "@/types";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const STATUSES = ["", "PENDING", "CONFIRMED", "PROCESSING", "DISPATCHED", "DELIVERED", "CANCELLED"];

const PAYMENT_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  VISA:         { label: "Visa",         bg: "#1A1F71", color: "#fff" },
  MASTERCARD:   { label: "Mastercard",   bg: "#EB001B", color: "#fff" },
  MTN_MOMO:     { label: "MTN MoMo",    bg: "#FFCC00", color: "#000" },
  AIRTEL_MONEY: { label: "Airtel Money", bg: "#E30613", color: "#fff" },
  APPLE_PAY:    { label: "Apple Pay",   bg: "#000000", color: "#fff" },
  AFRIPAY:      { label: "Afripay",     bg: "#00A859", color: "#fff" },
};

function PaymentBadge({ method }: { method?: string | null }) {
  if (!method) return <span className="text-xs text-slate-400">—</span>;
  const p = PAYMENT_LABELS[method];
  if (!p) return <span className="text-xs text-slate-500">{method}</span>;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold whitespace-nowrap"
      style={{ background: p.bg, color: p.color }}
    >
      {p.label}
    </span>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), ...(search && { search }), ...(status && { status }) });
      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();
      if (data.success) { setOrders(data.data); setTotal(data.total); }
    } finally { setLoading(false); }
  }, [page, search, status]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Orders</h1>
          <p className="text-sm text-slate-500">{total} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search orders, customers…"
            className="w-full pl-9 pr-3 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] dark:text-white" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${status === s ? "bg-[#2563EB] text-white border-[#2563EB]" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-[#2563EB]"}`}>
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                {["Order #", "Customer", "Phone", "Items", "Total", "Payment", "Status", "Date", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/80">
              {loading ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 9 }).map((_, j) => <td key={j} className="px-5 py-3"><Skeleton className="h-4" /></td>)}</tr>
              )) : orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs font-bold text-[#2563EB]">{order.orderNumber}</td>
                  <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">{order.customer?.name}</td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{order.customer?.phone}</td>
                  <td className="px-5 py-3 text-slate-500">{order.items?.length} items</td>
                  <td className="px-5 py-3 font-bold text-slate-900 dark:text-white">{formatCurrency(order.total)}</td>
                  <td className="px-5 py-3"><PaymentBadge method={order.paymentMethod} /></td>
                  <td className="px-5 py-3"><OrderStatusBadge status={order.status} /></td>
                  <td className="px-5 py-3 text-slate-400 text-xs whitespace-nowrap">{formatDateTime(order.createdAt)}</td>
                  <td className="px-5 py-3">
                    <Link href={`/admin/orders/${order.id}`}>
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-[#2563EB] transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </Link>
                  </td>
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
