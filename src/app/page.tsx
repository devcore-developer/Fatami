"use client";

import { useEffect } from "react";
import { AnnouncementBar } from "@/components/storefront/announcement-bar";
import { StorefrontHeader } from "@/components/storefront/header";
import { StorefrontFooter } from "@/components/storefront/footer";
import { HomePage } from "@/components/storefront/home-page";
import { ShopView } from "@/components/storefront/shop-view";
import { ProductDetail } from "@/components/product/product-detail";
import { SizeChartModal } from "@/components/product/size-chart-modal";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CheckoutView } from "@/components/checkout/checkout-view";
import { StaticPages } from "@/components/storefront/static-pages";
import { CatalogProvider } from "@/components/storefront/catalog-provider";
import { AdminView } from "@/components/admin/admin-view";
import { useUI } from "@/store";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { view } = useUI();
  const { toast } = useToast();

  // Handle payment redirect hash on mount (e.g. #payment=success&order=FD-2026-...)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const params = new URLSearchParams(hash.replace(/&view=/, "&__view="));
    const payment = params.get("payment");
    const order = params.get("order");
    const targetView = params.get("__view") || params.get("view");
    if (payment && order) {
      if (payment === "success") {
        toast({
          title: "تم الدفع بنجاح",
          description: `رقم الطلب: ${order}`,
        });
      } else if (payment === "failed") {
        toast({
          title: "فشل الدفع",
          description: `رقم الطلب: ${order}`,
          variant: "destructive",
        });
      }
      if (targetView === "order-tracking") {
        useUI.setState({ view: "order-tracking" });
      }
      // Clear the hash so it doesn't re-trigger
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [toast]);

  // Admin view is rendered full-screen, outside the storefront chrome
  if (view === "admin") {
    return <AdminView />;
  }

  return (
    <CatalogProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <AnnouncementBar />
        <StorefrontHeader />

        <main className="flex-1">
          {view === "home" && <HomePage />}
          {view === "shop" && <ShopView />}
          {view === "product" && <ProductDetail />}
          {view === "checkout" && <CheckoutView />}
          {(view === "about" ||
            view === "contact" ||
            view === "size-guide" ||
            view === "shipping-info" ||
            view === "returns" ||
            view === "privacy" ||
            view === "terms" ||
            view === "order-success" ||
            view === "order-tracking") && <StaticPages />}
        </main>

        {view !== "checkout" && view !== "order-success" && <StorefrontFooter />}

        <SizeChartModal />
        <CartDrawer />
      </div>
    </CatalogProvider>
  );
}
