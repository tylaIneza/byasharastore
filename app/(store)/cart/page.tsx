"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package, ArrowLeft,
  Truck, ShieldCheck, BadgeCheck, Sparkles, X,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useLanguageStore } from "@/store/language";
import { formatCurrency, calculateDeliveryFee, FREE_DELIVERY_THRESHOLD } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export default function CartPage() {
  const { t } = useLanguageStore();
  const { items, removeItem, updateQuantity, getSubtotal, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const subtotal = getSubtotal();
  // Default delivery estimate (user sets at checkout)
  const estimatedDelivery = subtotal > 0 ? calculateDeliveryFee(subtotal, "Kigali", "Rwanda") : 0;
  const total = subtotal + estimatedDelivery;
  const totalSavings = items.reduce((sum, i) => sum + Math.max(0, i.basePrice - i.unitPrice) * i.quantity, 0);
  const freeDeliveryProgress = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);
  const freeDeliveryUnlocked = subtotal >= FREE_DELIVERY_THRESHOLD;

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center py-24 px-4"
        >
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#2563EB]/10 to-[#FF6B00]/10 dark:from-[#2563EB]/20 dark:to-[#FF6B00]/20 animate-pulse" />
            <div className="relative w-24 h-24 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center shadow-sm">
              <ShoppingCart className="w-10 h-10 text-[#2563EB]" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{t.cart.empty}</h1>
          <p className="text-slate-400 mb-8 max-w-sm mx-auto">{t.cart.emptyDesc}</p>
          <Link href="/products">
            <Button size="lg" className="group">
              {t.cart.startShopping}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 pb-28 lg:pb-8">
      <div className="container-base">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Link href="/products" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">{t.cart.title}</h1>
              <p className="text-sm text-slate-400">
                {items.reduce((a, i) => a + i.quantity, 0)} {t.cart.items}
              </p>
            </div>
          </div>
          <button
            onClick={clearCart}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">{t.cart.clearCart}</span>
          </button>
        </div>

        {/* Free delivery progress */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${freeDeliveryUnlocked ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-blue-50 dark:bg-blue-900/20"}`}>
                <Truck className={`w-3.5 h-3.5 ${freeDeliveryUnlocked ? "text-emerald-500" : "text-[#2563EB]"}`} />
              </div>
              <p className={`text-sm font-semibold ${freeDeliveryUnlocked ? "text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"}`}>
                {freeDeliveryUnlocked
                  ? t.cart.freeDeliveryUnlocked
                  : t.cart.freeDeliveryHint.replace("{amount}", formatCurrency(FREE_DELIVERY_THRESHOLD - subtotal))}
              </p>
            </div>
            {freeDeliveryUnlocked && <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
          </div>
          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${freeDeliveryProgress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={`h-full rounded-full ${freeDeliveryUnlocked ? "bg-emerald-500" : "bg-gradient-to-r from-[#2563EB] to-[#60A5FA]"}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence initial={false}>
              {items.map((item) => {
                const itemSavings = Math.max(0, item.basePrice - item.unitPrice) * item.quantity;
                return (
                  <motion.div
                    key={item.productId}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0, padding: 0 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm transition-all"
                  >
                    <div className="flex gap-4">
                      <Link
                        href={`/products/${item.slug}`}
                        className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800 group"
                      >
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="80px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-slate-300" />
                          </div>
                        )}
                      </Link>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Link href={`/products/${item.slug}`} className="font-semibold text-slate-900 dark:text-white hover:text-[#2563EB] transition-colors line-clamp-2">
                              {item.name}
                            </Link>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <p className="text-xs text-slate-400">SKU: {item.sku}</p>
                              <span className="text-xs text-slate-300 dark:text-slate-600">•</span>
                              <p className="text-xs text-slate-400">{t.cart.minOrder}: {item.minOrderQty}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeItem(item.productId)}
                            aria-label={t.cart.remove}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden text-slate-600 dark:text-slate-300">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              disabled={item.quantity <= item.minOrderQty}
                              className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-10 text-center text-sm font-semibold text-slate-900 dark:text-white tabular-nums">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-400">{formatCurrency(item.unitPrice)} × {item.quantity}</p>
                            <AnimatePresence mode="wait">
                              <motion.p
                                key={item.totalPrice}
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="font-bold text-slate-900 dark:text-white tabular-nums"
                              >
                                {formatCurrency(item.totalPrice)}
                              </motion.p>
                            </AnimatePresence>
                            {itemSavings > 0 && (
                              <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                -{formatCurrency(itemSavings)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden sticky top-24">
              <div className="bg-gradient-to-r from-[#0F172A] to-[#1D4ED8] px-6 py-4">
                <h2 className="font-bold text-white">{t.checkout.orderSummary}</h2>
              </div>

              <div className="p-6">
                <div className="space-y-3 text-sm max-h-48 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.productId} className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span className="truncate mr-2">{item.name} × {item.quantity}</span>
                      <span className="flex-shrink-0 font-medium">{formatCurrency(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 mt-4 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>{t.cart.subtotal}</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>{t.cart.bulkSavings}</span>
                      <span className="font-medium">-{formatCurrency(totalSavings)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Est. {t.cart.delivery} (Kigali)</span>
                    <span className="font-medium">{estimatedDelivery === 0 ? "Free" : formatCurrency(estimatedDelivery)}</span>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-2 flex justify-between font-bold text-slate-900 dark:text-white text-base">
                    <span>{t.cart.total}</span>
                    <span className="tabular-nums">{formatCurrency(total)}</span>
                  </div>
                </div>

                <Link href="/checkout" className="hidden lg:block mt-5">
                  <Button fullWidth size="lg" className="group">
                    {t.cart.checkout}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>

                <Link href="/products" className="block mt-3">
                  <Button fullWidth variant="secondary">
                    {t.checkout.continueShopping}
                  </Button>
                </Link>

                <div className="flex items-center justify-between mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    <span className="text-[10px] text-slate-400 text-center leading-tight">{t.cart.trustSecure}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <BadgeCheck className="w-4 h-4 text-slate-400" />
                    <span className="text-[10px] text-slate-400 text-center leading-tight">{t.cart.trustGenuine}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <Truck className="w-4 h-4 text-slate-400" />
                    <span className="text-[10px] text-slate-400 text-center leading-tight">{t.cart.trustFast}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky checkout bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-4 z-30">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400">{t.cart.total}</p>
            <p className="font-black text-slate-900 dark:text-white tabular-nums">{formatCurrency(total)}</p>
          </div>
          <Link href="/checkout" className="flex-shrink-0">
            <Button size="lg" className="group">
              {t.cart.checkout}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
