import { NextRequest, NextResponse } from "next/server";
import { adminUploadImage } from "@/lib/r2";

// POST /api/admin/upload
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
    const result = await adminUploadImage(file, "products");
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
    return NextResponse.json({
      success: true,
      data: { url: result.url, key: result.key },
      warning: result.error === "R2_CREDENTIALS_MISSING" ? "R2 credentials not set — stored as data URL for testing" : undefined,
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message ?? "Upload failed" },
      { status: 500 }
    );
  }
}