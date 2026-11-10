"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
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
import { ShoppingCart, Eye } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "قيد المراجعة",
  CONFIRMED: "مؤكد",
  PROCESSING: "قيد التجهيز",
  SHIPPED: "تم الشحن",
  DELIVERED: "تم التوصيل",
  CANCELLED: "ملغي",
  REFUNDED: "تم الاسترداد",
};
const PAYMENT_LABELS: Record<string, string> = {
  UNPAID: "غير مدفوع",
  PENDING: "بانتظار الدفع",
  PAID: "مدفوع",
  FAILED: "فشل",
  CANCELLED: "ملغي",
  REFUNDED: "تم الاسترداد",
};
const STATUSES = Object.keys(STATUS_LABELS);
const PAYMENT_STATUSES = Object.keys(PAYMENT_LABELS);

export function OrdersSection() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const json = await res.json();
      if (json.success) setOrders(json.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const updateStatus = async (id: string, field: "status" | "paymentStatus", value: string) => {
    const res = await fetch(`/api/admin/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    const json = await res.json();
    if (json.success) {
      toast({ title: "تم التحديث" });
      void load();
      if (selected?.id === id) setSelected(json.data);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">الطلبات</h1>
        <p className="text-sm text-muted-foreground mt-1">{orders.length} طلب</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">جاري التحميل...</div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center border border-border">
          <ShoppingCart className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">لا توجد طلبات بعد</p>
        </div>
      ) : (
        <div className="border border-border bg-background overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr className="text-right">
                <th className="py-3 px-3 text-xs tracking-luxe uppercase text-muted-foreground">رقم الطلب</th>
                <th className="py-3 px-3 text-xs tracking-luxe uppercase text-muted-foreground hidden sm:table-cell">العميل</th>
                <th className="py-3 px-3 text-xs tracking-luxe uppercase text-muted-foreground">الإجمالي</th>
                <th className="py-3 px-3 text-xs tracking-luxe uppercase text-muted-foreground">الحالة</th>
                <th className="py-3 px-3 text-xs tracking-luxe uppercase text-muted-foreground hidden md:table-cell">الدفع</th>
                <th className="py-3 px-3 text-xs tracking-luxe uppercase text-muted-foreground hidden lg:table-cell">التاريخ</th>
                <th className="py-3 px-3 text-xs tracking-luxe uppercase text-muted-foreground text-left">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-border hover:bg-secondary/30">
                  <td className="py-3 px-3 font-mono text-xs" dir="ltr">{o.orderNumber}</td>
                  <td className="py-3 px-3 hidden sm:table-cell">
                    <p className="text-xs">{o.customer.firstName} {o.customer.lastName}</p>
                    <p className="text-[10px] text-muted-foreground" dir="ltr">{o.customer.phone}</p>
                  </td>
                  <td className="py-3 px-3 font-medium">{formatPrice(o.total)}</td>
                  <td className="py-3 px-3">
                    <Select value={o.status} onValueChange={(v) => updateStatus(o.id, "status", v)}>
                      <SelectTrigger className="h-8 text-xs w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-3 px-3 hidden md:table-cell">
                    <Select value={o.paymentStatus} onValueChange={(v) => updateStatus(o.id, "paymentStatus", v)}>
                      <SelectTrigger className="h-8 text-xs w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>{PAYMENT_LABELS[s]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-3 px-3 hidden lg:table-cell text-xs text-muted-foreground">
                    {new Date(o.createdAt).toLocaleDateString("ar-KW")}
                  </td>
                  <td className="py-3 px-3 text-left">
                    <button onClick={() => setSelected(o)} className="h-8 w-8 inline-flex items-center justify-center hover:bg-secondary">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 py-4 border-b border-border">
            <DialogTitle className="text-right font-mono" dir="ltr">
              {selected?.orderNumber}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="px-6 py-4 space-y-5 text-sm">
              {/* Customer */}
              <Section title="بيانات العميل">
                <Row label="الاسم" value={`${selected.customer.firstName} ${selected.customer.lastName}`} />
                <Row label="الهاتف" value={selected.customer.phone} ltr />
                {selected.customer.email && <Row label="البريد" value={selected.customer.email} ltr />}
                <Row label="العنوان" value={selected.customer.address} />
                <Row label="القطعة" value={selected.customer.block ?? "—"} />
                <Row label="المدينة" value={selected.customer.city} />
                <Row label="المحافظة" value={selected.customer.governorate} />
              </Section>

              {/* Items */}
              <Section title="المنتجات">
                <div className="space-y-2">
                  {selected.items.map((it: any) => (
                    <div key={it.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                      {it.productImage && <img src={it.productImage} alt="" className="h-12 w-10 object-cover bg-secondary" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium line-clamp-1">{it.productName}</p>
                        <p className="text-[10px] text-muted-foreground">مقاس {it.size} × {it.quantity}</p>
                      </div>
                      <span className="text-xs font-medium">{formatPrice(it.price * it.quantity)}</span>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Totals */}
              <Section title="الملخص المالي">
                <Row label="المجموع الفرعي" value={formatPrice(selected.subtotal)} />
                <Row label="الشحن" value={formatPrice(selected.shippingCost)} />
                <div className="flex justify-between pt-2 border-t border-border font-bold">
                  <span>الإجمالي</span>
                  <span>{formatPrice(selected.total)}</span>
                </div>
              </Section>

              {/* Status */}
              <Section title="حالة الطلب">
                <Row label="الحالة" value={STATUS_LABELS[selected.status]} />
                <Row label="الدفع" value={PAYMENT_LABELS[selected.paymentStatus]} />
                <Row label="طريقة الدفع" value="تحويل بنكي" />
                {selected.trackingNumber && <Row label="رقم الشحن" value={selected.trackingNumber} ltr />}
              </Section>

              {/* Transfer screenshot */}
              {selected.transferScreenshot && (
                <Section title="إيصال التحويل">
                  <a href={selected.transferScreenshot} target="_blank" rel="noopener noreferrer">
                    <img
                      src={selected.transferScreenshot}
                      alt="إيصال التحويل"
                      className="w-full rounded-lg border border-border cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  </a>
                  <p className="text-[10px] text-muted-foreground mt-1">اضغطي على الصورة لعرضها بحجم كامل</p>
                </Section>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border p-4">
      <h3 className="text-xs tracking-luxe uppercase text-muted-foreground mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
function Row({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={ltr ? "font-mono" : ""} dir={ltr ? "ltr" : undefined}>{value}</span>
    </div>
  );
}
