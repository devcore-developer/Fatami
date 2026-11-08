"use client";

import { useState } from "react";
import { useCart, useUI } from "@/store";
import { formatPrice } from "@/lib/format";
import { storeSettings } from "@/data/catalog";
import { useCatalog } from "@/components/storefront/catalog-provider";
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
import { ArrowLeft, Check, CreditCard, Truck, Lock } from "lucide-react";

type Step = "info" | "shipping" | "payment";

export function CheckoutView() {
  const { items, subtotal, clear } = useCart();
  const { setView, setLastOrderNumber } = useUI();
  const { toast } = useToast();
  const { governorates } = useCatalog();
  const total = subtotal();

  const [step, setStep] = useState<Step>("info");
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
    shippingMethod: "standard",
    paymentMethod: "UPAYMENTS",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);

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
    if (s === "shipping" && !form.shippingMethod)
      e.shippingMethod = "اختاري طريقة الشحن";
    if (s === "payment" && !form.paymentMethod)
      e.paymentMethod = "اختاري طريقة الدفع";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate(step)) return;
    if (step === "info") setStep("shipping");
    else if (step === "shipping") setStep("payment");
  };

  const back = () => {
    if (step === "shipping") setStep("info");
    else if (step === "payment") setStep("shipping");
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
          measurements: i.measurements,
        })),
        paymentMethod: form.paymentMethod,
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

      const { orderNumber, id: orderId } = json.data;
      setLastOrderNumber(orderNumber);
      clear();

      // For UPayments, redirect to the payment gateway.
      // For COD, the order is complete (payment collected on delivery).
      if (form.paymentMethod === "UPAYMENTS") {
        toast({
          title: "تم إنشاء الطلب",
          description: `رقم الطلب: ${orderNumber} — جاري التحويل لبوابة الدفع`,
        });
        // Fetch the payment URL from the server and redirect.
        try {
          const payRes = await fetch("/api/upayments/request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId }),
          });
          const payJson = await payRes.json();
          if (payJson.success && payJson.data?.paymentURL) {
            window.location.href = payJson.data.paymentURL;
            return; // page is navigating away
          }
        } catch {
          // If payment request fails, still show success so customer keeps the order
        }
        // Fallback: show success page if redirect didn't happen
        setProcessing(false);
        setView("order-success");
      } else {
        toast({
          title: "تم إنشاء الطلب بنجاح",
          description: `رقم الطلب: ${orderNumber}`,
        });
        setProcessing(false);
        setView("order-success");
      }
    } catch (e: any) {
      setProcessing(false);
      toast({
        title: "تعذّر إنشاء الطلب",
        description: e.message || "حاولي مرة أخرى",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container-luxe py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setView("cart")}
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4 rotate-180" />
            العودة للسلة
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold">إتمام الشراء</h1>
          <div className="w-24" />
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {(["info", "shipping", "payment"] as Step[]).map((s, i) => {
            const isActive = step === s;
            const isDone =
              (step === "shipping" && s === "info") ||
              (step === "payment" && s !== "payment");
            return (
              <div key={s} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs border ${
                      isActive
                        ? "bg-black text-white border-black"
                        : isDone
                        ? "bg-black text-white border-black"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {isDone ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  <span
                    className={`text-xs tracking-luxe uppercase hidden sm:inline ${
                      isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {s === "info" ? "البيانات" : s === "shipping" ? "الشحن" : "الدفع"}
                  </span>
                </div>
                {i < 2 && <div className="w-8 sm:w-16 h-px bg-border mx-2" />}
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
                <Field
                  label="البريد الإلكتروني أو رقم الهاتف"
                  required
                  error={errors.emailOrPhone}
                >
                  <Input
                    value={form.emailOrPhone}
                    onChange={(e) =>
                      setForm({ ...form, emailOrPhone: e.target.value })
                    }
                    placeholder="example@email.com"
                    className="h-11"
                  />
                </Field>

                <SectionTitle title="عنوان الشحن" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="الاسم الأول" required error={errors.firstName}>
                    <Input
                      value={form.firstName}
                      onChange={(e) =>
                        setForm({ ...form, firstName: e.target.value })
                      }
                      className="h-11"
                    />
                  </Field>
                  <Field label="اسم العائلة" required error={errors.lastName}>
                    <Input
                      value={form.lastName}
                      onChange={(e) =>
                        setForm({ ...form, lastName: e.target.value })
                      }
                      className="h-11"
                    />
                  </Field>
                </div>
                <Field label="العنوان" required error={errors.address}>
                  <Input
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    placeholder="الشارع، المنطقة"
                    className="h-11"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="الشقة أو الوحدة (اختياري)">
                    <Input
                      value={form.apartment}
                      onChange={(e) =>
                        setForm({ ...form, apartment: e.target.value })
                      }
                      className="h-11"
                    />
                  </Field>
                  <Field label="القطعة / Block" required error={errors.block}>
                    <Input
                      value={form.block}
                      onChange={(e) =>
                        setForm({ ...form, block: e.target.value })
                      }
                      className="h-11"
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="الرمز البريدي (اختياري)">
                    <Input
                      value={form.postalCode}
                      onChange={(e) =>
                        setForm({ ...form, postalCode: e.target.value })
                      }
                      className="h-11"
                    />
                  </Field>
                  <Field label="المدينة" required error={errors.city}>
                    <Input
                      value={form.city}
                      onChange={(e) =>
                        setForm({ ...form, city: e.target.value })
                      }
                      className="h-11"
                    />
                  </Field>
                </div>
                <Field label="المحافظة" required error={errors.governorate}>
                  <Select
                    value={form.governorate}
                    onValueChange={(v) =>
                      setForm({ ...form, governorate: v })
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="اختاري المحافظة" />
                    </SelectTrigger>
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
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+965 9000 0000"
                    className="h-11"
                    dir="ltr"
                  />
                </Field>
              </div>
            )}

            {step === "shipping" && (
              <div className="space-y-4 animate-fade-up">
                <SectionTitle title="طريقة الشحن" />
                <ShippingOption
                  selected={form.shippingMethod === "standard"}
                  onSelect={() => setForm({ ...form, shippingMethod: "standard" })}
                  title="الشحن العادي"
                  subtitle="التوصيل خلال 1-3 أيام عمل"
                  price={shippingCost}
                />
                <ShippingOption
                  selected={form.shippingMethod === "express"}
                  onSelect={() => setForm({ ...form, shippingMethod: "express" })}
                  title="الشحن السريع"
                  subtitle="التوصيل في نفس اليوم (ضمن الكويت)"
                  price={shippingCost + 2}
                  disabled
                  comingSoon
                />
                {!form.governorate && (
                  <p className="text-xs text-muted-foreground">
                    * اختاري المحافظة لعرض رسوم الشحن
                  </p>
                )}
              </div>
            )}

            {step === "payment" && (
              <div className="space-y-4 animate-fade-up">
                <SectionTitle title="طريقة الدفع" />
                <PaymentOption
                  selected={form.paymentMethod === "UPAYMENTS"}
                  onSelect={() => setForm({ ...form, paymentMethod: "UPAYMENTS" })}
                  title="الدفع عبر UPayments"
                  subtitle="بطاقة ائتمانية / K-Net / محفظة إلكترونية"
                  icon={<CreditCard className="h-5 w-5" />}
                  recommended
                />
                <PaymentOption
                  selected={form.paymentMethod === "COD"}
                  onSelect={() => setForm({ ...form, paymentMethod: "COD" })}
                  title="الدفع عند الاستلام"
                  subtitle="ادفعي نقداً عند وصول الطلب"
                  icon={<Truck className="h-5 w-5" />}
                />
                <div className="flex items-start gap-2 p-4 bg-secondary/50 text-xs text-muted-foreground">
                  <Lock className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>
                    جميع المعاملات آمنة ومشفّرة. لا نخزّن بيانات بطاقتك الائتمانية.
                    سيتم تحويلك إلى بوابة دفع UPayments لإتمام عملية الدفع بأمان تام.
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              {step !== "info" ? (
                <Button variant="outline" onClick={back}>
                  السابق
                </Button>
              ) : (
                <div />
              )}
              {step !== "payment" ? (
                <Button onClick={next} className="min-w-32">
                  التالي
                </Button>
              ) : (
                <Button
                  onClick={placeOrder}
                  disabled={processing}
                  className="min-w-40 h-12"
                >
                  {processing
                    ? "جاري المعالجة..."
                    : `ادفعي ${formatPrice(grandTotal)}`}
                </Button>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-28 self-start">
            <div className="border border-border p-6">
              <h3 className="text-sm font-medium tracking-luxe uppercase mb-4">
                ملخص الطلب
              </h3>
              <div className="space-y-4 mb-5 max-h-72 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative shrink-0 w-14 h-18 bg-secondary overflow-hidden">
                      <img
                        src={item.product.images[0].url}
                        alt={item.product.images[0].alt}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute -top-1 -left-1 bg-black text-white text-[10px] h-5 w-5 rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium line-clamp-1">
                        {item.product.nameAr}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.size}
                      </p>
                      <p className="text-xs font-medium mt-1">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المجموع الفرعي</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الشحن</span>
                  <span>
                    {shippingCost > 0 ? formatPrice(shippingCost) : "—"}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border font-bold text-base">
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

function SectionTitle({ title }: { title: string }) {
  return (
    <h2 className="text-sm font-medium tracking-luxe uppercase text-muted-foreground pb-2 border-b border-border">
      {title}
    </h2>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-xs mb-1.5 block">
        {label}
        {required && <span className="text-foreground mr-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

function ShippingOption({
  selected,
  onSelect,
  title,
  subtitle,
  price,
  disabled,
  comingSoon,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  subtitle: string;
  price: number;
  disabled?: boolean;
  comingSoon?: boolean;
}) {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`flex items-center justify-between w-full p-4 border text-right transition-colors ${
        selected
          ? "border-foreground bg-secondary/50"
          : "border-border hover:border-foreground/40"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{title}</span>
          {comingSoon && (
            <span className="text-[10px] tracking-luxe uppercase text-muted-foreground border border-border px-1.5 py-0.5">
              قريباً
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">{formatPrice(price)}</span>
        <div
          className={`h-5 w-5 rounded-full border-2 ${
            selected ? "border-foreground bg-foreground" : "border-border"
          }`}
        >
          {selected && (
            <div className="h-full w-full flex items-center justify-center">
              <Check className="h-3 w-3 text-background" />
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

function PaymentOption({
  selected,
  onSelect,
  title,
  subtitle,
  icon,
  recommended,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  recommended?: boolean;
}) {
  return (
    <button
      onClick={onSelect}
      className={`flex items-center gap-4 w-full p-4 border text-right transition-colors ${
        selected
          ? "border-foreground bg-secondary/50"
          : "border-border hover:border-foreground/40"
      }`}
    >
      <div
        className={`h-11 w-11 flex items-center justify-center border ${
          selected ? "bg-foreground text-background border-foreground" : "border-border"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{title}</span>
          {recommended && (
            <span className="text-[10px] tracking-luxe uppercase bg-foreground text-background px-1.5 py-0.5">
              موصى به
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      <div
        className={`h-5 w-5 rounded-full border-2 ${
          selected ? "border-foreground bg-foreground" : "border-border"
        }`}
      >
        {selected && (
          <div className="h-full w-full flex items-center justify-center">
            <Check className="h-3 w-3 text-background" />
          </div>
        )}
      </div>
    </button>
  );
}
