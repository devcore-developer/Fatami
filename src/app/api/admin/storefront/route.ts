// ─── src/app/api/admin/storefront/route.ts ───
import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

// GET /api/admin/storefront — returns content (auth required)
export async function GET() {
  const user = await getCurrentAdmin();
  if (!user) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  try {
    const content = await db.storefrontContent.findUnique({ where: { id: "singleton" } });
    return NextResponse.json({ success: true, data: content });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

// PUT /api/admin/storefront — update content (auth required)
export async function PUT(req: NextRequest) {
  const user = await getCurrentAdmin();
  if (!user) return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
  try {
    const body = await req.json();
    const updated = await db.storefrontContent.upsert({
      where: { id: "singleton" },
      update: {
        logoImage: body.logoImage,
        heroImage: body.heroImage,
        mobileHeroImage: body.mobileHeroImage,
        heroTitle: body.heroTitle,
        heroDescription: body.heroDescription,
        heroCollectionLabel: body.heroCollectionLabel,
        heroPrimaryCtaText: body.heroPrimaryCtaText,
        heroSecondaryCtaText: body.heroSecondaryCtaText,
        editorialImage: body.editorialImage,
        editorialTitle: body.editorialTitle,
        editorialDescription: body.editorialDescription,
        editorialCtaText: body.editorialCtaText,
      },
      create: {
        id: "singleton",
        logoImage: body.logoImage,
        heroImage: body.heroImage,
        mobileHeroImage: body.mobileHeroImage,
        heroTitle: body.heroTitle,
        heroDescription: body.heroDescription,
        heroCollectionLabel: body.heroCollectionLabel,
        heroPrimaryCtaText: body.heroPrimaryCtaText,
        heroSecondaryCtaText: body.heroSecondaryCtaText,
        editorialImage: body.editorialImage,
        editorialTitle: body.editorialTitle,
        editorialDescription: body.editorialDescription,
        editorialCtaText: body.editorialCtaText,
      },
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}