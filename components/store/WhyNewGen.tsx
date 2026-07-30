"use client";
import { motion } from "framer-motion";
import { Truck, Shield, TrendingDown, Headphones } from "lucide-react";
import { useLanguageStore } from "@/store/language";

const ICONS = [TrendingDown, Truck, Shield, Headphones];
const COLORS = ["#2563EB", "#10B981", "#FF6B00", "#7C3AED"];

export default function WhyNewGen() {
  const { t } = useLanguageStore();

  const features = [
    { icon: ICONS[0], color: COLORS[0], title: t.why.bulk.title, desc: t.why.bulk.desc },
    { icon: ICONS[1], color: COLORS[1], title: t.why.fast.title, desc: t.why.fast.desc },
    { icon: ICONS[2], color: COLORS[2], title: t.why.quality.title, desc: t.why.quality.desc },
    { icon: ICONS[3], color: COLORS[3], title: t.why.support.title, desc: t.why.support.desc },
  ];

  return (
    <section className="py-24 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="container-base">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-[#2563EB]/10 text-[#2563EB] uppercase tracking-wider mb-4">
            Why Choose Us
          </span>
          <h2 className="section-title text-slate-900 dark:text-white mb-4">{t.why.title}</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">{t.why.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => {
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
