import { NextResponse } from "next/server";
import { getGovernorateRates } from "@/lib/queries";

export async function GET() {
  try {
    const rates = await getGovernorateRates();
    return NextResponse.json({ success: true, data: rates });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message ?? "Failed to fetch governorates" },
      { status: 500 }
    );
  }
}
