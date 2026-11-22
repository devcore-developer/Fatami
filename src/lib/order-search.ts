import { PrismaClient } from "@prisma/client";

// عميل Prisma مشترك (نفس النمط المتبع في Next.js لتفادي اتصالات متعددة في بيئة التطوير)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const db = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// توحيد رقم الهاتف: إزالة كل الرموز غير الرقمية ثم حذف مفتاح الكويت
// (965 أو 00965) إن وُجد — حتى لا يفشل البحث بسبب اختلاف التنسيق
// (+965 90001234 مقابل 90001234 مثلاً).
export function normalizePhone(raw: string): string {
  const digits = (raw || "").replace(/\D/g, "");
  if (digits.startsWith("00965")) return digits.slice(5);
  if (digits.length > 8 && digits.startsWith("965")) return digits.slice(3);
  return digits;
}

// البحث المرن في الطلبات لتتبع العميل:
// - رقم الطلب + الهاتف معًا: يجب أن يطابقا نفس الطلب (تحقق مشترك).
// - رقم الطلب فقط: جلب الطلب المحدد مباشرة بدون هاتف.
// - الهاتف فقط: كل طلبات هذا الهاتف مرتبة من الأحدث للأقدم، بعد مطابقة
//   تامة على الرقم الموحّد (بحث مبدئي بـ contains ثم تصفية دقيقة،
//   حتى لا يظهر أي طلب لا يخص هذا الهاتف بالضبط).
export async function searchOrders(params: {
  orderNumber?: string;
  phone?: string;
}) {
  const orderNumber = (params.orderNumber || "").trim();
  const rawPhone = (params.phone || "").trim();

  if (orderNumber && rawPhone) {
    const order = await db.order.findUnique({
      where: { orderNumber },
      include: { customer: true, items: true },
    });
    if (!order) return { kind: "single" as const, order: null };
    const stored = order.customer?.phone ?? "";
    const matched = normalizePhone(stored) === normalizePhone(rawPhone);
    return { kind: "single" as const, order: matched ? order : null };
  }

  if (orderNumber) {
    const order = await db.order.findUnique({
      where: { orderNumber },
      include: { customer: true, items: true },
    });
    return { kind: "single" as const, order: order ?? null };
  }

  const local = normalizePhone(rawPhone);
  if (!local) return { kind: "list" as const, orders: [] };

  const candidates = await db.order.findMany({
    where: { customer: { phone: { contains: local } } },
    include: { customer: true, items: true },
    orderBy: { createdAt: "desc" },
  });
  const orders = candidates.filter(
    (o) => normalizePhone(o.customer?.phone ?? "") === local
  );
  return { kind: "list" as const, orders };
}