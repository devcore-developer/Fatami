"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { CustomerMeasurements } from "@/types";
import { MEASUREMENT_FIELDS } from "@/lib/measurements";
import { Ruler } from "lucide-react";

// Safety bound — mirrors the server-side sanitizer in lib/queries.ts
const MAX_VALUE = 300;
const NOTE_MAX = 500;

type ValuesState = Record<string, string>;

function measurementsToValues(m: CustomerMeasurements | null): ValuesState {
  const v: ValuesState = {};
  for (const f of MEASUREMENT_FIELDS) {
    v[f.key] = m && typeof m[f.key] === "number" ? String(m[f.key]) : "";
  }
  return v;
}

export function MeasurementsModal({
  open,
  onOpenChange,
  initial,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial: CustomerMeasurements | null;
  onSave: (m: CustomerMeasurements | null) => void;
}) {
  const [values, setValues] = useState<ValuesState>(() => measurementsToValues(initial));
  const [note, setNote] = useState(initial?.note ?? "");
  const [invalid, setInvalid] = useState<string[]>([]);

  // Re-fill the form every time the modal opens (draft or existing cart line)
  useEffect(() => {
    if (open) {
      setValues(measurementsToValues(initial));
      setNote(initial?.note ?? "");
      setInvalid([]);
    }
  }, [open, initial]);

  const setField = (key: string, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setInvalid((inv) => inv.filter((k) => k !== key));
  };

  const save = () => {
    const bad: string[] = [];
    const result: CustomerMeasurements = {};
    let count = 0;
    for (const f of MEASUREMENT_FIELDS) {
      const raw = (values[f.key] ?? "").trim();
      if (raw === "") continue;
      const n = Number(raw);
      if (!Number.isFinite(n) || n <= 0 || n > MAX_VALUE) {
        bad.push(f.key);
        continue;
      }
      (result as any)[f.key] = n;
      count++;
    }
    const cleanNote = note.trim().slice(0, NOTE_MAX);
    if (cleanNote) {
      result.note = cleanNote;
      count++;
    }
    setInvalid(bad);
    if (bad.length > 0) return; // keep the modal open, errors shown inline
    onSave(count > 0 ? result : null); // all empty → clear saved measurements
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0">
        <DialogHeader className="px-6 py-4 border-b border-border text-right">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Ruler className="h-5 w-5" />
            أضف مقاساتك
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            كل الحقول اختيارية — القياسات بالبوصة، وستُرسل مع طلبك لتخصيص القطعة على قياسك.
          </p>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {MEASUREMENT_FIELDS.map((f) => (
              <div key={f.key}>
                <Label className="text-xs mb-1.5 block">{f.label}</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  dir="ltr"
                  value={values[f.key] ?? ""}
                  onChange={(e) => setField(f.key, e.target.value)}
                  placeholder="0"
                  className={`h-10 ${
                    invalid.includes(f.key)
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                />
              </div>
            ))}
          </div>
          {invalid.length > 0 && (
            <p className="text-xs text-destructive">
              القيم لازم تكون أرقام بين 0 و{MAX_VALUE} — صحّي الحقول المظللة أو امسحيها.
            </p>
          )}
          <div>
            <Label className="text-xs mb-1.5 block">ملاحظة (اختياري)</Label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={NOTE_MAX}
              rows={3}
              placeholder="أي تفاصيل إضافية تحبين توصلها لنا مع الطلب..."
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <p className="text-[10px] text-muted-foreground mt-1">{note.length}/{NOTE_MAX}</p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setValues(measurementsToValues(null));
              setNote("");
              setInvalid([]);
            }}
          >
            مسح الكل
          </Button>
          <Button onClick={save}>حفظ المقاسات</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}