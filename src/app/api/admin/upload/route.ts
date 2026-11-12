// src/app/api/admin/upload/route.ts
// Image upload route: writes files into public/uploads (folder is created
// automatically if missing) and logs any failure to the terminal as
// "UPLOAD ERROR:" so we always know the real cause.

import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// GET - quick liveness check: open http://localhost:3000/api/admin/upload
// in the browser; if you see this JSON, the new route is live.
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "UPLOAD-ROUTE-V2 is live",
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentAdmin();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, error: "No file selected" },
        { status: 400 }
      );
    }

    // Determine extension from MIME type, or from the filename as fallback
    let ext = EXT_BY_MIME[file.type];
    if (!ext) {
      const nameExt = file.name.split(".").pop()?.toLowerCase();
      if (nameExt === "jpeg") ext = "jpg";
      else if (nameExt === "jpg" || nameExt === "png" || nameExt === "webp") ext = nameExt;
    }
    if (!ext) {
      return NextResponse.json(
        { success: false, error: "Unsupported file type - JPG, PNG or WEBP only" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "File too large - max 5MB" },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());

    // Unique filename so uploads never overwrite each other
    const filename = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;

    // Folder is created automatically if missing (recursive: true)
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    await writeFile(path.join(uploadsDir, filename), bytes);

    return NextResponse.json({
      success: true,
      data: { url: `/uploads/${filename}` },
    });
  } catch (err) {
    // Print the real error to the terminal
    console.error("UPLOAD ERROR:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Upload failed: ${message}` },
      { status: 500 }
    );
  }
}
