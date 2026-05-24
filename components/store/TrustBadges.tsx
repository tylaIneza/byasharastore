"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useLanguageStore } from "@/store/language";

function CountUp({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

const STATS_CONFIG = [
  { value: 12500, suffix: "+", color: "#2563EB", key: "orders" as const },
  { value: 800,   suffix: "+", color: "#10B981", key: "products" as const },
  { value: 3200,  suffix: "+", color: "#FF6B00", key: "clients" as const },
  { value: 4,     suffix: "",  color: "#7C3AED", key: "countries" as const },
];

export default function TrustBadges() {
  const { t } = useLanguageStore();

  return (
    <section className="py-20 bg-[#0F172A]">
      <div className="container-base">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS_CONFIG.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-black mb-2" style={{ color: stat.color }}>
                <CountUp target={stat.value} />
                {stat.suffix}
              </div>
              <p className="text-slate-400 text-sm font-medium">{t.trust[stat.key]}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
