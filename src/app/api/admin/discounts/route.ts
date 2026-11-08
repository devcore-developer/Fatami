import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getCurrentAdmin();
  if (!user) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  const discounts = await db.discountCode.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ success: true, data: discounts });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentAdmin();
  if (!user) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  try {
    const body = await req.json();
    if (!body.code || !body.type || body.value == null) {
      return NextResponse.json({ success: false, error: "البيانات ناقصة" }, { status: 400 });
    }
    const discount = await db.discountCode.create({
      data: {
        code: body.code.toUpperCase(),
        type: body.type,
        value: Number(body.value),
        active: body.active ?? true,
        usageLimit: body.usageLimit,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    });
    return NextResponse.json({ success: true, data: discount });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message ?? "Create failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentAdmin();
  if (!user) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  try {
    const { id, active } = await req.json();
    const discount = await db.discountCode.update({ where: { id }, data: { active } });
    return NextResponse.json({ success: true, data: discount });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message ?? "Update failed" }, { status: 500 });
  }
}
