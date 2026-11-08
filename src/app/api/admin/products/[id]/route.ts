import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

// GET /api/admin/products/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentAdmin();
  if (!user) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
    include: { images: { orderBy: { position: "asc" } }, sizes: true, category: true },
  });
  if (!product) return NextResponse.json({ success: false, error: "غير موجود" }, { status: 404 });
  return NextResponse.json({ success: true, data: product });
}

// PUT /api/admin/products/[id] — full update
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentAdmin();
  if (!user) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  try {
    const { id } = await params;
    const body = await req.json();
    const { images, sizes, ...rest } = body;

    // Update scalar fields
    const updated = await db.product.update({
      where: { id },
      data: { ...rest },
    });

    // Replace images if provided
    if (images) {
      await db.productImage.deleteMany({ where: { productId: id } });
      if (images.length > 0) {
        await db.productImage.createMany({
          data: images.map((i: any, idx: number) => ({
            url: i.url,
            alt: i.alt ?? "",
            position: idx,
            productId: id,
          })),
        });
      }
    }

    // Update sizes if provided
    if (sizes) {
      for (const s of sizes) {
        const existing = await db.productSize.findFirst({
          where: { productId: id, size: s.size },
        });
        if (existing) {
          await db.productSize.update({ where: { id: existing.id }, data: { stock: s.stock } });
        } else {
          await db.productSize.create({ data: { productId: id, size: s.size, stock: s.stock } });
        }
      }
    }

    const refreshed = await db.product.findUnique({
      where: { id },
      include: { images: { orderBy: { position: "asc" } }, sizes: true, category: true },
    });
    return NextResponse.json({ success: true, data: refreshed });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message ?? "Update failed" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentAdmin();
  if (!user) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  try {
    const { id } = await params;
    await db.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message ?? "Delete failed" },
      { status: 500 }
    );
  }
}
