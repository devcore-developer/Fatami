"use client";

import { useCart, useUI } from "@/store";
import { formatPrice } from "@/lib/format";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ShoppingBag, X, Minus, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal } = useCart();
  const { setView } = useUI();
  const total = subtotal();
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  const goCheckout = () => {
    closeCart();
    setView("checkout");
  };

  const goShop = () => {
    closeCart();
    setView("shop");
  };

  return (
    <Sheet open={isOpen} onOpenChange={(o) => !o && closeCart()}>
      <SheetContent side="left" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-6 py-5 border-b border-border flex-row items-center justify-between space-y-0">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <ShoppingBag className="h-5 w-5" />
            سلة التسوق
            {itemCount > 0 && (
              <span className="text-sm text-muted-foreground font-normal">
                ({itemCount})
              </span>
            )}
          </SheetTitle>
          <button
            onClick={closeCart}
            className="h-8 w-8 inline-flex items-center justify-center hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center mb-6">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">سلتك فارغة</h3>
            <p className="text-sm text-muted-foreground mb-6">
              ابدئي التسوق واكتشفي تشكيلاتنا الفاخرة
            </p>
            <Button onClick={goShop} className="gap-2">
              تسوقي الآن
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <button
                    onClick={() => {
                      closeCart();
                      useUI.getState().openProduct(item.product.slug);
                    }}
                    className="shrink-0 w-20 h-28 overflow-hidden bg-secondary"
                  >
                    <img
                      src={item.product.images[0].url}
                      alt={item.product.images[0].alt}
                      className="w-full h-full object-cover"
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium line-clamp-1">
                      {item.product.nameAr}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      المقاس: {item.size}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="inline-flex items-center border border-border">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-7 w-7 flex items-center justify-center hover:bg-secondary"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-xs">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-7 w-7 flex items-center justify-center hover:bg-secondary"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-sm font-medium">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-xs text-muted-foreground hover:text-foreground mt-2 inline-flex items-center gap-1"
                    >
                      <X className="h-3 w-3" />
                      إزالة
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-border px-6 py-5 space-y-4 bg-secondary/30">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">المجموع الفرعي</span>
                <span className="font-medium">{formatPrice(total)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">الشحن</span>
                <span className="text-muted-foreground">يُحسب عند الدفع</span>
              </div>
              <div className="border-t border-border pt-3 flex items-center justify-between">
                <span className="font-medium">الإجمالي</span>
                <span className="text-lg font-bold">{formatPrice(total)}</span>
              </div>
              <Button
                onClick={goCheckout}
                className="w-full h-12 text-sm tracking-luxe uppercase"
              >
                إتمام الشراء
              </Button>
              <button
                onClick={goShop}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground underline"
              >
                متابعة التسوق
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}