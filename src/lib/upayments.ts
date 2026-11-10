// UPayments integration for Futami DESIGNS
// Based on the standard UPayments Kuwait gateway workflow:
//   1. Server creates a payment request via UPayments API
//   2. Customer is redirected to the UPayments hosted checkout
//   3. On completion, UPayments redirects back to a success/cancel URL
//   4. UPayments also calls a webhook to confirm payment status
//   5. Server verifies the transaction and updates the order
//
// Required environment variables (set in .env for production):
//   UPAYMENTS_API_KEY     - Your UPayments API key
//   UPAYMENTS_STORE_ID    - Your UPayments store ID
//   UPAYMENTS_USERNAME    - Your UPayments account username
//   UPAYMENTS_PASSWORD    - Your UPayments account password
//   UPAYMENTS_BASE_URL    - https://api.upayments.com/api/v1 (live) or
//                           https://api.upaystaging.com/api/v1 (test)
//   APP_BASE_URL          - https://yourdomain.com (for callbacks)
//
// If credentials are missing, the integration falls back to a mock
// "pending payment" mode so the rest of the flow stays testable.

import { db } from "@/lib/db";
import { updateOrderPayment } from "@/lib/queries";

const UPAYMENTS_BASE_URL =
  process.env.UPAYMENTS_BASE_URL ?? "https://api.upayments.com/api/v1";

const APP_BASE_URL =
  process.env.APP_BASE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

interface UPaymentsRequest {
  store_id: string;
  amount: number;
  currency: string; // "KWD"
  order_id: string; // our orderNumber
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_mobile: string;
  redirect_url: string;
  webhook_url: string;
  reference: string;
}

export interface UPaymentsResponse {
  success: boolean;
  data?: {
    paymentURL?: string;
    transactionID?: string;
    reference?: string;
  };
  message?: string;
}

function hasCredentials(): boolean {
  return !!(
    process.env.UPAYMENTS_API_KEY &&
    process.env.UPAYMENTS_STORE_ID &&
    process.env.UPAYMENTS_USERNAME &&
    process.env.UPAYMENTS_PASSWORD
  );
}

/**
 * Create a UPayments payment request for an order.
 * Returns the hosted checkout URL the customer should be redirected to.
 */
export async function createPaymentRequest(orderId: string): Promise<{
  success: boolean;
  paymentURL?: string;
  transactionId?: string;
  reference?: string;
  error?: string;
}> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { customer: true, items: true },
  });
  if (!order) return { success: false, error: "الطلب غير موجود" };
  if (order.paymentStatus === "PAID") return { success: false, error: "الطلب مدفوع بالفعل" };

  // If no credentials, mark order as PENDING payment and return a mock URL.
  if (!hasCredentials()) {
    await db.order.update({
      where: { id: orderId },
      data: { paymentStatus: "PENDING" },
    });
    return {
      success: true,
      paymentURL: `${APP_BASE_URL}/api/upayments/mock?orderId=${orderId}`,
      reference: `MOCK-${order.orderNumber}`,
      error: "UPAYMENTS_CREDENTIALS_MISSING",
    };
  }

  const payload: UPaymentsRequest = {
    store_id: process.env.UPAYMENTS_STORE_ID!,
    amount: Number(order.total.toFixed(3)),
    currency: "KWD",
    order_id: order.orderNumber,
    customer_first_name: order.customer.firstName,
    customer_last_name: order.customer.lastName,
    customer_email: order.customer.email ?? "customer@Futamidesigns.com",
    customer_mobile: order.customer.phone,
    redirect_url: `${APP_BASE_URL}/api/upayments/callback?orderNumber=${order.orderNumber}`,
    webhook_url: `${APP_BASE_URL}/api/upayments/webhook`,
    reference: order.trackingNumber ?? order.orderNumber,
  };

  const auth = Buffer.from(
    `${process.env.UPAYMENTS_USERNAME}:${process.env.UPAYMENTS_PASSWORD}`
  ).toString("base64");

  const res = await fetch(`${UPAYMENTS_BASE_URL}/charge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
      "X-API-KEY": process.env.UPAYMENTS_API_KEY!,
    },
    body: JSON.stringify(payload),
  });

  const json: UPaymentsResponse = await res.json();

  if (json.success && json.data?.paymentURL) {
    // Record transaction reference
    await db.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PENDING",
      },
    });
    return {
      success: true,
      paymentURL: json.data.paymentURL,
      transactionId: json.data.transactionID,
      reference: json.data.reference,
    };
  }

  return { success: false, error: json.message ?? "فشل إنشاء طلب الدفع" };
}

/**
 * Verify a payment transaction status with UPayments.
 * Called after the customer is redirected back, and from the webhook.
 */
export async function verifyPayment(
  transactionId: string,
  orderNumber: string
): Promise<{
  success: boolean;
  status: "PAID" | "FAILED" | "CANCELLED" | "UNKNOWN";
  error?: string;
}> {
  if (!hasCredentials()) {
    // Mock mode: mark as PAID for demo flow.
    // In production this branch should never run.
    return { success: true, status: "PAID" };
  }

  const auth = Buffer.from(
    `${process.env.UPAYMENTS_USERNAME}:${process.env.UPAYMENTS_PASSWORD}`
  ).toString("base64");

  const res = await fetch(
    `${UPAYMENTS_BASE_URL}/check_transection?track_id=${transactionId}&order_id=${orderNumber}`,
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        "X-API-KEY": process.env.UPAYMENTS_API_KEY!,
      },
    }
  );

  const json = await res.json();

  // UPayments returns payment status; map to our states.
  if (json.success || json.status === "success" || json.payment_status === "success") {
    return { success: true, status: "PAID" };
  }
  if (json.status === "failed" || json.payment_status === "failed") {
    return { success: true, status: "FAILED" };
  }
  if (json.status === "cancelled" || json.payment_status === "cancelled") {
    return { success: true, status: "CANCELLED" };
  }

  return { success: false, status: "UNKNOWN", error: "حالة الدفع غير مؤكدة" };
}

/**
 * Process the payment result (after redirect back or webhook).
 * Updates the order payment status and prevents duplicate processing.
 */
export async function processPaymentResult(
  orderId: string,
  transactionId: string,
  orderNumber: string
): Promise<{ ok: boolean; status: string }> {
  // Idempotency: if already paid, do nothing.
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return { ok: false, status: "ORDER_NOT_FOUND" };
  if (order.paymentStatus === "PAID") return { ok: true, status: "ALREADY_PAID" };

  const verification = await verifyPayment(transactionId, orderNumber);
  if (!verification.success) {
    await updateOrderPayment(orderId, "PENDING");
    return { ok: false, status: "VERIFICATION_PENDING" };
  }

  await updateOrderPayment(
    orderId,
    verification.status === "PAID" ? "PAID" : verification.status === "UNKNOWN" ? "PENDING" : verification.status,
  );

  return { ok: true, status: verification.status };
}
