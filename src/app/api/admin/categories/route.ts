// src/app/api/admin/categories/route.ts
// GET  : list categories (+ productCount)
// POST : create — name/nameAr/slug/image/active/sortOrder
// PUT  : update — this handler was MISSING entirely before, so editing a
//        category from the admin UI silently failed (405). Added so image
//        replacement and any category edit actually persist.
//
// The image is ONE permanent URL (Cloudflare R2), uploaded through the same
// /api/admin/upload route used by product images (folder=categories).
// No migration needed — Category.image already exists in the schema.

import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

// Keep only real columns — the client may send extra fields (productCount…)
function pickFields(body: any) {
  return {
    name: typeof body.name === "string" ? body.name.trim() : "",
    nameAr: typeof body.nameAr === "string" ? body.nameAr.trim() : "",
    slug: typeof body.slug === "string" ? body.slug.trim() : "",
    // Empty string → null so clearing the image actually clears the column
    image:
      typeof body.image === "string" && body.image.trim() !== ""
        ? body.image.trim()
        : null,
    active: body.active === undefined ? true : Boolean(body.active),
    sortOrder: Number.isFinite(Number(body.sortOrder))
      ? Math.trunc(Number(body.sortOrder))
      : 0,
  };
}

// Duplicate slug → Prisma P2002; surface it in plain Arabic instead of a raw message
function friendlyError(e: any) {
  if (e?.code === "P2002") return "الـ slug مستخدم بالفعل — اختاري slug مختلف";
  return e?.message ?? "Operation failed";
}

export async function GET() {
  const user = await getCurrentAdmin();
  if (!user) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json({
    success: true,
    data: categories.map((c) => ({ ...c, productCount: c._count.products })),
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentAdmin();
  if (!user) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  try {
    const body = await req.json();
    const data = pickFields(body);
    if (!data.slug || !data.nameAr) {
      return NextResponse.json({ success: false, error: "الاسم العربي والـ slug مطلوبة" }, { status: 400 });
    }
    const cat = await db.category.create({ data });
    return NextResponse.json({ success: true, data: cat });
  } catch (e: any) {
    console.error("CATEGORY CREATE ERROR:", e);
    return NextResponse.json({ success: false, error: friendlyError(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentAdmin();
  if (!user) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "Category id is required" }, { status: 400 });
    }
    const data = pickFields(body);
    if (!data.slug || !data.nameAr) {
      return NextResponse.json({ success: false, error: "الاسم العربي والـ slug مطلوبة" }, { status: 400 });
    }
    const cat = await db.category.update({ where: { id: body.id }, data });
    return NextResponse.json({ success: true, data: cat });
  } catch (e: any) {
    console.error("CATEGORY UPDATE ERROR:", e);
    return NextResponse.json({ success: false, error: friendlyError(e) }, { status: 500 });
  }
}