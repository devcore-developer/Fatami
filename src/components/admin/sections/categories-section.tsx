"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
import {
  Plus,
  Pencil,
  Trash2,
  FolderTree,
  X,
  AlertTriangle,
  ImagePlus,
  Loader2,
  RefreshCw,
} from "lucide-react";

// Must mirror the limits enforced by /api/admin/upload
const MAX_SIZE = 4 * 1024 * 1024; // 4MB
const OK_TYPES = ["image/jpeg", "image/png", "image/webp"];

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
  // Single-image upload state (same mechanism as product images: /api/admin/upload → R2)
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const lastFileRef = useRef<File | null>(null);
  // Reassign-then-delete flow state.
  const [reassign, setReassign] = useState<{ category: CategoryRow | null; targetId: string; count: number } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const json = await res.json().catch(() => ({ success: false, error: "REQUEST_FAILED" }));
      if (json.success) setCategories(json.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", nameAr: "", slug: "", image: "", active: true, sortOrder: categories.length });
    setUploadError(null);
    setUploading(false);
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
    setUploadError(null);
    setUploading(false);
    setShowForm(true);
  };

  // Upload the picked file right away — the returned R2 URL is the permanent
  // one that gets saved with the category. No blob/temporary URLs are stored.
  const startUpload = (file: File) => {
    if (!OK_TYPES.includes(file.type)) {
      toast({ title: "نوع غير مدعوم", description: "مسموح فقط JPG / PNG / WEBP", variant: "destructive" });
      return;
    }
    if (file.size > MAX_SIZE) {
      toast({ title: "الملف كبير جدًا", description: "الحد الأقصى 4MB للصورة", variant: "destructive" });
      return;
    }
    lastFileRef.current = file;
    setUploadError(null);
    setUploading(true);
    setUploadProgress(0);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "categories"); // stored under categories/ in the same R2 bucket

    // XHR instead of fetch so we get real upload progress events
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let json: any = null;
      try {
        json = JSON.parse(xhr.responseText || "{}");
      } catch {
        json = null;
      }
      setUploading(false);
      if (xhr.status >= 200 && xhr.status < 300 && json?.success && json?.data?.url) {
        setForm((f) => ({ ...f, image: json.data.url }));
      } else {
        setUploadError(json?.error || `فشل الرفع (كود ${xhr.status})`);
      }
    };
    xhr.onerror = () => {
      setUploading(false);
      setUploadError("تعذر الاتصال بخادم الرفع");
    };
    xhr.onabort = () => {
      setUploading(false);
      setUploadError("تم إلغاء الرفع");
    };
    xhr.send(fd);
  };

  const retryUpload = () => {
    const f = lastFileRef.current;
    if (f) startUpload(f);
  };

  const save = async () => {
    if (!form.slug || !form.nameAr) {
      toast({ title: "بيانات ناقصة", description: "الاسم العربي والـ slug مطلوبة", variant: "destructive" });
      return;
    }
    if (uploading) {
      toast({ title: "الرفع لسه شغال", description: "استني الصورة تخلص رفع الأول وبعدين احفظي", variant: "destructive" });
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
    const json = await res.json().catch(() => ({ success: false, error: "REQUEST_FAILED" }));
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
    // The remove route answers 400 + needsReassign + productsCount when the
    // category is not empty — open the reassign dialog in that case.
    const res = await fetch(`/api/admin/categories/remove?id=${c.id}`, { method: "DELETE" });
    const json = await res.json().catch(() => ({ success: false, error: "REQUEST_FAILED" }));
    if (json.success) {
      toast({ title: "تم الحذف" });
      void load();
    } else if (json.needsReassign) {
      setReassign({ category: c, targetId: "", count: json.productsCount ?? 0 });
    } else {
      toast({ title: "تعذّر الحذف", description: json.error, variant: "destructive" });
    }
  };

  const confirmReassign = async () => {
    if (!reassign?.category || !reassign.targetId) return;
    setDeleting(true);
    try {
      // Reassign goes through the same remove route (one transaction there)
      const res = await fetch(
        `/api/admin/categories/remove?id=${reassign.category.id}&reassignTo=${reassign.targetId}`,
        { method: "DELETE" }
      );
      const json = await res.json().catch(() => ({ success: false, error: "REQUEST_FAILED" }));
      if (json.success) {
        toast({
          title: "تم الحذف",
          description: `نُقلت ${json.data?.movedProducts ?? 0} منتج إلى الفئة البديلة`,
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

            {/* Image — real upload via /api/admin/upload (R2), no manual URL */}
            <Field label="صورة الفئة">
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) startUpload(f);
                  e.target.value = "";
                }}
              />
              {form.image ? (
                <div className="relative h-40 w-full overflow-hidden border border-border bg-secondary">
                  <img src={form.image} alt="معاينة صورة الفئة" className="w-full h-full object-cover" />
                  {uploading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/70">
                      <Loader2 className="h-5 w-5 animate-spin text-charcoal" />
                      <span className="text-xs font-medium">جاري رفع الصورة الجديدة {uploadProgress}%</span>
                      <div className="h-1 w-3/4 bg-secondary overflow-hidden">
                        <div className="h-full bg-charcoal transition-all" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}
                  {!uploading && (
                    <button
                      type="button"
                      title="إزالة الصورة"
                      onClick={() => setForm({ ...form, image: "" })}
                      className="absolute top-1 right-1 h-7 w-7 bg-black/80 text-white flex items-center justify-center hover:bg-black"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ) : uploading ? (
                <div className="w-full h-40 border border-dashed border-border bg-secondary/20 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-charcoal" />
                  <span className="text-xs font-medium">جاري الرفع {uploadProgress}%</span>
                  <div className="h-1 w-3/4 bg-secondary overflow-hidden">
                    <div className="h-full bg-charcoal transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="w-full h-40 border border-dashed border-border hover:border-charcoal hover:bg-secondary/40 flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors"
                >
                  <ImagePlus className="h-6 w-6" />
                  <span className="text-sm font-medium">اضغطي لاختيار صورة الفئة</span>
                  <span className="text-xs">JPG أو PNG أو WEBP — حتى 4MB</span>
                </button>
              )}
              {uploadError && (
                <div className="flex items-center justify-between gap-2 mt-2 p-2 border border-destructive/40 bg-destructive/5 text-xs text-destructive">
                  <span className="line-clamp-2">{uploadError}</span>
                  <button
                    type="button"
                    onClick={retryUpload}
                    className="h-7 w-7 shrink-0 flex items-center justify-center hover:bg-destructive/10"
                    title="إعادة المحاولة"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              <p className="text-[11px] text-muted-foreground mt-1">
                الصورة بتترفع فورًا على نفس تخزين الموقع وبتتحفظ مع الفئة لما تضغطي حفظ.
                لو الفئة عندها صورة قديمة، الرفع الجديد بيستبدلها عند الحفظ.
              </p>
            </Field>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <Label className="text-sm">نشط (يظهر في الواجهة الأمامية)</Label>
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>
                إلغاء
              </Button>
              <Button onClick={save} disabled={uploading}>
                {editing ? "حفظ التعديلات" : "إضافة"}
              </Button>
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