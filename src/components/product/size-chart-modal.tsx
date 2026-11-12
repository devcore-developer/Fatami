"use client";

import { sizeChart } from "@/data/catalog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUI } from "@/store";
import { X } from "lucide-react";

export function SizeChartModal() {
  const { isSizeChartOpen, setSizeChartOpen } = useUI();

  return (
    <Dialog open={isSizeChartOpen} onOpenChange={setSizeChartOpen}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        {/* Header with close affordance */}
        <DialogHeader className="px-5 sm:px-8 pt-5 sm:pt-6 pb-4 border-b border-border flex-row items-center justify-between space-y-0">
          <div className="text-right">
            <DialogTitle className="text-xl sm:text-2xl font-bold tracking-luxe">
              جدول المقاسات
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">
              جميع القياسات بالبوصة (inch)
            </p>
          </div>
          <button
            onClick={() => setSizeChartOpen(false)}
            className="h-9 w-9 inline-flex items-center justify-center hover:bg-secondary rounded-full"
            aria-label="إغلاق"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="px-5 sm:px-8 py-6 max-h-[70vh] overflow-y-auto">
          {/* Scrollable on small screens to avoid horizontal overflow */}
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full text-sm min-w-[420px]">
              <thead>
                <tr className="border-b-2 border-foreground">
                  <th className="py-3 px-3 text-center font-bold tracking-luxe text-xs uppercase">
                    المقاس
                  </th>
                  <th className="py-3 px-3 text-center font-medium text-muted-foreground text-xs uppercase tracking-luxe">
                    الكتف
                  </th>
                  <th className="py-3 px-3 text-center font-medium text-muted-foreground text-xs uppercase tracking-luxe">
                    الصدر
                  </th>
                  <th className="py-3 px-3 text-center font-medium text-muted-foreground text-xs uppercase tracking-luxe">
                    الخصر
                  </th>
                  <th className="py-3 px-3 text-center font-medium text-muted-foreground text-xs uppercase tracking-luxe">
                    الأرداف
                  </th>
                </tr>
              </thead>
              <tbody>
                {sizeChart.map((row, i) => (
                  <tr
                    key={row.size}
                    className={`border-b border-border ${i % 2 === 0 ? "bg-secondary/40" : ""}`}
                  >
                    <td className="py-3 px-3 text-center font-bold tracking-luxe">
                      {row.size}
                    </td>
                    <td className="py-3 px-3 text-center">{row.shoulder}"</td>
                    <td className="py-3 px-3 text-center">{row.chest}"</td>
                    <td className="py-3 px-3 text-center">{row.waist}"</td>
                    <td className="py-3 px-3 text-center">{row.hips}"</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 space-y-2 text-xs text-muted-foreground leading-relaxed">
            <p className="font-medium text-foreground mb-2">إرشادات القياس:</p>
            <p>• الكتف: قيسي من حافة الكتف إلى حافة الكتف الأخرى من الخلف.</p>
            <p>• الصدر: قيسي حول أوسع جزء من الصدر.</p>
            <p>• الخصر: قيسي حول أضيق جزء من الخصر.</p>
            <p>• الأرداف: قيسي حول أوسع جزء من الأرداف.</p>
            <p className="mt-3 text-foreground/70">
              اختاري المقاس المناسب لقياساتك من قائمة المقاسات أعلاه.
            </p>
                   </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}