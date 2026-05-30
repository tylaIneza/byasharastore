"use client";
import { useEffect, useCallback, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { useLanguageStore } from "@/store/language";
import { Button } from "@/components/ui/Button";

const SLIDES = [
  {
    id: 1,
    badge: "New Arrivals",
    title: "Next-Gen Smartphones",
    subtitle: "Latest flagship models at the best prices. Order online easily.",
    cta: "Shop Phones",
    href: "/products?category=phones",
    bg: "from-[#0F172A] via-[#1e3a8a] to-[#1D4ED8]",
    accent: "#60A5FA",
    emoji: "📱",
  },
  {
    id: 2,
    badge: "Best Sellers",
    title: "Laptop & Computing",
    subtitle: "Business laptops, gaming rigs, accessories. Direct from suppliers.",
    cta: "Shop Laptops",
    href: "/products?category=laptops",
    bg: "from-[#0F172A] via-[#1e1b4b] to-[#312e81]",
    accent: "#a78bfa",
    emoji: "💻",
  },
  {
    id: 3,
    badge: "Hot Deals",
    title: "Audio & Accessories",
    subtitle: "Headphones, earbuds, cables and more. Great prices, fast delivery.",
    cta: "Shop Accessories",
    href: "/products?category=accessories",
    bg: "from-[#0F172A] via-[#3b0764] to-[#7c3aed]",
    accent: "#c084fc",
    emoji: "🎧",
  },
];

export default function HeroSlider() {
  const { t } = useLanguageStore();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  return (
    <section className="relative overflow-hidden">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex touch-pan-y">
          {SLIDES.map((slide) => (
            <div key={slide.id} className="flex-[0_0_100%] min-w-0 relative">
              <div className={`min-h-[90vh] md:min-h-[80vh] bg-gradient-to-br ${slide.bg} flex items-center`}>
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden">
                  <div
                    className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-10"
                    style={{ background: `radial-gradient(circle, ${slide.accent}, transparent)` }}
                  />
                  <div
                    className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full opacity-5"
                    style={{ background: `radial-gradient(circle, ${slide.accent}, transparent)` }}
                  />
                  {/* Grid pattern */}
                  <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                      backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                      backgroundSize: "60px 60px",
                    }}
                  />
                </div>

                <div className="container-base relative z-10 py-24">
                  <div className="max-w-2xl">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-white/90 border border-white/20 mb-6">
                        <Zap className="w-3 h-3" style={{ color: slide.accent }} />
                        {slide.badge}
                      </span>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-6xl mb-4"
                    >
                      {slide.emoji}
                    </motion.div>

                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-4xl md:text-6xl font-black text-white leading-tight mb-4"
                    >
                      {slide.title}
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-lg text-slate-300 mb-8 max-w-lg"
                    >
                      {slide.subtitle}
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex flex-wrap gap-3"
                    >
                      <Link href={slide.href}>
                        <Button size="lg" variant="accent" className="group">
                          {slide.cta}
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                      <Link href="/products">
                        <Button
                          size="lg"
                          variant="ghost"
                          className="text-white hover:bg-white/10 border border-white/20"
                        >
                          {t.hero.secondary}
                        </Button>
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all backdrop-blur-sm"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all backdrop-blur-sm"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === selectedIndex ? "w-8 h-2 bg-white" : "w-2 h-2 bg-white/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
