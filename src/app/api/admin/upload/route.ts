// src/app/api/admin/upload/route.ts
// UPLOAD-ROUTE-V3 — Cloudflare R2 edition.
//
// The app runs on serverless hosting (AWS Lambda — the EROFS error at
// /var/task/public/uploads proved it) where the filesystem is READ-ONLY
// and ephemeral, so writing to public/uploads can never work in production.
// Files now go to Cloudflare R2 and only the public URL is returned.
// Same request/response contract as V2, so the admin UI needs no changes.

import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomBytes } from "crypto";

// 4MB keeps the multipart request safely under the ~4.5MB serverless
// body limit (Vercel & similar platforms reject bigger payloads with 413)
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
  const bucket = process.env.R2_BUCKET;
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

// GET — liveness + config check: open /api/admin/upload in the browser
export async function GET() {
  const cfg = getR2Config();
  return NextResponse.json({
    success: true,
    message: "UPLOAD-ROUTE-V3 (R2) is live",
    configured: cfg.ok,
    ...(cfg.ok ? {} : { missingEnvVars: cfg.missing }),
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentAdmin();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

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
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, error: "No file selected" },
        { status: 400 }
      );
    }

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
        { success: false, error: "File too large - max 4MB" },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());

    // Unique key, grouped in a products/ folder inside the bucket
    const key = `products/${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;

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

    return NextResponse.json({
      success: true,
      data: { url: `${cfg.publicBase}/${key}` },
    });
  } catch (err: any) {
    console.error("UPLOAD ERROR:", err);
    let message = err?.message ?? "Unknown error";
    const status = err?.$metadata?.httpStatusCode;
    if (status === 401 || status === 403) {
      message = "R2 رفض الطلب — اتأكد من R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY وإن التوكن فيه صلاحية Object Read & Write";
    } else if (status === 404 || err?.name === "NoSuchBucket") {
      message = "البكت مش موجود — اتأكد من R2_BUCKET";
    }
    return NextResponse.json(
      { success: false, error: `Upload failed: ${message}` },
      { status: 500 }
    );
  }
}