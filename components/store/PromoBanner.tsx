"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Truck } from "lucide-react";
import { useLanguageStore } from "@/store/language";

export default function PromoBanner() {
  const { t } = useLanguageStore();

  return (
    <section className="py-12 container-base">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Bulk deals */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white group hover:shadow-xl transition-shadow"
        >
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/5" />
          <Zap className="w-10 h-10 mb-4 text-yellow-300" />
          <h3 className="text-2xl font-black mb-2">{t.promo.bulkTitle}</h3>
          <p className="text-blue-100 text-sm mb-5">{t.promo.bulkDesc}</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-bold bg-white text-[#2563EB] px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors group-hover:gap-3"
          >
            {t.promo.shopNow} <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Free delivery */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-r from-[#0F172A] to-[#1e293b] text-white group hover:shadow-xl transition-shadow"
        >
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5" />
          <Truck className="w-10 h-10 mb-4 text-[#60A5FA]" />
          <h3 className="text-2xl font-black mb-2">{t.promo.deliveryTitle}</h3>
          <p className="text-slate-400 text-sm mb-5">{t.promo.deliveryDesc}</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-bold border border-slate-600 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors group-hover:gap-3"
          >
            {t.promo.viewProducts} <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
