import "server-only";
import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import ProductCard from "./ProductCard";
import { prisma } from "@/lib/prisma";
import { Product } from "@/types";

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: { images: { orderBy: { sortOrder: "asc" } }, pricingTiers: { orderBy: { minQty: "asc" } }, category: true },
      orderBy: [{ featured: "desc" }, { trendingScore: "desc" }, { createdAt: "desc" }],
      take: 100,
    });
    return products.map((p) => ({
      ...p,
      basePrice: Number(p.basePrice),
      engagementScore: Number(p.engagementScore),
      trendingScore: Number(p.trendingScore),
      pricingTiers: p.pricingTiers.map((t) => ({ ...t, price: Number(t.price) })),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      category: p.category ? { ...p.category, createdAt: p.category.createdAt.toISOString(), updatedAt: p.category.updatedAt.toISOString() } : undefined,
    })) as Product[];
  } catch {
    return [];
  }
}

export default async function FeaturedProducts() {
  const products = await getFeaturedProducts();
  if (!products.length) return null;

  return (
    <section className="py-10 bg-white dark:bg-slate-950">
      <div className="container-base">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#FF6B00]" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">All Products</h2>
            <span className="text-xs text-slate-400">({products.length} items)</span>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-1 text-sm font-semibold text-[#2563EB] hover:underline"
          >
            Browse all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
