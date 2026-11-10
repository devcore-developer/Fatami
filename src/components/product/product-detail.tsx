"use client";

import { useMemo, useState } from "react";
import { Product, SizeCode, CustomerMeasurements } from "@/types";
import { useCart, useUI } from "@/store";
import { formatPrice } from "@/lib/format";
import { getProductBySlug } from "@/data/catalog";
import { useCatalog } from "@/components/storefront/catalog-provider";
import {
  ChevronLeft,
  ShoppingBag,
  Ruler,
  Minus,
  Plus,
  Truck,
  RefreshCcw,
  Shield,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function ProductDetail() {
  const { activeProductSlug, setView, setSizeChartOpen, openCategory } = useUI();
  const { addItem } = useCart();
  const { toast } = useToast();
  const { getProductBySlug: getFromCatalog } = useCatalog();

  const product = useMemo(
    () => (activeProductSlug ? (getFromCatalog(activeProductSlug) ?? getProductBySlug(activeProductSlug)) : undefined),
    [activeProductSlug, getFromCatalog]
  );

  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState<SizeCode | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [measurements, setMeasurements] = useState<CustomerMeasurements>({});
  const [expandedSection, setExpandedSection] = useState<string | null>("description");

  if (!product) {
    return (
      <div className="container-luxe py-32 text-center">
        <p className="text-muted-foreground">المنتج غير موجود</p>
        <Button onClick={() => setView("shop")} className="mt-4">
          العودة للمتجر
        </Button>
      </div>
    );
  }

  const trackStock = product.trackStock ?? true;
  const availableSizes = trackStock
    ? (product.sizes ?? []).filter((s) => s.stock > 0)
    : (product.sizes ?? []);
  const selectedSizeObj = (product.sizes ?? []).find((s) => s.size === selectedSize);
  const isOutOfStock = trackStock ? availableSizes.length === 0 : false;
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const productImages = product.images ?? [];
  const activeImgObj = productImages[activeImg] ?? productImages[0];

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: "اختاري المقاس",
        description: "الرجاء اختيار المقاس قبل الإضافة إلى السلة",
        variant: "destructive",
      });
      return;
    }
    const cleanedMeasurements = showMeasurements
      ? Object.fromEntries(
          Object.entries(measurements).filter(([, v]) => v !== "" && v !== undefined)
        )
      : undefined;
    addItem(product, selectedSize, quantity, cleanedMeasurements);
    toast({
      title: "تمت الإضافة بنجاح",
      description: `${product.nameAr} — مقاس ${selectedSize}`,
    });
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      toast({
        title: "اختاري المقاس",
        description: "الرجاء اختيار المقاس قبل الشراء",
        variant: "destructive",
      });
      return;
    }
    handleAddToCart();
    setView("checkout");
  };

  return (
    <div className="bg-background">
      {/* Breadcrumb */}
      <div className="container-luxe pt-6">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <button onClick={() => setView("home")} className="hover:text-foreground">
            الرئيسية
          </button>
          <ChevronLeft className="h-3 w-3" />
          <button onClick={() => setView("shop")} className="hover:text-foreground">
            المتجر
          </button>
          <ChevronLeft className="h-3 w-3" />
          <button
            onClick={() => openCategory(product.categoryId)}
            className="hover:text-foreground"
          >
            الفئة
          </button>
          <ChevronLeft className="h-3 w-3" />
          <span className="text-foreground">{product.nameAr}</span>
        </nav>
      </div>

      <div className="container-luxe py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
          {/* Gallery */}
          <div className="flex flex-col-reverse lg:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex lg:flex-col gap-2 lg:w-20">
              {productImages.map((img, i) => (
                <button
                  key={img.id ?? i}
                  onClick={() => setActiveImg(i)}
                  className={`relative aspect-[3/4] w-16 lg:w-full overflow-hidden border ${
                    activeImg === i ? "border-foreground" : "border-border"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.alt}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
            {/* Main image */}
            <div className="flex-1 relative aspect-[3/4] overflow-hidden bg-secondary">
              {activeImgObj ? (
                <img
                  src={activeImgObj.url}
                  alt={activeImgObj.alt}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                  FATAMI
                </div>
              )}
              {hasDiscount && (
                <span className="absolute top-4 right-4 bg-black text-white text-[10px] tracking-luxe uppercase px-3 py-1.5">
                  تخفيض
                </span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="lg:py-4">
            <div className="mb-6">
              {product.newArrival && (
                <span className="text-xs tracking-luxe uppercase text-muted-foreground mb-2 block">
                  وصل حديثاً
                </span>
              )}
              <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
                {product.nameAr}
              </h1>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-medium">
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.compareAtPrice!)}
                  </span>
                )}
              </div>
            </div>

            {/* Size selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">المقاس</span>
                <button
                  onClick={() => setSizeChartOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground underline"
                >
                  <Ruler className="h-3.5 w-3.5" />
                  دليل المقاسات
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(product.sizes ?? []).map((s) => {
                  const disabled = trackStock && s.stock === 0;
                  return (
                    <button
                      key={s.size}
                      disabled={disabled}
                      onClick={() => setSelectedSize(s.size)}
                      className={`relative h-12 min-w-12 px-4 text-sm tracking-luxe uppercase border transition-colors ${
                        selectedSize === s.size
                          ? "bg-black text-white border-black"
                          : disabled
                          ? "border-border bg-secondary text-muted-foreground/50 cursor-not-allowed line-through"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      {s.size}
                    </button>
                  );
                })}
              </div>
              {trackStock && selectedSizeObj && selectedSizeObj.stock <= 3 && selectedSizeObj.stock > 0 && (
                <p className="text-xs text-foreground mt-2">
                  بقي {selectedSizeObj.stock} قطع فقط — سارعي بالطلب
                </p>
              )}
            </div>

            {/* Custom measurements toggle */}
            <div className="mb-6">
              <button
                onClick={() => setShowMeasurements(!showMeasurements)}
                className="flex items-center justify-between w-full py-3 border-y border-border text-sm"
              >
                <span className="flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  إدخال قياساتي (اختياري)
                </span>
                <Plus className={`h-4 w-4 transition-transform ${showMeasurements ? "rotate-45" : ""}`} />
              </button>
              {showMeasurements && (
                <div className="pt-4 animate-fade-up">
                  <p className="text-xs text-muted-foreground mb-3">
                    أدخلي قياساتك بالبوصة (inch) للحصول على قطعة بمقاس مخصص
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <MeasurementInput
                      label="الكتف"
                      value={measurements.shoulder}
                      onChange={(v) =>
                        setMeasurements((m) => ({ ...m, shoulder: v }))
                      }
                    />
                    <MeasurementInput
                      label="الصدر"
                      value={measurements.chest}
                      onChange={(v) =>
                        setMeasurements((m) => ({ ...m, chest: v }))
                      }
                    />
                    <MeasurementInput
                      label="الخصر"
                      value={measurements.waist}
                      onChange={(v) =>
                        setMeasurements((m) => ({ ...m, waist: v }))
                      }
                    />
                    <MeasurementInput
                      label="الأرداف"
                      value={measurements.hips}
                      onChange={(v) =>
                        setMeasurements((m) => ({ ...m, hips: v }))
                      }
                    />
                    <MeasurementInput
                      label="طول الكم"
                      value={measurements.sleeveLength}
                      onChange={(v) =>
                        setMeasurements((m) => ({ ...m, sleeveLength: v }))
                      }
                    />
                    <MeasurementInput
                      label="الطول"
                      value={measurements.height}
                      onChange={(v) =>
                        setMeasurements((m) => ({ ...m, height: v }))
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Quantity */}
            {!isOutOfStock && (
              <div className="mb-6">
                <span className="text-sm font-medium block mb-3">الكمية</span>
                <div className="inline-flex items-center border border-border">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="h-11 w-11 flex items-center justify-center hover:bg-secondary"
                    aria-label="إنقاص"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-sm">{quantity}</span>
                  <button
                    onClick={() =>
                      setQuantity((q) =>
                        Math.min(
                          selectedSizeObj?.stock ?? 99,
                          q + 1
                        )
                      )
                    }
                    className="h-11 w-11 flex items-center justify-center hover:bg-secondary"
                    aria-label="زيادة"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 mb-8">
              <button
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="h-14 bg-foreground text-background text-sm tracking-luxe uppercase font-medium hover:bg-foreground/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingBag className="h-5 w-5" />
                {isOutOfStock ? "نفذت الكمية" : "أضيفي إلى السلة"}
              </button>
              <button
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className="h-14 border border-foreground text-sm tracking-luxe uppercase font-medium hover:bg-foreground hover:text-background transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                اشتري الآن
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 mb-8 text-center">
              <Trust icon={<Truck className="h-5 w-5" />} title="شحن سريع" subtitle="1-3 أيام" />
              <Trust icon={<RefreshCcw className="h-5 w-5" />} title="إرجاع مجاني" subtitle="خلال 7 أيام" />
              <Trust icon={<Shield className="h-5 w-5" />} title="دفع آمن" subtitle="UPayments" />
            </div>

            {/* Accordion */}
            <div className="border-t border-border">
              <Accordion
                title="الوصف"
                open={expandedSection === "description"}
                onToggle={() =>
                  setExpandedSection(
                    expandedSection === "description" ? null : "description"
                  )
                }
              >
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </Accordion>
              {product.fabric && (
                <Accordion
                  title="الخامة والعناية"
                  open={expandedSection === "fabric"}
                  onToggle={() =>
                    setExpandedSection(
                      expandedSection === "fabric" ? null : "fabric"
                    )
                  }
                >
                  <dl className="text-sm space-y-2">
                    <div className="flex gap-2">
                      <dt className="text-muted-foreground">الخامة:</dt>
                      <dd>{product.fabric}</dd>
                    </div>
                    {product.care && (
                      <div className="flex gap-2">
                        <dt className="text-muted-foreground">العناية:</dt>
                        <dd>{product.care}</dd>
                      </div>
                    )}
                  </dl>
                </Accordion>
              )}
              <Accordion
                title="الشحن والإرجاع"
                open={expandedSection === "shipping"}
                onToggle={() =>
                  setExpandedSection(
                    expandedSection === "shipping" ? null : "shipping"
                  )
                }
              >
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• الشحن داخل الكويت خلال 1-3 أيام عمل</li>
                  <li>• رسوم الشحن: 3 د.ك لمعظم المحافظات، 5 د.ك للمطلاع وصباح الأحمد</li>
                  <li>• الدفع عند الاستلام متاح</li>
                  <li>• إرجاع واستبدال مجاني خلال 7 أيام</li>
                </ul>
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MeasurementInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: number;
  onChange: (v: number | undefined) => void;
}) {
  return (
    <div>
      <label className="text-xs text-muted-foreground block mb-1">{label}</label>
      <input
        type="number"
        step="0.5"
        min={0}
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? undefined : Number(e.target.value))
        }
        placeholder="بوصة"
        className="w-full h-10 px-3 text-sm bg-secondary border-0 focus:ring-1 focus:ring-ring outline-none"
      />
    </div>
  );
}

function Trust({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 py-3 border border-border">
      <span className="text-foreground">{icon}</span>
      <span className="text-xs font-medium">{title}</span>
      <span className="text-[10px] text-muted-foreground">{subtitle}</span>
    </div>
  );
}

function Accordion({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-4 text-sm font-medium"
      >
        {title}
        <Plus className={`h-4 w-4 transition-transform ${open ? "rotate-45" : ""}`} />
      </button>
      {open && <div className="pb-4 animate-fade-up">{children}</div>}
    </div>
  );
}