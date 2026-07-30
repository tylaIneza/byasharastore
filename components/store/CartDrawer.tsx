"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useLanguageStore } from "@/store/language";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal } = useCartStore();
  const { t } = useLanguageStore();
  const subtotal = getSubtotal();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm"
          />
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-[80] w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#2563EB]" />
                <h2 className="font-bold text-lg text-slate-900 dark:text-white">{t.cart.title}</h2>
                {items.length > 0 && (
                  <span className="bg-[#2563EB] text-white text-xs font-bold rounded-full px-2 py-0.5">
                    {items.reduce((a, i) => a + i.quantity, 0)}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">{t.cart.empty}</p>
                    <p className="text-sm text-slate-400 mt-1">{t.cart.emptyDesc}</p>
                  </div>
                  <Button variant="outline" onClick={closeCart}>
                    {t.cart.startShopping}
                  </Button>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {items.map((item) => (
                    <motion.div
                      key={item.productId}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50"
                    >
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-700">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ShoppingBag className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-900 dark:text-white line-clamp-2">{item.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">SKU: {item.sku}</p>
                        <p className="text-sm font-bold text-[#2563EB] mt-1">
                          {formatCurrency(item.unitPrice)} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= item.minOrderQty}
                            className="w-6 h-6 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-slate-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="w-6 h-6 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {formatCurrency(item.totalPrice)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-slate-100 dark:border-slate-800 p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">{t.cart.subtotal}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(subtotal)}</span>
                </div>
                <p className="text-xs text-slate-400">{t.checkout.deliveryFee}</p>
                <Link href="/checkout" onClick={closeCart}>
                  <Button fullWidth size="lg" className="group">
                    {t.cart.checkout}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/cart" onClick={closeCart}>
                  <Button variant="secondary" fullWidth>
                    View Full Cart
                  </Button>
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
