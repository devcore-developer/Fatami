"use client";

import { useEffect } from "react";
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
import { useUI } from "@/store";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { view } = useUI();
  const { toast } = useToast();

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
        toast({ title: "تم الدفع بنجاح", description: `رقم الطلب: ${order}` });
      } else if (payment === "failed") {
        toast({ title: "فشل الدفع", description: `رقم الطلب: ${order}`, variant: "destructive" });
      }
      if (targetView === "order-tracking") {
        useUI.setState({ view: "order-tracking" });
      }
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [toast]);

  return (
    <CatalogProvider>
      <div className="min-h-screen flex flex-col bg-background">
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