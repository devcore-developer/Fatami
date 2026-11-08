import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getCurrentAdmin();
  if (!user) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  const rates = await db.governorateRate.findMany({ orderBy: { nameAr: "asc" } });
  return NextResponse.json({ success: true, data: rates });
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentAdmin();
  if (!user) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  try {
    const { id, shippingCost, active } = await req.json();
    const rate = await db.governorateRate.update({
      where: { id },
      data: { shippingCost, active },
    });
    return NextResponse.json({ success: true, data: rate });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message ?? "Update failed" }, { status: 500 });
  }
}
