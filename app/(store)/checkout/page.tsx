"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Package, ArrowLeft, ShieldCheck, Smartphone, CheckCircle2, XCircle, Loader2, LocateFixed, MapPin, Phone, FileText } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useLanguageStore } from "@/store/language";
import { formatCurrency, calculateDeliveryFee, nearestBranch } from "@/lib/utils";
import { checkoutSchema, CheckoutFormData } from "@/lib/validators/order";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";

const MOBILE_MONEY_METHODS = ["MTN_MOMO", "AIRTEL_MONEY"];
type PayStep = "form" | "waiting" | "confirmed" | "failed";

export default function CheckoutPage() {
  const router = useRouter();
  const { t } = useLanguageStore();
  const { items, getSubtotal, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentError, setPaymentError] = useState(false);
  const [momoPhone, setMomoPhone] = useState("");
  const [payStep, setPayStep] = useState<PayStep>("form");
  const [payError, setPayError] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [pendingPayload, setPendingPayload] = useState<Record<string, unknown> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  async function useMyLocation() {
    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    setLocError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          setGpsCoords({ lat: latitude, lng: longitude });
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const addr = data.address ?? {};
          const street =
            [addr.road, addr.suburb, addr.neighbourhood, addr.quarter, addr.city ?? addr.town ?? addr.village]
              .filter(Boolean)
              .join(", ");
          const fullAddress = street || data.display_name?.split(",").slice(0, 4).join(", ") || "";
          if (fullAddress) setValue("address", fullAddress, { shouldValidate: true });
        } catch {
          setLocError("Location found but address lookup failed. Please check your fields.");
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) {
          // PERMISSION_DENIED
          setLocError("Location permission denied. Click the lock icon in your browser address bar to allow it.");
        } else if (err.code === 2) {
          // POSITION_UNAVAILABLE — common on desktop when system Location Services are off
          setLocError("Location unavailable. On Mac/PC, make sure Location Services are enabled in system settings for your browser.");
        } else {
          // TIMEOUT
          setLocError("Location request timed out. Check your connection and try again.");
        }
      },
      { timeout: 15000, enableHighAccuracy: false, maximumAge: 60000 }
    );
  }

  const subtotal = getSubtotal();
  const deliveryFee = calculateDeliveryFee(subtotal, "Kigali", "Rwanda", gpsCoords ?? undefined);
  const total = subtotal + deliveryFee;
  const branchInfo = gpsCoords && subtotal < 500000
    ? nearestBranch(gpsCoords.lat, gpsCoords.lng)
    : null;

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center py-24">
          <p className="text-slate-500 mb-4">Your cart is empty</p>
          <Link href="/products"><Button>Browse Products</Button></Link>
        </div>
      </div>
    );
  }

  function buildPayload(data: CheckoutFormData) {
    return {
      customer: { phone: data.phone, address: data.address, country: "Rwanda", city: "" },
      items: items.map((item) => ({ productId: item.productId, productName: item.name, productSku: item.sku, quantity: item.quantity, unitPrice: item.unitPrice, totalPrice: item.totalPrice })),
      subtotal, deliveryFee, total,
      deliveryAddress: data.address, city: "", country: "Rwanda",
      notes: data.notes || undefined,
      paymentMethod,
    };
  }

  async function placeOrder(payload: Record<string, unknown>) {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (result.success && result.data?.orderNumber) {
      clearCart();
      router.push(`/order-success/${result.data.orderNumber}`);
    } else {
      throw new Error(result.error ?? "Failed to place order");
    }
  }

  function stopPolling() {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }

  async function startPolling(refId: string, method: string, payload: Record<string, unknown>) {
    // Poll every 4 seconds for up to 3 minutes
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/status/${refId}?method=${method}`);
        const data = await res.json();
        if (data.status === "SUCCESSFUL") {
          stopPolling();
          setPayStep("confirmed");
          await placeOrder(payload);
        } else if (data.status === "FAILED") {
          stopPolling();
          setPayError("Payment was declined or cancelled. Please try again.");
          setPayStep("failed");
          setPlacing(false);
        }
      } catch { /* keep polling */ }
    }, 4000);

    // Timeout after 3 minutes
    timeoutRef.current = setTimeout(() => {
      stopPolling();
      setPayError("Payment confirmation timed out. Please try again.");
      setPayStep("failed");
      setPlacing(false);
    }, 3 * 60 * 1000);
  }

  async function onSubmit(data: CheckoutFormData) {
    if (!paymentMethod) {
      setPaymentError(true);
      document.getElementById("payment-section")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (MOBILE_MONEY_METHODS.includes(paymentMethod) && !momoPhone.trim()) {
      document.getElementById("momo-phone")?.focus();
      return;
    }
    setPaymentError(false);
    setPlacing(true);
    const payload = buildPayload(data);

    // Mobile money: initiate push first, then wait
    if (MOBILE_MONEY_METHODS.includes(paymentMethod)) {
      try {
        const res = await fetch("/api/payments/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ method: paymentMethod, phone: momoPhone, amount: total }),
        });
        const result = await res.json();
        if (!res.ok || !result.referenceId) {
          const errMsg = res.status === 503
            ? `${momoLabel} payments are not yet activated. Please choose another payment method or contact the store.`
            : (result.error ?? "Could not initiate payment. Try again.");
          setPayError(errMsg);
          setPayStep("failed");
          setPlacing(false);
          return;
        }
        setReferenceId(result.referenceId);
        setPendingPayload(payload);
        setPayStep("waiting");
        await startPolling(result.referenceId, paymentMethod, payload);
      } catch (err) {
        setPayError("Network error. Please try again.");
        setPayStep("failed");
        setPlacing(false);
      }
      return;
    }

    // Non-mobile-money: place order directly
    try {
      await placeOrder(payload);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  const isMobileMoney = MOBILE_MONEY_METHODS.includes(paymentMethod);
  const momoLabel = paymentMethod === "MTN_MOMO" ? "MTN MoMo" : "Airtel Money";

  // ── Mobile Money waiting overlay ───────────────────────────────────────────
  if (payStep === "waiting") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="w-24 h-24 rounded-full border-4 border-[#2563EB]/20 border-t-[#2563EB] animate-spin absolute inset-0" />
            <div className="w-24 h-24 flex items-center justify-center">
              <Smartphone className="w-10 h-10 text-[#2563EB]" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Check Your Phone</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-2">
            A <span className="font-bold text-slate-700 dark:text-slate-200">{momoLabel}</span> payment request has been sent to
          </p>
          <p className="text-lg font-black text-[#2563EB] mb-6">{momoPhone}</p>
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 mb-6 text-left space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-[#2563EB] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
              <span className="text-sm text-slate-700 dark:text-slate-300">A prompt will appear on your phone screen</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-[#2563EB] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
              <span className="text-sm text-slate-700 dark:text-slate-300">Enter your <strong>{momoLabel}</strong> PIN to confirm</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-[#2563EB] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
              <span className="text-sm text-slate-700 dark:text-slate-300">Your order will be placed automatically after confirmation</span>
            </div>
          </div>
          <p className="text-xs text-slate-400">Amount: <strong className="text-slate-600 dark:text-slate-300">{formatCurrency(total)}</strong></p>
          <p className="text-xs text-slate-400 mt-1">Waiting for confirmation… (expires in 3 minutes)</p>
          <button
            onClick={() => { stopPolling(); setPayStep("form"); setPlacing(false); }}
            className="mt-6 text-xs text-slate-400 hover:text-red-500 transition-colors underline"
          >
            Cancel payment
          </button>
        </div>
      </div>
    );
  }

  if (payStep === "confirmed") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center">
          <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Payment Confirmed!</h2>
          <p className="text-slate-500">Placing your order…</p>
        </div>
      </div>
    );
  }

  if (payStep === "failed") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Payment Failed</h2>
          <p className="text-slate-500 mb-6">{payError}</p>
          <Button onClick={() => { setPayStep("form"); setPayError(""); setPlacing(false); }} fullWidth>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="container-base">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/cart" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">{t.checkout.title}</h1>
            <p className="text-sm text-slate-400">Fill in your delivery details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-5">

              {/* Phone */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-[#2563EB]" />
                  </div>
                  <h2 className="font-bold text-slate-900 dark:text-white">Phone Number <span className="text-red-500">*</span></h2>
                </div>
                <input
                  type="tel"
                  placeholder="e.g. +250 788 000 000"
                  {...register("phone")}
                  className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition"
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1.5">{errors.phone.message}</p>}
              </div>

              {/* Delivery Address */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-[#FF6B00]" />
                    </div>
                    <h2 className="font-bold text-slate-900 dark:text-white">Delivery Address <span className="text-red-500">*</span></h2>
                  </div>
                  <button
                    type="button"
                    onClick={useMyLocation}
                    disabled={locating}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#2563EB]/10 text-[#2563EB] hover:bg-[#2563EB]/20 disabled:opacity-60 transition-colors"
                  >
                    {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LocateFixed className="w-3.5 h-3.5" />}
                    {locating ? "Detecting…" : "Use My Location"}
                  </button>
                </div>
                {locError && (
                  <p className="text-xs text-red-500 mb-3 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5 flex-shrink-0" /> {locError}
                  </p>
                )}
                {gpsCoords && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-1">
                    <LocateFixed className="w-3 h-3" /> Location detected — address filled below
                  </p>
                )}
                <textarea
                  rows={3}
                  placeholder="e.g. KN 4 Ave, Nyabugogo, Kigali — or describe your location clearly"
                  {...register("address")}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] resize-none transition"
                />
                {errors.address && <p className="text-xs text-red-500 mt-1.5">{errors.address.message}</p>}
              </div>

              {/* Notes */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-slate-500" />
                  </div>
                  <h2 className="font-bold text-slate-900 dark:text-white">Order Notes <span className="text-slate-400 font-normal text-sm">(optional)</span></h2>
                </div>
                <textarea
                  rows={3}
                  placeholder="Any special instructions, preferred delivery time, landmark, etc."
                  {...register("notes")}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] resize-none transition"
                />
              </div>

              {/* Payment Method */}
              <div id="payment-section" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
                  <h2 className="font-bold text-slate-900 dark:text-white">Payment Method</h2>
                  <span className="text-red-500 text-sm">*</span>
                </div>
                {paymentError && (
                  <p className="text-xs text-red-500 mb-3">Please select a payment method to continue.</p>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: "VISA",         label: "Visa",         bg: "#1A1F71", display: <span className="font-black italic text-lg tracking-tight text-white">VISA</span> },
                    { id: "MASTERCARD",   label: "Mastercard",   bg: "#fff",    display: <span className="flex items-center gap-1"><span className="w-5 h-5 rounded-full bg-[#EB001B] -mr-2 inline-block"/><span className="w-5 h-5 rounded-full bg-[#F79E1B] inline-block opacity-90"/><span className="ml-2 text-xs font-bold text-slate-700">Mastercard</span></span> },
                    { id: "MTN_MOMO",     label: "MTN MoMo",     bg: "#FFCC00", display: <span className="font-black text-sm text-black">MTN MoMo</span> },
                    { id: "AIRTEL_MONEY", label: "Airtel Money", bg: "#E30613", display: <span className="font-black text-sm text-white">Airtel Money</span> },
                    { id: "APPLE_PAY",    label: "Apple Pay",    bg: "#000",    display: <span className="flex items-center gap-1"><svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg><span className="text-white font-semibold text-sm">Pay</span></span> },
                    { id: "AFRIPAY",      label: "Afripay",      bg: "#00A859", display: <span className="font-black text-sm text-white">Afripay</span> },
                  ].map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => { setPaymentMethod(method.id); setPaymentError(false); }}
                      className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                        paymentMethod === method.id
                          ? "border-[#2563EB] shadow-md scale-[1.02]"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <div
                        className="h-10 w-full rounded-lg flex items-center justify-center px-2"
                        style={{ background: method.bg }}
                      >
                        {method.display}
                      </div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{method.label}</span>
                      {paymentMethod === method.id && (
                        <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#2563EB] flex items-center justify-center">
                          <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 fill-white"><path d="M10 3L5 8.5 2 5.5"/><path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {isMobileMoney && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      {momoLabel} Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="momo-phone"
                      type="tel"
                      value={momoPhone}
                      onChange={(e) => setMomoPhone(e.target.value)}
                      placeholder={paymentMethod === "MTN_MOMO" ? "e.g. +250 788 000 000" : "e.g. +250 738 000 000"}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm"
                      required
                    />
                    <p className="text-xs text-slate-400 mt-1.5">
                      You will receive a payment prompt on this number to confirm {formatCurrency(total)}.
                    </p>
                  </div>
                )}
                {!isMobileMoney && (
                  <p className="text-xs text-slate-400 mt-3">Payment will be processed after order confirmation.</p>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 sticky top-24">
                <h2 className="font-bold text-slate-900 dark:text-white mb-5">{t.checkout.orderSummary}</h2>

                <div className="space-y-3 max-h-[280px] overflow-y-auto mb-4">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="40px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-slate-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{item.name}</p>
                        <p className="text-xs text-slate-400">× {item.quantity}</p>
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white flex-shrink-0">
                        {formatCurrency(item.totalPrice)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>{t.cart.subtotal}</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>{t.cart.delivery}</span>
                    <span className={`font-medium ${deliveryFee === 0 ? "text-emerald-500" : ""}`}>
                      {deliveryFee === 0 ? "Free" : formatCurrency(deliveryFee)}
                    </span>
                  </div>
                  {branchInfo && deliveryFee > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-xs space-y-1">
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                        <span>Nearest branch</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{branchInfo.branch.label}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                        <span>Distance</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{branchInfo.distanceKm.toFixed(1)} km</span>
                      </div>
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                        <span>Rate</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">1,500 RWF / 10 km</span>
                      </div>
                    </div>
                  )}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-2 flex justify-between font-bold text-base text-slate-900 dark:text-white">
                    <span>{t.cart.total}</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  loading={placing}
                  className="mt-5"
                >
                  {placing ? t.checkout.placing : t.checkout.placeOrder}
                </Button>

                <Link href="/cart" className="block mt-3">
                  <Button variant="secondary" fullWidth>
                    {t.checkout.continueShopping}
                  </Button>
                </Link>

                <p className="text-xs text-slate-400 text-center mt-3">
                  By placing your order you agree to our terms of service.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
