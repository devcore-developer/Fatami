"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function SettingsSection() {
  const [settings, setSettings] = useState<any>({
    brandName: "Futami DESIGNS",
    brandTagline: "أناقة بلا حدود",
    currency: "KWD",
    whatsapp: "",
    instagram: "",
    tiktok: "",
    email: "",
    phone: "",
    freeShippingThreshold: 100,
    bankName: "",
    bankAccount: "",
    accountName: "",
    iban: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      if (json.success && json.data) setSettings(json.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "تم حفظ الإعدادات" });
      } else {
        toast({ title: "فشل", description: json.error, variant: "destructive" });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-12 text-center text-muted-foreground">جاري التحميل...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">إعدادات المتجر</h1>
        <p className="text-sm text-muted-foreground mt-1">معلومات العلامة التجارية والتواصل</p>
      </div>

      <div className="border border-border bg-background p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="اسم العلامة">
            <Input value={settings.brandName ?? ""} onChange={(e) => setSettings({ ...settings, brandName: e.target.value })} className="h-10" dir="ltr" />
          </Field>
          <Field label="الشعار / الوصف">
            <Input value={settings.brandTagline ?? ""} onChange={(e) => setSettings({ ...settings, brandTagline: e.target.value })} className="h-10" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="العملة">
            <Input value={settings.currency ?? "KWD"} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} className="h-10" dir="ltr" />
          </Field>
          <Field label="حد الشحن المجاني (د.ك)">
            <Input type="number" step="0.001" value={settings.freeShippingThreshold ?? ""} onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })} className="h-10" dir="ltr" />
          </Field>
        </div>

        <h3 className="text-xs tracking-luxe uppercase text-muted-foreground pt-4 border-t border-border">معلومات التواصل</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="البريد الإلكتروني">
            <Input value={settings.email ?? ""} onChange={(e) => setSettings({ ...settings, email: e.target.value })} className="h-10" dir="ltr" />
          </Field>
          <Field label="الهاتف">
            <Input value={settings.phone ?? ""} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} className="h-10" dir="ltr" />
          </Field>
          <Field label="واتساب">
            <Input value={settings.whatsapp ?? ""} onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })} className="h-10" dir="ltr" />
          </Field>
          <Field label="إنستغرام">
            <Input value={settings.instagram ?? ""} onChange={(e) => setSettings({ ...settings, instagram: e.target.value })} className="h-10" dir="ltr" />
          </Field>
          <Field label="تيك توك">
            <Input value={settings.tiktok ?? ""} onChange={(e) => setSettings({ ...settings, tiktok: e.target.value })} className="h-10" dir="ltr" />
          </Field>
        </div>

        <h3 className="text-xs tracking-luxe uppercase text-muted-foreground pt-4 border-t border-border">بيانات التحويل البنكي</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="اسم البنك">
            <Input value={settings.bankName ?? ""} onChange={(e) => setSettings({ ...settings, bankName: e.target.value })} className="h-10" />
          </Field>
          <Field label="اسم صاحب الحساب">
            <Input value={settings.accountName ?? ""} onChange={(e) => setSettings({ ...settings, accountName: e.target.value })} className="h-10" />
          </Field>
          <Field label="رقم الحساب">
            <Input value={settings.bankAccount ?? ""} onChange={(e) => setSettings({ ...settings, bankAccount: e.target.value })} className="h-10" dir="ltr" />
          </Field>
          <Field label="IBAN (اختياري)">
            <Input value={settings.iban ?? ""} onChange={(e) => setSettings({ ...settings, iban: e.target.value })} className="h-10" dir="ltr" />
          </Field>
        </div>
        <div className="flex justify-end pt-4 border-t border-border">
          <Button onClick={save} disabled={saving}>
            {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}
