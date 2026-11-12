"use client";

import { StorefrontHeader } from "@/components/storefront/header";
import { StorefrontFooter } from "@/components/storefront/footer";
import { HomePage } from "@/components/storefront/home-page";
import { ShopView } from "@/components/storefront/shop-view";
import { ProductDetail } from "@/components/product/product-detail";
import { SizeChartModal } from "@/components/product/size-chart-modal";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CheckoutView } from "@/components/checkout/checkout-view";
import { StaticPages } from "@/components/storefront/static-pages";
import { CatalogProvider, type StorefrontContent } from "@/components/storefront/catalog-provider";
import { useUI } from "@/store";

export function AppShell({ initialStorefront }: { initialStorefront?: StorefrontContent | null }) {
  const { view } = useUI();

  return (
    <CatalogProvider initialStorefront={initialStorefront}>
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