// Database seed script for FATAMI DESIGNS
// Run with: bun run scripts/seed.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const IMG = {
  abaya1: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=900&q=80",
  abaya2: "https://images.unsplash.com/photo-1617059062941-78cdde3c5536?auto=format&fit=crop&w=900&q=80",
  dress1: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80",
  dress2: "https://images.unsplash.com/photo-1496217590455-aa63a8350296?auto=format&fit=crop&w=900&q=80",
  dress3: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=80",
  kaftan1: "https://images.unsplash.com/photo-1623188103259-97a82b53c7c0?auto=format&fit=crop&w=900&q=80",
  kaftan2: "https://images.unsplash.com/photo-1622495966122-37b8d0c1d9b6?auto=format&fit=crop&w=900&q=80",
  kimono1: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80",
  kimono2: "https://images.unsplash.com/photo-1606293459339-aa5d34a7b0e1?auto=format&fit=crop&w=900&q=80",
  suit1: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=80",
  suit2: "https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=900&q=80",
  blouse1: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=900&q=80",
  blouse2: "https://images.unsplash.com/photo-1581044777550-4cfa60706c55?auto=format&fit=crop&w=900&q=80",
  trousers1: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80",
  trousers2: "https://images.unsplash.com/photo-1614179086353-cb8a7c4c4c8a?auto=format&fit=crop&w=900&q=80",
};

async function main() {
  console.log("🌱 Seeding FATAMI DESIGNS database...");

  await prisma.adminUser.upsert({
    where: { email: "admin@fatamidesigns.com" },
    update: {},
    create: {
      email: "admin@fatamidesigns.com",
      name: "مدير المتجر",
      passwordHash: "$2a$10$DEMO_HASH_REPLACE_WITH_BCRYPT_IN_PRODUCTION_xxxxxxxxxxxxxxxxxxxxxxx",
      role: "ADMIN",
    },
  });
  console.log("  ✓ Admin user created (admin@fatamidesigns.com)");

  const categoriesData = [
    { name: "Abayas", nameAr: "عبايات", slug: "abayas", image: IMG.abaya1 },
    { name: "Dresses", nameAr: "فساتين", slug: "dresses", image: IMG.dress1 },
    { name: "Kaftans", nameAr: "قفاطين", slug: "kaftans", image: IMG.kaftan1 },
    { name: "Sets", nameAr: "أطقم", slug: "sets", image: IMG.kimono1 },
    { name: "Tops", nameAr: "بلوزات", slug: "tops", image: IMG.blouse1 },
    { name: "Bottoms", nameAr: "بناطيل", slug: "bottoms", image: IMG.trousers1 },
  ];
  const categories: Record<string, string> = {};
  for (const c of categoriesData) {
    const rec = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    categories[c.slug] = rec.id;
  }
  console.log(`  ✓ ${categoriesData.length} categories created`);

  const allSizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const mkSizes = (map: Record<string, number> = {}) =>
    allSizes.map((s) => ({ size: s, stock: map[s] ?? Math.floor(Math.random() * 12) }));

  const productsData = [
    {
      slug: "noir-silk-abaya", name: "Noir Silk Abaya", nameAr: "عباية الحرير نوار",
      description: "عباية من الحرير الفاخر بقصّة انسيابية أنيقة. تتميز بتفاصيل دقيقة وخامة عالية الجودة تمنحك إطلالة راقية في جميع المناسبات. تصميم عصري يجمع بين الأصالة والمعاصرة.",
      price: 65, compareAtPrice: 85, categoryId: categories.abayas,
      images: [{ url: IMG.abaya1, alt: "عباية الحرير نوار" }, { url: IMG.abaya2, alt: "عباية الحرير نوار - الخلف" }],
      sizes: mkSizes({ XS: 5, S: 8, M: 6, L: 4, XL: 3, XXL: 0 }),
      featured: true, newArrival: true, bestSeller: true, fabric: "حرير صناعي 100%", care: "غسيل جاف فقط",
    },
    {
      slug: "blanc-evening-dress", name: "Blanc Evening Dress", nameAr: "فستان السهرة بلان",
      description: "فستان سهرة بتصميم فاخر يبرز أناقتك. خامة عالية الجودة وقصّة محكمة تمنحك إطلالة ساحرة في المناسبات الخاصة. تصميم خالد يبقى رائجاً عبر المواسم.",
      price: 78, categoryId: categories.dresses,
      images: [{ url: IMG.dress1, alt: "فستان السهرة بلان" }, { url: IMG.dress2, alt: "فستان السهرة بلان - جانبي" }, { url: IMG.dress3, alt: "فستان السهرة بلان - الخلف" }],
      sizes: mkSizes({ XS: 3, S: 6, M: 7, L: 5, XL: 2 }),
      featured: true, newArrival: true, bestSeller: false, fabric: "ساتان", care: "غسيل يدوي بماء بارد",
    },
    {
      slug: "onyx-kaftan", name: "Onyx Kaftan", nameAr: "قفطان أونيكس",
      description: "قفطان فاخر بتصميم عصري مزين بتفاصيل أنيقة. مثالي للمناسبات الرسمية والسهرات. خامة مريحة وفخمة في آن واحد.",
      price: 92, compareAtPrice: 110, categoryId: categories.kaftans,
      images: [{ url: IMG.kaftan1, alt: "قفطان أونيكس" }, { url: IMG.kaftan2, alt: "قفطان أونيكس - تفاصيل" }],
      sizes: mkSizes({ XS: 4, S: 5, M: 6, L: 4, XL: 3, XXL: 2 }),
      featured: true, newArrival: false, bestSeller: true, fabric: "كريب", care: "غسيل جاف",
    },
    {
      slug: "monochrome-kimono-set", name: "Monochrome Kimono Set", nameAr: "طقم الكيمونو مونوكروم",
      description: "طقم كيمونو عصري بتصميم مزدوج اللون. يتكون من كيمونو وقميص داخلي وبنطال. إطلالة متكاملة بأنيقة عصرية لمحبي التميّز.",
      price: 110, categoryId: categories.sets,
      images: [{ url: IMG.kimono1, alt: "طقم الكيمونو مونوكروم" }, { url: IMG.kimono2, alt: "طقم الكيمونو مونوكروم - تفاصيل" }],
      sizes: mkSizes({ XS: 2, S: 4, M: 5, L: 3, XL: 2 }),
      featured: true, newArrival: true, bestSeller: true, fabric: "كتان و حرير", care: "غسيل لطيف",
    },
    {
      slug: "tailored-power-suit", name: "Tailored Power Suit", nameAr: "بدلة الباور الرسمية",
      description: "بدلة رسمية بقصّة محكمة تمنحك حضوراً قوياً واثقاً. مصممة بعناية فائقة لتبرز أنوثتك بأسلوب عصري راقٍ.",
      price: 135, compareAtPrice: 160, categoryId: categories.sets,
      images: [{ url: IMG.suit1, alt: "بدلة الباور الرسمية" }, { url: IMG.suit2, alt: "بدلة الباور الرسمية - الخلف" }],
      sizes: mkSizes({ XS: 3, S: 5, M: 6, L: 4, XL: 3, XXL: 1 }),
      featured: false, newArrival: true, bestSeller: true, fabric: "صوف", care: "غسيل جاف",
    },
    {
      slug: "silk-blouse-classic", name: "Silk Blouse Classic", nameAr: "بلوزة حرير كلاسيك",
      description: "بلوزة من الحرير الفاخر بتصميم كلاسيكي خالد. قطعة أساسية في خزانة كل امرأة أنيقة. تناسب الإطلالات الرسمية واليومية.",
      price: 45, categoryId: categories.tops,
      images: [{ url: IMG.blouse1, alt: "بلوزة حرير كلاسيك" }, { url: IMG.blouse2, alt: "بلوزة حرير كلاسيك - جانبي" }],
      sizes: mkSizes({ XS: 6, S: 8, M: 7, L: 5, XL: 4, XXL: 2 }),
      featured: false, newArrival: false, bestSeller: true, fabric: "حرير طبيعي", care: "غسيل يدوي",
    },
    {
      slug: "wide-leg-trousers", name: "Wide Leg Trousers", nameAr: "بنطال واسع الساقين",
      description: "بنطال واسع الساقين بقصّة عصرية مريحة. خامة عالية الجودة تسقط بشكل أنيق. مثالي للإطلالات اليومية والرسمية.",
      price: 52, categoryId: categories.bottoms,
      images: [{ url: IMG.trousers1, alt: "بنطال واسع الساقين" }, { url: IMG.trousers2, alt: "بنطال واسع الساقين - تفاصيل" }],
      sizes: mkSizes({ XS: 4, S: 6, M: 8, L: 5, XL: 3, XXL: 2 }),
      featured: false, newArrival: true, bestSeller: false, fabric: "بوليستر منسوج", care: "غسيل آلي بماء بارد",
    },
    {
      slug: "ivory-cape-abaya", name: "Ivory Cape Abaya", nameAr: "عباية الكيب عاجي",
      description: "عباية بتصميم الكيب الفاخر بلون عاجي راقٍ. تتميز بتفاصيل استثنائية وقصّة انسيابية تمنحك إطلالة ملكية.",
      price: 98, compareAtPrice: 120, categoryId: categories.abayas,
      images: [{ url: IMG.abaya2, alt: "عباية الكيب عاجي" }, { url: IMG.abaya1, alt: "عباية الكيب عاجي - الخلف" }],
      sizes: mkSizes({ XS: 2, S: 4, M: 5, L: 4, XL: 2, XXL: 0 }),
      featured: true, newArrival: false, bestSeller: true, fabric: "كريب فاخر", care: "غسيل جاف",
    },
  ];

  let productCount = 0;
  for (const p of productsData) {
    const { images, sizes, ...rest } = p;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { ...rest },
      create: {
        ...rest,
        images: { create: images.map((img, i) => ({ ...img, position: i })) },
        sizes: { create: sizes },
      },
    });
    productCount++;
  }
  console.log(`  ✓ ${productCount} products created`);

  const governorates = [
    { name: "Al Ahmadi", nameAr: "الأحمدي", shippingCost: 3 },
    { name: "Al Farwaniyah", nameAr: "الفروانية", shippingCost: 3 },
    { name: "Al Asimah", nameAr: "العاصمة", shippingCost: 3 },
    { name: "Al Jahra", nameAr: "الجهراء", shippingCost: 3 },
    { name: "Hawalli", nameAr: "حولي", shippingCost: 3 },
    { name: "Mubarak Al Kabeer", nameAr: "مبارك الكبير", shippingCost: 3 },
    { name: "Al Mutlaa", nameAr: "المطلاع", shippingCost: 5 },
    { name: "Sabah Al Ahmad", nameAr: "صباح الأحمد", shippingCost: 5 },
  ];
  for (const g of governorates) {
    await prisma.governorateRate.upsert({
      where: { nameAr: g.nameAr },
      update: { shippingCost: g.shippingCost },
      create: g,
    });
  }
  console.log(`  ✓ ${governorates.length} governorates with shipping rates`);

  await prisma.storeSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      brandName: "FATAMI DESIGNS",
      brandTagline: "أناقة بلا حدود",
      currency: "KWD",
      whatsapp: "+96590000000",
      instagram: "fatami.designs",
      tiktok: "fatamidesigns",
      email: "info@fatamidesigns.com",
      phone: "+965 9000 0000",
      freeShippingThreshold: 100,
    },
  });
  console.log("  ✓ Store settings created");

  await prisma.discountCode.upsert({
    where: { code: "FATAMI10" },
    update: {},
    create: { code: "FATAMI10", type: "PERCENTAGE", value: 10, active: true, usageLimit: 100 },
  });
  console.log("  ✓ Demo discount code: FATAMI10 (10% off)");

  console.log("\n✅ Seed completed successfully");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
