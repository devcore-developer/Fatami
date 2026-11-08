import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

// PATCH /api/admin/orders/[id]/status { status }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentAdmin();
  if (!user) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  try {
    const { id } = await params;
    const { status, paymentStatus, trackingNumber } = await req.json();
    const data: any = { updatedAt: new Date() };
    if (status) data.status = status;
    if (paymentStatus) data.paymentStatus = paymentStatus;
    if (trackingNumber !== undefined) data.trackingNumber = trackingNumber;
    const order = await db.order.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: order });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message ?? "Update failed" }, { status: 500 });
  }
}
