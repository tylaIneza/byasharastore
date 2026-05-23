"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Package, Truck, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const STATUS_STEPS = [
  { key: "PENDING",    label: "Order Placed",  icon: Clock,        color: "#94A3B8" },
  { key: "CONFIRMED",  label: "Confirmed",     icon: CheckCircle,  color: "#2563EB" },
  { key: "PROCESSING", label: "Processing",    icon: Package,      color: "#FF6B00" },
  { key: "DISPATCHED", label: "Dispatched",    icon: Truck,        color: "#7C3AED" },
  { key: "DELIVERED",  label: "Delivered",     icon: CheckCircle,  color: "#10B981" },
];

const STATUS_ORDER = ["PENDING", "CONFIRMED", "PROCESSING", "DISPATCHED", "DELIVERED"];

interface OrderResult {
  orderNumber: string;
  status: string;
  paymentMethod: string | null;
  createdAt: string;
  updatedAt: string;
  city: string;
  country: string;
  total: number;
  deliveryFee: number;
  customerName: string;
  items: { productName: string; productSku: string; quantity: number; unitPrice: number; totalPrice: number }[];
}

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get("order")?.toUpperCase() ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OrderResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const order = searchParams.get("order");
    if (order) setOrderNumber(order.toUpperCase());
  }, [searchParams]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(orderNumber.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Order not found. Please check your order number.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const currentStep = result ? STATUS_ORDER.indexOf(result.status) : -1;
  const isCancelled = result?.status === "CANCELLED";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-[#2563EB]/10 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-[#2563EB]" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Track Your Order</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Enter your order number to see the latest status
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 mb-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Order Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                placeholder="e.g. BYS-20240523-XXXX"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] font-mono text-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-[#2563EB] hover:bg-[#1d4ed8] disabled:opacity-60 text-white font-bold rounded-xl transition-colors text-sm"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {loading ? "Searching…" : "Track Order"}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl p-4 mb-6">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-4">

            {/* Status banner */}
            <div className={`rounded-2xl p-5 border ${isCancelled ? "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800" : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800"} shadow-sm`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Order</span>
                <span className="text-xs text-slate-400">{new Date(result.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-xl font-black text-[#2563EB] font-mono">{result.orderNumber}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{result.customerName} · {result.city}, {result.country}</p>
              {result.paymentMethod && (
                <p className="text-xs text-slate-400 mt-1">
                  Payment: <span className="font-semibold text-slate-600 dark:text-slate-300">{result.paymentMethod.replace("_", " ")}</span>
                </p>
              )}

              {isCancelled ? (
                <div className="flex items-center gap-2 mt-4 text-red-500">
                  <XCircle className="w-5 h-5" />
                  <span className="font-bold">Order Cancelled</span>
                </div>
              ) : (
                <div className="mt-6">
                  <div className="flex items-center justify-between relative">
                    {/* progress line */}
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-700 z-0" />
                    <div
                      className="absolute top-4 left-0 h-0.5 bg-[#2563EB] z-0 transition-all duration-700"
                      style={{ width: currentStep >= 0 ? `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` : "0%" }}
                    />

                    {STATUS_STEPS.map((step, i) => {
                      const Icon = step.icon;
                      const done = i <= currentStep;
                      const active = i === currentStep;
                      return (
                        <div key={step.key} className="flex flex-col items-center gap-2 z-10">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${done ? "shadow-md" : "bg-slate-100 dark:bg-slate-800"}`}
                            style={done ? { background: step.color } : {}}
                          >
                            <Icon className={`w-4 h-4 ${done ? "text-white" : "text-slate-400"} ${active ? "animate-pulse" : ""}`} />
                          </div>
                          <span className={`text-[10px] font-semibold text-center leading-tight ${done ? "text-slate-700 dark:text-slate-300" : "text-slate-400"}`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-4">Items Ordered</h3>
              <div className="space-y-3">
                {result.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{item.productName}</p>
                      <p className="text-xs text-slate-400">SKU: {item.productSku} · Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white flex-shrink-0">{formatCurrency(item.totalPrice)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 mt-4 pt-4 space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Delivery fee</span>
                  <span>{result.deliveryFee > 0 ? formatCurrency(result.deliveryFee) : "Free"}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white">
                  <span>Total</span>
                  <span>{formatCurrency(result.total)}</span>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-slate-400">
              Last updated: {new Date(result.updatedAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
