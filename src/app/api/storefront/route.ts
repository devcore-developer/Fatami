import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/storefront — public endpoint, returns editable homepage content
export async function GET() {
  try {
    const content = await db.storefrontContent.findUnique({ where: { id: "singleton" } });
    return NextResponse.json({ success: true, data: content });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message ?? "Failed to fetch storefront content" },
      { status: 500 }
    );
  }
}