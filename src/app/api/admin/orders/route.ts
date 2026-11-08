import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getCurrentAdmin();
  if (!user) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  const orders = await db.order.findMany({
    include: { customer: true, items: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ success: true, data: orders });
}
