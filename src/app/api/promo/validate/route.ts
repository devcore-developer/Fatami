import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateDiscountCode, computeDiscountAmount } from "@/lib/queries";

// POST /api/promo/validate { code, items: [{ productId, quantity }] }
// Server-side promo validation for the checkout page. Prices are read from
// the database — the client's own subtotal/amounts are never trusted. The
// response is for display only: createOrder revalidates the code and
// recalculates the discount inside its transaction at submit time.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = typeof body?.code === "string" ? body.code.trim() : "";
    const rawItems = Array.isArray(body?.items) ? body.items : [];

    if (!code) {
      return NextResponse.json(
        { success: false, error: "أدخلي كود الخصم" },
        { status: 400 }
      );
    }
    if (code.length > 40) {
      return NextResponse.json(
        { success: false, error: "كود الخصم غير صحيح" },
        { status: 400 }
      );
    }

    const lines = rawItems
      .map((it: any) => ({
        productId: typeof it?.productId === "string" ? it.productId : "",
        quantity: Math.max(1, Math.min(99, Math.floor(Number(it?.quantity) || 0))),
      }))
      .filter((l: any) => l.productId && l.quantity > 0);
    if (lines.length === 0) {
      return NextResponse.json(
        { success: false, error: "السلة فارغة" },
        { status: 400 }
      );
    }

    // Subtotal comes from DB prices only (active products).
    const products = await db.product.findMany({
      where: { id: { in: lines.map((l: any) => l.productId) }, active: true },
      select: { id: true, price: true },
    });
    const priceById = new Map(products.map((p) => [p.id, p.price]));
    let subtotal = 0;
    for (const l of lines) {
      const price = priceById.get(l.productId);
      if (price === undefined) {
        return NextResponse.json(
          { success: false, error: "أحد المنتجات في السلة غير متاح حالياً" },
          { status: 400 }
        );
      }
      subtotal += price * l.quantity;
    }
    subtotal = Math.round(subtotal * 1000) / 1000;

    // Existing validation rules: exists, active, usage limit, expiry.
    const promo = await validateDiscountCode(code);
    if (!promo.valid || promo.type === undefined || promo.value === undefined) {
      return NextResponse.json(
        { success: false, error: promo.error || "كود الخصم غير صالح" },
        { status: 400 }
      );
    }

    const discountAmount = computeDiscountAmount(
      promo.type as "PERCENTAGE" | "FIXED",
      promo.value,
      subtotal
    );

    return NextResponse.json({
      success: true,
      data: {
        code: code.toUpperCase(),
        type: promo.type,
        value: promo.value,
        discountAmount,
        subtotal,
        subtotalAfterDiscount: Math.round((subtotal - discountAmount) * 1000) / 1000,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message ?? "تعذّر التحقق من الكود" },
      { status: 500 }
    );
  }
}