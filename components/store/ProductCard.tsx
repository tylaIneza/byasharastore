"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingCart, Eye, Star, Zap, Package } from "lucide-react";
import { Product } from "@/types";
import { useCartStore } from "@/store/cart";
import { useLanguageStore } from "@/store/language";
import { formatCurrency, getStockStatus } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

interface Props { product: Product; index?: number }

export default function ProductCard({ product, index = 0 }: Props) {
  const { t } = useLanguageStore();
  const { addItem } = useCartStore();
  const [adding, setAdding] = useState(false);
  const primaryImage = product.images?.find((i) => i.isPrimary)?.url ?? product.images?.[0]?.url;
  const stockStatus = getStockStatus(product.stock, product.minOrderQty);
  const lowestTierPrice = product.pricingTiers?.length
    ? Math.min(...product.pricingTiers.map((t) => t.price))
    : product.basePrice;

  async function handleAddToCart() {
    if (stockStatus === "out_of_stock") return;
    setAdding(true);
    addItem({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      slug: product.slug,
      image: primaryImage ?? "",
      basePrice: product.basePrice,
      pricingTiers: product.pricingTiers ?? [],
      minOrderQty: product.minOrderQty,
      stock: product.stock,
    });
    setTimeout(() => setAdding(false), 600);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-800">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-16 h-16 text-slate-200 dark:text-slate-700" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.featured && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF6B00] text-white">
                <Star className="w-2.5 h-2.5" /> Featured
              </span>
            )}
            {stockStatus === "low_stock" && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                <Zap className="w-2.5 h-2.5" /> Low Stock
              </span>
            )}
          </div>

          {/* Quick view overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              <span className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 shadow-lg">
                <Eye className="w-4 h-4" /> Quick View
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3">
        {product.category && (
          <p className="text-[11px] text-[#2563EB] font-medium mb-0.5">
            {product.category.emoji} {product.category.name}
          </p>
        )}

        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-2 hover:text-[#2563EB] transition-colors mb-1">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mb-1.5">
          <div>
            {product.pricingTiers?.length > 0 ? (
              <div>
                <span className="text-[11px] text-slate-400">{t.products.from}</span>
                <p className="font-bold text-[#2563EB] text-base">{formatCurrency(lowestTierPrice)}</p>
              </div>
            ) : (
              <p className="font-bold text-[#2563EB] text-base">{formatCurrency(product.basePrice)}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-[11px] text-slate-400">{t.products.moq}</p>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">×{product.minOrderQty}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-2">
          {stockStatus === "in_stock" && <Badge variant="success">{t.products.inStock}</Badge>}
          {stockStatus === "low_stock" && <Badge variant="warning">{t.products.lowStock}</Badge>}
          {stockStatus === "out_of_stock" && <Badge variant="danger">{t.products.outOfStock}</Badge>}
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={stockStatus === "out_of_stock"}
          loading={adding}
          fullWidth
          size="sm"
          variant={stockStatus === "out_of_stock" ? "secondary" : "primary"}
          className="gap-2"
        >
          {stockStatus !== "out_of_stock" && <ShoppingCart className="w-3.5 h-3.5" />}
          {stockStatus === "out_of_stock" ? t.products.outOfStock : t.products.addToCart}
        </Button>
      </div>
    </motion.div>
  );
}
