"use client";
import { useState, useEffect } from "react";
import { AlertTriangle, Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export default function WarehousePage() {
  const [data, setData] = useState<{ products: { id: string; name: string; sku: string; stock: number; minOrderQty: number }[]; movements: { id: string; type: string; quantity: number; previousStock: number; newStock: number; notes?: string | null; createdAt: string; product: { name: string; sku: string }; createdBy?: { name: string } | null }[]; lowStock: { id: string; name: string; sku: string; stock: number }[]; outOfStock: { id: string; name: string; sku: string; stock: number }[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ productId: "", type: "IN", quantity: 1, notes: "" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/warehouse").then((r) => r.json()).then((d) => { if (d.success) setData(d.data); }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  async function handleSubmit() {
    setSaving(true);
    await fetch("/api/warehouse", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowForm(false);
    setForm({ productId: "", type: "IN", quantity: 1, notes: "" });
    load();
    setSaving(false);
  }

  const TYPE_COLORS: Record<string, "success" | "danger" | "info" | "warning"> = {
    IN: "success", OUT: "danger", RETURN: "info", ADJUSTMENT: "warning",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Warehouse</h1>
          <p className="text-sm text-slate-500">Stock management and movements</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Stock Movement</Button>
      </div>

      {/* Alerts */}
      {data && (data.outOfStock.length > 0 || data.lowStock.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.outOfStock.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h3 className="font-bold text-red-700 dark:text-red-400 text-sm">Out of Stock ({data.outOfStock.length})</h3>
              </div>
              <ul className="space-y-1 text-sm text-red-600 dark:text-red-300">
                {data.outOfStock.map((p) => <li key={p.id}>• {p.name} <span className="text-xs text-red-400">({p.sku})</span></li>)}
              </ul>
            </div>
          )}
          {data.lowStock.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-amber-700 dark:text-amber-400 text-sm">Low Stock ({data.lowStock.length})</h3>
              </div>
              <ul className="space-y-1 text-sm text-amber-600 dark:text-amber-300">
                {data.lowStock.map((p) => <li key={p.id}>• {p.name} <span className="text-xs">({p.stock} left)</span></li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
          <h2 className="font-bold text-slate-900 dark:text-white mb-4">Record Stock Movement</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Product"
              required
              value={form.productId}
              onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
              options={[{ value: "", label: "Select product…" }, ...(data?.products.map((p) => ({ value: p.id, label: `${p.name} (Stock: ${p.stock})` })) ?? [])]}
            />
            <Select
              label="Movement Type"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              options={[{ value: "IN", label: "Stock In" }, { value: "OUT", label: "Stock Out" }, { value: "RETURN", label: "Return" }, { value: "ADJUSTMENT", label: "Adjustment" }]}
            />
            <Input label="Quantity" type="number" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) }))} />
            <div className="sm:col-span-2">
              <Textarea label="Notes (optional)" rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={saving} disabled={!form.productId}>Record Movement</Button>
          </div>
        </div>
      )}

      {/* Recent movements */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <h2 className="font-bold text-slate-900 dark:text-white p-5 border-b border-slate-100 dark:border-slate-800">Recent Stock Movements</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                {["Product", "Type", "Quantity", "Previous", "New Stock", "By", "Date"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/80">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-400">Loading…</td></tr>
              ) : data?.movements.map((m) => (
                <tr key={m.id}>
                  <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">{m.product.name}</td>
                  <td className="px-5 py-3"><Badge variant={TYPE_COLORS[m.type]}>{m.type}</Badge></td>
                  <td className="px-5 py-3 font-bold">{m.quantity}</td>
                  <td className="px-5 py-3 text-slate-400">{m.previousStock}</td>
                  <td className="px-5 py-3 font-semibold">{m.newStock}</td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{m.createdBy?.name ?? "System"}</td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{formatDate(m.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
