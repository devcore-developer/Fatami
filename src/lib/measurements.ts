// Shared helpers for the custom measurements feature (FATAMI DESIGNS).
// One source of truth for field order/labels so the product page, checkout
// and the admin order details never drift apart.

import type { CustomerMeasurements } from "@/types";

// Display order matches the measurements form:
// الصدر، الكتف، الورك، الخصر، الزند، الكم، الطول (+ ملاحظة)
export const MEASUREMENT_FIELDS: {
  key: Exclude<keyof CustomerMeasurements, "note">;
  label: string;
}[] = [
  { key: "chest", label: "الصدر" },
  { key: "shoulder", label: "الكتف" },
  { key: "hips", label: "الورك" },
  { key: "waist", label: "الخصر" },
  { key: "forearm", label: "الزند" },
  { key: "sleeveLength", label: "الكم" },
  { key: "height", label: "الطول" },
];

// One-line summary like: الصدر 36 · الكتف 14 · الكم 22
export function formatMeasurementsSummary(
  m?: CustomerMeasurements | null
): string {
  if (!m) return "";
  const parts = MEASUREMENT_FIELDS.filter(
    (f) => typeof m[f.key] === "number"
  ).map((f) => `${f.label} ${m[f.key]}`);
  if (m.note && m.note.trim()) parts.push(`ملاحظة: ${m.note.trim()}`);
  return parts.join(" · ");
}

// Admin receives measurementsJson as a raw JSON string from Prisma
// (or an already-parsed object on some API paths) — normalize defensively.
// Returns null when there is nothing meaningful to display.
export function parseMeasurementsJson(v: unknown): CustomerMeasurements | null {
  if (!v) return null;
  let obj: any = v;
  if (typeof obj === "string") {
    try {
      obj = JSON.parse(obj);
    } catch {
      return null;
    }
  }
  if (!obj || typeof obj !== "object") return null;
  const m = obj as CustomerMeasurements;
  const hasValue =
    MEASUREMENT_FIELDS.some((f) => typeof m[f.key] === "number") ||
    !!(m.note && m.note.trim());
  return hasValue ? m : null;
}