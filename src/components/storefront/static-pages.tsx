// ─── src/components/storefront/static-pages.tsx ───
"use client";

import { useState } from "react";
import { useUI } from "@/store";
import { images } from "@/data/catalog";
import { formatPrice } from "@/lib/format";
import { CONTACT, SOCIALS } from "@/lib/contact";
import { InstagramIcon, TiktokIcon, SnapchatIcon, WhatsAppIcon } from "@/components/icons/brand-icons";
import { Check, Ruler, Sparkles, Mail, Phone } from "lucide-react";

export function StaticPages() {
  const { view, setView, lastOrderNumber } = useUI();

  if (view === "about") return <AboutPage />;
  if (view === "contact") return <ContactPage />;
  if (view === "size-guide") return <SizeGuidePage />;
  if (view === "shipping-info") return <ShippingInfoPage />;
  if (view === "returns") return <ReturnsPage />;
  if (view === "privacy") return <PrivacyPage />;
  if (view === "terms") return <TermsPage />;
  if (view === "order-success") return <OrderSuccessPage orderNumber={lastOrderNumber} />;
  if (view === "order-tracking") return <OrderTrackingPage />;
  return null;
}

function PageShell({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background min-h-screen">
      <div className="container-narrow py-12 sm:py-20">
        <div className="text-center mb-12 animate-fade-up">
          {eyebrow && (
            <p className="text-xs tracking-luxe uppercase text-muted-foreground mb-3">
              {eyebrow}
            </p>
          )}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">{title}</h1>
        </div>
        <div className="prose prose-sm max-w-none">{children}</div>
      </div>
    </div>
  );
}

function AboutPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <section className="relative h-[400px] sm:h-[480px] bg-black overflow-hidden">
        <img
          src={images.about}
          alt="Futami DESIGNS"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="relative h-full container-luxe flex flex-col justify-end pb-12">
          <p className="text-xs tracking-luxe-wide text-white/70 mb-3 uppercase">
            قصتنا
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
            Futami DESIGNS
          </h1>
        </div>
      </section>

      <div className="container-narrow py-16 sm:py-24 space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-lg leading-relaxed text-muted-foreground">
            Futami DESIGNS علامة أزياء كويتية وُلدت من شغف الأناقة والجمال.
            نصمم قطعاً خالدة تجمع بين الأصالة الكويتية واللمسة العصرية،
            لتمنح المرأة العصرية إطلالة فاخرة تعبّر عن شخصيتها المميزة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Pillar
            icon={<Sparkles className="h-6 w-6" />}
            title="رؤيتنا"
            body="أن نكون العلامة الكويتية الرائدة في الأزياء النسائية الفاخرة، ونقدّم تصاميم تُلهم المرأة العصرية وتبرز أناقتها."
          />
          <Pillar
            icon={<Ruler className="h-6 w-6" />}
            title="رسالتنا"
            body="نلتزم بتقديم تصاميم عالية الجودة بخامات فاخرة وتفاصيل دقيقة، مع حرص تام على رضا العميل وتجربة تسوّق استثنائية."
          />
          <Pillar
            icon={<Check className="h-6 w-6" />}
            title="قيمنا"
            body="الأصالة، الجودة، الأناقة، والابتكار. نؤمن أن الفخامة الحقيقية تكمن في التفاصيل، وأن الأناقة لا تعرف الحدود."
          />
        </div>

        <div className="border-t border-border pt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">لماذا Futami؟</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Feature title="خامات فاخرة" body="نختار أجود الأقمشة لنضمن لكِ راحة وأناقة تدوم." />
            <Feature title="تصاميم حصرية" body="كل قطعة مصممة بعناية لتكون فريدة ومميزة." />
            <Feature title="جودة عالية" body="نلتزم بأعلى معايير الجودة في كل تفصيل." />
            <Feature title="خدمة متميزة" body="فريقنا جاهز لخدمتك وتلبية احتياجاتك." />
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactPage() {
  // قنوات التواصل الرسمية — من src/lib/contact.ts (المصدر الوحيد لبيانات التواصل).
  const channels: { label: string; value: string; href?: string; icon: React.ReactNode }[] = [
    {
      label: "واتساب",
      value: CONTACT.phoneDisplay,
      href: CONTACT.whatsappUrl,
      icon: <WhatsAppIcon className="h-5 w-5" />,
    },
    {
      label: "اتصال مباشر",
      value: CONTACT.phoneDisplay,
      href: `tel:${CONTACT.phoneTel}`,
      icon: <Phone className="h-5 w-5" />,
    },
    {
      label: "البريد الإلكتروني",
      value: CONTACT.email,
      href: `mailto:${CONTACT.email}`,
      icon: <Mail className="h-5 w-5" />,
    },
    ...SOCIALS.filter((s) => s.id !== "whatsapp").map((s) => ({
      label: s.label,
      value: s.handle,
      href: s.url,
      icon:
        s.id === "instagram" ? (
          <InstagramIcon className="h-5 w-5" />
        ) : s.id === "tiktok" ? (
          <TiktokIcon className="h-5 w-5" />
        ) : (
          <SnapchatIcon className="h-5 w-5" />
        ),
    })),
  ];

  // إرسال الرسالة عبر واتساب مباشرة — الرسالة تُفتح في محادثة المتجر نصاً جاهزاً.
  const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const subject = String(fd.get("subject") || "").trim();
    const message = String(fd.get("message") || "").trim();

    const lines = [
      `مرحباً Futami DESIGNS،`,
      subject ? `الموضوع: ${subject}` : "",
      message,
      email ? `بريدي للرد: ${email}` : "",
      name ? `— ${name}` : "",
    ].filter(Boolean);

    window.open(
      `${CONTACT.whatsappUrl}?text=${encodeURIComponent(lines.join("\n"))}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <PageShell title="تواصل معنا" eyebrow="نحن هنا لخدمتك">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        {channels.map((ch, i) =>
          ch.href ? (
            <a
              key={i}
              href={ch.href}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-border p-6 text-center hover:border-foreground transition-colors group"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center bg-foreground text-background mb-3 group-hover:scale-105 transition-transform">
                {ch.icon}
              </div>
              <p className="text-xs tracking-luxe uppercase text-muted-foreground mb-2">
                {ch.label}
              </p>
              <p className="font-medium" dir="ltr">{ch.value}</p>
            </a>
          ) : (
            <div key={i} className="border border-border p-6 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center bg-foreground text-background mb-3">
                {ch.icon}
              </div>
              <p className="text-xs tracking-luxe uppercase text-muted-foreground mb-2">
                {ch.label}
              </p>
              <p className="font-medium" dir="ltr">{ch.value}</p>
            </div>
          )
        )}
      </div>

      <form onSubmit={sendMessage} className="space-y-5 max-w-xl mx-auto">
        <div className="grid grid-cols-2 gap-4">
          <input
            required
            name="name"
            placeholder="الاسم"
            className="h-11 px-4 bg-secondary border-0 focus:ring-1 focus:ring-ring outline-none"
          />
          <input
            required
            name="email"
            placeholder="البريد الإلكتروني"
            type="email"
            className="h-11 px-4 bg-secondary border-0 focus:ring-1 focus:ring-ring outline-none"
          />
        </div>
        <input
          name="subject"
          placeholder="الموضوع"
          className="w-full h-11 px-4 bg-secondary border-0 focus:ring-1 focus:ring-ring outline-none"
        />
        <textarea
          required
          name="message"
          rows={5}
          placeholder="رسالتك"
          className="w-full p-4 bg-secondary border-0 focus:ring-1 focus:ring-ring outline-none resize-none"
        />
        <button className="w-full h-12 bg-foreground text-background text-sm tracking-luxe uppercase font-medium hover:bg-foreground/90 transition-colors">
          إرسال الرسالة عبر واتساب
        </button>
        <p className="text-xs text-muted-foreground text-center">
          اضغطي إرسال وسيتم فتح واتساب برسالتك جاهزة للإرسال إلى {CONTACT.phoneDisplay}
        </p>
      </form>
    </PageShell>
  );
}

function SizeGuidePage() {
  const { setSizeChartOpen } = useUI();
  return (
    <PageShell title="دليل المقاسات" eyebrow="لإيجاد مقاسك المثالي">
      <div className="max-w-3xl mx-auto">
        <p className="text-center text-muted-foreground mb-8">
          جميع القياسات بالبوصة (inch). لقياساتك بدقة، يُفضّل أخذ القياسات أمام مرآة
          بشريط قياس مرن.
        </p>
        <table className="w-full text-sm border border-border">
          <thead className="bg-secondary">
            <tr>
              <th className="py-4 px-3 text-center font-bold tracking-luxe uppercase text-xs">المقاس</th>
              <th className="py-4 px-3 text-center text-xs uppercase tracking-luxe">الكتف</th>
              <th className="py-4 px-3 text-center text-xs uppercase tracking-luxe">الصدر</th>
              <th className="py-4 px-3 text-center text-xs uppercase tracking-luxe">الخصر</th>
              <th className="py-4 px-3 text-center text-xs uppercase tracking-luxe">الأرداف</th>
            </tr>
          </thead>
          <tbody>
            {[
              { s: "XS", sh: 13, ch: 34, w: 26, h: 36 },
              { s: "S", sh: 14, ch: 36, w: 28, h: 38 },
              { s: "M", sh: 14.5, ch: 38, w: 30, h: 40 },
              { s: "L", sh: 15, ch: 40, w: 32, h: "42-43" },
              { s: "XL", sh: 16, ch: 44, w: 35, h: 46 },
              { s: "XXL", sh: 17, ch: 48, w: 38, h: 50 },
            ].map((r, i) => (
              <tr key={r.s} className={i % 2 ? "bg-secondary/30" : ""}>
                <td className="py-3 px-3 text-center font-bold tracking-luxe border-t border-border">{r.s}</td>
                <td className="py-3 px-3 text-center border-t border-border">{r.sh}"</td>
                <td className="py-3 px-3 text-center border-t border-border">{r.ch}"</td>
                <td className="py-3 px-3 text-center border-t border-border">{r.w}"</td>
                <td className="py-3 px-3 text-center border-t border-border">{r.h}"</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-8 text-center">
          <button
            onClick={() => setSizeChartOpen(true)}
            className="text-sm underline hover:text-foreground"
          >
            فتح دليل المقاسات المنبثق
          </button>
        </div>
      </div>
    </PageShell>
  );
}

function ShippingInfoPage() {
  return (
    <PageShell title="الشحن والتوصيل" eyebrow="نوصّل لكل الكويت">
      <div className="max-w-2xl mx-auto space-y-6">
        <InfoBlock title="مناطق التوصيل ورسوم الشحن">
          <p>نوصّل لجميع محافظات الكويت بالرسوم التالية:</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li>• الأحمدي — 3.000 د.ك</li>
            <li>• الفروانية — 3.000 د.ك</li>
            <li>• العاصمة — 3.000 د.ك</li>
            <li>• الجهراء — 3.000 د.ك</li>
            <li>• حولي — 3.000 د.ك</li>
            <li>• مبارك الكبير — 3.000 د.ك</li>
            <li>• المطلاع — 5.000 د.ك</li>
            <li>• صباح الأحمد — 5.000 د.ك</li>
          </ul>
        </InfoBlock>
        <InfoBlock title="مدة التوصيل">
          <p>يتم توصيل الطلبات داخل الكويت خلال 7-10 أيام عمل من تاريخ تأكيد الطلب.</p>
        </InfoBlock>
        <InfoBlock title="الدفع عند الاستلام">
          <p>يتوفر الدفع نقداً عند استلام الطلب في جميع المحافظات دون رسوم إضافية.</p>
        </InfoBlock>
      </div>
    </PageShell>
  );
}

function ReturnsPage() {
  return (
    <PageShell title="الإرجاع والاستبدال" eyebrow="رضاك أولويتنا">
      <div className="max-w-2xl mx-auto space-y-6">
        <InfoBlock title="سياسة الإرجاع">
          <p>يمكنك إرجاع أو استبدال المنتجات خلال 7 أيام من تاريخ الاستلام، بشرط أن تكون المنتجات بحالتها الأصلية وغير مستخدمة، مع الاحتفاظ بالبطاقات والشارات الأصلية.</p>
        </InfoBlock>
        <InfoBlock title="المنتجات غير القابلة للإرجاع">
          <ul className="space-y-1.5 text-sm">
            <li>• المنتجات المفصّلة حسب قياساتك المخصصة.</li>
            <li>• المنتجات المستخدمة أو التالفة.</li>
            <li>• المنتجات التي تم تعديلها.</li>
          </ul>
        </InfoBlock>
        <InfoBlock title="كيفية الإرجاع">
          <ol className="space-y-1.5 text-sm list-decimal pr-4">
            <li>تواصلي معنا عبر الهاتف أو البريد الإلكتروني لطلب الإرجاع.</li>
            <li>سيتم تحديد موعد لاستلام المنتج من عنوانك.</li>
            <li>بعد فحص المنتج، سيتم رد المبلغ خلال 5-7 أيام عمل.</li>
          </ol>
        </InfoBlock>
      </div>
    </PageShell>
  );
}

function PrivacyPage() {
  return (
    <PageShell title="سياسة الخصوصية" eyebrow="نحمي بياناتك">
      <div className="max-w-2xl mx-auto space-y-6 text-sm leading-relaxed text-muted-foreground">
        <p>نلتزم في Futami DESIGNS بحماية خصوصيتك وبياناتك الشخصية. لا نشارك معلوماتك مع أي طرف ثالث دون موافقتك.</p>
        <InfoBlock title="البيانات التي نجمعها">
          <ul className="space-y-1.5">
            <li>• الاسم ومعلومات التواصل</li>
            <li>• عنوان الشحن</li>
            <li>• تفاصيل الطلب والدفع</li>
          </ul>
        </InfoBlock>
        <InfoBlock title="كيف نستخدم بياناتك">
          <p>نستخدم بياناتك فقط لمعالجة طلباتك وتوصيلها إليك، ولتحسين خدماتنا وتجربتك التسوّقية.</p>
        </InfoBlock>
      </div>
    </PageShell>
  );
}

function TermsPage() {
  return (
    <PageShell title="الشروط والأحكام" eyebrow="باستخدامك للموقع">
      <div className="max-w-2xl mx-auto space-y-6 text-sm leading-relaxed text-muted-foreground">
        <p>باستخدامك لموقع Futami DESIGNS، فإنك توافقين على الشروط والأحكام التالية:</p>
        <InfoBlock title="الطلبات">
          <p>يحق لنا رفض أو إلغاء أي طلب في حال وجود خطأ في الأسعار أو توفر المنتج. سيتم إعلامك فوراً في حال إلغاء طلبك.</p>
        </InfoBlock>
        <InfoBlock title="الأسعار">
          <p>جميع الأسعار بالدينار الكويتي (د.ك). نحتفظ بحق تعديل الأسعار في أي وقت دون إشعار مسبق.</p>
        </InfoBlock>
        <InfoBlock title="الملكية الفكرية">
          <p>جميع المحتويات والتصاميم والصور في هذا الموقع مملوكة لـ Futami DESIGNS ولا يجوز استخدامها دون إذن.</p>
        </InfoBlock>
      </div>
    </PageShell>
  );
}

function OrderSuccessPage({ orderNumber }: { orderNumber: string | null }) {
  const { setView } = useUI();
  return (
    <div className="bg-background min-h-screen flex items-center justify-center">
      <div className="container-narrow py-20 text-center max-w-lg">
        <div className="h-20 w-20 rounded-full bg-foreground text-background flex items-center justify-center mx-auto mb-6 animate-fade-up">
          <Check className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-bold mb-3">تم إنشاء طلبك بنجاح</h1>
        <p className="text-muted-foreground mb-6">
          شكراً لتسوّقك من Futami DESIGNS. تم استلام طلبك وسنتواصل معك قريباً.
        </p>
        {orderNumber && (
          <div className="inline-flex items-center gap-2 px-6 py-3 border border-border mb-8">
            <span className="text-xs tracking-luxe uppercase text-muted-foreground">رقم الطلب</span>
            <span className="font-mono font-bold" dir="ltr">{orderNumber}</span>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => setView("order-tracking")}
            className="h-12 px-6 bg-foreground text-background text-sm tracking-luxe uppercase hover:bg-foreground/90"
          >
            تتبع الطلب
          </button>
          <button
            onClick={() => setView("home")}
            className="h-12 px-6 border border-foreground text-sm tracking-luxe uppercase hover:bg-foreground hover:text-background"
          >
            متابعة التسوق
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderTrackingPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const track = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const params = new URLSearchParams({ orderNumber, phone });
      const res = await fetch(`/api/orders?${params}`);
      const json = await res.json();
      if (json.success) {
        setResult(json.data);
      } else {
        setError(json.error || "الطلب غير موجود");
      }
    } catch (err: any) {
      setError(err.message || "تعذّر جلب الطلب");
    } finally {
      setLoading(false);
    }
  };

  const statusLabels: Record<string, string> = {
    PENDING: "قيد المراجعة",
    CONFIRMED: "مؤكد — قيد التجهيز",
    PROCESSING: "قيد التجهيز",
    SHIPPED: "تم الشحن",
    DELIVERED: "تم التوصيل",
    CANCELLED: "ملغي",
    REFUNDED: "تم الاسترداد",
  };
  const paymentLabels: Record<string, string> = {
    UNPAID: "غير مدفوع",
    PENDING: "بانتظار الدفع",
    PAID: "مدفوع",
    FAILED: "فشل الدفع",
    CANCELLED: "ملغي",
    REFUNDED: "تم الاسترداد",
  };

  return (
    <PageShell title="تتبع الطلب" eyebrow="تابع طلبك">
      <form onSubmit={track} className="max-w-md mx-auto space-y-4">
        <input
          required
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="رقم الطلب (مثال: FD-2026-000001)"
          className="w-full h-12 px-4 bg-secondary border-0 focus:ring-1 focus:ring-ring outline-none text-center font-mono"
          dir="ltr"
        />
        <input
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="رقم الهاتف"
          className="w-full h-12 px-4 bg-secondary border-0 focus:ring-1 focus:ring-ring outline-none text-center"
          dir="ltr"
        />
        <button
          disabled={loading}
          className="w-full h-12 bg-foreground text-background text-sm tracking-luxe uppercase hover:bg-foreground/90 disabled:opacity-50"
        >
          {loading ? "جاري البحث..." : "تتبع"}
        </button>
      </form>

      {error && (
        <div className="mt-6 max-w-md mx-auto p-4 border border-destructive/30 text-destructive text-sm text-center">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 max-w-md mx-auto border border-border p-6 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">رقم الطلب</span>
            <span className="font-mono font-bold" dir="ltr">{result.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">الحالة</span>
            <span className="font-medium">{statusLabels[result.status] || result.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">الدفع</span>
            <span className="font-medium">{paymentLabels[result.paymentStatus] || result.paymentStatus}</span>
          </div>
          {result.trackingNumber && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">رقم الشحن</span>
              <span className="font-mono" dir="ltr">{result.trackingNumber}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">الإجمالي</span>
            <span className="font-bold">{formatPrice(result.total)}</span>
          </div>
          {result.items && result.items.length > 0 && (
            <div className="pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">المنتجات:</p>
              <ul className="space-y-1">
                {result.items.map((it: any) => (
                  <li key={it.id} className="text-xs">
                    {it.productName} — {it.size} × {it.quantity} ({formatPrice(it.price)})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-12 max-w-md mx-auto">
        <div className="border border-border p-5 text-sm">
          <p className="font-medium mb-2">حالات الطلب:</p>
          <ul className="space-y-1.5 text-muted-foreground">
            <li>• قيد المراجعة</li>
            <li>• مؤكد — قيد التجهيز</li>
            <li>• تم الشحن</li>
            <li>• تم التوصيل</li>
          </ul>
        </div>
      </div>
    </PageShell>
  );
}

function Pillar({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="text-center p-6 border border-border">
      <div className="inline-flex h-12 w-12 items-center justify-center bg-foreground text-background mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex items-start gap-3">
      <Check className="h-5 w-5 mt-0.5 shrink-0" />
      <div>
        <h4 className="font-medium text-sm mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}

function InfoBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border p-6">
      <h2 className="text-base font-bold mb-3">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );
}