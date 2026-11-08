import { NextResponse } from "next/server";
import { getCategories } from "@/lib/queries";

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message ?? "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
