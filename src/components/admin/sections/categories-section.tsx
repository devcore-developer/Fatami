"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, FolderTree } from "lucide-react";

export function CategoriesSection() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", nameAr: "", slug: "", image: "" });
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (json.success) setCategories(json.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const create = async () => {
    if (!form.slug || !form.nameAr) {
      toast({ title: "بيانات ناقصة", variant: "destructive" });
      return;
    }
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (json.success) {
      toast({ title: "تمت الإضافة" });
      setShowForm(false);
      setForm({ name: "", nameAr: "", slug: "", image: "" });
      void load();
    } else {
      toast({ title: "فشل", description: json.error, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">الفئات</h1>
          <p className="text-sm text-muted-foreground mt-1">{categories.length} فئة</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          فئة جديدة
        </Button>
      </div>

      {showForm && (
        <div className="border border-border bg-background p-5 grid grid-cols-2 gap-4">
          <Field label="الاسم العربي *">
            <Input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} className="h-10" />
          </Field>
          <Field label="الاسم الإنجليزي">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-10" dir="ltr" />
          </Field>
          <Field label="الـ Slug *">
            <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="h-10" dir="ltr" />
          </Field>
          <Field label="رابط الصورة">
            <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="h-10" dir="ltr" />
          </Field>
          <div className="col-span-2 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
            <Button onClick={create}>إضافة</Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">جاري التحميل...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((c) => (
            <div key={c.id} className="border border-border bg-background p-4 text-center">
              {c.image ? (
                <img src={c.image} alt={c.nameAr} className="h-24 w-full object-cover mb-3 bg-secondary" />
              ) : (
                <div className="h-24 w-full bg-secondary flex items-center justify-center mb-3">
                  <FolderTree className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <p className="font-medium text-sm">{c.nameAr}</p>
              <p className="text-xs text-muted-foreground" dir="ltr">{c.slug}</p>
              <p className="text-xs mt-2">{c.productCount ?? 0} منتج</p>
            </div>
          ))}
        </div>
      )}
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
