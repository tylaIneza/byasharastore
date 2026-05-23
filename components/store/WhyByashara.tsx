"use client";
import { motion } from "framer-motion";
import { Truck, Shield, TrendingDown, Headphones } from "lucide-react";

const FEATURES = [
  {
    icon: TrendingDown,
    color: "#2563EB",
    title: "Wholesale Pricing",
    desc: "Tiered bulk pricing — the more you order, the more you save. Minimum order quantities designed for retailers.",
  },
  {
    icon: Truck,
    color: "#10B981",
    title: "Fast Delivery",
    desc: "Rwanda & Eastern DRC covered. Same-day processing, next-day delivery to Kigali. Goma & Bukavu delivered within 48h.",
  },
  {
    icon: Shield,
    color: "#FF6B00",
    title: "Verified Products",
    desc: "Every product is sourced from verified suppliers and inspected before listing. 100% authentic guarantee.",
  },
  {
    icon: Headphones,
    color: "#7C3AED",
    title: "Dedicated Support",
    desc: "Real B2B support for wholesale buyers. Our team handles bulk inquiries, returns and after-sales service.",
  },
];

export default function WhyByashara() {
  return (
    <section className="py-24 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="container-base">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-[#2563EB]/10 text-[#2563EB] uppercase tracking-wider mb-4">
            Why Choose Us
          </span>
          <h2 className="section-title text-slate-900 dark:text-white mb-4">Why Choose BYASHARA?</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Built for wholesale buyers across East Africa. We make bulk electronics purchasing simple, reliable and affordable.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2"
                  style={{ background: feature.color }}
                />
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${feature.color}15` }}
                >
                  <Icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
