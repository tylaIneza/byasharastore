"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Plus, Trash2, Upload, X, GripVertical } from "lucide-react";
import { productSchema, ProductFormData } from "@/lib/validators/product";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Product } from "@/types";

function generateSku(name: string): string {
  const code = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6)
    .padEnd(4, "X");
  const num = String(Math.floor(Math.random() * 900 + 100));
  return `BYS-${code}-${num}`;
}

interface Props { product?: Product }

export default function ProductForm({ product }: Props) {
  const router = useRouter();
  const isEdit = !!product;
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<{ url: string; isPrimary: boolean }[]>(
    product?.images?.map((i) => ({ url: i.url, isPrimary: i.isPrimary })) ?? []
  );
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  const skuManuallyEdited = useRef(false);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      sku: product?.sku ?? "",
      categoryId: product?.categoryId ?? "",
      stock: product?.stock ?? 0,
      minOrderQty: product?.minOrderQty ?? 1,
      basePrice: product?.basePrice ?? 0,
      featured: product?.featured ?? false,
      status: product?.status ?? "DRAFT",
    },
  });

  const watchedName = watch("name");

  useEffect(() => {
    if (isEdit || skuManuallyEdited.current || !watchedName?.trim()) return;
    setValue("sku", generateSku(watchedName), { shouldValidate: false, shouldDirty: false });
  }, [watchedName, isEdit, setValue]);

  const { fields: tiers, append: appendTier, remove: removeTier } = useFieldArray({
    control,
    name: "pricingTiers" as never,
  });

  useEffect(() => {
    fetch("/api/categories?active=true").then((r) => r.json()).then((d) => {
      if (d.success) setCategories(d.data);
    });
  }, []);

  const onDrop = useCallback(async (files: File[]) => {
    setUploading(true);
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setImages((prev) => [...prev, { url: data.url, isPrimary: prev.length === 0 }]);
      }
    }
    setUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  async function onSubmit(data: ProductFormData) {
    setSaving(true);
    try {
      const payload = {
        ...data,
        images: images.map((img, i) => ({ ...img, sortOrder: i })),
        pricingTiers: (data as { pricingTiers?: { label: string; minQty: number; price: number }[] }).pricingTiers ?? [],
      };

      const url = isEdit ? `/api/products/${product!.id}` : "/api/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        router.push("/admin/products");
        router.refresh();
      } else {
        alert(result.error ?? "Failed to save product");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-4">
            <h2 className="font-bold text-slate-900 dark:text-white">Basic Information</h2>
            <Input label="Product Name" required error={errors.name?.message} {...register("name")} />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="SKU"
                required
                error={errors.sku?.message}
                placeholder="BYS-001"
                {...register("sku", { onChange: () => { skuManuallyEdited.current = true; } })}
              />
              <Select
                label="Category"
                required
                error={errors.categoryId?.message}
                options={[{ value: "", label: "Select category…" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
                {...register("categoryId")}
              />
            </div>
            <Textarea label="Description" rows={5} {...register("description")} />
          </div>

          {/* Images */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
            <h2 className="font-bold text-slate-900 dark:text-white mb-4">Product Images</h2>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive ? "border-[#2563EB] bg-[#2563EB]/5" : "border-slate-200 dark:border-slate-700 hover:border-[#2563EB]"}`}
            >
              <input {...getInputProps()} />
              <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">
                {uploading ? "Uploading…" : "Drop images here or click to select"}
              </p>
              <p className="text-xs text-slate-400 mt-1">PNG, JPG, WebP — max 10MB each</p>
            </div>

            {images.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {images.map((img, i) => (
                  <div key={i} className="relative group">
                    <div className={`relative w-24 h-24 rounded-xl overflow-hidden border-2 ${img.isPrimary ? "border-[#2563EB]" : "border-transparent"}`}>
                      <Image src={img.url} alt="" fill className="object-cover" sizes="96px" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {!img.isPrimary && (
                      <button
                        type="button"
                        onClick={() => setImages((prev) => prev.map((img2, j) => ({ ...img2, isPrimary: j === i })))}
                        className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Set Primary
                      </button>
                    )}
                    {img.isPrimary && (
                      <span className="absolute bottom-0 left-0 right-0 bg-[#2563EB] text-white text-[10px] text-center py-0.5">Primary</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing Tiers */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 dark:text-white">Bulk Pricing Tiers</h2>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => appendTier({ label: "", minQty: 1, maxQty: null, price: 0 } as never)}
              >
                <Plus className="w-3.5 h-3.5" /> Add Tier
              </Button>
            </div>
            {tiers.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No pricing tiers — base price will be used</p>
            ) : (
              <div className="space-y-3">
                {tiers.map((tier, i) => (
                  <div key={tier.id} className="flex gap-3 items-start p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <div className="grid grid-cols-4 gap-2 flex-1">
                      <input placeholder="Label (e.g. Bulk)" className="h-8 px-2 rounded border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 dark:text-white" {...register(`pricingTiers.${i}.label` as never)} />
                      <input type="number" placeholder="Min qty" className="h-8 px-2 rounded border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 dark:text-white" {...register(`pricingTiers.${i}.minQty` as never, { valueAsNumber: true })} />
                      <input type="number" placeholder="Max qty" className="h-8 px-2 rounded border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 dark:text-white" {...register(`pricingTiers.${i}.maxQty` as never, { valueAsNumber: true })} />
                      <input type="number" placeholder="Price (RWF)" className="h-8 px-2 rounded border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 dark:text-white" {...register(`pricingTiers.${i}.price` as never, { valueAsNumber: true })} />
                    </div>
                    <button type="button" onClick={() => removeTier(i)} className="p-1.5 rounded text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-4">
            <h2 className="font-bold text-slate-900 dark:text-white">Pricing & Stock</h2>
            <Input label="Base Price (RWF)" type="number" required error={errors.basePrice?.message} {...register("basePrice", { valueAsNumber: true })} />
            <Input label="Stock Quantity" type="number" required error={errors.stock?.message} {...register("stock", { valueAsNumber: true })} />
            <Input label="Min Order Qty (MOQ)" type="number" required error={errors.minOrderQty?.message} {...register("minOrderQty", { valueAsNumber: true })} />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-4">
            <h2 className="font-bold text-slate-900 dark:text-white">Status & Visibility</h2>
            <Select
              label="Status"
              options={[
                { value: "DRAFT", label: "Draft" },
                { value: "PENDING", label: "Pending Review" },
                { value: "ACTIVE", label: "Active (Published)" },
                { value: "REJECTED", label: "Rejected" },
              ]}
              {...register("status")}
            />
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]" {...register("featured")} />
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Featured Product</p>
                <p className="text-xs text-slate-400">Show on homepage featured section</p>
              </div>
            </label>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="secondary" fullWidth onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} fullWidth>
              {isEdit ? "Save Changes" : "Create Product"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
