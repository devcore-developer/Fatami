import { NextRequest, NextResponse } from "next/server";
import { validateDiscountCode } from "@/lib/queries";

// POST /api/discounts/validate { code, subtotal }
export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();
    if (!code) {
      return NextResponse.json(
        { success: false, error: "أدخلي كود الخصم" },
        { status: 400 }
      );
    }
    const result = await validateDiscountCode(code);
    if (!result.valid) {
      return NextResponse.json({ success: false, error: result.error });
    }

    let discount = 0;
    if (result.type === "PERCENTAGE") {
      discount = (Number(subtotal) || 0) * (result.value! / 100);
    } else if (result.type === "FIXED") {
      discount = result.value!;
    }

    return NextResponse.json({
      success: true,
      data: { type: result.type, value: result.value, discount },
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message ?? "Failed to validate discount" },
      { status: 500 }
    );
  }
}
