// ─── src/data/catalog.ts ───
// Mock catalog data for Futami DESIGNS — Phase 1 storefront
// Replaced by real database data in Phase 2.

import type {
  Category,
  KuwaitGovernorate,
  Product,
  SizeCode,
  SizeMeasurement,
  StoreSettings,
} from "@/types";

// Premium placeholder imagery (black & white editorial fashion aesthetic)
// Using Unsplash high-quality fashion photography.
const IMG = {
  abaya1:
    "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=900&q=80",
  abaya2:
    "https://images.unsplash.com/photo-1617059062941-78cdde3c5536?auto=format&fit=crop&w=900&q=80",
  dress1:
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80",
  dress2:
    "https://images.unsplash.com/photo-1496217590455-aa63a8350296?auto=format&fit=crop&w=900&q=80",
  dress3:
    "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=80",
  kaftan1:
    "https://images.unsplash.com/photo-1623188103259-97a82b53c7c0?auto=format&fit=crop&w=900&q=80",
  kaftan2:
    "https://images.unsplash.com/photo-1622495966122-37b8d0c1e9b6?auto=format&fit=crop&w=900&q=80",
  kimono1:
    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80",
  kimono2:
    "https://images.unsplash.com/photo-1606293459339-aa5d34a7b0e1?auto=format&fit=crop&w=900&q=80",
  suit1:
    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=80",
  suit2:
    "https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=900&q=80",
  blouse1:
    "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=900&q=80",
  blouse2:
    "https://images.unsplash.com/photo-1581044777550-4cfa60706c55?auto=format&fit=crop&w=900&q=80",
  trousers1:
    "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80",
  trousers2:
    "https://images.unsplash.com/photo-1614179086353-cb8a7c4c4c8a?auto=format&fit=crop&w=900&q=80",
  collection1:
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
  collection2:
    "https://images.unsplash.com/photo-1469334031218-3817d962b8bc?auto=format&fit=crop&w=1200&q=80",
  collection3:
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
  hero:
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80",
  hero2:
    "https://images.unsplash.com/photo-1469334031218-3817d962b8bc?auto=format&fit=crop&w=1600&q=80",
  about:
    "https://images.unsplash.com/photo-1469334031218-3817d962b8bc?auto=format&fit=crop&w=1200&q=80",
};

export const images = IMG;

const allSizes: SizeCode[] = ["XS", "S", "M", "L", "XL", "XXL"];

function mkSizes(stockMap: Partial<Record<SizeCode, number>> = {}) {
  return allSizes.map((s) => ({
    size: s,
    stock: stockMap[s] ?? Math.floor(Math.random() * 12),
  }));
}

export const categories: Category[] = [
  {
    id: "cat-abayas",
    name: "Abayas",
    nameAr: "عبايات",
    slug: "abayas",
    image: IMG.collection1,
  },
  {
    id: "cat-dresses",
    name: "Dresses",
    nameAr: "فساتين",
    slug: "dresses",
    image: IMG.collection2,
  },
  {
    id: "cat-kaftans",
    name: "Kaftans",
    nameAr: "قفاطين",
    slug: "kaftans",
    image: IMG.collection3,
  },
  {
    id: "cat-sets",
    name: "Sets",
    nameAr: "أطقم",
    slug: "sets",
    image: IMG.collection1,
  },
  {
    id: "cat-bottoms",
    name: "Bottoms",
    nameAr: "بناطيل",
    slug: "bottoms",
    image: IMG.collection3,
  },
];

export const products: Product[] = [
  {
    id: "p1",
    slug: "noir-silk-abaya",
    name: "Noir Silk Abaya",
    nameAr: "عباية الحرير نوار",
    description:
      "عباية من الحرير الفاخر بقصّة انسيابية أنيقة. تتميز بتفاصيل دقيقة وخامة عالية الجودة تمنحك إطلالة راقية في جميع المناسبات. تصميم عصري يجمع بين الأصالة والمعاصرة.",
    price: 65,
    compareAtPrice: 85,
    categoryId: "cat-abayas",
    images: [
      { id: "i1", url: IMG.abaya1, alt: "عباية الحرير نوار" },
      { id: "i2", url: IMG.abaya2, alt: "عباية الحرير نوار - الخلف" },
    ],
    sizes: mkSizes({ XS: 5, S: 8, M: 6, L: 4, XL: 3, XXL: 0 }),
    featured: true,
    newArrival: true,
    bestSeller: true,
    active: true,
    fabric: "حرير صناعي 100%",
    care: "غسيل جاف فقط",
    createdAt: "2026-10-20",
  },
  {
    id: "p2",
    slug: "blanc-evening-dress",
    name: "Blanc Evening Dress",
    nameAr: "فستان السهرة بلان",
    description:
      "فستان سهرة بتصميم فاخر يبرز أناقتك. خامة عالية الجودة وقصّة محكمة تمنحك إطلالة ساحرة في المناسبات الخاصة. تصميم خالد يبقى رائجاً عبر المواسم.",
    price: 78,
    categoryId: "cat-dresses",
    images: [
      { id: "i1", url: IMG.dress1, alt: "فستان السهرة بلان" },
      { id: "i2", url: IMG.dress2, alt: "فستان السهرة بلان - جانبي" },
      { id: "i3", url: IMG.dress3, alt: "فستان السهرة بلان - الخلف" },
    ],
    sizes: mkSizes({ XS: 3, S: 6, M: 7, L: 5, XL: 2 }),
    featured: true,
    newArrival: true,
    bestSeller: false,
    active: true,
    fabric: "ساتان",
    care: "غسيل يدوي بماء بارد",
    createdAt: "2026-10-18",
  },
  {
    id: "p3",
    slug: "onyx-kaftan",
    name: "Onyx Kaftan",
    nameAr: "قفطان أونيكس",
    description:
      "قفطان فاخر بتصميم عصري مزين بتفاصيل أنيقة. مثالي للمناسبات الرسمية والسهرات. خامة مريحة وفخمة في آن واحد.",
    price: 92,
    compareAtPrice: 110,
    categoryId: "cat-kaftans",
    images: [
      { id: "i1", url: IMG.kaftan1, alt: "قفطان أونيكس" },
      { id: "i2", url: IMG.kaftan2, alt: "قفطان أونيكس - تفاصيل" },
    ],
    sizes: mkSizes({ XS: 4, S: 5, M: 6, L: 4, XL: 3, XXL: 2 }),
    featured: true,
    newArrival: false,
    bestSeller: true,
    active: true,
    fabric: "كريب",
    care: "غسيل جاف",
    createdAt: "2026-09-28",
  },
  {
    id: "p4",
    slug: "monochrome-kimono-set",
    name: "Monochrome Kimono Set",
    nameAr: "طقم الكيمونو مونوكروم",
    description:
      "طقم كيمونو عصري بتصميم مزدوج اللون. يتكون من كيمونو وقميص داخلي وبنطال. إطلالة متكاملة بأنيقة عصرية لمحبي التميّز.",
    price: 110,
    categoryId: "cat-sets",
    images: [
      { id: "i1", url: IMG.kimono1, alt: "طقم الكيمونو مونوكروم" },
      { id: "i2", url: IMG.kimono2, alt: "طقم الكيمونو مونوكروم - تفاصيل" },
    ],
    sizes: mkSizes({ XS: 2, S: 4, M: 5, L: 3, XL: 2 }),
    featured: true,
    newArrival: true,
    bestSeller: true,
    active: true,
    fabric: "كتان و حرير",
    care: "غسيل لطيف",
    createdAt: "2026-10-22",
  },
  {
    id: "p5",
    slug: "tailored-power-suit",
    name: "Tailored Power Suit",
    nameAr: "بدلة الباور الرسمية",
    description:
      "بدلة رسمية بقصّة محكمة تمنحك حضوراً قوياً واثقاً. مصممة بعناية فائقة لتبرز أنوثتك بأسلوب عصري راقٍ.",
    price: 135,
    compareAtPrice: 160,
    categoryId: "cat-sets",
    images: [
      { id: "i1", url: IMG.suit1, alt: "بدلة الباور الرسمية" },
      { id: "i2", url: IMG.suit2, alt: "بدلة الباور الرسمية - الخلف" },
    ],
    sizes: mkSizes({ XS: 3, S: 5, M: 6, L: 4, XL: 3, XXL: 1 }),
    featured: false,
    newArrival: true,
    bestSeller: true,
    active: true,
    fabric: "صوف",
    care: "غسيل جاف",
    createdAt: "2026-10-25",
  },
  {
    id: "p7",
    slug: "wide-leg-trousers",
    name: "Wide Leg Trousers",
    nameAr: "بنطال واسع الساقين",
    description:
      "بنطال واسع الساقين بقصّة عصرية مريحة. خامة عالية الجودة تسقط بشكل أنيق. مثالي للإطلالات اليومية والرسمية.",
    price: 52,
    categoryId: "cat-bottoms",
    images: [
      { id: "i1", url: IMG.trousers1, alt: "بنطال واسع الساقين" },
      { id: "i2", url: IMG.trousers2, alt: "بنطال واسع الساقين - تفاصيل" },
    ],
    sizes: mkSizes({ XS: 4, S: 6, M: 8, L: 5, XL: 3, XXL: 2 }),
    featured: false,
    newArrival: true,
    bestSeller: false,
    active: true,
    fabric: "بوليستر منسوج",
    care: "غسيل آلي بماء بارد",
    createdAt: "2026-10-26",
  },
  {
    id: "p8",
    slug: "ivory-cape-abaya",
    name: "Ivory Cape Abaya",
    nameAr: "عباية الكيب عاجي",
    description:
      "عباية بتصميم الكيب الفاخر بلون عاجي راقٍ. تتميز بتفاصيل استثنائية وقصّة انسيابية تمنحك إطلالة ملكية.",
    price: 98,
    compareAtPrice: 120,
    categoryId: "cat-abayas",
    images: [
      { id: "i1", url: IMG.abaya2, alt: "عباية الكيب عاجي" },
      { id: "i2", url: IMG.abaya1, alt: "عباية الكيب عاجي - الخلف" },
    ],
    sizes: mkSizes({ XS: 2, S: 4, M: 5, L: 4, XL: 2, XXL: 0 }),
    featured: true,
    newArrival: false,
    bestSeller: true,
    active: true,
    fabric: "كريب فاخر",
    care: "غسيل جاف",
    createdAt: "2026-09-15",
  },
];

// Size chart data (all measurements in inches)
export const sizeChart: { size: SizeCode; shoulder: number; chest: number; waist: number; hips: number | string }[] = [
  { size: "XS", shoulder: 13, chest: 34, waist: 26, hips: 36 },
  { size: "S", shoulder: 14, chest: 36, waist: 28, hips: 38 },
  { size: "M", shoulder: 14.5, chest: 38, waist: 30, hips: 40 },
  { size: "L", shoulder: 15, chest: 40, waist: 32, hips: "42-43" },
  { size: "XL", shoulder: 16, chest: 44, waist: 35, hips: 46 },
  { size: "XXL", shoulder: 17, chest: 48, waist: 38, hips: 50 },
];

// Kuwait governorates & shipping rates
export const kuwaitGovernorates: KuwaitGovernorate[] = [
  { id: "g1", name: "Al Ahmadi", nameAr: "الأحمدي", shippingCost: 3 },
  { id: "g2", name: "Al Farwaniyah", nameAr: "الفروانية", shippingCost: 3 },
  { id: "g3", name: "Al Asimah", nameAr: "العاصمة", shippingCost: 3 },
  { id: "g4", name: "Al Jahra", nameAr: "الجهراء", shippingCost: 3 },
  { id: "g5", name: "Hawalli", nameAr: "حولي", shippingCost: 3 },
  { id: "g6", name: "Mubarak Al Kabeer", nameAr: "مبارك الكبير", shippingCost: 3 },
  { id: "g7", name: "Al Mutlaa", nameAr: "المطلاع", shippingCost: 5 },
  { id: "g8", name: "Sabah Al Ahmad", nameAr: "صباح الأحمد", shippingCost: 5 },
];

// بيانات المتجر الافتراضية (fallback قبل ما بيانات لوحة الإدارة تتحمّل).
// تم تحديثها ببيانات التواصل الرسمية للمتجر.
// ملاحظة: روابط السوشيال الرسمية مصدرها src/lib/contact.ts.
export const storeSettings: StoreSettings = {
  brandName: "Futami DESIGNS",
  brandTagline: "أناقة بلا حدود",
  currency: "KWD",
  whatsapp: "+96550518057",
  instagram: "fatamidesigns",
  tiktok: "fatamidesigns",
  snapchat: "fatamidesigns",
  email: "fat.obeed@gmail.com",
  phone: "+965 50518057",
};

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured && p.active);
}

export function getNewArrivals(limit = 8): Product[] {
  return products
    .filter((p) => p.newArrival && p.active)
    .slice(0, limit);
}

export function getBestSellers(limit = 8): Product[] {
  return products
    .filter((p) => p.bestSeller && p.active)
    .slice(0, limit);
}