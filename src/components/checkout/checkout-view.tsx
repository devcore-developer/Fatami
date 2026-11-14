"use client";

import { useState, useEffect } from "react";
import { useCart, useUI } from "@/store";
import { formatPrice } from "@/lib/format";
import { storeSettings } from "@/data/catalog";
import { useCatalog } from "@/components/storefront/catalog-provider";
import { formatMeasurementsSummary } from "@/lib/measurements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Check, Upload, Building2, Copy, Smartphone } from "lucide-react";

type Step = "info" | "payment";
type PaymentMethod = "WAMD" | "BANK_TRANSFER";

export function CheckoutView() {
  const { items, subtotal, clear } = useCart();
  const { setView, setLastOrderNumber } = useUI();
  const { toast } = useToast();
  const { governorates } = useCatalog();
  const total = subtotal();

  const [step, setStep] = useState<Step>("info");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("WAMD");
  // Live store settings (WAMD phone etc.) fetched from the admin-configured DB record.
  const [settings, setSettings] = useState<any>(storeSettings);
  const [form, setForm] = useState({
    emailOrPhone: "",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    block: "",
    postalCode: "",
    city: "",
    governorate: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Fetch the admin-configured store settings (bank + WAMD details) once.
  useEffect(() => {
    fetch("/api/admin/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) setSettings({ ...storeSettings, ...json.data });
      })
      .catch(() => {});
  }, []);

  const selectedGov = governorates.find(
    (g) => g.nameAr === form.governorate
  );
  const shippingCost = selectedGov?.shippingCost ?? 0;
  const grandTotal = total + shippingCost;

  if (items.length === 0 && !processing) {
    return (
      <div className="container-narrow py-32 text-center">
        <h1 className="text-2xl font-bold mb-3">سلتك فارغة</h1>
        <p className="text-muted-foreground mb-6">
          أضيفي منتجات إلى السلة قبل إتمام الشراء
        </p>
        <Button onClick={() => setView("shop")}>العودة للمتجر</Button>
      </div>
    );
  }

  const validate = (s: Step): boolean => {
    const e: Record<string, string> = {};
    if (s === "info") {
      if (!form.emailOrPhone.trim())
        e.emailOrPhone = "البريد الإلكتروني أو رقم الهاتف مطلوب";
      if (!form.firstName.trim()) e.firstName = "الاسم الأول مطلوب";
      if (!form.lastName.trim()) e.lastName = "اسم العائلة مطلوب";
      if (!form.address.trim()) e.address = "العنوان مطلوب";
      if (!form.block.trim()) e.block = "القطعة / Block مطلوبة";
      if (!form.city.trim()) e.city = "المدينة مطلوبة";
      if (!form.governorate) e.governorate = "اختاري المحافظة";
      if (!form.phone.trim()) e.phone = "رقم الهاتف مطلوب";
      else if (!/^[+\d\s-]{8,}$/.test(form.phone))
        e.phone = "رقم الهاتف غير صحيح";
    }
    if (s === "payment" && !screenshotUrl) {
      e.screenshot = "يرجى رفع صورة إيصال التحويل";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate("info")) return;
    setStep("payment");
  };

  const back = () => {
    if (step === "payment") setStep("info");
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      // Public upload endpoint (no admin auth required for customer receipts).
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json.success) {
        setScreenshotUrl(json.data.url);
        toast({ title: "تم رفع الإيصال" });
      } else {
        toast({ title: "فشل الرفع", description: json.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "فشل الرفع", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const placeOrder = async () => {
    if (!validate("payment")) return;
    setProcessing(true);
    try {
      const payload = {
        customer: {
          email: form.emailOrPhone.includes("@") ? form.emailOrPhone : undefined,
          phone: form.phone,
          firstName: form.firstName,
          lastName: form.lastName,
          address: form.address,
          apartment: form.apartment || undefined,
          block: form.block,
          postalCode: form.postalCode || undefined,
          city: form.city,
          governorate: form.governorate,
        },
        items: items.map((i) => ({
          productId: i.productId,
          size: i.size,
          quantity: i.quantity,
          // Custom measurements ride with their own cart line (may be undefined)
          measurements: i.measurements,
        })),
        paymentMethod,
        transferScreenshot: screenshotUrl,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || "فشل إنشاء الطلب");
      }

      const { orderNumber } = json.data;
      setLastOrderNumber(orderNumber);
      clear();
      toast({
        title: "تم إنشاء الطلب بنجاح",
        description: `رقم الطلب: ${orderNumber}`,
      });
      setProcessing(false);
      setView("order-success");
    } catch (e: any) {
      setProcessing(false);
      toast({
        title: "تعذّر إنشاء الطلب",
        description: e.message || "حاولي مرة أخرى",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "تم النسخ" });
  };

  return (
    <div className="bg-cream min-h-screen">
      <div className="container-luxe py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setView("cart")}
            className="text-sm text-muted-brand hover:text-charcoal inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4 rotate-180" />
            العودة للسلة
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal">إتمام الشراء</h1>
          <div className="w-24" />
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {(["info", "payment"] as Step[]).map((s, i) => {
            const isActive = step === s;
            const isDone = step === "payment" && s === "info";
            return (
              <div key={s} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs border ${
                      isActive
                        ? "bg-charcoal text-cream border-charcoal"
                        : isDone
                        ? "bg-charcoal text-cream border-charcoal"
                        : "border-border text-muted-brand"
                    }`}
                  >
                    {isDone ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  <span
                    className={`text-xs tracking-luxe uppercase hidden sm:inline ${
                      isActive ? "text-charcoal" : "text-muted-brand"
                    }`}
                  >
                    {s === "info" ? "البيانات" : "الدفع"}
                  </span>
                </div>
                {i < 1 && <div className="w-8 sm:w-16 h-px bg-border mx-2" />}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-12">
          {/* Form */}
          <div>
            {step === "info" && (
              <div className="space-y-5 animate-fade-up">
                <SectionTitle title="معلومات التواصل" />
                <Field label="البريد الإلكتروني أو رقم الهاتف" required error={errors.emailOrPhone}>
                  <Input
                    value={form.emailOrPhone}
                    onChange={(e) => setForm({ ...form, emailOrPhone: e.target.value })}
                    placeholder="example@email.com"
                    className="h-11 bg-surface border-hairline"
                  />
                </Field>

                <SectionTitle title="عنوان الشحن" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="الاسم الأول" required error={errors.firstName}>
                    <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="h-11 bg-surface border-hairline" />
                  </Field>
                  <Field label="اسم العائلة" required error={errors.lastName}>
                    <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="h-11 bg-surface border-hairline" />
                  </Field>
                </div>
                <Field label="العنوان" required error={errors.address}>
                  <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="الشارع، المنطقة" className="h-11 bg-surface border-hairline" />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="الشقة أو الوحدة (اختياري)">
                    <Input value={form.apartment} onChange={(e) => setForm({ ...form, apartment: e.target.value })} className="h-11 bg-surface border-hairline" />
                  </Field>
                  <Field label="القطعة / Block" required error={errors.block}>
                    <Input value={form.block} onChange={(e) => setForm({ ...form, block: e.target.value })} className="h-11 bg-surface border-hairline" />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="الرمز البريدي (اختياري)">
                    <Input value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} className="h-11 bg-surface border-hairline" />
                  </Field>
                  <Field label="المدينة" required error={errors.city}>
                    <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="h-11 bg-surface border-hairline" />
                  </Field>
                </div>
                <Field label="المحافظة" required error={errors.governorate}>
                  <Select value={form.governorate} onValueChange={(v) => setForm({ ...form, governorate: v })}>
                    <SelectTrigger className="h-11 bg-surface border-hairline"><SelectValue placeholder="اختاري المحافظة" /></SelectTrigger>
                    <SelectContent>
                      {governorates.map((g) => (
                        <SelectItem key={g.id} value={g.nameAr}>
                          {g.nameAr} — {formatPrice(g.shippingCost)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="رقم الهاتف" required error={errors.phone}>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+965 9000 0000" className="h-11 bg-surface border-hairline" dir="ltr" />
                </Field>
              </div>
            )}

            {step === "payment" && (
              <div className="space-y-6 animate-fade-up">
                <SectionTitle title="طريقة الدفع" />

                {/* Payment method selection — only WAMD and Bank Transfer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <PaymentOption
                    selected={paymentMethod === "WAMD"}
                    onClick={() => setPaymentMethod("WAMD")}
                    icon={<Smartphone className="h-5 w-5" />}
                    title="WAMD (وامض)"
                    subtitle="تحويل فوري عبر وامض"
                  />
                  <PaymentOption
                    selected={paymentMethod === "BANK_TRANSFER"}
                    onClick={() => setPaymentMethod("BANK_TRANSFER")}
                    icon={<Building2 className="h-5 w-5" />}
                    title="تحويل بنكي"
                    subtitle="حوّلي إلى الحساب البنكي"
                  />
                </div>

                {/* WAMD details */}
                {paymentMethod === "WAMD" && (
                  <div className="border border-hairline rounded-2xl bg-surface p-6 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Smartphone className="h-5 w-5 text-brown" />
                      <h3 className="text-sm font-bold text-charcoal">بيانات الدفع عبر WAMD</h3>
                    </div>
                    <div className="space-y-3">
                      {settings.wamdPhone && (
                        <BankRow label="رقم الهاتف (WAMD)" value={settings.wamdPhone} onCopy={copyToClipboard} ltr />
                      )}
                      {settings.wamdAccountName && (
                        <BankRow label="اسم الحساب" value={settings.wamdAccountName} onCopy={copyToClipboard} />
                      )}
                      {!settings.wamdPhone && !settings.wamdAccountName && (
                        <p className="text-xs text-muted-brand">
                          لم يتم ضبط بيانات WAMD بعد. تواصلي مع المتجر لتأكيد التحويل.
                        </p>
                      )}
                    </div>
                    <div className="pt-3 border-t border-hairline">
                      <p className="text-xs text-muted-brand leading-relaxed">
                        حوّلي المبلغ المطلوب ({formatPrice(grandTotal)}) إلى رقم WAMD أعلاه، ثم ارفعي صورة إيصال التحويل أدناه لتأكيد الطلب.
                      </p>
                    </div>
                  </div>
                )}

                {/* Bank transfer details */}
                {paymentMethod === "BANK_TRANSFER" && (
                  <div className="border border-hairline rounded-2xl bg-surface p-6 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-5 w-5 text-brown" />
                      <h3 className="text-sm font-bold text-charcoal">بيانات التحويل البنكي</h3>
                    </div>

                    <div className="space-y-3">
                      <BankRow label="اسم البنك" value={settings.bankName || "—"} onCopy={copyToClipboard} />
                      <BankRow label="اسم صاحب الحساب" value={settings.accountName || "—"} onCopy={copyToClipboard} />
                      <BankRow label="رقم الحساب" value={settings.bankAccount || "—"} onCopy={copyToClipboard} ltr />
                      {settings.iban && (
                        <BankRow label="IBAN" value={settings.iban} onCopy={copyToClipboard} ltr />
                      )}
                    </div>

                    <div className="pt-3 border-t border-hairline">
                      <p className="text-xs text-muted-brand leading-relaxed">
                        حوّلي المبلغ المطلوب ({formatPrice(grandTotal)}) إلى الحساب أعلاه، ثم ارفعي صورة إيصال التحويل أدناه لتأكيد الطلب.
                      </p>
                    </div>
                  </div>
                )}

                {/* Screenshot upload */}
                <div className="border border-hairline rounded-2xl bg-surface p-6 space-y-4">
                  <h3 className="text-sm font-bold text-charcoal">رفع إيصال التحويل</h3>

                  {screenshotUrl ? (
                    <div className="space-y-3">
                      <div className="relative rounded-xl overflow-hidden border border-hairline">
                        <img src={screenshotUrl} alt="إيصال التحويل" className="w-full max-h-64 object-contain bg-beige" />
                        <button
                          onClick={() => setScreenshotUrl(null)}
                          className="absolute top-2 right-2 bg-charcoal text-cream text-xs px-3 py-1.5 rounded-full hover:bg-dark-brown"
                        >
                          تغيير
                        </button>
                      </div>
                      <p className="text-xs text-muted-brand flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-brown" />
                        تم رفع الإيصال بنجاح
                      </p>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-hairline rounded-xl py-10 cursor-pointer hover:bg-beige/50 transition-colors">
                      {uploading ? (
                        <p className="text-sm text-muted-brand">جاري الرفع...</p>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-taupe" />
                          <p className="text-sm text-charcoal font-medium">اضغطي لرفع صورة الإيصال</p>
                          <p className="text-xs text-muted-brand">JPEG, PNG, WEBP — أقل من 5MB</p>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleUpload(f);
                        }}
                      />
                    </label>
                  )}
                  {errors.screenshot && (
                    <p className="text-xs text-destructive">{errors.screenshot}</p>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-hairline">
              {step !== "info" ? (
                <Button variant="outline" onClick={back}>السابق</Button>
              ) : (
                <div />
              )}
              {step !== "payment" ? (
                <Button onClick={next} className="min-w-32 bg-charcoal text-cream hover:bg-dark-brown">التالي</Button>
              ) : (
                <Button
                  onClick={placeOrder}
                  disabled={processing || !screenshotUrl}
                  className="min-w-40 h-12 bg-charcoal text-cream hover:bg-dark-brown"
                >
                  {processing ? "جاري المعالجة..." : "تأكيد الطلب"}
                </Button>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-28 self-start">
            <div className="border border-hairline rounded-2xl bg-surface p-6">
              <h3 className="text-sm font-bold tracking-luxe uppercase text-charcoal mb-4">ملخص الطلب</h3>
              <div className="space-y-4 mb-5 max-h-72 overflow-y-auto">
                {items.map((item) => {
                  const measSummary = formatMeasurementsSummary(item.measurements);
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative shrink-0 w-14 h-18 bg-beige overflow-hidden rounded-lg">
                        <img src={item.product.images[0]?.url} alt="" className="w-full h-full object-cover" />
                        <span className="absolute -top-1 -left-1 bg-charcoal text-cream text-[10px] h-5 w-5 rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium line-clamp-1 text-charcoal">{item.product.nameAr}</p>
                        <p className="text-xs text-muted-brand mt-0.5">{item.size}</p>
                        {measSummary && (
                          <p className="text-[10px] text-brown mt-0.5 leading-relaxed">
                            مقاسات مخصصة: {measSummary}
                          </p>
                        )}
                        <p className="text-xs font-medium mt-1 text-charcoal">{formatPrice(item.product.price * item.quantity)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="space-y-2 border-t border-hairline pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-brand">المجموع الفرعي</span>
                  <span className="text-charcoal">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-brand">الشحن</span>
                  <span className="text-charcoal">{shippingCost > 0 ? formatPrice(shippingCost) : "—"}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-hairline font-bold text-base text-charcoal">
                  <span>الإجمالي</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentOption({
  selected,
  onClick,
  icon,
  title,
  subtitle,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 p-4 border rounded-2xl text-right transition-all ${
        selected
          ? "border-charcoal bg-charcoal/5 ring-1 ring-charcoal"
          : "border-hairline bg-surface hover:border-brown"
      }`}
    >
      <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${selected ? "bg-charcoal text-cream" : "bg-beige text-brown"}`}>
        {icon}
      </span>
      <div className="flex-1">
        <p className="text-sm font-bold text-charcoal">{title}</p>
        <p className="text-xs text-muted-brand mt-0.5">{subtitle}</p>
      </div>
      <span className={`h-4 w-4 rounded-full border-2 mt-1 ${selected ? "border-charcoal bg-charcoal" : "border-hairline"}`} />
    </button>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h2 className="text-sm font-bold tracking-luxe uppercase text-muted-brand pb-2 border-b border-hairline">
      {title}
    </h2>
  );
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs mb-1.5 block text-charcoal">
        {label}
        {required && <span className="text-brown mr-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

function BankRow({ label, value, onCopy, ltr }: { label: string; value: string; onCopy: (text: string) => void; ltr?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-muted-brand">{label}</p>
        <p className="text-sm font-medium text-charcoal" dir={ltr ? "ltr" : "rtl"}>{value}</p>
      </div>
      {value !== "—" && (
        <button
          onClick={() => onCopy(value)}
          className="inline-flex items-center gap-1 text-xs text-muted-brand hover:text-brown transition-colors"
        >
          <Copy className="h-3.5 w-3.5" />
          نسخ
        </button>
      )}
    </div>
  );
}