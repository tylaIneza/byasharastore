import ProductForm from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface Props { params: Promise<{ id: string }> }

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } }, pricingTiers: { orderBy: { minQty: "asc" } } },
  });
  if (!product) notFound();

  const serialized = {
    ...product,
    basePrice: Number(product.basePrice),
    engagementScore: Number(product.engagementScore),
    trendingScore: Number(product.trendingScore),
    pricingTiers: product.pricingTiers.map((t) => ({ ...t, price: Number(t.price) })),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };

  return (
    <div>
      <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Edit Product</h1>
      <ProductForm product={serialized as never} />
    </div>
  );
}
