"use client";
import Link from "next/link";
import { ShoppingBag, Tag } from "lucide-react";
import { useLanguageStore } from "@/store/language";

export default function CompactHero() {
  const { t } = useLanguageStore();
  return (
    <section className="bg-gradient-to-r from-[#0F172A] via-[#1e3a8a] to-[#1D4ED8] py-8 md:py-10">
      <div className="container-base flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-[#93C5FD] text-xs font-semibold uppercase tracking-widest mb-1">
            Rwanda & Eastern DRC — Wholesale Electronics
          </p>
          <h1 className="text-white text-2xl md:text-3xl font-black leading-tight">
            Premium Electronics at <span className="text-[#60A5FA]">Wholesale Prices</span>
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-md">
            Bulk pricing, fast delivery. Order online — no account needed.
          </p>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs text-white/80 bg-white/10 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Kigali Branch
            </span>
            <span className="flex items-center gap-1.5 text-xs text-white/80 bg-white/10 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Rubavu Branch
            </span>
          </div>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <Link
            href="/products"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#ea5f00] text-white text-sm font-bold rounded-xl transition-colors"
          >
            <ShoppingBag className="w-4 h-4" /> Shop Now
          </Link>
          <Link
            href="/products?sort=price_asc"
            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Tag className="w-4 h-4" /> Best Deals
          </Link>
        </div>
      </div>
    </section>
  );
}
