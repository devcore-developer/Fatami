import { NextRequest, NextResponse } from "next/server";
import { adminUploadImage } from "@/lib/r2";

// POST /api/admin/upload — admin-protected image upload (R2).
// Used by the storefront-content and product editors to upload hero images
// and product imagery. Falls back to a data URL when R2 credentials are
// not configured (local/dev), so the admin UI remains usable.
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
    // Default folder is "products"; storefront editors pass "storefront".
    const folder = (formData.get("folder") as string) || "products";
    const result = await adminUploadImage(file, folder);
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