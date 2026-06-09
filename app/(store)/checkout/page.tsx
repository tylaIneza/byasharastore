"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Package, ArrowLeft, ShieldCheck, XCircle, Loader2, LocateFixed, MapPin, Phone, FileText, User } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useLanguageStore } from "@/store/language";
import { formatCurrency, calculateDeliveryFee, FREE_DELIVERY_THRESHOLD } from "@/lib/utils";
import { checkoutSchema, CheckoutFormData } from "@/lib/validators/order";
import { Button } from "@/components/ui/Button";

const AFRIPAY_APP_ID = "865691b289bec1a27490b54ff14e37a4";
const AFRIPAY_APP_SECRET = "JDJ5JDEwJHF5ay5K";
const AFRIPAY_CHECKOUT_URL = "https://www.afripay.africa/checkout/index.php";

// Keywords → city key (must match keys in CITY_CENTERS)
const ADDRESS_CITY_KEYWORDS: Record<string, string> = {
  // Kigali districts / sectors
  kigali: "kigali", nyabugogo: "kigali", kimironko: "kigali",
  remera: "kigali", kicukiro: "kigali", gasabo: "kigali",
  nyarugenge: "kigali", gisozi: "kigali", kibagabaga: "kigali",
  gikondo: "kigali", kanombe: "kigali", kabeza: "kigali",
  // Rwanda cities
  musanze: "musanze", ruhengeri: "musanze",
  rubavu: "rubavu", gisenyi: "rubavu",
  huye: "huye", butare: "huye",
  nyagatare: "nyagatare",
  muhanga: "muhanga", gitarama: "muhanga",
  // DRC
  goma: "goma", bukavu: "bukavu",
  butembo: "butembo", kinshasa: "kinshasa", lubumbashi: "lubumbashi",
};

function detectCityFromAddress(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [kw, city] of Object.entries(ADDRESS_CITY_KEYWORDS)) {
    if (lower.includes(kw)) return city;
  }
  return null;
}

export default function CheckoutPage() {
  const { t } = useLanguageStore();
  const { items, getSubtotal } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationDetails, setLocationDetails] = useState<{
    district?: string; sector?: string; cell?: string; city?: string; road?: string; country?: string;
  } | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const addressValue = watch("address") || "";
  const cityFromText = detectCityFromAddress(addressValue);

  async function useMyLocation() {
    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    setLocError("");
    setLocationDetails(null);
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

          // Extract Rwanda / DRC administrative divisions
          const district = (addr.county || addr.state_district || "")
            .replace(/\s*district\s*/gi, "").trim();
          const sector   = addr.suburb || addr.quarter || addr.borough || "";
          const cell     = addr.neighbourhood || addr.village || "";
          const city     = addr.city || addr.town || addr.municipality || "";
          const road     = addr.road || addr.pedestrian || addr.path || "";
          const country  = addr.country_code?.toUpperCase() || "RW";

          setLocationDetails({ district, sector, cell, city, road, country });

          // Build full address string from all available parts
          const parts = [road, cell, sector, district, city].filter(Boolean);
          const fullAddress = parts.join(", ") || data.display_name?.split(",").slice(0, 4).join(", ") || "";
          if (fullAddress) setValue("address", fullAddress, { shouldValidate: true });
        } catch {
          setLocError("Location found but address lookup failed. Please enter your address manually.");
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) {
          setLocError("Location permission denied. Click the lock icon in your browser address bar to allow it.");
        } else if (err.code === 2) {
          setLocError("Location unavailable. On Mac/PC, make sure Location Services are enabled in system settings for your browser.");
        } else {
          setLocError("Location request timed out. Check your connection and try again.");
        }
      },
      { timeout: 15000, enableHighAccuracy: true, maximumAge: 30000 }
    );
  }

  const subtotal = getSubtotal();
  const effectiveCity = locationDetails?.city || cityFromText || "";
  const deliveryFee = calculateDeliveryFee(subtotal, effectiveCity || "Kigali", "Rwanda", gpsCoords ?? undefined);
  const total = subtotal + deliveryFee;
  const showFeeCard = subtotal < FREE_DELIVERY_THRESHOLD;

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
    const city = locationDetails?.city || cityFromText || "";
    const country = locationDetails?.country === "CD" ? "DRC" : "Rwanda";
    return {
      customer: {
        name: data.name?.trim() || undefined,
        phone: data.phone,
        address: data.address,
        country,
        city,
      },
      items: items.map((item) => ({ productId: item.productId, productName: item.name, productSku: item.sku, quantity: item.quantity, unitPrice: item.unitPrice, totalPrice: item.totalPrice })),
      subtotal, deliveryFee, total,
      deliveryAddress: data.address, city, country,
      notes: data.notes || undefined,
      paymentMethod: "AFRIPAY",
    };
  }

  function submitToAfriPay(orderNumber: string, amount: number) {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = AFRIPAY_CHECKOUT_URL;
    const fields: Record<string, string> = {
      amount: String(Math.round(amount)),
      currency: "RWF",
      comment: orderNumber,
      client_token: "",
      return_url: `${window.location.origin}/order-success/${orderNumber}`,
      app_id: AFRIPAY_APP_ID,
      app_secret: AFRIPAY_APP_SECRET,
    };
    for (const [name, value] of Object.entries(fields)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
  }

  async function onSubmit(data: CheckoutFormData) {
    setPlacing(true);
    const payload = buildPayload(data);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!result.success || !result.data?.orderNumber) {
        throw new Error(result.error ?? "Failed to place order");
      }
      setRedirecting(true);
      submitToAfriPay(result.data.orderNumber, total);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to place order. Please try again.");
      setPlacing(false);
    }
  }

  if (redirecting) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#059669]/10 flex items-center justify-center mx-auto mb-5">
            <Loader2 className="w-8 h-8 text-[#059669] animate-spin" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Redirecting to AfriPay…</h2>
          <p className="text-sm text-slate-500">You will be taken to AfriPay to complete your payment.<br/>Do not close this tab.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 py-8 px-4">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-7">
          <Link href="/cart" className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">{t.checkout.title}</h1>
            <p className="text-sm text-slate-400">{items.length} item{items.length !== 1 ? "s" : ""} · {formatCurrency(total)}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* ── Order Summary ───────────────────────────────── */}
          <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
            {/* Gradient banner */}
            <div className="bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-200 uppercase tracking-widest mb-0.5">{t.checkout.orderSummary}</p>
                <p className="text-2xl font-black text-white">{formatCurrency(total)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-200">{items.length} item{items.length !== 1 ? "s" : ""}</p>
                {deliveryFee === 0
                  ? <p className="text-xs font-bold text-emerald-300 mt-0.5">Free delivery</p>
                  : <p className="text-xs text-blue-200 mt-0.5">+{formatCurrency(deliveryFee)} delivery</p>}
              </div>
            </div>

            {/* Items */}
            <div className="bg-white dark:bg-slate-900 px-5 pt-4 pb-2 space-y-3 max-h-52 overflow-y-auto">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    {item.image
                      ? <Image src={item.image} alt={item.name} fill className="object-cover" sizes="44px" />
                      : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-slate-300" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{item.name}</p>
                    <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white flex-shrink-0">{formatCurrency(item.totalPrice)}</p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-5 py-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>{t.cart.subtotal}</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>{t.cart.delivery}</span>
                <span className={`font-medium ${deliveryFee === 0 ? "text-emerald-500" : "text-slate-700 dark:text-slate-300"}`}>
                  {deliveryFee === 0 ? "Free" : formatCurrency(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between font-black text-base pt-1 border-t border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white">
                <span>{t.cart.total}</span>
                <span className="text-[#2563EB]">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* ── Full Name ──────────────────────────────────── */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              </div>
              <label className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Full Name <span className="text-slate-400 font-normal text-xs">(optional)</span>
              </label>
            </div>
            <input
              type="text"
              placeholder="Your name or business name"
              {...register("name")}
              className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition"
            />
          </div>

          {/* ── Phone ──────────────────────────────────────── */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Phone className="w-3.5 h-3.5 text-[#2563EB]" />
              </div>
              <label className="font-bold text-sm text-slate-800 dark:text-slate-200">Phone Number <span className="text-red-500">*</span></label>
            </div>
            <input
              type="tel"
              placeholder="e.g. +250 788 000 000"
              {...register("phone")}
              className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition"
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1.5">{errors.phone.message}</p>}
          </div>

          {/* ── Delivery Address ───────────────────────────── */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5 text-[#FF6B00]" />
                </div>
                <label className="font-bold text-sm text-slate-800 dark:text-slate-200">Delivery Address <span className="text-red-500">*</span></label>
              </div>
              <button
                type="button"
                onClick={useMyLocation}
                disabled={locating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#2563EB]/10 text-[#2563EB] hover:bg-[#2563EB]/20 disabled:opacity-60 transition-colors"
              >
                {locating ? <Loader2 className="w-3 h-3 animate-spin" /> : <LocateFixed className="w-3 h-3" />}
                {locating ? "Detecting…" : "Use My Location"}
              </button>
            </div>
            {locError && <p className="text-xs text-red-500 mb-2 flex items-center gap-1"><XCircle className="w-3 h-3 flex-shrink-0" />{locError}</p>}

            {locationDetails && (
              <div className="mb-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-xl p-3">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mb-2">
                  <LocateFixed className="w-3 h-3" /> Location detected
                </p>
                <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
                  {locationDetails.district && (<><span className="text-slate-500 dark:text-slate-400">District</span><span className="font-semibold text-slate-800 dark:text-slate-100">{locationDetails.district}</span></>)}
                  {locationDetails.sector   && (<><span className="text-slate-500 dark:text-slate-400">Sector</span><span className="font-semibold text-slate-800 dark:text-slate-100">{locationDetails.sector}</span></>)}
                  {locationDetails.cell     && (<><span className="text-slate-500 dark:text-slate-400">Cell</span><span className="font-semibold text-slate-800 dark:text-slate-100">{locationDetails.cell}</span></>)}
                  {locationDetails.city     && (<><span className="text-slate-500 dark:text-slate-400">City / Town</span><span className="font-semibold text-slate-800 dark:text-slate-100">{locationDetails.city}</span></>)}
                  {locationDetails.road     && (<><span className="text-slate-500 dark:text-slate-400">Street / Road</span><span className="font-semibold text-slate-800 dark:text-slate-100">{locationDetails.road}</span></>)}
                </div>
              </div>
            )}
            <textarea
              rows={3}
              placeholder="e.g. KN 4 Ave, Nyabugogo, Kigali — or describe your location clearly"
              {...register("address")}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] resize-none transition"
            />
            {errors.address && <p className="text-xs text-red-500 mt-1.5">{errors.address.message}</p>}

            {/* ── Live delivery fee card ─────────────────── */}
            {showFeeCard && (
              <div className="mt-3 rounded-xl border border-blue-100 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-900/20 p-3 space-y-2">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Delivery Estimate</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-sm">
                    <span className="text-slate-700 dark:text-slate-300">Transport fee</span>
                    <span className="text-[#2563EB]">{formatCurrency(deliveryFee)}</span>
                  </div>
                </div>
              </div>
            )}

            {subtotal >= FREE_DELIVERY_THRESHOLD && (
              <p className="mt-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                🎉 Free delivery — order qualifies (above {formatCurrency(FREE_DELIVERY_THRESHOLD)})
              </p>
            )}
          </div>

          {/* ── Notes ──────────────────────────────────────── */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <label className="font-bold text-sm text-slate-800 dark:text-slate-200">Order Notes <span className="text-slate-400 font-normal">(optional)</span></label>
            </div>
            <textarea
              rows={2}
              placeholder="Special instructions, preferred delivery time, landmark…"
              {...register("notes")}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] resize-none transition"
            />
          </div>

          {/* ── Payment Method ─────────────────────────────── */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <label className="font-bold text-sm text-slate-800 dark:text-slate-200">Payment</label>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50">
              <div className="h-10 w-20 rounded-lg bg-[#059669] flex items-center justify-center flex-shrink-0">
                <span className="font-black text-sm text-white">AfriPay</span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Pay with AfriPay</p>
                <p className="text-xs text-slate-500 mt-0.5">You will be redirected to AfriPay to complete your payment of <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(total)}</span>.</p>
              </div>
            </div>
          </div>

          {/* ── Place Order Button ─────────────────────────── */}
          <div className="pt-1 space-y-3">
            <Button type="submit" fullWidth size="lg" loading={placing} className="h-14 text-base font-black shadow-lg shadow-blue-200 dark:shadow-none">
              {placing ? t.checkout.placing : `${t.checkout.placeOrder} — ${formatCurrency(total)}`}
            </Button>
            <Link href="/cart" className="block">
              <Button variant="secondary" fullWidth>
                <ArrowLeft className="w-4 h-4" /> {t.checkout.continueShopping}
              </Button>
            </Link>
            <p className="text-xs text-slate-400 text-center pb-4">
              By placing your order you agree to our{" "}
              <Link href="/terms-of-service" className="underline hover:text-slate-600">terms of service</Link>.
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}
