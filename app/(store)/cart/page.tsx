"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useLanguageStore } from "@/store/language";
import { formatCurrency, calculateDeliveryFee } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export default function CartPage() {
  const { t } = useLanguageStore();
  const { items, removeItem, updateQuantity, getSubtotal, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const subtotal = getSubtotal();
  // Default delivery estimate (user sets at checkout)
  const estimatedDelivery = subtotal > 0 ? calculateDeliveryFee(subtotal, "Kigali", "Rwanda") : 0;
  const total = subtotal + estimatedDelivery;

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center py-24 px-4">
          <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-12 h-12 text-slate-300 dark:text-slate-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{t.cart.empty}</h1>
          <p className="text-slate-400 mb-8 max-w-sm mx-auto">{t.cart.emptyDesc}</p>
          <Link href="/products">
            <Button size="lg">{t.cart.startShopping}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="container-base">
        <div className="flex items-center gap-3 mb-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.productId}
                  layout
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4"
                >
                  <div className="flex gap-4">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-slate-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link href={`/products/${item.slug}`} className="font-semibold text-slate-900 dark:text-white hover:text-[#2563EB] transition-colors line-clamp-2">
                            {item.name}
                          </Link>
                          <p className="text-xs text-slate-400 mt-0.5">SKU: {item.sku}</p>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= item.minOrderQty}
                            className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-10 text-center text-sm font-semibold text-slate-900 dark:text-white">{item.quantity}</span>
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
                          <p className="font-bold text-slate-900 dark:text-white">{formatCurrency(item.totalPrice)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <button
              onClick={clearCart}
              className="text-sm text-red-400 hover:text-red-500 hover:underline transition-colors"
            >
              Clear Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 sticky top-24">
              <h2 className="font-bold text-slate-900 dark:text-white mb-5">{t.checkout.orderSummary}</h2>

              <div className="space-y-3 text-sm">
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
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Est. {t.cart.delivery} (Kigali)</span>
                  <span className="font-medium">{estimatedDelivery === 0 ? "Free" : formatCurrency(estimatedDelivery)}</span>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-2 flex justify-between font-bold text-slate-900 dark:text-white text-base">
                  <span>{t.cart.total}</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              {subtotal < 500000 && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 text-center">
                  Add {formatCurrency(500000 - subtotal)} more for free delivery!
                </p>
              )}

              <Link href="/checkout" className="block mt-5">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
