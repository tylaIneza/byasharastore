"use client";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { Package, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";

export default function ProductCarouselClient({ products }: { products: Product[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", slidesToScroll: 1 },
    [Autoplay({ delay: 3000, stopOnInteraction: true })]
  );

  if (!products.length) return null;

  return (
    <div className="relative">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex gap-3 px-4 md:px-0">
          {products.map((product) => {
            const image = product.images?.find((i) => i.isPrimary)?.url ?? product.images?.[0]?.url;
            const price = product.pricingTiers?.length
              ? Math.min(...product.pricingTiers.map((t) => Number(t.price)))
              : Number(product.basePrice);

            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="flex-[0_0_160px] md:flex-[0_0_200px] group"
              >
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="relative aspect-square bg-slate-50 dark:bg-slate-700">
                    {image ? (
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="200px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-10 h-10 text-slate-200 dark:text-slate-600" />
                      </div>
                    )}
                    {product.featured && (
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-[#FF6B00] text-white text-[9px] font-bold rounded-full">
                        HOT
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-[#2563EB] font-medium truncate">
                      {product.category?.emoji} {product.category?.name}
                    </p>
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-white line-clamp-2 leading-tight mt-0.5">
                      {product.name}
                    </h3>
                    <p className="text-sm font-bold text-[#2563EB] mt-1">
                      {formatCurrency(price)}
                    </p>
                    <p className="text-[10px] text-slate-400">MOQ: ×{product.minOrderQty}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Nav arrows */}
      <button
        onClick={() => emblaApi?.scrollPrev()}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-[#2563EB] hover:text-white hover:border-[#2563EB] transition-all z-10 hidden md:flex"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => emblaApi?.scrollNext()}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-[#2563EB] hover:text-white hover:border-[#2563EB] transition-all z-10 hidden md:flex"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
