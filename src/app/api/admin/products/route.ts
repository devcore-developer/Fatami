import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

// Arabic → Latin transliteration so auto-generated slugs stay URL-safe
// (no new dependencies — a small static map is enough)
const AR_TRANSLIT: Record<string, string> = {
  ا: "a", أ: "a", إ: "a", آ: "a", ب: "b", ت: "t", ث: "th", ج: "j", ح: "h",
  خ: "kh", د: "d", ذ: "dh", ر: "r", ز: "z", س: "s", ش: "sh", ص: "s", ض: "d",
  ط: "t", ظ: "z", ع: "a", غ: "gh", ف: "f", ق: "q", ك: "k", ل: "l", م: "m",
  ن: "n", ه: "h", و: "w", ي: "y", ى: "a", ة: "a", ء: "", ئ: "y", ؤ: "w",
};

function slugify(text: string): string {
  const translit = Array.from(text)
    .map((ch) => AR_TRANSLIT[ch] ?? ch)
    .join("");
  return translit
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Guarantees uniqueness even when several products share the same name
async function uniqueSlug(base: string): Promise<string> {
  const clean = base || "product";
  let candidate = clean;
  let n = 2;
  // findFirst works whether or not slug has a @unique constraint
  while (await db.product.findFirst({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${clean}-${n}`;
    n += 1;
  }
  return candidate;
}

// GET /api/admin/products — list all products (incl. inactive)
export async function GET() {
  const user = await getCurrentAdmin();
  if (!user) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  const products = await db.product.findMany({
    include: {
      images: { orderBy: { position: "asc" } },
      sizes: true,
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ success: true, data: products });
}

// POST /api/admin/products — create product
export async function POST(req: NextRequest) {
  const user = await getCurrentAdmin();
  if (!user) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  try {
    const body = await req.json();
    // slug is NEVER accepted from the client anymore — always generated.
    // newArrival is removed as a feature, so it is stripped too.
    const { images, sizes, slug: _slug, newArrival: _newArrival, ...rest } = body;
    if (!rest.nameAr || rest.price == null) {
      return NextResponse.json(
        { success: false, error: "الاسم العربي والسعر مطلوبان" },
        { status: 400 }
      );
    }

    // Prefer the English name when present, otherwise transliterate the
    // Arabic name — both produce a Latin, URL-safe slug.
    const source = (rest.name || rest.nameAr || "").trim();
    const slug = await uniqueSlug(slugify(source));

    const product = await db.product.create({
      data: {
        ...rest,
        slug,
        images: images?.length
          ? { create: images.map((i: any, idx: number) => ({ ...i, position: idx })) }
          : undefined,
        sizes: sizes?.length
          ? { create: sizes }
          : { create: ["XS","S","M","L","XL","XXL"].map((s) => ({ size: s, stock: 0 })) },
      },
      include: { images: true, sizes: true },
    });
    return NextResponse.json({ success: true, data: product });
  } catch (e: any) {
    console.error("PRODUCT CREATE ERROR:", e);
    return NextResponse.json(
      { success: false, error: e.message ?? "Create failed" },
      { status: 500 }
    );
  }
}