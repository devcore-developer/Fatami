"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, FolderTree, X, AlertTriangle } from "lucide-react";

interface CategoryRow {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  image?: string | null;
  active: boolean;
  sortOrder: number;
  productCount: number;
}

export function CategoriesSection() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [form, setForm] = useState({ name: "", nameAr: "", slug: "", image: "", active: true, sortOrder: 0 });
  // Reassign-then-delete flow state.
  const [reassign, setReassign] = useState<{ category: CategoryRow | null; targetId: string; count: number } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const json = await res.json().catch(() => ({ success: false, error: "DELETE_FAILED" }));
      if (json.success) setCategories(json.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", nameAr: "", slug: "", image: "", active: true, sortOrder: categories.length });
    setShowForm(true);
  };

  const openEdit = (c: CategoryRow) => {
    setEditing(c);
    setForm({
      name: c.name || "",
      nameAr: c.nameAr,
      slug: c.slug,
      image: c.image ?? "",
      active: c.active,
      sortOrder: c.sortOrder ?? 0,
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.slug || !form.nameAr) {
      toast({ title: "بيانات ناقصة", description: "الاسم العربي والـ slug مطلوبة", variant: "destructive" });
      return;
    }
    const method = editing ? "PUT" : "POST";
    const body: any = { ...form };
    if (editing) body.id = editing.id;
    const res = await fetch("/api/admin/categories", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({ success: false, error: "DELETE_FAILED" }));
    if (json.success) {
      toast({ title: editing ? "تم التحديث" : "تمت الإضافة" });
      setShowForm(false);
      setEditing(null);
      setForm({ name: "", nameAr: "", slug: "", image: "", active: true, sortOrder: 0 });
      void load();
    } else {
      toast({ title: "فشل", description: json.error, variant: "destructive" });
    }
  };

  const remove = async (c: CategoryRow) => {
    // Fast path: try delete. If the category has products the API returns
    // HTTP 409 with `error: "reassign-required"` + productCount, and we open
    // the reassign dialog instead of failing flat.
    const res = await fetch(`/api/admin/categories/remove?id=${c.id}`, { method: "DELETE" });
    const json = await res.json().catch(() => ({ success: false, error: "DELETE_FAILED" }));
    if (json.success) {
      toast({ title: "تم الحذف" });
      void load();
    } else if (res.status === 409 && json.error === "reassign-required") {
      setReassign({ category: c, targetId: "", count: json.productCount ?? 0 });
    } else {
      toast({ title: "تعذّر الحذف", description: json.error, variant: "destructive" });
    }
  };

  const confirmReassign = async () => {
    if (!reassign?.category || !reassign.targetId) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/categories?id=${reassign.category.id}&reassignTo=${reassign.targetId}`,
        { method: "DELETE" }
      );
      const json = await res.json().catch(() => ({ success: false, error: "DELETE_FAILED" }));
      if (json.success) {
        toast({
          title: "تم الحذف",
          description: `نُقلت ${json.reassigned ?? 0} منتج إلى الفئة البديلة`,
        });
        setReassign(null);
        void load();
      } else {
        toast({ title: "تعذّر الحذف", description: json.error, variant: "destructive" });
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">الفئات</h1>
          <p className="text-sm text-muted-foreground mt-1">{categories.length} فئة</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" />
          فئة جديدة
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        ملاحظة: عند حذف فئة تحتوي على منتجات، ستُطلب منك اختيار فئة بديلة لنقل المنتجات إليها. الفئات غير النشطة لا تظهر في الواجهة الأمامية.
      </p>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">جاري التحميل...</div>
      ) : categories.length === 0 ? (
        <div className="py-16 text-center border border-border">
          <FolderTree className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">لا توجد فئات بعد</p>
        </div>
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
              <p className="text-xs mt-2 flex items-center justify-center gap-1">
                {c.productCount > 0 ? (
                  <span className="inline-flex items-center gap-1 text-amber-600">
                    <AlertTriangle className="h-3 w-3" />
                    {c.productCount} منتج
                  </span>
                ) : (
                  <span>{c.productCount} منتج</span>
                )}
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className={`text-[10px] px-2 py-0.5 ${c.active ? "bg-black text-white" : "bg-secondary text-muted-foreground"}`}>
                  {c.active ? "نشط" : "معطّل"}
                </span>
              </div>
              <div className="flex items-center justify-center gap-1 mt-3">
                <button onClick={() => openEdit(c)} className="h-8 w-8 flex items-center justify-center hover:bg-secondary" title="تعديل">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => remove(c)} className="h-8 w-8 flex items-center justify-center hover:bg-secondary text-destructive" title="حذف">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor dialog */}
      <Dialog open={showForm} onOpenChange={(o) => { setShowForm(o); if (!o) setEditing(null); }}>
        <DialogContent className="max-w-lg p-0">
          <DialogHeader className="px-6 py-4 border-b border-border">
            <DialogTitle className="text-right">
              {editing ? "تعديل الفئة" : "فئة جديدة"}
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="الاسم العربي *">
                <Input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} className="h-10" />
              </Field>
              <Field label="الاسم الإنجليزي">
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-10" dir="ltr" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="الـ Slug *">
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="h-10" dir="ltr" placeholder="abayas" />
              </Field>
              <Field label="ترتيب العرض">
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                  className="h-10"
                  dir="ltr"
                />
              </Field>
            </div>
            <Field label="رابط الصورة">
              <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="h-10" dir="ltr" placeholder="https://..." />
            </Field>
            {form.image && (
              <div className="relative h-32 w-full overflow-hidden border border-border">
                <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, image: "" })}
                  className="absolute top-1 right-1 h-6 w-6 bg-black text-white flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-border pt-4">
              <Label className="text-sm">نشط (يظهر في الواجهة الأمامية)</Label>
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>
                إلغاء
              </Button>
              <Button onClick={save}>{editing ? "حفظ التعديلات" : "إضافة"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reassign-then-delete dialog */}
      <Dialog open={!!reassign} onOpenChange={(o) => { if (!o) setReassign(null); }}>
        <DialogContent className="max-w-md p-0">
          <DialogHeader className="px-6 py-4 border-b border-border">
            <DialogTitle className="text-right flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              حذف الفئة وإعادة التعيين
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 py-4 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              الفئة «<span className="font-medium text-foreground">{reassign?.category?.nameAr}</span>»
              تحتوي على <span className="font-medium text-foreground">{reassign?.count ?? 0}</span> منتج.
              اختاري الفئة البديلة التي ستُنقل إليها المنتجات قبل الحذف.
            </p>
            <Field label="الفئة البديلة *">
              <Select
                value={reassign?.targetId ?? ""}
                onValueChange={(v) => setReassign((r) => (r ? { ...r, targetId: v } : r))}
              >
                <SelectTrigger className="h-10"><SelectValue placeholder="اختاري فئة..." /></SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((c) => c.id !== reassign?.category?.id)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nameAr} ({c.productCount} منتج)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>لا يمكن التراجع عن هذا الإجراء. ستُنقل المنتجات ثم تُحذف الفئة نهائياً.</span>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" onClick={() => setReassign(null)} disabled={deleting}>
                إلغاء
              </Button>
              <Button
                onClick={confirmReassign}
                disabled={!reassign?.targetId || deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? "جاري الحذف..." : "نقل المنتجات وحذف الفئة"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
