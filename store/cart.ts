"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem, PricingTier } from "@/types";
import { getPriceTier } from "@/lib/utils";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity" | "unitPrice" | "totalPrice">, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
}

function calcUnitPrice(pricingTiers: PricingTier[], basePrice: number, qty: number): number {
  if (pricingTiers.length === 0) return basePrice;
  return getPriceTier(pricingTiers, qty) || basePrice;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item, qty = item.minOrderQty || 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          const quantity = existing ? existing.quantity + qty : qty;
          const unitPrice = calcUnitPrice(item.pricingTiers, item.basePrice, quantity);
          const totalPrice = unitPrice * quantity;

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity, unitPrice, totalPrice }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, { ...item, quantity, unitPrice, totalPrice }],
          };
        });
      },

      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),

      updateQuantity: (productId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.productId !== productId) };
          }
          return {
            items: state.items.map((i) => {
              if (i.productId !== productId) return i;
              const unitPrice = calcUnitPrice(i.pricingTiers, i.basePrice, quantity);
              return { ...i, quantity, unitPrice, totalPrice: unitPrice * quantity };
            }),
          };
        });
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getSubtotal: () => get().items.reduce((sum, i) => sum + i.totalPrice, 0),
    }),
    {
      name: "byashara-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
