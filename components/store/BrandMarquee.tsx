"use client";
import { motion } from "framer-motion";

const BRANDS = [
  "Samsung", "Apple", "Xiaomi", "Tecno", "Infinix", "Itel", "Huawei",
  "HP", "Dell", "Lenovo", "Asus", "Acer", "Sony", "LG", "JBL",
];

export default function BrandMarquee() {
  return (
    <div className="py-8 bg-slate-50 dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 overflow-hidden">
      <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
        Trusted Brands
      </p>
      <div className="relative flex">
        <motion.div
          className="flex gap-12 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity }}
        >
          {[...BRANDS, ...BRANDS].map((brand, i) => (
            <span
              key={i}
              className="text-slate-400 dark:text-slate-600 font-bold text-lg hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors cursor-default select-none"
            >
              {brand}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
