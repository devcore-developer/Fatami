// ─── src/lib/contact.ts ───
// ─── بيانات التواصل الرسمية لـ Futami DESIGNS ───
// هذا الملف هو المصدر الوحيد لبيانات التواصل في الواجهة:
// الفوتر، صفحة "تواصل معنا"، زر الواتساب العائم، وقائمة الهيدر (الموبايل).
// لتغيير أي رقم أو لينك مستقبلاً: عدّلي هنا فقط وكل الصفحات تتحدث تلقائياً.

export const CONTACT = {
  /** الرقم كما يظهر للعميل */
  phoneDisplay: "+965 50518057",
  /** الرقم لروابط الاتصال المباشر tel: */
  phoneTel: "+96550518057",
  /** رابط واتساب جاهز */
  whatsappUrl: "https://wa.me/96550518057",
  /** الأرقام فقط (لو احتجتها لصيغ أخرى) */
  whatsappDigits: "96550518057",
  email: "fat.obeed@gmail.com",
  location: "الكويت",
} as const;

export interface SocialLink {
  id: "instagram" | "tiktok" | "snapchat" | "whatsapp";
  label: string;
  handle: string;
  url: string;
}

// الروابط الرسمية كما أرسلتها إدارة المتجر.
// لينك سناب شات هو لينك المشاركة الرسمي (QR) وليس لينك username.
export const SOCIALS: SocialLink[] = [
  {
    id: "instagram",
    label: "إنستغرام",
    handle: "@fatamidesigns",
    url: "https://www.instagram.com/fatamidesigns",
  },
  {
    id: "tiktok",
    label: "تيك توك",
    handle: "@fatamidesigns",
    url: "https://www.tiktok.com/@fatamidesigns",
  },
  {
    id: "snapchat",
    label: "سناب شات",
    handle: "fatamidesigns",
    url: "https://snapchat.com/t/8m0uMrpB",
  },
  {
    id: "whatsapp",
    label: "واتساب",
    handle: CONTACT.phoneDisplay,
    url: CONTACT.whatsappUrl,
  },
];