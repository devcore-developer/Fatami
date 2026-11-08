"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CartItem,
  CustomerMeasurements,
  Product,
  SizeCode,
  StoreView,
} from "@/types";
import { cartLineId } from "@/lib/format";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (
    product: Product,
    size: SizeCode,
    quantity?: number,
    measurements?: CustomerMeasurements
  ) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  itemCount: () => number;
  subtotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (product, size, quantity = 1, measurements) => {
        const lineId = cartLineId(product.id, size);
        set((state) => {
          const existing = state.items.find((i) => i.id === lineId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === lineId
                  ? {
                      ...i,
                      quantity: i.quantity + quantity,
                      measurements: measurements ?? i.measurements,
                    }
                  : i
              ),
              isOpen: true,
            };
          }
          const newItem: CartItem = {
            id: lineId,
            productId: product.id,
            product,
            size,
            quantity,
            measurements,
          };
          return { items: [...state.items, newItem], isOpen: true };
        });
      },
      removeItem: (lineId) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== lineId),
        })),
      updateQuantity: (lineId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.id === lineId ? { ...i, quantity: Math.max(1, quantity) } : i
            )
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      itemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    }),
    { name: "fatami-cart" }
  )
);

interface UIState {
  view: StoreView;
  activeProductSlug: string | null;
  activeCategoryId: string | null;
  isMenuOpen: boolean;
  isSearchOpen: boolean;
  isSizeChartOpen: boolean;
  searchQuery: string;
  lastOrderNumber: string | null;
  setView: (view: StoreView) => void;
  openProduct: (slug: string) => void;
  openCategory: (categoryId: string) => void;
  setMenuOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setSizeChartOpen: (open: boolean) => void;
  setSearchQuery: (q: string) => void;
  setLastOrderNumber: (n: string) => void;
  goToShop: () => void;
}

export const useUI = create<UIState>((set) => ({
  view: "home",
  activeProductSlug: null,
  activeCategoryId: null,
  isMenuOpen: false,
  isSearchOpen: false,
  isSizeChartOpen: false,
  searchQuery: "",
  lastOrderNumber: null,
  setView: (view) =>
    set({ view, isMenuOpen: false, isSearchOpen: false }) &&
    typeof window !== "undefined" &&
    window.scrollTo({ top: 0, behavior: "smooth" }),
  openProduct: (slug) =>
    set({ view: "product", activeProductSlug: slug }) &&
    typeof window !== "undefined" &&
    window.scrollTo({ top: 0, behavior: "smooth" }),
  openCategory: (categoryId) =>
    set({ view: "shop", activeCategoryId: categoryId }) &&
    typeof window !== "undefined" &&
    window.scrollTo({ top: 0, behavior: "smooth" }),
  setMenuOpen: (open) => set({ isMenuOpen: open }),
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  setSizeChartOpen: (open) => set({ isSizeChartOpen: open }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setLastOrderNumber: (n) => set({ lastOrderNumber: n }),
  goToShop: () =>
    set({ view: "shop", activeCategoryId: null }) &&
    typeof window !== "undefined" &&
    window.scrollTo({ top: 0, behavior: "smooth" }),
}));
