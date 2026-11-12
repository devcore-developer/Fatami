"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminLogin } from "@/components/admin/admin-login";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<{ name: string; email: string } | null>(null);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/session");
      const json = await res.json();
      if (json.authenticated) {
        setAuthed(true);
        setAdminUser(json.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="text-muted-brand">جاري التحميل...</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex flex-col bg-cream">
        <div className="flex-1 flex items-center justify-center py-12">
          <AdminLogin onSuccess={(u) => { setAuthed(true); setAdminUser(u); }} />
        </div>
        <div className="text-center pb-8">
          <button
            onClick={() => router.push("/")}
            className="text-xs text-muted-brand hover:text-charcoal transition-colors"
          >
            العودة للمتجر
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <AdminTopBar
        user={adminUser}
        onLogout={async () => {
          await fetch("/api/admin/logout", { method: "POST" });
          setAuthed(false);
          setAdminUser(null);
        }}
        onExitToStore={() => router.push("/")}
      />
      <main className="flex-1">
        <AdminDashboard />
      </main>
    </div>
  );
}

function AdminTopBar({ user, onLogout, onExitToStore }: {
  user: { name: string; email: string } | null;
  onLogout: () => void;
  onExitToStore: () => void;
}) {
  return (
    <header className="bg-charcoal text-cream sticky top-0 z-40">
      <div className="container-luxe">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex flex-col leading-none">
              <span className="text-base font-bold tracking-luxe-wide text-cream">Futami</span>
              <span className="text-[9px] tracking-luxe-wide text-taupe">ADMIN</span>
            </div>
            <span className="h-6 w-px bg-cream/20" />
            <span className="text-xs text-cream/70 hidden sm:inline">لوحة الإدارة</span>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-xs text-cream/70 hidden sm:inline">
                {user.name} · {user.email}
              </span>
            )}
            <button
              onClick={onExitToStore}
              className="text-xs tracking-luxe uppercase border border-cream/30 text-cream px-3 py-1.5 hover:bg-cream/10 transition-colors rounded-lg"
            >
              عرض المتجر
            </button>
            <button
              onClick={onLogout}
              className="text-xs tracking-luxe uppercase border border-cream/30 text-cream px-3 py-1.5 hover:bg-cream/10 transition-colors rounded-lg"
            >
              خروج
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}