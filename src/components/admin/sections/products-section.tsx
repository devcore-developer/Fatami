"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/format";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Package,
  ImagePlus,
  Star,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
} from "lucide-react";

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

// Must mirror the limits enforced by /api/admin/upload
const MAX_SIZE = 4 * 1024 * 1024; // 4MB — نفس حد السيرفر
const OK_TYPES = ["image/jpeg", "image/png", "image/webp"];

type ProductImage = { id?: string; url: string; alt?: string };

type PendingImage = {
  key: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: "uploading" | "error";
  error?: string;
};

// XHR instead of fetch so we get real upload progress events
function uploadWithProgress(file: File, onProgress: (pct: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let json: any = null;
      try {
        json = JSON.parse(xhr.responseText || "{}");
      } catch {
        json = null;
      }
      if (xhr.status >= 200 && xhr.status < 300 && json?.success && json?.data?.url) {
        resolve(json.data.url);
      } else {
        reject(new Error(json?.error || `فشل الرفع (كود ${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error("تعذر الاتصال بخادم الرفع"));
    xhr.onabort = () => reject(new Error("تم إلغاء الرفع"));

    const fd = new FormData();
    fd.append("file", file);
    xhr.send(fd);
  });
}

// ---------------------------------------------------------------------------
// ImagesEditor — drag & drop + multi-file upload with progress, previews,
// remove / reorder / make-primary. Works for both create and edit modes.
// ---------------------------------------------------------------------------
function ImagesEditor({
  images,
  onImagesChange,
  altBase,
  onUploadingCountChange,
}: {
  images: ProductImage[];
  onImagesChange: (updater: (prev: ProductImage[]) => ProductImage[]) => void;
  altBase: string;
  onUploadingCountChange: (n: number) => void;
}) {
  const { toast } = useToast();
  const [pending, setPending] = useState<PendingImage[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const aliveRef = useRef(true);
  const pendingRef = useRef<PendingImage[]>([]);
  const removedRef = useRef<Set<string>>(new Set());
  const altRef = useRef(altBase);

  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);

  useEffect(() => {
    altRef.current = altBase;
  }, [altBase]);

  // Report how many uploads are still in flight (parent blocks Save)
  useEffect(() => {
    onUploadingCountChange(pending.filter((p) => p.status === "uploading").length);
  }, [pending, onUploadingCountChange]);

  // Cleanup when the editor dialog closes / component unmounts
  useEffect(() => {
    return () => {
      aliveRef.current = false;
      pendingRef.current.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      onUploadingCountChange(0);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startUpload = useCallback(
    (key: string, file: File) => {
      (async () => {
        try {
          const url = await uploadWithProgress(file, (pct) => {
            setPending((ps) =>
              ps.map((p) => (p.key === key ? { ...p, progress: pct } : p))
            );
          });
          if (!aliveRef.current || removedRef.current.has(key)) return;

          const item = pendingRef.current.find((p) => p.key === key);
          if (item) URL.revokeObjectURL(item.previewUrl);

          setPending((ps) => ps.filter((p) => p.key !== key));
          onImagesChange((prev) => [...prev, { url, alt: altRef.current }]);
        } catch (err: any) {
          if (!aliveRef.current || removedRef.current.has(key)) return;
          setPending((ps) =>
            ps.map((p) =>
              p.key === key
                ? { ...p, status: "error", error: err?.message ?? "فشل الرفع" }
                : p
            )
          );
        }
      })();
    },
    [onImagesChange]
  );

  const addFiles = (fileList: FileList | File[] | null) => {
    if (!fileList) return;
    const files = Array.from(fileList);
    if (files.length === 0) return;

    for (const f of files) {
      if (!OK_TYPES.includes(f.type)) {
        toast({
          title: "نوع غير مدعوم",
          description: `"${f.name}" — مسموح فقط JPG / PNG / WEBP`,
          variant: "destructive",
        });
        continue;
      }
      if (f.size > MAX_SIZE) {
        toast({
          title: "الملف كبير جدًا",
          description: `"${f.name}" — الحد الأقصى 4MB للصورة`,
          variant: "destructive",
        });
        continue;
      }

      const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setPending((ps) => [
        ...ps,
        {
          key,
          file: f,
          previewUrl: URL.createObjectURL(f),
          progress: 0,
          status: "uploading",
        },
      ]);
      startUpload(key, f);
    }
  };

  const removePending = (key: string) => {
    removedRef.current.add(key);
    const item = pendingRef.current.find((p) => p.key === key);
    if (item) URL.revokeObjectURL(item.previewUrl);
    setPending((ps) => ps.filter((p) => p.key !== key));
  };

  const retry = (item: PendingImage) => {
    setPending((ps) =>
      ps.map((p) =>
        p.key === item.key
          ? { ...p, status: "uploading", progress: 0, error: undefined }
          : p
      )
    );
    startUpload(item.key, item.file);
  };

  // --- mutations on committed (already uploaded) images ---
  const removeAt = (i: number) =>
    onImagesChange((prev) => prev.filter((_, idx) => idx !== i));

  const makePrimary = (i: number) => {
    if (i === 0) return;
    onImagesChange((prev) => {
      const next = [...prev];
      const [item] = next.splice(i, 1);
      next.unshift(item);
      return next;
    });
  };

  const moveEarlier = (i: number) => {
    if (i === 0) return;
    onImagesChange((prev) => {
      const next = [...prev];
      [next[i - 1], next[i]] = [next[i], next[i - 1]];
      return next;
    });
  };

  const moveLater = (i: number) => {
    onImagesChange((prev) => {
      if (i >= prev.length - 1) return prev;
      const next = [...prev];
      [next[i + 1], next[i]] = [next[i], next[i + 1]];
      return next;
    });
  };

  return (
    <div
      className={`space-y-3 transition-colors ${dragOver ? "ring-1 ring-charcoal" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        addFiles(e.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {images.length === 0 && pending.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`w-full border border-dashed p-8 text-center transition-colors cursor-pointer ${
            dragOver
              ? "border-charcoal bg-secondary/60"
              : "border-border bg-secondary/20 hover:bg-secondary/40"
          }`}
        >
          <ImagePlus className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm font-medium">اسحب الصور هنا أو اضغط للاختيار</p>
          <p className="text-xs text-muted-foreground mt-1">
            JPG أو PNG أو WEBP — حتى 4MB لكل صورة — يمكنك اختيار أكثر من صورة
          </p>
        </button>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Already uploaded images (existing + just uploaded) */}
          {images.map((img, i) => (
            <div
              key={img.id ?? `${img.url}-${i}`}
              className="border border-border bg-secondary/30"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <img
                  src={img.url}
                  alt={img.alt ?? ""}
                  className="h-full w-full object-cover"
                />
                {i === 0 && (
                  <span className="absolute top-1 right-1 bg-charcoal text-cream text-[10px] px-1.5 py-0.5 flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    رئيسية
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between px-1 py-1 border-t border-border">
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    title="اجعلها الصورة الرئيسية"
                    disabled={i === 0}
                    onClick={() => makePrimary(i)}
                    className="h-7 w-7 flex items-center justify-center hover:bg-secondary disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="قدّم الصورة"
                    disabled={i === 0}
                    onClick={() => moveEarlier(i)}
                    className="h-7 w-7 flex items-center justify-center hover:bg-secondary disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="أخّر الصورة"
                    disabled={i === images.length - 1}
                    onClick={() => moveLater(i)}
                    className="h-7 w-7 flex items-center justify-center hover:bg-secondary disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  title="حذف الصورة"
                  onClick={() => removeAt(i)}
                  className="h-7 w-7 flex items-center justify-center hover:bg-secondary text-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}

          {/* In-progress / failed uploads */}
          {pending.map((p) => (
            <div
              key={p.key}
              className={`border bg-secondary/30 ${
                p.status === "error" ? "border-destructive" : "border-border"
              }`}
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <img
                  src={p.previewUrl}
                  alt=""
                  className={`h-full w-full object-cover ${p.status === "uploading" ? "opacity-60" : ""}`}
                />
                {p.status === "uploading" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/70">
                    <Loader2 className="h-5 w-5 animate-spin text-charcoal" />
                    <span className="text-xs font-medium">جاري الرفع {p.progress}%</span>
                    <div className="h-1 w-3/4 bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-charcoal transition-all"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  </div>
                )}
                {p.status === "error" && (
                  <div className="absolute inset-x-0 bottom-0 bg-destructive text-white text-[10px] px-2 py-1 break-words">
                    {p.error}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between px-1 py-1 border-t border-border">
                {p.status === "error" ? (
                  <button
                    type="button"
                    title="إعادة المحاولة"
                    onClick={() => retry(p)}
                    className="h-7 w-7 flex items-center justify-center hover:bg-secondary"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  title="إزالة"
                  onClick={() => removePending(p.key)}
                  className="h-7 w-7 flex items-center justify-center hover:bg-secondary text-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}

          {/* Add more tile */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-[4/5] border border-dashed border-border hover:border-charcoal hover:bg-secondary/40 flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors"
          >
            <ImagePlus className="h-5 w-5" />
            <span className="text-xs">إضافة صور</span>
          </button>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">
        أول صورة هي الصورة الرئيسية اللي بتظهر في المتجر — الصور بتترفع فورًا
        على السيرفر، وروابطها بتتحفظ مع المنتج لما تضغط حفظ.
      </p>
    </div>
  );
}

export function ProductsSection() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/categories"),
      ]);
      const pJson = await pRes.json();
      const cJson = await cRes.json();
      if (pJson.success) setProducts(pJson.data);
      if (cJson.success) setCategories(cJson.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openNew = () => {
    setEditing({
      name: "",
      nameAr: "",
      description: "",
      price: 0,
      compareAtPrice: null,
      categoryId: categories[0]?.id ?? "",
      images: [],
      sizes: ALL_SIZES.map((s) => ({ size: s, stock: 0 })),
      featured: false,
      bestSeller: false,
      active: true,
      trackStock: true,
      fabric: "",
      care: "",
    });
    setShowEditor(true);
  };

  const openEdit = (p: any) => {
    setEditing({
      ...p,
      trackStock: p.trackStock ?? true,
      images: p.images ?? [],
      sizes: ALL_SIZES.map((s) => {
        const existing = p.sizes?.find((x: any) => x.size === s);
        return existing ? { size: s, stock: existing.stock } : { size: s, stock: 0 };
      }),
    });
    setShowEditor(true);
  };

  const save = async () => {
    if (!editing.nameAr || editing.price == null) {
      toast({
        title: "بيانات ناقصة",
        description: "الاسم العربي والسعر مطلوبان",
        variant: "destructive",
      });
      return;
    }
    if (uploadingCount > 0) {
      toast({
        title: "الرفع لسه شغال",
        description: "استنى الصور تخلص رفع الأول وبعدين احفظ",
        variant: "destructive",
      });
      return;
    }

    const method = editing.id ? "PUT" : "POST";
    const url = editing.id ? `/api/admin/products/${editing.id}` : "/api/admin/products";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      let json: any = null;
      try {
        json = JSON.parse(await res.text());
      } catch {
        json = null;
      }
      if (json?.success) {
        toast({ title: editing.id ? "تم التحديث" : "تم الإنشاء" });
        setShowEditor(false);
        setEditing(null);
        void load();
      } else {
        toast({
          title: "فشل الحفظ",
          description: json?.error || `خطأ من السيرفر (${res.status})`,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "فشل الاتصال",
        description: err?.message ?? "حصل خطأ غير متوقع",
        variant: "destructive",
      });
    }
  };

  const remove = async (p: any) => {
    if (!confirm(`حذف المنتج "${p.nameAr}"؟`)) return;
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
      let json: any = null;
      try {
        json = JSON.parse(await res.text());
      } catch {
        json = null;
      }
      if (json?.success) {
        toast({ title: "تم الحذف" });
        void load();
      } else {
        toast({
          title: "فشل الحذف",
          description: json?.error || `خطأ من السيرفر (${res.status})`,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "فشل الاتصال",
        description: err?.message ?? "حصل خطأ غير متوقع",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">المنتجات</h1>
          <p className="text-sm text-muted-foreground mt-1">{products.length} منتج</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" />
          منتج جديد
        </Button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">جاري التحميل...</div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center border border-border">
          <Package className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">لا توجد منتجات بعد</p>
        </div>
      ) : (
        <div className="border border-border bg-background overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr className="text-right">
                <th className="py-3 px-3 text-xs tracking-luxe uppercase text-muted-foreground">المنتج</th>
                <th className="py-3 px-3 text-xs tracking-luxe uppercase text-muted-foreground hidden sm:table-cell">الفئة</th>
                <th className="py-3 px-3 text-xs tracking-luxe uppercase text-muted-foreground">السعر</th>
                <th className="py-3 px-3 text-xs tracking-luxe uppercase text-muted-foreground">الحالة</th>
                <th className="py-3 px-3 text-xs tracking-luxe uppercase text-muted-foreground text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const cat = categories.find((c) => c.id === p.categoryId);
                return (
                  <tr key={p.id} className="border-t border-border hover:bg-secondary/30">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0]?.url ? (
                          <img src={p.images[0].url} alt="" className="h-12 w-10 object-cover" />
                        ) : (
                          <div className="h-12 w-10 bg-secondary flex items-center justify-center">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium line-clamp-1">{p.nameAr}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1" dir="ltr">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 hidden sm:table-cell text-xs">{cat?.nameAr ?? "—"}</td>
                    <td className="py-3 px-3 font-medium">{formatPrice(p.price)}</td>
                    <td className="py-3 px-3">
                      <span className={`text-xs px-2 py-0.5 ${p.active ? "bg-black text-white" : "bg-secondary text-muted-foreground"}`}>
                        {p.active ? "نشط" : "معطّل"}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(p)} className="h-8 w-8 flex items-center justify-center hover:bg-secondary" title="تعديل">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => remove(p)} className="h-8 w-8 flex items-center justify-center hover:bg-secondary text-destructive" title="حذف">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Editor dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 py-4 border-b border-border sticky top-0 bg-background z-10">
            <DialogTitle className="text-right">
              {editing?.id ? "تعديل المنتج" : "منتج جديد"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="px-6 py-4 space-y-5">
              {/* Images — real uploads via /api/admin/upload */}
              <div>
                <Label className="text-xs mb-2 block">صور المنتج</Label>
                <ImagesEditor
                  images={editing.images ?? []}
                  onImagesChange={(updater) =>
                    setEditing((prev) =>
                      prev ? { ...prev, images: updater(prev.images ?? []) } : prev
                    )
                  }
                  altBase={editing.nameAr || "صورة منتج"}
                  onUploadingCountChange={setUploadingCount}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="الاسم العربي *">
                  <Input value={editing.nameAr} onChange={(e) => setEditing({ ...editing, nameAr: e.target.value })} className="h-10" />
                </Field>
                <Field label="الاسم الإنجليزي">
                  <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="h-10" dir="ltr" />
                </Field>
              </div>
              <div>
                <Field label="الفئة">
                  <Select value={editing.categoryId} onValueChange={(v) => setEditing({ ...editing, categoryId: v })}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.nameAr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <p className="text-[11px] text-muted-foreground mt-1">
                  الرابط (slug) بيتولد تلقائيًا من اسم المنتج — وللمنتجات القديمة بيتحفظ زي ما هو.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="السعر (د.ك) *">
                  <Input type="number" step="0.001" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} className="h-10" dir="ltr" />
                </Field>
                <Field label="سعر قبل التخفيض">
                  <Input type="number" step="0.001" value={editing.compareAtPrice ?? ""} onChange={(e) => setEditing({ ...editing, compareAtPrice: e.target.value ? Number(e.target.value) : null })} className="h-10" dir="ltr" />
                </Field>
              </div>
              <Field label="الوصف">
                <Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="الخامة">
                  <Input value={editing.fabric ?? ""} onChange={(e) => setEditing({ ...editing, fabric: e.target.value })} className="h-10" />
                </Field>
                <Field label="العناية">
                  <Input value={editing.care ?? ""} onChange={(e) => setEditing({ ...editing, care: e.target.value })} className="h-10" />
                </Field>
              </div>

              {/* Sizes — simple selection, no stock tracking */}
              <div>
                <Label className="text-xs mb-3 block">المقاسات المتاحة</Label>
                <div className="flex flex-wrap gap-2">
                  {editing.sizes.map((s: any, i: number) => (
                    <button
                      key={s.size}
                      type="button"
                      onClick={() => {
                        const sizes = [...editing.sizes];
                        sizes[i] = { ...sizes[i], stock: s.stock > 0 ? 0 : 99 };
                        setEditing({ ...editing, sizes });
                      }}
                      className={`h-10 min-w-10 px-3 text-sm tracking-luxe uppercase border transition-colors ${
                        s.stock > 0
                          ? "bg-charcoal text-cream border-charcoal"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Flags — "وصل حديثاً" removed by design */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-border pt-4">
                <Toggle label="نشط" checked={editing.active} onChange={(v) => setEditing({ ...editing, active: v })} />
                <Toggle label="مميز" checked={editing.featured} onChange={(v) => setEditing({ ...editing, featured: v })} />
                <Toggle label="الأكثر مبيعاً" checked={editing.bestSeller} onChange={(v) => setEditing({ ...editing, bestSeller: v })} />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => { setShowEditor(false); setEditing(null); }}>
                  إلغاء
                </Button>
                <Button onClick={save} disabled={uploadingCount > 0}>
                  {editing.id ? "حفظ التعديلات" : "إنشاء المنتج"}
                </Button>
              </div>
            </div>
          )}
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

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-xs">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}