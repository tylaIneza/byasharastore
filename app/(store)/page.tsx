import { Suspense } from "react";
import { Metadata } from "next";

export const dynamic = "force-dynamic";
import CompactHero from "@/components/store/CompactHero";
import CategoryGrid from "@/components/store/CategoryGrid";
import FeaturedProducts from "@/components/store/FeaturedProducts";
import PaymentMethods from "@/components/store/PaymentMethods";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";

export const metadata: Metadata = {
  title: "BYASHARA STORE",
  description: "Browse electronics, accessories, and more. Order online with fast delivery.",
};

export default function HomePage() {
  return (
    <>
      {/* 1. Compact hero banner */}
      <CompactHero />

      {/* 2. All products grid */}
      <Suspense
        fallback={
          <section className="py-10 container-base">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          </section>
        }
      >
        <FeaturedProducts />
      </Suspense>

      {/* 3. Category grid */}
      <Suspense fallback={<CategorySkeleton />}>
        <CategoryGrid />
      </Suspense>

      {/* 4. Payment methods */}
      <PaymentMethods />
    </>
  );
}

function CategorySkeleton() {
  return (
    <section className="py-8 container-base">
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton h-10 w-28 rounded-full bg-slate-100 dark:bg-slate-800 flex-shrink-0" />
        ))}
      </div>
    </section>
  );
}
