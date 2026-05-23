import { z } from "zod";

export const checkoutSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().min(9, "Enter a valid phone number").max(20),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  country: z.string().min(2).max(60),
  city: z.string().min(2, "City is required").max(60),
  address: z.string().min(5, "Delivery address is required").max(500),
  notes: z.string().max(1000).optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

export const orderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "DISPATCHED", "DELIVERED", "CANCELLED"]),
  notes: z.string().max(500).optional(),
});
