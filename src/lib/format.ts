// Formatting & currency helpers for Futami DESIGNS (Kuwait / KWD / Arabic)

export function formatPrice(amount: number, currency = "KWD"): string {
  // KWD has 3 decimal places (dinars, fils)
  const formatted = amount.toFixed(3);
  // Use Arabic-Indic digits with RTL-friendly currency label
  const currencyLabel =
    currency === "KWD" ? "د.ك" : currency === "USD" ? "$" : currency;
  if (currency === "USD") return `${currencyLabel}${formatted}`;
  return `${formatted} ${currencyLabel}`;
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("ar-KW", {
    maximumFractionDigits: 3,
  }).format(n);
}

// Convert digits to Arabic-Indic for display (optional aesthetic)
export function toArabicDigits(value: string | number): string {
  const map = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(value).replace(/[0-9]/g, (d) => map[Number(d)]);
}

// Cart line unique id
export function cartLineId(productId: string, size: string): string {
  return `${productId}__${size}`;
}

// Generate a human-readable order number, e.g. FD-2026-000123
export function generateOrderNumber(seq: number): string {
  const year = new Date().getFullYear();
  const seqStr = String(seq).padStart(6, "0");
  return `FD-${year}-${seqStr}`;
}

export function generateTrackingNumber(): string {
  const part = () =>
    Math.random().toString(36).slice(2, 6).toUpperCase();
  return `FAT-${part()}-${part()}-${part()}`;
}

export function classNames(
  ...classes: (string | false | null | undefined)[]
): string {
  return classes.filter(Boolean).join(" ");
}
