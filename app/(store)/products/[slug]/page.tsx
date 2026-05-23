import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductDetail from "@/components/store/ProductDetail";
import { Product } from "@/types";

interface Props { params: Promise<{ slug: string }> }

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const p = await prisma.product.findUnique({
      where: { slug, status: "ACTIVE" },
      include: { images: { orderBy: { sortOrder: "asc" } }, pricingTiers: { orderBy: { minQty: "asc" } }, category: true },
    });
    if (!p) return null;
    // Increment view count
    await prisma.product.update({ where: { id: p.id }, data: { viewCount: { increment: 1 } } });
    await prisma.productView.create({ data: { productId: p.id } });
    return {
      ...p,
      basePrice: Number(p.basePrice),
      engagementScore: Number(p.engagementScore),
      trendingScore: Number(p.trendingScore),
      pricingTiers: p.pricingTiers.map((t) => ({ ...t, price: Number(t.price) })),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    } as Product;
  } catch { return null; }
}

async function getRelated(product: Product): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: { categoryId: product.categoryId, status: "ACTIVE", id: { not: product.id } },
      include: { images: true, pricingTiers: true, category: true },
      take: 4,
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
  } catch { return []; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug }, select: { name: true, description: true },
  });
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.name,
    description: product.description?.slice(0, 160) ?? `Buy ${product.name} wholesale at BYASHARA STORE`,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const related = await getRelated(product);
  return <ProductDetail product={product} related={related} />;
}
