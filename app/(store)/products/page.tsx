"use client";
import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import ProductCard from "@/components/store/ProductCard";
import { Button } from "@/components/ui/Button";
import { Product, Category } from "@/types";


const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "trending", label: "Trending" },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") ?? "");
  const [sort, setSort] = useState("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const PAGE_SIZE = 12;

  const fetchProducts = useCallback(async (p = 1, append = false) => {
    if (p === 1) setLoading(true); else setLoadingMore(true);
    try {
      const params = new URLSearchParams({
        page: String(p), pageSize: String(PAGE_SIZE),
        ...(search && { search }),
        ...(selectedCategory && { category: selectedCategory }),
        sort,
        status: "ACTIVE",
      });
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      if (data.success) {
        setProducts(append ? (prev) => [...prev, ...data.data] : data.data);
        setTotal(data.total);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [search, selectedCategory, sort]);

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/categories?active=true");
    const data = await res.json();
    if (data.success) setCategories(data.data);
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { setPage(1); fetchProducts(1, false); }, [fetchProducts]);

  function handleLoadMore() {
    const next = page + 1;
    setPage(next);
    fetchProducts(next, true);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
  }

  function clearCategory() { setSelectedCategory(""); }

  const hasMore = products.length < total;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-10">
        <div className="container-base">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
            {selectedCategory
              ? (categories.find((c) => c.slug === selectedCategory)?.name ?? "Products")
              : "All Products"}
          </h1>
          <p className="text-slate-500 text-sm">{total} products available</p>
        </div>
      </div>

      <div className="container-base py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className={`lg:w-64 flex-shrink-0 ${filtersOpen ? "block" : "hidden lg:block"}`}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-slate-900 dark:text-white">Filters</h2>
                {(selectedCategory || search) && (
                  <button
                    onClick={() => { setSelectedCategory(""); setSearch(""); }}
                    className="text-xs text-[#2563EB] hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="mb-6">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Search</p>
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products…"
                    className="w-full pl-9 pr-3 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent dark:text-white"
                  />
                </form>
              </div>

              {/* Categories */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Categories</p>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory("")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      !selectedCategory
                        ? "bg-[#2563EB]/10 text-[#2563EB] font-semibold"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span>All Categories</span>
                    <span className="text-xs text-slate-400">{total}</span>
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === cat.slug
                          ? "bg-[#2563EB]/10 text-[#2563EB] font-semibold"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {cat.emoji && <span>{cat.emoji}</span>}
                        {cat.name}
                      </span>
                      <span className="text-xs text-slate-400">{cat._count?.products}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400"
                >
                  <SlidersHorizontal className="w-4 h-4" /> Filters
                </button>
                {selectedCategory && (
                  <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] text-sm font-medium">
                    {categories.find((c) => c.slug === selectedCategory)?.name}
                    <button onClick={clearCategory}><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 hidden sm:block">{products.length} of {total}</span>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  >
                    {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-5xl mb-4">🔍</p>
                <p className="font-semibold text-slate-700 dark:text-slate-300 text-lg">No products found</p>
                <p className="text-slate-400 mt-2 mb-6">Try adjusting your search or filters</p>
                <Button onClick={() => { setSearch(""); setSelectedCategory(""); }} variant="outline">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                  <AnimatePresence>
                    {products.map((product, i) => (
                      <ProductCard key={product.id} product={product} index={i % PAGE_SIZE} />
                    ))}
                  </AnimatePresence>
                </div>

                {hasMore && (
                  <div className="mt-10 text-center">
                    <Button
                      onClick={handleLoadMore}
                      loading={loadingMore}
                      variant="outline"
                      size="lg"
                    >
                      Load More Products
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-10">
          <div className="container-base">
            <div className="h-8 w-48 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse mb-2" />
            <div className="h-4 w-32 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
          </div>
        </div>
        <div className="container-base py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
            {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
