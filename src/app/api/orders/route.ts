import { NextRequest, NextResponse } from "next/server";
import { createOrder, getOrderByNumber, type CreateOrderInput } from "@/lib/queries";

// هذا الراوت لازم يعمل دايمًا ديناميكيًا وبلا أي كاش: صفحة تتبع العميل
// لازم تعرض القيم المخزّنة حاليًا في قاعدة البيانات لحظة الفحص، بحيث أي
// تغيير حالة من الأدمن يظهر عند أول refresh للعميل.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

// GET /api/orders?orderNumber=FD-...&phone=...  → تتبع الطلب للعميل.
// يقرأ الحالة الفعلية المخزّنة في قاعدة البيانات — بدون اشتقاق أو قيم
// افتراضية. التحقق الأمني الموجود محفوظ: رقم الهاتف لازم يطابق المخزّن.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = (searchParams.get("orderNumber") || "").trim();
    const phone = (searchParams.get("phone") || "").trim();

    if (!orderNumber || !phone) {
      return NextResponse.json(
        { success: false, error: "أدخلي رقم الطلب ورقم الهاتف" },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const order = await getOrderByNumber(orderNumber, phone);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "الطلب غير موجود — تأكدي من رقم الطلب ورقم الهاتف" },
        { status: 404, headers: NO_STORE_HEADERS }
      );
    }

    // نعيد الحقول الفعلية المخزّنة في الداتابيز كما هي — الحالة وحالة الدفع
    // تأتيان من الصف نفسه، ولا يتم تعديلهما أو اشتقاقهما هنا بأي شكل.
    return NextResponse.json(
      {
        success: true,
        data: {
          orderNumber: order.orderNumber,
          status: order.status,               // القيمة الفعلية في الداتابيز
          paymentStatus: order.paymentStatus, // القيمة الفعلية في الداتابيز
          trackingNumber: order.trackingNumber ?? null,
          promoCode: order.promoCode ?? null,
          discount: order.discount ?? 0,
          subtotal: order.subtotal,
          shippingCost: order.shippingCost,
          total: order.total,
          createdAt: order.createdAt,
          items: (order.items || []).map((it) => ({
            id: it.id,
            productName: it.productName,
            size: it.size,
            quantity: it.quantity,
            price: it.price,
          })),
        },
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message ?? "تعذّر جلب الطلب" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

// POST /api/orders → إنشاء طلب جديد.
// createOrder() يحفظ في قاعدة البيانات: status="PENDING" و
// paymentStatus="UNPAID" صراحةً، ويعيد التحقق من الأسعار والمخزون والشحن
// وكود الخصم على السيرفر. هذا الراوت لا يقبل ولا يضبط أي حالة
// (مؤكد/مدفوع/مشحون/مُوصل) من العميل إطلاقًا.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const input: CreateOrderInput = {
      customer: {
        email: typeof body?.customer?.email === "string" && body.customer.email ? body.customer.email : undefined,
        phone: String(body?.customer?.phone ?? "").trim(),
        firstName: String(body?.customer?.firstName ?? "").trim(),
        lastName: String(body?.customer?.lastName ?? "").trim(),
        address: String(body?.customer?.address ?? "").trim(),
        apartment: body?.customer?.apartment ? String(body.customer.apartment) : undefined,
        block: body?.customer?.block ? String(body.customer.block) : undefined,
        postalCode: body?.customer?.postalCode ? String(body.customer.postalCode) : undefined,
        city: String(body?.customer?.city ?? "").trim(),
        governorate: String(body?.customer?.governorate ?? "").trim(),
      },
      items: Array.isArray(body?.items)
        ? body.items.map((it: any) => ({
            productId: String(it?.productId ?? ""),
            size: String(it?.size ?? "") as any,
            quantity: Math.max(1, Math.floor(Number(it?.quantity) || 1)),
            measurements: it?.measurements,
          }))
        : [],
      paymentMethod: body?.paymentMethod === "WAMD" ? "WAMD" : "BANK_TRANSFER",
      transferScreenshot: body?.transferScreenshot ? String(body.transferScreenshot) : null,
      notes: body?.notes ? String(body.notes) : undefined,
      promoCode: typeof body?.promoCode === "string" ? body.promoCode : undefined,
    };

    if (!input.customer.phone || !input.customer.firstName || !input.customer.governorate || input.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "بيانات الطلب ناقصة" },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const { order } = await createOrder(input);

    return NextResponse.json(
      {
        success: true,
        data: {
          orderNumber: order.orderNumber,
          // الحالة الابتدائية المخزّنة فعلاً في قاعدة البيانات:
          status: order.status,             // "PENDING"
          paymentStatus: order.paymentStatus, // "UNPAID"
          total: order.total,
        },
      },
      { status: 201, headers: NO_STORE_HEADERS }
    );
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message ?? "تعذّر إنشاء الطلب" },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }
}