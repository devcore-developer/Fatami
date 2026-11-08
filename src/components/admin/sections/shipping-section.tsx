"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/format";
import { Truck } from "lucide-react";

export function ShippingSection() {
  const [rates, setRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/governorates");
      const json = await res.json();
      if (json.success) setRates(json.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const updateRate = async (id: string, shippingCost: number, active: boolean) => {
    const res = await fetch("/api/admin/governorates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, shippingCost, active }),
    });
    const json = await res.json();
    if (json.success) {
      toast({ title: "تم التحديث" });
      void load();
    } else {
      toast({ title: "فشل", description: json.error, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">رسوم الشحن</h1>
        <p className="text-sm text-muted-foreground mt-1">إدارة رسوم شحن المحافظات الكويتية</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">جاري التحميل...</div>
      ) : (
        <div className="border border-border bg-background divide-y divide-border">
          {rates.map((r) => (
            <RateRow key={r.id} rate={r} onSave={updateRate} />
          ))}
        </div>
      )}
    </div>
  );
}

function RateRow({ rate, onSave }: { rate: any; onSave: (id: string, cost: number, active: boolean) => void }) {
  const [cost, setCost] = useState(rate.shippingCost);
  const [active, setActive] = useState(rate.active);
  const dirty = cost !== rate.shippingCost || active !== rate.active;

  return (
    <div className="flex items-center gap-4 p-4">
      <Truck className="h-5 w-5 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{rate.nameAr}</p>
        <p className="text-xs text-muted-foreground" dir="ltr">{rate.name}</p>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          step="0.001"
          min={0}
          value={cost}
          onChange={(e) => setCost(Number(e.target.value))}
          className="h-9 w-24 text-center"
          dir="ltr"
        />
        <span className="text-xs text-muted-foreground">د.ك</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{active ? "نشط" : "معطّل"}</span>
        <Switch checked={active} onCheckedChange={setActive} />
      </div>
      {dirty && (
        <Button size="sm" onClick={() => onSave(rate.id, cost, active)} className="h-8">
          حفظ
        </Button>
      )}
    </div>
  );
}
