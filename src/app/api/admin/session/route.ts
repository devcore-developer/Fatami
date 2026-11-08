import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";

export async function GET() {
  const user = await getCurrentAdmin();
  if (!user) {
    return NextResponse.json({ success: false, authenticated: false }, { status: 200 });
  }
  return NextResponse.json({
    success: true,
    authenticated: true,
    data: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}
