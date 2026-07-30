import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Add New Product</h1>
      <ProductForm />
    </div>
  );
}
