"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { Order, OrderStatus } from "@/types";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

const STATUS_FLOW: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "DISPATCHED", "DELIVERED"];

const PAYMENT_META: Record<string, { label: string; bg: string; color: string }> = {
  VISA:         { label: "Visa",         bg: "#1A1F71", color: "#fff" },
  MASTERCARD:   { label: "Mastercard",   bg: "#EB001B", color: "#fff" },
  MTN_MOMO:     { label: "MTN MoMo",    bg: "#FFCC00", color: "#000" },
  AIRTEL_MONEY: { label: "Airtel Money", bg: "#E30613", color: "#fff" },
  APPLE_PAY:    { label: "Apple Pay",   bg: "#000000", color: "#fff" },
  AFRIPAY:      { label: "Afripay",     bg: "#00A859", color: "#fff" },
};

function PaymentMethodDisplay({ method }: { method: string }) {
  const meta = PAYMENT_META[method];
  if (!meta) return <span className="text-sm font-medium text-slate-600">{method}</span>;
  return (
    <div className="h-10 px-5 rounded-xl flex items-center justify-center" style={{ background: meta.bg }}>
      <span className="font-black text-sm" style={{ color: meta.color }}>{meta.label}</span>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  useEffect(() => {
    fetch(`/api/orders/${id}`).then((r) => r.json()).then((d) => {
      if (d.success) setOrder(d.data);
    }).finally(() => setLoading(false));
  }, [id]);

  async function updateStatus(status: string) {
    setUpdating(true);
    setUpdateError("");
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder((o) => o ? { ...o, status: status as OrderStatus } : o);
      } else {
        setUpdateError(data.error ?? "Failed to update status.");
      }
    } catch {
      setUpdateError("Network error. Please try again.");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>;
  if (!order) return <div className="text-center py-16 text-slate-400">Order not found</div>;

  const currentIdx = STATUS_FLOW.indexOf(order.status as OrderStatus);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white font-mono">{order.orderNumber}</h1>
          <p className="text-sm text-slate-400">{formatDateTime(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Status Progress */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
        <h2 className="font-bold text-slate-900 dark:text-white mb-4">Order Status</h2>
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          {STATUS_FLOW.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-shrink-0">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${i <= currentIdx ? "bg-[#2563EB] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                {s}
              </div>
              {i < STATUS_FLOW.length - 1 && <div className={`w-6 h-0.5 ${i < currentIdx ? "bg-[#2563EB]" : "bg-slate-200 dark:bg-slate-700"}`} />}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {[...STATUS_FLOW, "CANCELLED"].map((s) => (
            <Button key={s} size="sm" variant={order.status === s ? "primary" : "secondary"} onClick={() => updateStatus(s)} loading={updating} disabled={order.status === s}>
              Mark {s}
            </Button>
          ))}
        </div>
        {updateError && (
          <p className="text-xs text-red-500 mt-2">{updateError}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
          <h2 className="font-bold text-slate-900 dark:text-white mb-4">Customer</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">Name</span><span className="font-medium text-slate-800 dark:text-slate-200">{order.customer?.name}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Phone</span><span className="font-medium">{order.customer?.phone}</span></div>
            {order.customer?.email && <div className="flex justify-between"><span className="text-slate-400">Email</span><span className="font-medium">{order.customer.email}</span></div>}
            <div className="flex justify-between"><span className="text-slate-400">Orders</span><span className="font-medium">{order.customer?.totalOrders}</span></div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
          <h2 className="font-bold text-slate-900 dark:text-white mb-4">Delivery</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">Country</span><span className="font-medium">{order.country}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">City</span><span className="font-medium">{order.city}</span></div>
            <div><span className="text-slate-400">Address</span><p className="font-medium mt-1">{order.deliveryAddress}</p></div>
            {order.notes && <div><span className="text-slate-400">Notes</span><p className="font-medium mt-1 italic">{order.notes}</p></div>}
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 md:col-span-2">
          <h2 className="font-bold text-slate-900 dark:text-white mb-4">Payment</h2>
          {order.paymentMethod ? (
            <div className="flex items-center gap-4">
              <PaymentMethodDisplay method={order.paymentMethod} />
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {PAYMENT_META[order.paymentMethod]?.label ?? order.paymentMethod}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Payment pending — gateway will be configured soon
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No payment method selected</p>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <h2 className="font-bold text-slate-900 dark:text-white p-6 border-b border-slate-100 dark:border-slate-800">Order Items</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              {["Product", "SKU", "Qty", "Unit Price", "Total"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/80">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-slate-300" />
                    <span className="font-medium text-slate-800 dark:text-slate-200">{item.productName}</span>
                  </div>
                </td>
                <td className="px-5 py-3 font-mono text-xs text-slate-400">{item.productSku}</td>
                <td className="px-5 py-3 font-semibold">{item.quantity}</td>
                <td className="px-5 py-3">{formatCurrency(item.unitPrice)}</td>
                <td className="px-5 py-3 font-bold text-slate-900 dark:text-white">{formatCurrency(item.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-slate-100 dark:border-slate-800">
            <tr>
              <td colSpan={4} className="px-5 py-3 text-right text-sm text-slate-500">Subtotal</td>
              <td className="px-5 py-3 font-semibold">{formatCurrency(order.subtotal)}</td>
            </tr>
            <tr>
              <td colSpan={4} className="px-5 py-3 text-right text-sm text-slate-500">Delivery</td>
              <td className="px-5 py-3 font-semibold">{formatCurrency(order.deliveryFee)}</td>
            </tr>
            <tr>
              <td colSpan={4} className="px-5 py-3 text-right font-bold text-slate-900 dark:text-white">Total</td>
              <td className="px-5 py-3 font-black text-lg text-[#2563EB]">{formatCurrency(order.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
