"use client";

import { useState, useEffect, useCallback } from "react";
import { useUI } from "@/store";
import { StorefrontHeader } from "@/components/storefront/header";
import { StorefrontFooter } from "@/components/storefront/footer";
import { AdminLogin } from "@/components/admin/admin-login";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function AdminView() {
  const { setView } = useUI();
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <StorefrontHeader />
        <main className="flex-1 flex items-center justify-center py-12">
          <AdminLogin onSuccess={(u) => { setAuthed(true); setAdminUser(u); }} />
        </main>
        <StorefrontFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-secondary/20">
      <AdminTopBar user={adminUser} onLogout={async () => { await fetch("/api/admin/logout", { method: "POST" }); setAuthed(false); setAdminUser(null); }} onExitToStore={() => setView("home")} />
      <main className="flex-1">
        <AdminDashboard />
      </main>
    </div>
  );
}

function AdminTopBar({ user, onLogout, onExitToStore }: { user: { name: string; email: string } | null; onLogout: () => void; onExitToStore: () => void }) {
  return (
    <header className="bg-black text-white sticky top-0 z-40">
      <div className="container-luxe">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex flex-col leading-none">
              <span className="text-base font-bold tracking-luxe-wide">Futami</span>
              <span className="text-[9px] tracking-luxe-wide text-white/50">ADMIN</span>
            </div>
            <span className="h-6 w-px bg-white/20" />
            <span className="text-xs text-white/70 hidden sm:inline">
              لوحة الإدارة
            </span>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-xs text-white/70 hidden sm:inline">
                {user.name} · {user.email}
              </span>
            )}
            <button
              onClick={onExitToStore}
              className="text-xs tracking-luxe uppercase border border-white/30 px-3 py-1.5 hover:bg-white/10"
            >
              عرض المتجر
            </button>
            <button
              onClick={onLogout}
              className="text-xs tracking-luxe uppercase border border-white/30 px-3 py-1.5 hover:bg-white/10"
            >
              خروج
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}