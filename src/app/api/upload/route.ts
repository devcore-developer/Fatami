import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/lib/r2";

// POST /api/upload — public endpoint for customer screenshot uploads
// No admin auth required — used for checkout transfer screenshots
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { success: false, error: "الملف مطلوب" },
        { status: 400 }
      );
    }
    // Use "receipts" folder to distinguish from admin product uploads
    const result = await uploadImage(file, "receipts");
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
    return NextResponse.json({
      success: true,
      data: { url: result.url, key: result.key },
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message ?? "Upload failed" },
      { status: 500 }
    );
  }
}