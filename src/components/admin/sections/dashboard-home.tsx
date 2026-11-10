"use client";

import { useEffect, useState, useCallback } from "react";
import { formatPrice } from "@/lib/format";
import { Package, ShoppingCart, Users, DollarSign, TrendingUp } from "lucide-react";

export function DashboardHome() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const json = await res.json();
      if (json.success) setStats(json.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <div className="py-12 text-center text-muted-foreground">جاري التحميل...</div>;
  if (!stats) return <div className="py-12 text-center text-muted-foreground">تعذّر تحميل الإحصائيات</div>;

  const maxDaily = Math.max(...stats.dailySales.map((d: any) => d.total), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">نظرة عامة</h1>
        <p className="text-sm text-muted-foreground mt-1">إحصائيات المتجر وآخر الأنشطة</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="إجمالي المبيعات"
          value={formatPrice(stats.totalRevenue)}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KpiCard
          title="الطلبات"
          value={String(stats.totalOrders)}
          subtitle={`${stats.pendingOrders} قيد المراجعة`}
          icon={<ShoppingCart className="h-5 w-5" />}
        />
        <KpiCard
          title="العملاء"
          value={String(stats.totalCustomers)}
          icon={<Users className="h-5 w-5" />}
        />
        <KpiCard
          title="المنتجات"
          value={String(stats.totalProducts)}
          subtitle={`${stats.paidOrders} طلب مدفوع`}
          icon={<Package className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales chart */}
        <div className="lg:col-span-2 border border-border bg-background p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-medium tracking-luxe uppercase">مبيعات آخر 7 أيام</h2>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-end justify-between gap-2 h-48">
            {stats.dailySales.map((d: any) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-black transition-all"
                  style={{ height: `${(d.total / maxDaily) * 100}%`, minHeight: d.total > 0 ? "4px" : "0" }}
                  title={formatPrice(d.total)}
                />
                <span className="text-[10px] text-muted-foreground">
                  {d.date.slice(5)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border flex justify-between text-xs text-muted-foreground">
            <span>إجمالي 7 أيام: {formatPrice(stats.dailySales.reduce((s: number, d: any) => s + d.total, 0))}</span>
            <span>عدد الطلبات: {stats.dailySales.reduce((s: number, d: any) => s + d.count, 0)}</span>
          </div>
        </div>

        {/* Top products */}
        <div className="border border-border bg-background p-6">
          <h2 className="text-sm font-medium tracking-luxe uppercase mb-4">الأكثر مبيعاً</h2>
          {stats.topProducts.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">لا توجد بيانات بعد</p>
          ) : (
            <ul className="space-y-3">
              {stats.topProducts.map((p: any, i: number) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="h-6 w-6 flex items-center justify-center bg-secondary text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-xs line-clamp-1">{p.name}</span>
                  <span className="text-xs font-medium">{p.quantity}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, subtitle, icon }: { title: string; value: string; subtitle?: string; icon: React.ReactNode }) {
  return (
    <div className="border border-border bg-background p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground tracking-luxe uppercase">{title}</span>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}
