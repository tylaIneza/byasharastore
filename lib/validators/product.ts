import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(10000).optional(),
  sku: z.string().min(2).max(50),
  categoryId: z.string().min(1, "Category is required"),
  stock: z.number().int().min(0),
  minOrderQty: z.number().int().min(1),
  basePrice: z.number().min(0),
  featured: z.boolean().default(false),
  status: z.enum(["DRAFT", "PENDING", "ACTIVE", "REJECTED"]).default("DRAFT"),
  pricingTiers: z.array(z.object({
    label: z.string().min(1),
    minQty: z.number().int().min(1),
    maxQty: z.number().int().nullable().optional(),
    price: z.number().min(0),
  })).optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  emoji: z.string().max(10).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
