import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/queries";

// GET /api/products?category=<slug>&featured=1&new=1&best=1&search=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category") ?? undefined;
    const featured = searchParams.get("featured") === "1";
    const newArrival = searchParams.get("new") === "1";
    const bestSeller = searchParams.get("best") === "1";
    const search = searchParams.get("search") ?? undefined;

    const products = await getProducts({
      categorySlug,
      featured,
      newArrival,
      bestSeller,
      search,
      activeOnly: true,
    });
    return NextResponse.json({ success: true, data: products });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message ?? "Failed to fetch products" },
      { status: 500 }
    );
  }
}
