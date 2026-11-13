// src/app/api/admin/products/[id]/route.ts
// PUT    : updates an existing product — scalar fields + full replace of
//          images (in the new order, first = primary) and sizes.
//          The client-sent slug is IGNORED so existing product URLs keep
//          working, and newArrival is ignored (feature removed, column
//          stays frozen to avoid a migration).
// DELETE : removes the product and explicitly wipes its images/sizes rows
//          first, so it works with or without onDelete: Cascade.

import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

// PUT /api/admin/products/:id
export async function PUT(req: NextRequest, ctx: Ctx) {
  const user = await getCurrentAdmin();
  if (!user) {
    return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  }

  try {
    const { id } = await ctx.params;
    const body = await req.json();

    // Strip relation objects / metadata / removed fields so Prisma only
    // receives real scalar columns.
    const {
      id: _id,
      images,
      sizes,
      slug: _slug,
      newArrival: _newArrival,
      category: _category,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      ...rest
    } = body;

    if (!rest.nameAr || rest.price == null) {
      return NextResponse.json(
        { success: false, error: "الاسم العربي والسعر مطلوبان" },
        { status: 400 }
      );
    }

    const safeImages = Array.isArray(images)
      ? images.filter((i: any) => i && typeof i.url === "string" && i.url.trim() !== "")
      : [];
    const safeSizes = Array.isArray(sizes) ? sizes : [];

    const product = await db.$transaction(async (tx) => {
      // 1) Update scalar fields and wipe the current image/size rows
      //    (replace strategy: whatever the client did NOT send is deleted).
      await tx.product.update({
        where: { id },
        data: {
          ...rest,
          images: { deleteMany: {} },
          sizes: { deleteMany: {} },
        },
      });

      // 2) Recreate images in the new order (position 0 = primary) and sizes
      return tx.product.update({
        where: { id },
        data: {
          images: {
            create: safeImages.map((i: any, idx: number) => ({
              url: i.url,
              alt: i.alt ?? rest.nameAr ?? "",
              position: idx,
            })),
          },
          sizes: {
            create: safeSizes.map((s: any) => ({
              size: s.size,
              stock: Number(s.stock) || 0,
            })),
          },
        },
        include: {
          images: { orderBy: { position: "asc" } },
          sizes: true,
          category: true,
        },
      });
    });

    return NextResponse.json({ success: true, data: product });
  } catch (e: any) {
    console.error("PRODUCT UPDATE ERROR:", e);
    return NextResponse.json(
      { success: false, error: e.message ?? "Update failed" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/:id
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const user = await getCurrentAdmin();
  if (!user) {
    return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  }

  try {
    const { id } = await ctx.params;
    await db.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: { images: { deleteMany: {} }, sizes: { deleteMany: {} } },
      });
      await tx.product.delete({ where: { id } });
    });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("PRODUCT DELETE ERROR:", e);
    return NextResponse.json(
      { success: false, error: e.message ?? "Delete failed" },
      { status: 500 }
    );
  }
}