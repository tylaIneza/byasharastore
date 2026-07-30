"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, Users } from "lucide-react";
import { Customer } from "@/types";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), ...(search && { search }) });
    const res = await fetch(`/api/customers?${params}`);
    const data = await res.json();
    if (data.success) { setCustomers(data.data); setTotal(data.total); }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Customers</h1>
        <p className="text-sm text-slate-500">{total} total customers</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or phone…"
            className="w-full pl-9 pr-3 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] dark:text-white" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              {["Customer", "Phone", "Email", "City", "Orders", "Total Spent", "Since"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/80">
            {loading ? Array.from({ length: 8 }).map((_, i) => (
              <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-5 py-3"><Skeleton className="h-4" /></td>)}</tr>
            )) : customers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {(c.name && c.name !== c.phone) ? c.name.charAt(0).toUpperCase() : "#"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {(c.name && c.name !== c.phone) ? c.name : <span className="text-slate-400 italic">No name</span>}
                      </p>
                      <p className="text-xs text-slate-400">{c.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 font-mono text-sm text-slate-700 dark:text-slate-300">{c.phone}</td>
                <td className="px-5 py-3 text-slate-400 text-xs">{c.email ?? "—"}</td>
                <td className="px-5 py-3 text-slate-500 text-xs">
                  {[c.city, c.country].filter(Boolean).join(", ") || "—"}
                </td>
                <td className="px-5 py-3 font-semibold">{c.totalOrders}</td>
                <td className="px-5 py-3 font-bold text-[#2563EB]">{formatCurrency(Number(c.totalSpent))}</td>
                <td className="px-5 py-3 text-slate-400 text-xs">{formatDate(c.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {total > 20 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-500">{customers.length} of {total}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 text-sm disabled:opacity-40">Prev</button>
              <button onClick={() => setPage(p => p + 1)} disabled={customers.length < 20} className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 text-sm disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
