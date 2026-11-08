import { NextRequest, NextResponse } from "next/server";
import { createPaymentRequest } from "@/lib/upayments";

// POST /api/upayments/request { orderId }
// Creates a UPayments payment request and returns the hosted checkout URL.
export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "رقم الطلب مطلوب" },
        { status: 400 }
      );
    }
    const result = await createPaymentRequest(orderId);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
    return NextResponse.json({
      success: true,
      data: {
        paymentURL: result.paymentURL,
        transactionId: result.transactionId,
        reference: result.reference,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message ?? "Payment request failed" },
      { status: 500 }
    );
  }
}
