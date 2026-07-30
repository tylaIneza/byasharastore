// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = "SUPER_ADMIN" | "ADMIN";
export type ProductStatus = "DRAFT" | "PENDING" | "ACTIVE" | "REJECTED";
export type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "DISPATCHED" | "DELIVERED" | "CANCELLED";
export type StockMovementType = "IN" | "OUT" | "RETURN" | "ADJUSTMENT";
export type EngagementType = "VIEW" | "ADD_TO_CART" | "PURCHASE";
export type Language = "en" | "fr" | "rw";

// ─── User ─────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  avatar?: string | null;
  createdAt: string;
}

// ─── Category ─────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  emoji?: string | null;
  color?: string | null;
  image?: string | null;
  isActive: boolean;
  sortOrder: number;
  _count?: { products: number };
  createdAt: string;
}

// ─── Product ──────────────────────────────────────────────────────────────────

export interface PricingTier {
  id: string;
  label: string;
  minQty: number;
  maxQty?: number | null;
  price: number;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  sku: string;
  categoryId: string;
  category?: Category;
  stock: number;
  minOrderQty: number;
  basePrice: number;
  featured: boolean;
  status: ProductStatus;
  viewCount: number;
  engagementScore: number;
  trendingScore: number;
  images: ProductImage[];
  pricingTiers: PricingTier[];
  createdAt: string;
  updatedAt: string;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  name: string;
  sku: string;
  slug: string;
  image: string;
  basePrice: number;
  pricingTiers: PricingTier[];
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  minOrderQty: number;
  stock: number;
}

// ─── Order / Checkout ─────────────────────────────────────────────────────────

export interface CheckoutCustomer {
  name: string;
  phone: string;
  email?: string;
  country: string;
  city: string;
  address: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string;
  city: string;
  country: string;
  notes?: string | null;
  paymentMethod?: string | null;
  customer?: Customer;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: Product;
}

export interface Customer {
  id: string;
  name: string;
  email?: string | null;
  phone: string;
  country: string;
  city: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  orders?: Order[];
  createdAt: string;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  productsChange: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "ORDER" | "STOCK" | "SYSTEM" | "TEAM";
  read: boolean;
  link?: string | null;
  createdAt: string;
}

// ─── Stock ────────────────────────────────────────────────────────────────────

export interface StockMovement {
  id: string;
  productId: string;
  product?: { name: string; sku: string };
  type: StockMovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  notes?: string | null;
  createdBy?: { name: string } | null;
  createdAt: string;
}

// ─── Site Settings ────────────────────────────────────────────────────────────

export interface SiteSetting {
  id: string;
  key: string;
  value: string;
  label: string;
  type: string;
  group: string;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
