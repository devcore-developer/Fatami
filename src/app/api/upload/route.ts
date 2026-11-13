// src/app/api/upload/route.ts
// TRANSFER-UPLOAD-V3 — Cloudflare R2 edition.
// Customer-facing upload for bank-transfer screenshots during checkout
// (stored on the Order as transferScreenshot). This is the PUBLIC sibling
// of /api/admin/upload — it must NOT require admin auth, because customers
// upload while placing an order.
// The old version wrote to public/uploads, which is impossible on Vercel
// serverless (EROFS: read-only file system at /var/task/...). Files now go
// to the same R2 bucket under transfers/ and only the public URL is
// returned. Accepts "file", "screenshot" or "image" as the FormData field
// so any existing checkout form keeps working without changes.

import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomBytes } from "crypto";

// 4MB keeps the request safely under the ~4.5MB serverless body limit
const MAX_SIZE = 4 * 1024 * 1024;

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

let cachedClient: S3Client | null = null;

function getR2Config() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  // Accept both spellings so existing configs keep working
  const bucket = process.env.R2_BUCKET || process.env.R2_BUCKET_NAME;
  const publicBase = (process.env.R2_PUBLIC_URL || process.env.R2_CUSTOM_DOMAIN || "")
    .trim()
    .replace(/\/+$/, "");

  const entries: Array<[string, string | undefined]> = [
    ["R2_ACCOUNT_ID", accountId],
    ["R2_ACCESS_KEY_ID", accessKeyId],
    ["R2_SECRET_ACCESS_KEY", secretAccessKey],
    ["R2_BUCKET", bucket],
    ["R2_PUBLIC_URL", publicBase || undefined],
  ];
  const missing = entries.filter(([, v]) => !v).map(([k]) => k);
  if (missing.length > 0) {
    return { ok: false as const, missing };
  }
  return {
    ok: true as const,
    endpoint:
      process.env.R2_ENDPOINT ||
      `https://${accountId}.r2.cloudflarestorage.com`,
    accessKeyId: accessKeyId!,
    secretAccessKey: secretAccessKey!,
    bucket: bucket!,
    publicBase,
  };
}

// Reuse one client across invocations (helps cold starts)
function getClient(endpoint: string, accessKeyId: string, secretAccessKey: string) {
  if (!cachedClient) {
    cachedClient = new S3Client({
      region: "auto",
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
    });
  }
  return cachedClient;
}

// GET — liveness + config check: open /api/upload in the browser
export async function GET() {
  const cfg = getR2Config();
  return NextResponse.json({
    success: true,
    message: "TRANSFER-UPLOAD-V3 (R2) is live",
    configured: cfg.ok,
    ...(cfg.ok ? {} : { missingEnvVars: cfg.missing }),
  });
}

export async function POST(req: NextRequest) {
  const cfg = getR2Config();
  if (!cfg.ok) {
    return NextResponse.json(
      {
        success: false,
        error: `التخزين السحابي (R2) مش متظبط — متغيرات ناقصة: ${cfg.missing.join(", ")}`,
      },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    // The checkout form sends the screenshot under "file"; accept the
    // common alternatives too so nothing breaks either way.
    const raw =
      formData.get("file") || formData.get("screenshot") || formData.get("image");
    const file = raw instanceof File ? raw : null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "لم يتم اختيار صورة" },
        { status: 400 }
      );
    }

    let ext = EXT_BY_MIME[file.type];
    if (!ext) {
      const nameExt = file.name?.split(".").pop()?.toLowerCase();
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
        { success: false, error: "حجم الصورة كبير — الحد الأقصى 4 ميجابايت" },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());

    // Unique key, grouped in a transfers/ folder inside the same bucket
    const key = `transfers/${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;

    const client = getClient(cfg.endpoint, cfg.accessKeyId, cfg.secretAccessKey);
    await client.send(
      new PutObjectCommand({
        Bucket: cfg.bucket,
        Key: key,
        Body: bytes,
        ContentType: file.type || `image/${ext === "jpg" ? "jpeg" : ext}`,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );

    const url = `${cfg.publicBase}/${key}`;
    // data.url is the canonical shape; top-level url kept as a safety net
    // for older checkout code that may read json.url directly.
    return NextResponse.json({ success: true, data: { url }, url });
  } catch (err: any) {
    console.error("TRANSFER UPLOAD ERROR:", err);
    let message = err?.message ?? "Unknown error";
    const status = err?.$metadata?.httpStatusCode;
    if (status === 401 || status === 403) {
      message = "R2 رفض الطلب — راجع مفاتيح R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY";
    } else if (status === 404 || err?.name === "NoSuchBucket") {
      message = "البكت مش موجود — راجع R2_BUCKET_NAME";
    }
    return NextResponse.json(
      { success: false, error: `فشل رفع الصورة: ${message}` },
      { status: 500 }
    );
  }
}