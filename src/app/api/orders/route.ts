import { NextRequest, NextResponse } from "next/server";
import { createOrder, getOrderByNumber } from "@/lib/queries";
import type { CreateOrderInput } from "@/lib/queries";

// POST /api/orders — create an order from cart contents
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body?.customer || !Array.isArray(body?.items) || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "بيانات الطلب غير مكتملة" },
        { status: 400 }
      );
    }

    const c = body.customer;
    if (!c.phone || !c.firstName || !c.lastName || !c.address || !c.city || !c.governorate) {
      return NextResponse.json(
        { success: false, error: "جميع حقول العنوان مطلوبة" },
        { status: 400 }
      );
    }

    const input: CreateOrderInput = {
      customer: {
        email: c.email,
        phone: c.phone,
        firstName: c.firstName,
        lastName: c.lastName,
        address: c.address,
        apartment: c.apartment,
        block: c.block,
        postalCode: c.postalCode,
        city: c.city,
        governorate: c.governorate,
      },
      items: body.items,
      paymentMethod: body.paymentMethod ?? "BANK_TRANSFER",
      transferScreenshot: body.transferScreenshot,
      notes: body.notes,
    };

    const { order } = await createOrder(input);

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        trackingNumber: order.trackingNumber,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        transferScreenshot: order.transferScreenshot,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message ?? "فشل إنشاء الطلب" },
      { status: 500 }
    );
  }
}

// GET /api/orders?orderNumber=FD-2026-000001&phone=+965...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get("orderNumber");
    const phone = searchParams.get("phone");

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, error: "رقم الطلب مطلوب" },
        { status: 400 }
      );
    }

    const order = await getOrderByNumber(orderNumber, phone ?? undefined);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "الطلب غير موجود أو رقم الهاتف غير مطابق" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message ?? "Failed to fetch order" },
      { status: 500 }
    );
  }
}
