import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { processPaymentResult } from "@/lib/upayments";

// POST /api/upayments/webhook
// UPayments server-to-server notification. Verifies and updates order.
// This is the authoritative source of payment status.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderNumber = body.order_id ?? body.orderNumber;
    const transactionId = body.transaction_id ?? body.track_id ?? body.TranId;
    const status = body.status ?? body.payment_status;

    if (!orderNumber || !transactionId) {
      return NextResponse.json(
        { success: false, error: "Missing order/transaction" },
        { status: 400 }
      );
    }

    const order = await db.order.findUnique({ where: { orderNumber } });
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Quick path for explicit failure from gateway.
    if (status === "failed" || status === "cancel" || status === "cancelled") {
      await db.order.update({
        where: { id: order.id },
        data: { paymentStatus: "FAILED", status: "CANCELLED" },
      });
      return NextResponse.json({ success: true, status: "FAILED" });
    }

    // Otherwise verify with UPayments (idempotent).
    const result = await processPaymentResult(order.id, transactionId, orderNumber);
    return NextResponse.json({ success: result.ok, status: result.status });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message ?? "Webhook failed" },
      { status: 500 }
    );
  }
}
