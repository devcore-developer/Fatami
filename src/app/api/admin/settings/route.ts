import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function GET() {
  const settings = await db.storeSettings.findUnique({ where: { id: "singleton" } });
  return NextResponse.json({ success: true, data: settings });
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentAdmin();
  if (!user) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  try {
    const body = await req.json();
    const updated = await db.storeSettings.upsert({
      where: { id: "singleton" },
      update: { ...body, updatedAt: new Date() },
      create: { id: "singleton", ...body },
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message ?? "Update failed" }, { status: 500 });
  }
}
