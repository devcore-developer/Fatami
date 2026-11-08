import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getCurrentAdmin();
  if (!user) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  const categories = await db.category.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } });
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
    if (!body.slug || !body.nameAr) {
      return NextResponse.json({ success: false, error: "الاسم والـ slug مطلوبة" }, { status: 400 });
    }
    const cat = await db.category.create({ data: { name: body.name, nameAr: body.nameAr, slug: body.slug, image: body.image } });
    return NextResponse.json({ success: true, data: cat });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message ?? "Create failed" }, { status: 500 });
  }
}
