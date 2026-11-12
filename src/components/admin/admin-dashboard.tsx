"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  Truck,
  Settings,
  FolderTree,
  TrendingUp,
  Users,
  Home,
} from "lucide-react";
import { DashboardHome } from "@/components/admin/sections/dashboard-home";
import { ProductsSection } from "@/components/admin/sections/products-section";
import { OrdersSection } from "@/components/admin/sections/orders-section";
import { CategoriesSection } from "@/components/admin/sections/categories-section";
import { DiscountsSection } from "@/components/admin/sections/discounts-section";
import { ShippingSection } from "@/components/admin/sections/shipping-section";
import { SettingsSection } from "@/components/admin/sections/settings-section";
import { CustomersSection } from "@/components/admin/sections/customers-section";
import { StorefrontContentSection } from "@/components/admin/sections/storefront-content-section";

type Section =
  | "dashboard"
  | "products"
  | "orders"
  | "categories"
  | "customers"
  | "discounts"
  | "shipping"
  | "storefront"
  | "settings";

const NAV: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "الرئيسية", icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "products", label: "المنتجات", icon: <Package className="h-4 w-4" /> },
  { id: "orders", label: "الطلبات", icon: <ShoppingCart className="h-4 w-4" /> },
  { id: "categories", label: "الفئات", icon: <FolderTree className="h-4 w-4" /> },
  { id: "customers", label: "العملاء", icon: <Users className="h-4 w-4" /> },
  { id: "storefront", label: "المتجر", icon: <Home className="h-4 w-4" /> },
  { id: "discounts", label: "أكواد الخصم", icon: <Tag className="h-4 w-4" /> },
  { id: "shipping", label: "الشحن", icon: <Truck className="h-4 w-4" /> },
  { id: "settings", label: "الإعدادات", icon: <Settings className="h-4 w-4" /> },
];

export function AdminDashboard() {
  const [section, setSection] = useState<Section>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        } fixed lg:sticky top-16 right-0 z-30 h-[calc(100vh-4rem)] w-64 bg-background border-l border-border transition-transform overflow-y-auto`}
      >
        <nav className="p-4 space-y-1">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => { setSection(item.id); setSidebarOpen(false); }}
              className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm text-right transition-colors ${
                section === item.id
                  ? "bg-black text-white"
                  : "hover:bg-secondary"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Mobile section toggle */}
        <div className="lg:hidden bg-background border-b border-border p-3 sticky top-16 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 text-sm"
          >
            <LayoutDashboard className="h-4 w-4" />
            القائمة
          </button>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {section === "dashboard" && <DashboardHome />}
          {section === "products" && <ProductsSection />}
          {section === "orders" && <OrdersSection />}
          {section === "categories" && <CategoriesSection />}
          {section === "customers" && <CustomersSection />}
          {section === "storefront" && <StorefrontContentSection />}
          {section === "discounts" && <DiscountsSection />}
          {section === "shipping" && <ShippingSection />}
          {section === "settings" && <SettingsSection />}
        </div>
      </div>
    </div>
  );
}