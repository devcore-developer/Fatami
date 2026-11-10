// Server-side data access layer for FATAMI DESIGNS

import { db } from "@/lib/db";
import type {
  Category,
  Customer,
  CustomerMeasurements,
  Order,
  OrderItem,
  Product,
  SizeCode,
  StoreSettings,
} from "@/types";

// ---------- Products ----------
export async function getProducts(filters?: {
  categoryId?: string;
  categorySlug?: string;
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  activeOnly?: boolean;
  search?: string;
}): Promise<Product[]> {
  const where: any = {};
  if (filters?.activeOnly !== false) where.active = true;
  if (filters?.categorySlug) {
    const cat = await db.category.findUnique({ where: { slug: filters.categorySlug } });
    if (cat) where.categoryId = cat.id;
  }
  if (filters?.categoryId) where.categoryId = filters.categoryId;
  if (filters?.featured) where.featured = true;
  if (filters?.newArrival) where.newArrival = true;
  if (filters?.bestSeller) where.bestSeller = true;
  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search } },
      { nameAr: { contains: filters.search } },
      { description: { contains: filters.search } },
    ];
  }

  const rows = await db.product.findMany({
    where,
    include: {
      images: { orderBy: { position: "asc" } },
      sizes: true,
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const row = await db.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      sizes: true,
      category: true,
    },
  });
  return row ? mapProduct(row) : null;
}

export async function getProductById(id: string) {
  return db.product.findUnique({
    where: { id },
    include: { images: true, sizes: true, category: true },
  });
}

// ---------- Categories ----------
export async function getCategories(): Promise<Category[]> {
  const rows = await db.category.findMany({ orderBy: { name: "asc" } });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    nameAr: r.nameAr,
    slug: r.slug,
    image: r.image ?? undefined,
  }));
}

// ---------- Governorates ----------
export async function getGovernorateRates() {
  const rows = await db.governorateRate.findMany({
    where: { active: true },
    orderBy: { nameAr: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    nameAr: r.nameAr,
    shippingCost: r.shippingCost,
  }));
}

export async function getShippingCost(governorateAr: string): Promise<number> {
  const row = await db.governorateRate.findUnique({ where: { nameAr: governorateAr } });
  return row?.shippingCost ?? 0;
}

// ---------- Settings ----------
export async function getStoreSettings(): Promise<StoreSettings> {
  const row = await db.storeSettings.findUnique({ where: { id: "singleton" } });
  if (!row) {
    return {
      brandName: "FATAMI DESIGNS",
      brandTagline: "أناقة بلا حدود",
      currency: "KWD",
    };
  }
  return {
    brandName: row.brandName,
    brandTagline: row.brandTagline,
    currency: row.currency,
    whatsapp: row.whatsapp ?? undefined,
    instagram: row.instagram ?? undefined,
    tiktok: row.tiktok ?? undefined,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    freeShippingThreshold: row.freeShippingThreshold ?? undefined,
  };
}

// ---------- Orders ----------
export interface CreateOrderInput {
  customer: {
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
  };
  items: {
    productId: string;
    size: SizeCode;
    quantity: number;
    measurements?: CustomerMeasurements;
  }[];
  paymentMethod: "UPAYMENTS" | "COD";
  notes?: string;
}

async function nextOrderNumber(): Promise<string> {
  const count = await db.order.count();
  const year = new Date().getFullYear();
  const seqStr = String(count + 1).padStart(6, "0");
  return `FD-${year}-${seqStr}`;
}

function generateTrackingNumber(): string {
  const part = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `FAT-${part()}-${part()}-${part()}`;
}

export async function createOrder(
  input: CreateOrderInput
): Promise<{ order: Order }> {
  return await db.$transaction(async (tx) => {
    const orderItems: OrderItem[] = [];
    let subtotal = 0;
    const productCache: Record<string, { name: string; nameAr: string; price: number; image?: string }> = {};

    for (const line of input.items) {
      const product = await tx.product.findUnique({
        where: { id: line.productId },
        include: { images: { orderBy: { position: "asc" }, take: 1 }, sizes: true },
      });
      if (!product) throw new Error(`المنتج غير موجود: ${line.productId}`);
      if (!product.active) throw new Error(`المنتج غير متاح: ${product.nameAr}`);

      const trackStock = product.trackStock ?? true;

      if (trackStock) {
        const sizeRow = product.sizes.find((s) => s.size === line.size);
        if (!sizeRow) throw new Error(`المقاس غير متاح: ${line.size}`);
        if (sizeRow.stock < line.quantity)
          throw new Error(`الكمية المطلوبة غير متوفرة لـ ${product.nameAr} مقاس ${line.size} (متوفر: ${sizeRow.stock})`);

        await tx.productSize.update({
          where: { id: sizeRow.id },
          data: { stock: sizeRow.stock - line.quantity },
        });
      }
      // If trackStock is false, skip stock validation entirely — product is always available.

      const lineTotal = product.price * line.quantity;
      subtotal += lineTotal;

      productCache[product.id] = {
        name: product.name,
        nameAr: product.nameAr,
        price: product.price,
        image: product.images[0]?.url,
      };

      orderItems.push({
        id: "tmp",
        orderId: "tmp",
        productId: product.id,
        productName: product.nameAr,
        productImage: product.images[0]?.url,
        size: line.size,
        quantity: line.quantity,
        price: product.price,
        measurements: line.measurements,
      });
    }

    const gov = await tx.governorateRate.findUnique({
      where: { nameAr: input.customer.governorate },
    });
    if (!gov) throw new Error(`المحافظة غير صحيحة: ${input.customer.governorate}`);
    const shippingCost = gov.shippingCost;

    const customer = await tx.customer.create({
      data: {
        email: input.customer.email,
        phone: input.customer.phone,
        firstName: input.customer.firstName,
        lastName: input.customer.lastName,
        address: input.customer.address,
        apartment: input.customer.apartment,
        block: input.customer.block,
        postalCode: input.customer.postalCode,
        city: input.customer.city,
        governorate: input.customer.governorate,
      },
    });

    const orderNumber = await nextOrderNumber();
    const trackingNumber = generateTrackingNumber();
    const order = await tx.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        subtotal,
        shippingCost,
        discount: 0,
        total: subtotal + shippingCost,
        status: "PENDING",
        paymentStatus: "UNPAID",
        paymentMethod: input.paymentMethod,
        governorate: input.customer.governorate,
        city: input.customer.city,
        trackingNumber,
        notes: input.notes,
      },
    });

    for (let i = 0; i < orderItems.length; i++) {
      const oi = orderItems[i];
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: oi.productId,
          productName: oi.productName,
          productImage: oi.productImage,
          size: oi.size,
          quantity: oi.quantity,
          price: oi.price,
          measurementsJson: oi.measurements ? JSON.stringify(oi.measurements) : null,
        },
      });
    }

    return {
      order: {
        ...order,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        items: orderItems.map((oi) => ({ ...oi, orderId: order.id })),
        customer: {
          ...customer,
          email: customer.email ?? undefined,
          apartment: customer.apartment ?? undefined,
          block: customer.block ?? undefined,
          postalCode: customer.postalCode ?? undefined,
          createdAt: customer.createdAt.toISOString(),
          updatedAt: customer.updatedAt.toISOString(),
        } as Customer,
        paymentMethod: order.paymentMethod as "UPAYMENTS" | "COD",
        status: order.status as Order["status"],
        paymentStatus: order.paymentStatus as Order["paymentStatus"],
        trackingNumber: order.trackingNumber ?? undefined,
        upaymentsTransactionId: order.upaymentsTransactionId ?? undefined,
      } as Order,
    };
  });
}

export async function getOrderByNumber(orderNumber: string, phone?: string) {
  const order = await db.order.findUnique({
    where: { orderNumber },
    include: { customer: true, items: true },
  });
  if (!order) return null;
  if (phone && order.customer.phone !== phone) return null;
  return order;
}

export async function updateOrderPayment(
  orderId: string,
  status: "PAID" | "FAILED" | "CANCELLED" | "REFUNDED" | "PENDING",
  transactionId?: string,
  reference?: string
) {
  return db.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: status,
      upaymentsTransactionId: transactionId,
      upaymentsReference: reference,
      status: status === "PAID" ? "CONFIRMED" : "PENDING",
      updatedAt: new Date(),
    },
  });
}

export async function listOrders(limit = 50) {
  return db.order.findMany({
    include: { customer: true, items: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function updateOrderStatus(orderId: string, status: string) {
  return db.order.update({
    where: { id: orderId },
    data: { status, updatedAt: new Date() },
  });
}

// ---------- Discount codes ----------
export async function validateDiscountCode(
  code: string
): Promise<{ valid: boolean; type?: string; value?: number; error?: string }> {
  const rec = await db.discountCode.findUnique({ where: { code: code.toUpperCase() } });
  if (!rec) return { valid: false, error: "كود الخصم غير صحيح" };
  if (!rec.active) return { valid: false, error: "كود الخصم غير نشط" };
  if (rec.usageLimit && rec.usedCount >= rec.usageLimit)
    return { valid: false, error: "انتهت صلاحية استخدام هذا الكود" };
  if (rec.expiresAt && rec.expiresAt < new Date())
    return { valid: false, error: "انتهت صلاحية الكود" };
  return { valid: true, type: rec.type, value: rec.value };
}

// ---------- mappers ----------
function mapProduct(r: any): Product {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    nameAr: r.nameAr,
    description: r.description,
    price: r.price,
    compareAtPrice: r.compareAtPrice ?? undefined,
    categoryId: r.categoryId,
    images: (r.images ?? []).map((i: any) => ({ id: i.id, url: i.url, alt: i.alt })),
    sizes: (r.sizes ?? []).map((s: any) => ({ size: s.size as SizeCode, stock: s.stock })),
    featured: r.featured,
    newArrival: r.newArrival,
    bestSeller: r.bestSeller,
    active: r.active,
    trackStock: r.trackStock ?? true,
    fabric: r.fabric ?? undefined,
    care: r.care ?? undefined,
    createdAt: r.createdAt.toISOString(),
  };
}