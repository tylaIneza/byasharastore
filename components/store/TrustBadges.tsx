"use client";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

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

const STATS = [
  { value: 12500, suffix: "+", label: "Orders Placed", color: "#2563EB" },
  { value: 800, suffix: "+", label: "Products", color: "#10B981" },
  { value: 3200, suffix: "+", label: "Happy Clients", color: "#FF6B00" },
  { value: 4, suffix: "", label: "Countries Served", color: "#7C3AED" },
];

export default function TrustBadges() {
  return (
    <section className="py-20 bg-[#0F172A]">
      <div className="container-base">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div
                className="text-4xl md:text-5xl font-black mb-2"
                style={{ color: stat.color }}
              >
                <CountUp target={stat.value} />
                {stat.suffix}
              </div>
              <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
