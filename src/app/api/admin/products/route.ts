import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

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
    const { images, sizes, ...rest } = body;
    if (!rest.slug || !rest.nameAr || rest.price == null) {
      return NextResponse.json(
        { success: false, error: "الاسم، الـ slug، والسعر مطلوبة" },
        { status: 400 }
      );
    }
    const product = await db.product.create({
      data: {
        ...rest,
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
    return NextResponse.json(
      { success: false, error: e.message ?? "Create failed" },
      { status: 500 }
    );
  }
}
