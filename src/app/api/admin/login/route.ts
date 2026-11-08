import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin, createAdminSession } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "البريد الإلكتروني وكلمة المرور مطلوبة" },
        { status: 400 }
      );
    }
    const user = await verifyAdmin(email, password);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "بيانات الدخول غير صحيحة" },
        { status: 401 }
      );
    }
    await createAdminSession(user.id);
    return NextResponse.json({
      success: true,
      data: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message ?? "Login failed" },
      { status: 500 }
    );
  }
}
