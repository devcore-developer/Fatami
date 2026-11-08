"use client";

import { useEffect, useState, useCallback } from "react";
import { formatPrice } from "@/lib/format";
import { Users } from "lucide-react";

export function CustomersSection() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Build a customer summary from orders
  const customers = (() => {
    const map = new Map<string, { phone: string; name: string; email?: string; governorate: string; orders: number; total: number; lastOrder: string }>();
    for (const o of orders) {
      const key = o.customer.phone;
      const existing = map.get(key) ?? {
        phone: o.customer.phone,
        name: `${o.customer.firstName} ${o.customer.lastName}`,
        email: o.customer.email,
        governorate: o.customer.governorate,
        orders: 0,
        total: 0,
        lastOrder: o.createdAt,
      };
      existing.orders += 1;
      existing.total += o.total;
      if (new Date(o.createdAt) > new Date(existing.lastOrder)) existing.lastOrder = o.createdAt;
      map.set(key, existing);
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  })();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">العملاء</h1>
        <p className="text-sm text-muted-foreground mt-1">{customers.length} عميل</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">جاري التحميل...</div>
      ) : customers.length === 0 ? (
        <div className="py-16 text-center border border-border">
          <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">لا يوجد عملاء بعد</p>
        </div>
      ) : (
        <div className="border border-border bg-background overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr className="text-right">
                <th className="py-3 px-3 text-xs tracking-luxe uppercase text-muted-foreground">العميل</th>
                <th className="py-3 px-3 text-xs tracking-luxe uppercase text-muted-foreground hidden sm:table-cell">المحافظة</th>
                <th className="py-3 px-3 text-xs tracking-luxe uppercase text-muted-foreground">الطلبات</th>
                <th className="py-3 px-3 text-xs tracking-luxe uppercase text-muted-foreground">إجمالي الشراء</th>
                <th className="py-3 px-3 text-xs tracking-luxe uppercase text-muted-foreground hidden md:table-cell">آخر طلب</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.phone} className="border-t border-border hover:bg-secondary/30">
                  <td className="py-3 px-3">
                    <p className="font-medium text-xs">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground" dir="ltr">{c.phone}</p>
                    {c.email && <p className="text-[10px] text-muted-foreground" dir="ltr">{c.email}</p>}
                  </td>
                  <td className="py-3 px-3 hidden sm:table-cell text-xs">{c.governorate}</td>
                  <td className="py-3 px-3 text-xs">{c.orders}</td>
                  <td className="py-3 px-3 font-medium text-xs">{formatPrice(c.total)}</td>
                  <td className="py-3 px-3 hidden md:table-cell text-xs text-muted-foreground">
                    {new Date(c.lastOrder).toLocaleDateString("ar-KW")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
