// ─── src/app/api/admin/upload/route.ts ───
// راوت رفع الصور (اللوجو، صور الهيرو، صور المنتجات).
// بيكتب الملفات في public/uploads على الجهاز محلياً، وبيعمل الفولدر
// تلقائياً لو مش موجود — ده كان السبب الأشهر لفشل الرفع بـ 500.
// ولو حصل خطأ، بيطبع السبب الحقيقي في الترمنال تحت سطر UPLOAD ERROR.

import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const MAX_SIZE = 5 * 1024 * 1024; // 5 ميجابايت

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// GET — اختبار سريع للتأكد إن الراوت الجديد شغال:
// افتحي http://localhost:3000/api/admin/upload في المتصفح،
// لو ظهرت رسالة JSON اللي تحت يبقى الملف اتستبدل واتسيف صح.
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "UPLOAD-ROUTE-V2 شغال ✅ — لو بتشوفي الرسالة دي يبقى الراوت الجديد فعال",
  });
}

export async function POST(req: NextRequest) {
  // التأكد من تسجيل دخول الأدمن
  const user = await getCurrentAdmin();
  if (!user) {
    return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, error: "لم يتم اختيار ملف" },
        { status: 400 }
      );
    }

    // تحديد الامتداد من نوع الملف، أو من اسم الملف لو المتصفح ما بعتش type
    let ext = EXT_BY_MIME[file.type];
    if (!ext) {
      const nameExt = file.name.split(".").pop()?.toLowerCase();
      if (nameExt === "jpeg") ext = "jpg";
      else if (nameExt === "jpg" || nameExt === "png" || nameExt === "webp") ext = nameExt;
    }
    if (!ext) {
      return NextResponse.json(
        { success: false, error: "نوع الملف غير مدعوم — المسموح: JPG أو PNG أو WEBP" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "حجم الصورة كبير — الحد الأقصى 5 ميجابايت" },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());

    // اسم فريد لكل ملف عشان الصور الجديدة ما تطمحش على القديمة
    const filename = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;

    // الفولدر بيتعمل تلقائياً لو مش موجود (recursive: true)
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    await writeFile(path.join(uploadsDir, filename), bytes);

    return NextResponse.json({
      success: true,
      data: { url: `/uploads/${filename}` },
    });
  } catch (err) {
    // اطبع الخطأ الحقيقي في الترمنال — دي هي تفاصيل سبب الفشل
    console.error("UPLOAD ERROR:", err);
    const message = err instanceof Error ? err.message : "خطأ غير معروف";
    return NextResponse.json(
      { success: false, error: `فشل رفع الملف: ${message}` },
      { status: 500 }
    );
  }
}