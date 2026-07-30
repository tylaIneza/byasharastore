"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Menu, X, Moon, Sun, Search, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { useCartStore } from "@/store/cart";
import { useLanguageStore } from "@/store/language";
import { cn } from "@/lib/utils";
import { Language } from "@/lib/translations";
import CartDrawer from "./CartDrawer";

const LANG_OPTIONS: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "fr", label: "FR", flag: "🇫🇷" },
  { code: "rw", label: "RW", flag: "🇷🇼" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const { t, language, setLanguage } = useLanguageStore();
  const { getItemCount, openCart } = useCartStore();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const itemCount = useCartStore((s) => s.items.reduce((a, i) => a + i.quantity, 0));

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/products", label: t.nav.products },
    { href: "/track-order", label: "Track Order" },
  ];

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "glass shadow-lg shadow-black/5"
            : "bg-transparent"
        )}
      >
        <div className="container-base">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <Image src="/logo.png" alt="NewGen Store" width={40} height={40} className="rounded-lg" priority />
              <span className="font-black text-lg tracking-tight text-[#0F172A] dark:text-white hidden sm:block">
                NEW<span className="text-[#2563EB]">GEN</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-[#2563EB]/10 text-[#2563EB]"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5">
              {/* Search button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Language Switcher */}
              <div className="relative group hidden sm:block">
                <button className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  {LANG_OPTIONS.find((l) => l.code === language)?.flag}
                  <span className="text-xs">{language.toUpperCase()}</span>
                </button>
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[100px]">
                  {LANG_OPTIONS.map((opt) => (
                    <button
                      key={opt.code}
                      onClick={() => setLanguage(opt.code)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors",
                        language === opt.code ? "text-[#2563EB] font-semibold" : "text-slate-700 dark:text-slate-300"
                      )}
                    >
                      <span>{opt.flag}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme toggle */}
              {mounted && (
                <button
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {resolvedTheme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              )}

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 bg-[#FF6B00] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                    >
                      {itemCount > 99 ? "99+" : itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Admin link */}
              <Link
                href="/admin"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                {t.nav.admin}
              </Link>

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden glass border-t border-slate-200/50 dark:border-slate-700/50"
            >
              <div className="container-base py-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "block px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      pathname === link.href
                        ? "bg-[#2563EB]/10 text-[#2563EB]"
                        : "text-slate-700 dark:text-slate-300"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="flex gap-2 pt-2">
                  {LANG_OPTIONS.map((opt) => (
                    <button
                      key={opt.code}
                      onClick={() => setLanguage(opt.code)}
                      className={cn(
                        "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm border transition-colors",
                        language === opt.code
                          ? "border-[#2563EB] text-[#2563EB] bg-[#2563EB]/5"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                      )}
                    >
                      {opt.flag} {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-start justify-center pt-24 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
                  }
                }}
              >
                <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800">
                  <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    placeholder={t.nav.search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none text-base"
                  />
                  <button type="button" onClick={() => setSearchOpen(false)}>
                    <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                  </button>
                </div>
              </form>
              <div className="p-4 text-sm text-slate-500 dark:text-slate-400">
                Press Enter to search or{" "}
                <Link
                  href="/products"
                  onClick={() => setSearchOpen(false)}
                  className="text-[#2563EB] hover:underline"
                >
                  browse all products
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer />
    </>
  );
}
