import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { updateOrderPayment } from "@/lib/queries";

// GET /api/upayments/mock?orderId=...
// Mock payment page for testing without real UPayments credentials.
// Simulates the gateway checkout then redirects to the callback.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");
  if (!orderId) {
    return new NextResponse("Missing orderId", { status: 400 });
  }
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return new NextResponse("Order not found", { status: 404 });
  }

  // Render a minimal mock checkout page in Arabic.
  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>بوابة الدفع — UPayments (تجريبي)</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;font-family:system-ui,sans-serif}
  body{background:#f5f5f5;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1rem}
  .card{background:#fff;max-width:420px;width:100%;padding:2rem;border:1px solid #ddd}
  .brand{font-size:1.25rem;font-weight:700;letter-spacing:2px;margin-bottom:.25rem}
  .sub{font-size:.75rem;color:#888;letter-spacing:2px;margin-bottom:1.5rem}
  .row{display:flex;justify-content:space-between;padding:.75rem 0;border-bottom:1px solid #eee;font-size:.875rem}
  .row span:first-child{color:#666}
  .total{font-weight:700;font-size:1.5rem;margin:1.5rem 0;text-align:center}
  .btn{display:block;width:100%;padding:1rem;background:#000;color:#fff;border:0;font-size:.875rem;letter-spacing:2px;text-transform:uppercase;cursor:pointer;margin-top:1rem;text-decoration:none;text-align:center}
  .btn.secondary{background:#fff;color:#000;border:1px solid #000}
  .note{font-size:.7rem;color:#999;margin-top:1rem;text-align:center;line-height:1.5}
</style>
</head>
<body>
  <div class="card">
    <div class="brand">UPayments</div>
    <div class="sub">بوابة الدفع — وضع تجريبي</div>
    <div class="row"><span>رقم الطلب</span><span dir="ltr">${order.orderNumber}</span></div>
    <div class="row"><span>العميل</span><span>${order.customerId}</span></div>
    <div class="row"><span>المحافظة</span><span>${order.governorate}</span></div>
    <div class="total">${order.total.toFixed(3)} د.ك</div>
    <form method="POST" action="/api/upayments/mock?orderId=${order.id}">
      <button type="submit" name="action" value="success" class="btn">تأكيد الدفع (نجاح)</button>
      <button type="submit" name="action" value="cancel" class="btn secondary">إلغاء الدفع</button>
    </form>
    <p class="note">هذه صفحة دفع تجريبية للاختبار بدون بيانات UPayments الحقيقية. في الإنتاج سيتم تحويل العميل إلى بوابة UPayments الفعلية.</p>
  </div>
</body>
</html>`;
  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

// POST /api/upayments/mock?orderId=...&action=success|cancel
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");
  const formData = await req.formData();
  const action = formData.get("action");

  if (!orderId) return new NextResponse("Missing orderId", { status: 400 });
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return new NextResponse("Order not found", { status: 404 });

  if (action === "success") {
    await updateOrderPayment(order.id, "PAID");
    // Use 303 See Other to convert POST → GET for the callback
    return NextResponse.redirect(
      new URL(`/api/upayments/callback?orderNumber=${order.orderNumber}&transactionId=MOCK-${order.orderNumber}&status=success`, req.url),
      { status: 303 }
    );
  } else {
    await updateOrderPayment(order.id, "FAILED");
    return NextResponse.redirect(
      new URL(`/api/upayments/callback?orderNumber=${order.orderNumber}&status=failed`, req.url),
      { status: 303 }
    );
  }
}
