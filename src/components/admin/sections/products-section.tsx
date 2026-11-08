"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Plus, Pencil, Trash2, X, Package } from "lucide-react";

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export function ProductsSection() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [showEditor, setShowEditor] = useState(false);
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

  useEffect(() => { void load(); }, [load]);

  const openNew = () => {
    setEditing({
      slug: "",
      name: "",
      nameAr: "",
      description: "",
      price: 0,
      compareAtPrice: null,
      categoryId: categories[0]?.id ?? "",
      images: [],
      sizes: ALL_SIZES.map((s) => ({ size: s, stock: 0 })),
      featured: false,
      newArrival: false,
      bestSeller: false,
      active: true,
      fabric: "",
      care: "",
    });
    setShowEditor(true);
  };

  const openEdit = (p: any) => {
    setEditing({
      ...p,
      images: p.images ?? [],
      sizes: ALL_SIZES.map((s) => {
        const existing = p.sizes?.find((x: any) => x.size === s);
        return existing ? { size: s, stock: existing.stock } : { size: s, stock: 0 };
      }),
    });
    setShowEditor(true);
  };

  const save = async () => {
    if (!editing.slug || !editing.nameAr || editing.price == null) {
      toast({ title: "بيانات ناقصة", description: "الـ slug، الاسم العربي، والسعر مطلوبة", variant: "destructive" });
      return;
    }
    const method = editing.id ? "PUT" : "POST";
    const url = editing.id ? `/api/admin/products/${editing.id}` : "/api/admin/products";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    const json = await res.json();
    if (json.success) {
      toast({ title: editing.id ? "تم التحديث" : "تم الإنشاء" });
      setShowEditor(false);
      setEditing(null);
      void load();
    } else {
      toast({ title: "فشل الحفظ", description: json.error, variant: "destructive" });
    }
  };

  const remove = async (p: any) => {
    if (!confirm(`حذف المنتج "${p.nameAr}"؟`)) return;
    const res = await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      toast({ title: "تم الحذف" });
      void load();
    } else {
      toast({ title: "فشل الحذف", description: json.error, variant: "destructive" });
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
                <th className="py-3 px-3 text-xs tracking-luxe uppercase text-muted-foreground hidden md:table-cell">المخزون</th>
                <th className="py-3 px-3 text-xs tracking-luxe uppercase text-muted-foreground">الحالة</th>
                <th className="py-3 px-3 text-xs tracking-luxe uppercase text-muted-foreground text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const totalStock = p.sizes?.reduce((s: number, x: any) => s + x.stock, 0) ?? 0;
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
                    <td className="py-3 px-3 hidden md:table-cell">
                      <span className={totalStock <= 5 ? "text-destructive font-medium" : ""}>{totalStock}</span>
                    </td>
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
              {/* Images */}
              <div>
                <Label className="text-xs mb-2 block">صور المنتج</Label>
                <div className="space-y-2">
                  {editing.images.map((img: any, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <img src={img.url} alt="" className="h-12 w-10 object-cover bg-secondary shrink-0" />
                      <Input
                        value={img.url}
                        onChange={(e) => {
                          const images = [...editing.images];
                          images[i] = { ...images[i], url: e.target.value, alt: editing.nameAr };
                          setEditing({ ...editing, images });
                        }}
                        className="h-9 flex-1"
                        dir="ltr"
                        placeholder="https://... أو ارفعي صورة"
                      />
                      <label className="h-9 px-3 inline-flex items-center justify-center bg-secondary hover:bg-secondary/70 text-xs cursor-pointer whitespace-nowrap">
                        رفع
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const fd = new FormData();
                            fd.append("file", f);
                            const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                            const json = await res.json();
                            if (json.success) {
                              const images = [...editing.images];
                              images[i] = { url: json.data.url, alt: editing.nameAr };
                              setEditing({ ...editing, images });
                              toast({ title: "تم رفع الصورة" });
                            } else {
                              toast({ title: "فشل الرفع", description: json.error, variant: "destructive" });
                            }
                          }}
                        />
                      </label>
                      <button
                        onClick={() => setEditing({ ...editing, images: editing.images.filter((_: any, idx: number) => idx !== i) })}
                        className="h-9 w-9 flex items-center justify-center hover:bg-secondary text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing({ ...editing, images: [...editing.images, { url: "", alt: editing.nameAr }] })}
                    className="gap-2"
                  >
                    <Plus className="h-3 w-3" />
                    إضافة صورة (رابط)
                  </Button>
                  <label className="inline-flex items-center gap-2 h-9 px-4 bg-black text-white text-xs cursor-pointer hover:bg-black/90 ml-2">
                    <Plus className="h-3 w-3" />
                    رفع صورة جديدة
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const fd = new FormData();
                        fd.append("file", f);
                        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                        const json = await res.json();
                        if (json.success) {
                          setEditing({
                            ...editing,
                            images: [...editing.images, { url: json.data.url, alt: editing.nameAr }],
                          });
                          toast({ title: "تم رفع الصورة" });
                        } else {
                          toast({ title: "فشل الرفع", description: json.error, variant: "destructive" });
                        }
                      }}
                    />
                  </label>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  يتم رفع الصور إلى Cloudflare R2 تلقائياً. أو أدخلي رابط URL مباشر.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="الاسم العربي *">
                  <Input value={editing.nameAr} onChange={(e) => setEditing({ ...editing, nameAr: e.target.value })} className="h-10" />
                </Field>
                <Field label="الاسم الإنجليزي">
                  <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="h-10" dir="ltr" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="الـ Slug *">
                  <Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="h-10" dir="ltr" placeholder="noir-silk-abaya" />
                </Field>
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

              {/* Sizes & stock */}
              <div>
                <Label className="text-xs mb-2 block">المقاسات والمخزون</Label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {editing.sizes.map((s: any, i: number) => (
                    <div key={s.size} className="border border-border p-2">
                      <p className="text-xs font-bold tracking-luxe text-center mb-1">{s.size}</p>
                      <Input
                        type="number"
                        min={0}
                        value={s.stock}
                        onChange={(e) => {
                          const sizes = [...editing.sizes];
                          sizes[i] = { ...sizes[i], stock: Number(e.target.value) };
                          setEditing({ ...editing, sizes });
                        }}
                        className="h-9 text-center text-sm p-1"
                        dir="ltr"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Flags */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-border pt-4">
                <Toggle label="نشط" checked={editing.active} onChange={(v) => setEditing({ ...editing, active: v })} />
                <Toggle label="مميز" checked={editing.featured} onChange={(v) => setEditing({ ...editing, featured: v })} />
                <Toggle label="وصل حديثاً" checked={editing.newArrival} onChange={(v) => setEditing({ ...editing, newArrival: v })} />
                <Toggle label="الأكثر مبيعاً" checked={editing.bestSeller} onChange={(v) => setEditing({ ...editing, bestSeller: v })} />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => { setShowEditor(false); setEditing(null); }}>
                  إلغاء
                </Button>
                <Button onClick={save}>
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
