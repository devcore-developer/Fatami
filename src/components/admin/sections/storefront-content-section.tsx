"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ImageIcon, Save } from "lucide-react";

export function StorefrontContentSection() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/storefront");
      const json = await res.json();
      if (json.success) setContent(json.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/storefront", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "تم حفظ التغييرات" });
      } else {
        toast({ title: "فشل الحفظ", description: json.error, variant: "destructive" });
      }
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (file: File, field: string) => {
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json.success) {
        setContent({ ...content, [field]: json.data.url });
        toast({ title: "تم رفع الصورة" });
      } else {
        toast({ title: "فشل الرفع", description: json.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "فشل الرفع", variant: "destructive" });
    }
  };

  if (loading) return <div className="py-12 text-center text-muted-foreground">جاري التحميل...</div>;
  if (!content) return <div className="py-12 text-center text-muted-foreground">تعذّر تحميل المحتوى</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">محتوى الصفحة الرئيسية</h1>
          <p className="text-sm text-muted-brand mt-1">إدارة صور ونصوص الهيرو والبانر الإعلاني</p>
        </div>
        <Button onClick={save} disabled={saving} className="gap-2 bg-charcoal text-cream hover:bg-dark-brown">
          <Save className="h-4 w-4" />
          {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </Button>
      </div>

      {/* Hero Section */}
      <div className="border border-hairline rounded-2xl bg-surface p-6 space-y-5">
        <h2 className="text-base font-bold text-charcoal flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-brown" />
          قسم الهيرو (الواجهة الرئيسية)
        </h2>

        {/* Hero Image — Desktop */}
        <ImageField
          label="صورة الهيرو (ديسكتوب)"
          value={content.heroImage}
          onChange={(url) => setContent({ ...content, heroImage: url })}
          onUpload={(file) => uploadImage(file, "heroImage")}
          onClear={() => setContent({ ...content, heroImage: null })}
        />

        {/* Hero Image — Mobile */}
        <ImageField
          label="صورة الهيرو (موبايل)"
          value={content.mobileHeroImage}
          onChange={(url) => setContent({ ...content, mobileHeroImage: url })}
          onUpload={(file) => uploadImage(file, "mobileHeroImage")}
          onClear={() => setContent({ ...content, mobileHeroImage: null })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="عنوان المجموعة">
            <Input value={content.heroCollectionLabel ?? ""} onChange={(e) => setContent({ ...content, heroCollectionLabel: e.target.value })} className="h-10 bg-cream border-hairline" />
          </Field>
        </div>
        <Field label="العنوان الرئيسي">
          <Input value={content.heroTitle ?? ""} onChange={(e) => setContent({ ...content, heroTitle: e.target.value })} className="h-10 bg-cream border-hairline" />
        </Field>
        <Field label="الوصف">
          <Textarea value={content.heroDescription ?? ""} onChange={(e) => setContent({ ...content, heroDescription: e.target.value })} rows={2} className="bg-cream border-hairline" />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="نص الزر الأساسي">
            <Input value={content.heroPrimaryCtaText ?? ""} onChange={(e) => setContent({ ...content, heroPrimaryCtaText: e.target.value })} className="h-10 bg-cream border-hairline" />
          </Field>
          <Field label="نص الزر الثانوي">
            <Input value={content.heroSecondaryCtaText ?? ""} onChange={(e) => setContent({ ...content, heroSecondaryCtaText: e.target.value })} className="h-10 bg-cream border-hairline" />
          </Field>
        </div>
      </div>

      {/* Editorial Banner Section */}
      <div className="border border-hairline rounded-2xl bg-surface p-6 space-y-5">
        <h2 className="text-base font-bold text-charcoal flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-brown" />
          البانر الإعلاني (الأناقة الخالدة)
        </h2>

        <ImageField
          label="صورة البانر"
          value={content.editorialImage}
          onChange={(url) => setContent({ ...content, editorialImage: url })}
          onUpload={(file) => uploadImage(file, "editorialImage")}
          onClear={() => setContent({ ...content, editorialImage: null })}
        />

        <Field label="عنوان البانر">
          <Input value={content.editorialTitle ?? ""} onChange={(e) => setContent({ ...content, editorialTitle: e.target.value })} className="h-10 bg-cream border-hairline" />
        </Field>
        <Field label="وصف البانر">
          <Textarea value={content.editorialDescription ?? ""} onChange={(e) => setContent({ ...content, editorialDescription: e.target.value })} rows={2} className="bg-cream border-hairline" />
        </Field>
        <Field label="نص زر البانر">
          <Input value={content.editorialCtaText ?? ""} onChange={(e) => setContent({ ...content, editorialCtaText: e.target.value })} className="h-10 bg-cream border-hairline" />
        </Field>
      </div>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="gap-2 bg-charcoal text-cream hover:bg-dark-brown">
          <Save className="h-4 w-4" />
          {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </Button>
      </div>
    </div>
  );
}

function ImageField({ label, value, onChange, onUpload, onClear }: {
  label: string;
  value: string | null | undefined;
  onChange: (url: string) => void;
  onUpload: (file: File) => void;
  onClear: () => void;
}) {
  return (
    <div>
      <Label className="text-xs mb-2 block text-charcoal">{label}</Label>
      <div className="flex items-start gap-4">
        <div className="relative h-24 w-32 shrink-0 rounded-lg overflow-hidden bg-beige border border-hairline">
          {value ? (
            <>
              <img src={value} alt={label} className="w-full h-full object-cover" />
              <button
                onClick={onClear}
                className="absolute top-1 right-1 h-6 w-6 bg-charcoal/80 text-cream rounded-full flex items-center justify-center hover:bg-charcoal"
                title="إزالة"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="h-6 w-6 text-taupe" />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <label className="inline-flex items-center gap-2 h-10 px-4 bg-charcoal text-cream text-xs font-medium rounded-lg cursor-pointer hover:bg-dark-brown transition-colors">
            <Plus className="h-3.5 w-3.5" />
            رفع صورة
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUpload(f);
              }}
            />
          </label>
          <Input
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="أو أدخلي رابط URL"
            className="h-9 text-xs bg-cream border-hairline"
            dir="ltr"
          />
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs mb-1.5 block text-charcoal">{label}</Label>
      {children}
    </div>
  );
}