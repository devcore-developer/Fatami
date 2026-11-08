// Cloudflare R2 image storage for FATAMI DESIGNS
//
// Uses the S3-compatible API of Cloudflare R2 for server-side uploads.
// Images are uploaded with a unique key, and the public URL is stored in
// the ProductImage table.
//
// Required environment variables (set in .env for production):
//   R2_ACCOUNT_ID          - Cloudflare account ID
//   R2_ACCESS_KEY_ID       - R2 token access key ID
//   R2_SECRET_ACCESS_KEY   - R2 token secret
//   R2_BUCKET_NAME         - R2 bucket name (e.g. fatami-designs)
//   R2_PUBLIC_URL          - Public URL of the bucket (via R2 public access
//                            or a Cloudflare Worker / custom domain)
//
// If credentials are missing, uploads fall back to returning the data URL
// (base64) so the admin UI stays usable for local testing.

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getCurrentAdmin } from "@/lib/admin-auth";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME ?? "fatami-designs";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

function hasR2Credentials(): boolean {
  return !!(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY);
}

let r2Client: S3Client | null = null;
function getR2Client(): S3Client {
  if (r2Client) return r2Client;
  r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID!,
      secretAccessKey: R2_SECRET_ACCESS_KEY!,
    },
  });
  return r2Client;
}

/**
 * Upload an image file to R2. Returns the public URL.
 * Only callable from the server (admin route).
 */
export async function uploadImage(
  file: File,
  folder = "products"
): Promise<{ success: boolean; url?: string; key?: string; error?: string }> {
  // Validate type & size
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: "نوع الملف غير مدعوم (JPEG, PNG, WEBP, GIF فقط)" };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "حجم الصورة يجب أن يكون أقل من 5 ميجابايت" };
  }

  // Generate a unique key
  const ext = file.name.split(".").pop() ?? "jpg";
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  // If no R2 credentials, return a data URL (for local testing only).
  if (!hasR2Credentials()) {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;
    return {
      success: true,
      url: dataUrl,
      key: `local:${key}`,
      error: "R2_CREDENTIALS_MISSING",
    };
  }

  const buffer = await file.arrayBuffer();
  const client = getR2Client();

  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: new Uint8Array(buffer),
      ContentType: file.type,
    })
  );

  const publicUrl = R2_PUBLIC_URL
    ? `${R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`
    : `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;

  return { success: true, url: publicUrl, key };
}

/**
 * Delete an image from R2 by key.
 */
export async function deleteImage(key: string): Promise<{ success: boolean; error?: string }> {
  if (!key || key.startsWith("local:") || key.startsWith("data:")) {
    return { success: true }; // nothing to delete for local/data URLs
  }
  if (!hasR2Credentials()) {
    return { success: true };
  }
  try {
    const client = getR2Client();
    await client.send(
      new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key })
    );
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

/**
 * Helper for admin upload route: authenticate then upload.
 */
export async function adminUploadImage(file: File, folder?: string) {
  const user = await getCurrentAdmin();
  if (!user) {
    return { success: false, error: "غير مصرح" };
  }
  return uploadImage(file, folder);
}
