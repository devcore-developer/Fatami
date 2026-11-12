"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail } from "lucide-react";

export function AdminLogin({ onSuccess }: { onSuccess: (user: { name: string; email: string }) => void }) {
  const [email, setEmail] = useState("admin@fatamidesigns.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: "تم تسجيل الدخول", description: `مرحباً ${json.data.name}` });
        onSuccess({ name: json.data.name, email: json.data.email });
      } else {
        toast({ title: "فشل الدخول", description: json.error, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex h-14 w-14 items-center justify-center bg-black text-white mb-4">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold mb-2">لوحة الإدارة</h1>
        <p className="text-sm text-muted-foreground">
          FATAMI DESIGNS — تسجيل دخول المسؤول
        </p>
      </div>

      <form onSubmit={submit} className="space-y-5 border border-border bg-background p-6 sm:p-8">
        <div>
          <Label className="text-xs mb-1.5 block">البريد الإلكتروني</Label>
          <div className="relative">
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 pr-9"
              dir="ltr"
              required
            />
          </div>
        </div>
        <div>
          <Label className="text-xs mb-1.5 block">كلمة المرور</Label>
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 pr-9"
              dir="ltr"
              required
              placeholder="admin123"
            />
          </div>
        </div>
        <Button type="submit" disabled={loading} className="w-full h-11">
          {loading ? "جاري الدخول..." : "تسجيل الدخول"}
        </Button>
        <div className="text-xs text-center text-muted-foreground border-t border-border pt-4">
          <p>بيانات الدخول التجريبية:</p>
          <p className="font-mono mt-1" dir="ltr">admin@fatamidesigns.com / admin123</p>
        </div>
      </form>
    </div>
  );
}