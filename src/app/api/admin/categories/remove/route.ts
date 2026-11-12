// src/app/api/admin/categories/remove/route.ts
// Category delete endpoint (separate from the main categories route so the
// existing GET/POST/PATCH handlers stay untouched).
//   DELETE /api/admin/categories/remove?id=xxx
//   DELETE /api/admin/categories/remove?id=xxx&reassignTo=yyy
// - Empty category: deleted directly.
// - Category with products + no reassignTo: 400 JSON asking the UI to pick
//   a replacement category.
// - Category with products + reassignTo: products are moved first, then the
//   category is deleted (single transaction).
// Always returns JSON. Real errors are logged as "CATEGORY DELETE ERROR:".

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin-auth";

export async function DELETE(req: NextRequest) {
  const user = await getCurrentAdmin();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const reassignTo = searchParams.get("reassignTo");

    if (!id) {
      return NextResponse.json({ success: false, error: "Category id is required" }, { status: 400 });
    }

    const category = await db.category.findUnique({ where: { id } });
    if (!category) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    // Count ALL products in this category (active and inactive)
    const productsCount = await db.product.count({ where: { categoryId: id } });

    if (productsCount > 0) {
      if (!reassignTo) {
        // Category is not empty - respond with clear details so the UI can
        // prompt for a replacement category
        return NextResponse.json(
          {
            success: false,
            error: "CATEGORY_HAS_PRODUCTS",
            needsReassign: true,
            productsCount,
            message:
              "Category has " + productsCount + " products - choose a replacement category to move them to",
          },
          { status: 400 }
        );
      }

      if (reassignTo === id) {
        return NextResponse.json(
          { success: false, error: "Replacement category must be different from the deleted one" },
          { status: 400 }
        );
      }

      const target = await db.category.findUnique({ where: { id: reassignTo } });
      if (!target) {
        return NextResponse.json(
          { success: false, error: "Replacement category not found" },
          { status: 400 }
        );
      }

      // Move products, then delete the category - in one transaction
      await db.$transaction([
        db.product.updateMany({ where: { categoryId: id }, data: { categoryId: reassignTo } }),
        db.category.delete({ where: { id } }),
      ]);

      return NextResponse.json({ success: true, data: { movedProducts: productsCount } });
    }

    // Empty category - delete directly
    await db.category.delete({ where: { id } });
    return NextResponse.json({ success: true, data: { id } });
  } catch (err) {
    console.error("CATEGORY DELETE ERROR:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: "Delete failed: " + message },
      { status: 500 }
    );
  }
}

// POST fallback with the same logic
export async function POST(req: NextRequest) {
  return DELETE(req);
}
