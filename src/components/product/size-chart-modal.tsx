"use client";

import { sizeChart } from "@/data/catalog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUI } from "@/store";

export function SizeChartModal() {
  const { isSizeChartOpen, setSizeChartOpen } = useUI();

  return (
    <Dialog open={isSizeChartOpen} onOpenChange={setSizeChartOpen}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-border">
          <DialogTitle className="text-right text-xl font-bold tracking-luxe">
            دليل المقاسات
          </DialogTitle>
          <p className="text-right text-xs text-muted-foreground mt-1">
            جميع القياسات بالبوصة (inch)
          </p>
        </DialogHeader>

        <div className="px-6 sm:px-8 py-6 max-h-[70vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-foreground">
                <th className="py-3 px-2 text-center font-bold tracking-luxe text-xs uppercase">
                  المقاس
                </th>
                <th className="py-3 px-2 text-center font-medium text-muted-foreground text-xs uppercase tracking-luxe">
                  الكتف
                </th>
                <th className="py-3 px-2 text-center font-medium text-muted-foreground text-xs uppercase tracking-luxe">
                  الصدر
                </th>
                <th className="py-3 px-2 text-center font-medium text-muted-foreground text-xs uppercase tracking-luxe">
                  الخصر
                </th>
                <th className="py-3 px-2 text-center font-medium text-muted-foreground text-xs uppercase tracking-luxe">
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
                  <td className="py-3 px-2 text-center font-bold tracking-luxe">
                    {row.size}
                  </td>
                  <td className="py-3 px-2 text-center">{row.shoulder}"</td>
                  <td className="py-3 px-2 text-center">{row.chest}"</td>
                  <td className="py-3 px-2 text-center">{row.waist}"</td>
                  <td className="py-3 px-2 text-center">{row.hips}"</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 space-y-2 text-xs text-muted-foreground leading-relaxed">
            <p className="font-medium text-foreground mb-2">إرشادات القياس:</p>
            <p>• الكتف: قيسي من حافة الكتف إلى حافة الكتف الأخرى من الخلف.</p>
            <p>• الصدر: قيسي حول أوسع جزء من الصدر.</p>
            <p>• الخصر: قيسي حول أضيق جزء من الخصر.</p>
            <p>• الأرداف: قيسي حول أوسع جزء من الأرداف.</p>
            <p className="mt-3 text-foreground/70">
              لطلب مقاس مخصص، يمكنك إدخال قياساتك في صفحة المنتج قبل الإضافة إلى السلة.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
