import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "RWF"): string {
  if (currency === "RWF") {
    return new Intl.NumberFormat("en-RW", {
      style: "currency", currency: "RWF",
      minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency,
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en").format(n);
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").trim();
}

export function generateOrderNumber(): string {
  const prefix = "BYS";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function truncate(str: string, length = 100): string {
  return str.length > length ? str.slice(0, length) + "…" : str;
}

export function timeAgo(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return then.toLocaleDateString("en-RW", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-RW", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString("en-RW", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function getPriceTier(tiers: { minQty: number; maxQty?: number | null; price: number }[], qty: number): number {
  if (!tiers.length) return 0;
  const sorted = [...tiers].sort((a, b) => b.minQty - a.minQty);
  for (const tier of sorted) {
    if (qty >= tier.minQty) return tier.price;
  }
  return sorted[sorted.length - 1].price;
}

export function getStockStatus(stock: number, moq: number): "in_stock" | "low_stock" | "out_of_stock" {
  if (stock === 0) return "out_of_stock";
  if (stock <= moq * 3) return "low_stock";
  return "in_stock";
}

export const FREE_DELIVERY_THRESHOLD = 500000;

// Branch coordinates
export const BRANCH_KIGALI  = { lat: -1.9386, lng: 30.0588, label: "Nyabugogo, Kigali" };
export const BRANCH_RUBAVU  = { lat: -1.6973, lng: 29.2577, label: "Mahoko, Rubavu" };

// City-centre fallback coordinates (used when GPS is not available)
export const CITY_CENTERS: Record<string, { lat: number; lng: number }> = {
  "kigali":      { lat: -1.9441, lng: 30.0619 },
  "musanze":     { lat: -1.4984, lng: 29.6348 },
  "rubavu":      { lat: -1.6973, lng: 29.2577 },
  "huye":        { lat: -2.5967, lng: 29.7394 },
  "nyagatare":   { lat: -1.2833, lng: 30.3167 },
  "muhanga":     { lat: -2.0833, lng: 29.7500 },
  "goma":        { lat: -1.6791, lng: 29.2285 },
  "bukavu":      { lat: -2.4969, lng: 28.8622 },
  "kinshasa":    { lat: -4.3217, lng: 15.3222 },
  "lubumbashi":  { lat: -11.6645, lng: 27.4794 },
  "butembo":     { lat:  0.1400, lng: 29.2906 },
};

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// 1,500 RWF per 10 km bracket (minimum 1,500 RWF)
export function feeFromDistance(km: number): number {
  return Math.max(1, Math.ceil(km / 10)) * 1500;
}

export interface NearestBranch {
  branch: typeof BRANCH_KIGALI;
  distanceKm: number;
  fee: number;
}

export function nearestBranch(lat: number, lng: number): NearestBranch {
  const dK = haversineKm(lat, lng, BRANCH_KIGALI.lat, BRANCH_KIGALI.lng);
  const dR = haversineKm(lat, lng, BRANCH_RUBAVU.lat, BRANCH_RUBAVU.lng);
  if (dK <= dR) {
    return { branch: BRANCH_KIGALI, distanceKm: dK, fee: feeFromDistance(dK) };
  }
  return { branch: BRANCH_RUBAVU, distanceKm: dR, fee: feeFromDistance(dR) };
}

export function calculateDeliveryFee(
  total: number,
  city: string,
  _country: string,
  coords?: { lat: number; lng: number }
): number {
  if (total >= FREE_DELIVERY_THRESHOLD) return 0;
  const pt = coords ?? CITY_CENTERS[city.toLowerCase()];
  if (pt) return nearestBranch(pt.lat, pt.lng).fee;
  // Unknown city with no coords — flat fallback
  return 5000;
}
