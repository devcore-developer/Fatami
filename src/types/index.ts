// Core domain types for FATAMI DESIGNS storefront & admin

export type SizeCode =
  | "XS"
  | "S"
  | "M"
  | "L"
  | "XL"
  | "XXL";

export interface SizeMeasurement {
  shoulder: number; // inches
  chest: number;
  waist: number;
  hips: number | string; // can be range "42-43"
}

export interface ProductSize {
  size: SizeCode;
  stock: number;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  nameAr: string;
  description: string;
  price: number; // KWD
  compareAtPrice?: number;
  categoryId: string;
  images: ProductImage[];
  sizes: ProductSize[];
  featured: boolean;
  newArrival: boolean;
  bestSeller: boolean;
  active: boolean;
  fabric?: string;
  care?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  image?: string;
  productCount?: number;
}

export interface CartItem {
  id: string; // unique cart line id
  productId: string;
  product: Product;
  size: SizeCode;
  quantity: number;
  measurements?: CustomerMeasurements;
}

export interface CustomerMeasurements {
  shoulder?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  sleeveLength?: number;
  height?: number;
}

export interface KuwaitGovernorate {
  id: string;
  name: string;
  nameAr: string;
  shippingCost: number; // KWD
}

export interface ShippingRate {
  governorate: string;
  cost: number;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus =
  | "UNPAID"
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentMethod = "UPAYMENTS" | "COD";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage?: string;
  size: SizeCode;
  quantity: number;
  price: number; // snapshot at purchase time
  measurements?: CustomerMeasurements;
}

export interface Customer {
  id: string;
  email?: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  block?: string;
  postalCode?: string;
  city: string;
  governorate: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  governorate: string;
  city: string;
  trackingNumber?: string;
  upaymentsTransactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountCode {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  active: boolean;
  usageLimit?: number;
  usedCount: number;
  expiresAt?: string;
}

export interface StoreSettings {
  brandName: string;
  brandTagline: string;
  currency: string;
  whatsapp?: string;
  instagram?: string;
  tiktok?: string;
  email?: string;
  phone?: string;
  freeShippingThreshold?: number;
}

// UI / view state
export type StoreView =
  | "home"
  | "shop"
  | "product"
  | "cart"
  | "checkout"
  | "about"
  | "contact"
  | "policies"
  | "size-guide"
  | "shipping-info"
  | "returns"
  | "privacy"
  | "terms"
  | "order-success"
  | "order-tracking"
  | "admin";

export interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
