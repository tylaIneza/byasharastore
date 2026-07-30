"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingCart, Minus, Plus, Package, Check, ChevronLeft,
  Layers, Eye, Star
} from "lucide-react";
import { Product } from "@/types";
import { useCartStore } from "@/store/cart";
import { useLanguageStore } from "@/store/language";
import { formatCurrency, getPriceTier, getStockStatus } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import ProductCard from "./ProductCard";

interface Props { product: Product; related: Product[] }

export default function ProductDetail({ product, related }: Props) {
  const { t } = useLanguageStore();
  const { addItem, openCart } = useCartStore();
  const [selectedImg, setSelectedImg] = useState(0);
  const [qty, setQty] = useState(product.minOrderQty);
  const [added, setAdded] = useState(false);

  const images = product.images?.length
    ? product.images
    : [{ id: "placeholder", url: "", alt: product.name, isPrimary: true, sortOrder: 0 }];

  const stockStatus = getStockStatus(product.stock, product.minOrderQty);
  const unitPrice = product.pricingTiers?.length
    ? getPriceTier(product.pricingTiers, qty)
    : product.basePrice;
  const totalPrice = unitPrice * qty;

  function handleAddToCart() {
    addItem({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      slug: product.slug,
      image: images[0]?.url ?? "",
      basePrice: product.basePrice,
      pricingTiers: product.pricingTiers ?? [],
      minOrderQty: product.minOrderQty,
      stock: product.stock,
    }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    handleAddToCart();
    openCart();
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-8">
      <div className="container-base">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-8">
          <Link href="/" className="hover:text-[#2563EB]">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#2563EB]">Products</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link href={`/products?category=${product.category.slug}`} className="hover:text-[#2563EB]">
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-slate-600 dark:text-slate-300 truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
              {images[selectedImg]?.url ? (
                <Image
                  src={images[selectedImg].url}
                  alt={images[selectedImg].alt ?? product.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-24 h-24 text-slate-200 dark:text-slate-700" />
                </div>
              )}
              {product.featured && (
                <span className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#FF6B00] text-white">
                  <Star className="w-3 h-3" /> Featured
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImg(i)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      i === selectedImg ? "border-[#2563EB]" : "border-transparent"
                    }`}
                  >
                    {img.url ? (
                      <Image src={img.url} alt={img.alt ?? ""} fill className="object-cover" sizes="80px" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Package className="w-8 h-8 text-slate-300" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {product.category && (
              <Link
                href={`/products?category=${product.category.slug}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2563EB] hover:underline mb-3"
              >
                {product.category.emoji} {product.category.name}
              </Link>
            )}

            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight mb-3">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs text-slate-400">SKU: {product.sku}</span>
              <span className="text-xs text-slate-300">|</span>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Eye className="w-3.5 h-3.5" /> {product.viewCount} views
              </div>
              {stockStatus === "in_stock" && <Badge variant="success">{t.products.inStock}</Badge>}
              {stockStatus === "low_stock" && <Badge variant="warning">{t.products.lowStock}</Badge>}
              {stockStatus === "out_of_stock" && <Badge variant="danger">{t.products.outOfStock}</Badge>}
            </div>

            {/* Pricing Tiers */}
            {product.pricingTiers?.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-[#2563EB]" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Bulk Pricing</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {product.pricingTiers.map((tier) => {
                    const isActive = qty >= tier.minQty && (tier.maxQty == null || qty <= tier.maxQty);
                    return (
                      <div
                        key={tier.id}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isActive
                            ? "border-[#2563EB] bg-[#2563EB]/5"
                            : "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                        }`}
                      >
                        <p className="text-xs text-slate-500 mb-1">{tier.label}</p>
                        <p className="font-bold text-[#2563EB] text-sm">{formatCurrency(tier.price)}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {tier.maxQty ? `${tier.minQty}–${tier.maxQty} pcs` : `${tier.minQty}+ pcs`}
                        </p>
                        {isActive && <Check className="w-3 h-3 text-[#2563EB] mx-auto mt-1" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Unit Price (qty: {qty})</p>
                  <p className="text-2xl font-black text-[#2563EB]">{formatCurrency(unitPrice)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Total</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalPrice)}</p>
                </div>
              </div>
            </div>

            {/* MOQ notice */}
            <p className="text-xs text-slate-400 mb-5">
              Minimum order: <span className="font-semibold text-slate-600 dark:text-slate-300">{product.minOrderQty} units</span>
              {" · "}In stock: <span className="font-semibold text-slate-600 dark:text-slate-300">{product.stock} units</span>
            </p>

            {/* Quantity + Actions */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQty(Math.max(product.minOrderQty, qty - 1))}
                  className="w-10 h-11 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={qty}
                  min={product.minOrderQty}
                  max={product.stock}
                  onChange={(e) => {
                    const v = Math.max(product.minOrderQty, Math.min(product.stock, Number(e.target.value)));
                    setQty(v);
                  }}
                  className="w-16 h-11 text-center font-bold text-slate-900 dark:text-white bg-transparent border-x border-slate-200 dark:border-slate-700 focus:outline-none"
                />
                <button
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  className="w-10 h-11 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={stockStatus === "out_of_stock"}
                size="lg"
                className="flex-1 gap-2"
              >
                {added ? (
                  <><Check className="w-4 h-4" /> Added!</>
                ) : (
                  <><ShoppingCart className="w-4 h-4" /> {t.products.addToCart}</>
                )}
              </Button>
              <Button
                onClick={handleBuyNow}
                disabled={stockStatus === "out_of_stock"}
                size="lg"
                variant="accent"
                className="flex-1"
              >
                {t.products.buyNow}
              </Button>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                <h2 className="font-bold text-slate-900 dark:text-white mb-3">Product Description</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="border-t border-slate-100 dark:border-slate-800 pt-16">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8">{t.products.related}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
