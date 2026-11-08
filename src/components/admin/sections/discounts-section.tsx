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
import { useToast } from "@/hooks/use-toast";
import { Plus, Tag } from "lucide-react";

export function DiscountsSection() {
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", type: "PERCENTAGE", value: 10, usageLimit: 100, expiresAt: "" });
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/discounts");
      const json = await res.json();
      if (json.success) setDiscounts(json.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const create = async () => {
    if (!form.code || form.value == null) {
      toast({ title: "بيانات ناقصة", variant: "destructive" });
      return;
    }
    const res = await fetch("/api/admin/discounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code,
        type: form.type,
        value: Number(form.value),
        usageLimit: form.usageLimit || undefined,
        expiresAt: form.expiresAt || undefined,
        active: true,
      }),
    });
    const json = await res.json();
    if (json.success) {
      toast({ title: "تم إنشاء الكود" });
      setShowForm(false);
      setForm({ code: "", type: "PERCENTAGE", value: 10, usageLimit: 100, expiresAt: "" });
      void load();
    } else {
      toast({ title: "فشل", description: json.error, variant: "destructive" });
    }
  };

  const toggle = async (id: string, active: boolean) => {
    const res = await fetch("/api/admin/discounts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active }),
    });
    const json = await res.json();
    if (json.success) {
      void load();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">أكواد الخصم</h1>
          <p className="text-sm text-muted-foreground mt-1">{discounts.length} كود</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          كود جديد
        </Button>
      </div>

      {showForm && (
        <div className="border border-border bg-background p-5 grid grid-cols-2 gap-4">
          <Field label="الكود *">
            <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="h-10 font-mono" dir="ltr" placeholder="SUMMER20" />
          </Field>
          <Field label="النوع">
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENTAGE">نسبة مئوية %</SelectItem>
                <SelectItem value="FIXED">مبلغ ثابت د.ك</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label={form.type === "PERCENTAGE" ? "القيمة (%) *" : "القيمة (د.ك) *"}>
            <Input type="number" step="0.001" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} className="h-10" dir="ltr" />
          </Field>
          <Field label="حد الاستخدام">
            <Input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })} className="h-10" dir="ltr" />
          </Field>
          <div className="col-span-2 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
            <Button onClick={create}>إنشاء</Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">جاري التحميل...</div>
      ) : discounts.length === 0 ? (
        <div className="py-16 text-center border border-border">
          <Tag className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">لا توجد أكواد بعد</p>
        </div>
      ) : (
        <div className="border border-border bg-background overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr className="text-right">
                <th className="py-3 px-3 text-xs tracking-luxe uppercase text-muted-foreground">الكود</th>
                <th className="py-3 px-3 text-xs tracking-luxe uppercase text-muted-foreground">النوع</th>
                <th className="py-3 px-3 text-xs tracking-luxe uppercase text-muted-foreground">القيمة</th>
                <th className="py-3 px-3 text-xs tracking-luxe uppercase text-muted-foreground">الاستخدام</th>
                <th className="py-3 px-3 text-xs tracking-luxe uppercase text-muted-foreground">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((d) => (
                <tr key={d.id} className="border-t border-border hover:bg-secondary/30">
                  <td className="py-3 px-3 font-mono font-bold" dir="ltr">{d.code}</td>
                  <td className="py-3 px-3 text-xs">{d.type === "PERCENTAGE" ? "نسبة %" : "مبلغ ثابت"}</td>
                  <td className="py-3 px-3 text-xs">{d.type === "PERCENTAGE" ? `${d.value}%` : `${d.value} د.ك`}</td>
                  <td className="py-3 px-3 text-xs">
                    {d.usedCount}{d.usageLimit ? ` / ${d.usageLimit}` : ""}
                  </td>
                  <td className="py-3 px-3">
                    <Switch checked={d.active} onCheckedChange={(v) => toggle(d.id, v)} />
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}
