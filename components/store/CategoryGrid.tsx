import Link from "next/link";
import { Grid3x3, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

async function getCategories() {
  try {
    const cats = await prisma.category.findMany({
      where: { isActive: true },
      include: { _count: { select: { products: { where: { status: "ACTIVE" } } } } },
      orderBy: { sortOrder: "asc" },
      take: 8,
    });
    return cats;
  } catch {
    return [];
  }
}

const DEFAULT_COLORS = ["#2563EB", "#7C3AED", "#DC2626", "#059669", "#D97706", "#0891B2", "#EA580C", "#6366F1"];

export default async function CategoryGrid() {
  const categories = await getCategories();
  if (!categories.length) return null;

  return (
    <section className="py-8 bg-slate-50 dark:bg-slate-900">
      <div className="container-base">
        <div className="flex items-center gap-2 mb-4">
          <Grid3x3 className="w-4 h-4 text-[#2563EB]" />
          <span className="text-sm font-bold text-slate-800 dark:text-white">Shop by Category</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {categories.map((cat, i) => {
            const color = cat.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];
            return (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group relative p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                  style={{ background: color }}
                />
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mx-auto mb-3 transition-transform group-hover:scale-110 duration-300"
                  style={{ background: `${color}15` }}
                >
                  {cat.emoji ?? "📦"}
                </div>
                <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 leading-tight">{cat.name}</p>
                <p className="text-xs text-slate-400 mt-1">{cat._count.products} products</p>
              </Link>
            );
          })}

          {/* All categories tile */}
          <Link
            href="/products"
            className="group p-5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-[#2563EB] dark:hover:border-[#2563EB] hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center justify-center gap-2"
          >
            <div className="w-12 h-12 rounded-xl bg-[#2563EB]/10 flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-[#2563EB]" />
            </div>
            <p className="font-semibold text-sm text-slate-600 dark:text-slate-400">All Products</p>
          </Link>
        </div>
      </div>
    </section>
  );
}
