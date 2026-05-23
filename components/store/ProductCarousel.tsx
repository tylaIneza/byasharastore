import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Product } from "@/types";
import ProductCarouselClient from "./ProductCarouselClient";

async function getCarouselProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        pricingTiers: { orderBy: { minQty: "asc" } },
        category: true,
      },
      orderBy: [{ featured: "desc" }, { trendingScore: "desc" }],
      take: 20,
    });
    return products.map((p) => ({
      ...p,
      basePrice: Number(p.basePrice),
      engagementScore: Number(p.engagementScore),
      trendingScore: Number(p.trendingScore),
      pricingTiers: p.pricingTiers.map((t) => ({ ...t, price: Number(t.price) })),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })) as Product[];
  } catch {
    return [];
  }
}

export default async function ProductCarousel() {
  const products = await getCarouselProducts();
  if (!products.length) return null;

  return (
    <section className="py-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
      <div className="container-base">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF6B00]" />
            <span className="text-sm font-bold text-slate-800 dark:text-white">
              Our Products
            </span>
            <span className="text-xs text-slate-400">— scroll to explore</span>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <ProductCarouselClient products={products} />
      </div>
    </section>
  );
}
