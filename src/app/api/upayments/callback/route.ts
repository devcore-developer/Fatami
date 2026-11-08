import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { processPaymentResult } from "@/lib/upayments";

// GET /api/upayments/callback?orderNumber=...&transactionId=...&status=...
// Customer is redirected here after completing (or cancelling) payment.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get("orderNumber") ?? searchParams.get("order_id");
  const transactionId = searchParams.get("transactionId") ?? searchParams.get("track_id") ?? searchParams.get("TranId");
  const status = searchParams.get("status");

  if (!orderNumber) {
    return NextResponse.redirect(new URL("/?payment=error", req.url));
  }

  const order = await db.order.findUnique({ where: { orderNumber } });
  if (!order) {
    return NextResponse.redirect(new URL("/?payment=error", req.url));
  }

  // If the gateway already tells us it failed/cancelled, short-circuit.
  if (status === "failed" || status === "cancel" || status === "cancelled") {
    await db.order.update({
      where: { id: order.id },
      data: { paymentStatus: "FAILED" },
    });
    return NextResponse.redirect(
      new URL(`/#payment=failed&order=${orderNumber}&view=order-tracking`, req.url)
    );
  }

  // Verify transaction with UPayments server-side.
  const result = await processPaymentResult(
    order.id,
    transactionId ?? order.upaymentsTransactionId ?? "",
    orderNumber
  );

  // Redirect to the storefront with payment result in the URL hash.
  // The SPA reads the hash on load and switches to the order-tracking view.
  const paymentParam = result.status === "PAID" ? "success" : "pending";
  return NextResponse.redirect(
    new URL(`/#payment=${paymentParam}&order=${orderNumber}&view=order-tracking`, req.url)
  );
}
