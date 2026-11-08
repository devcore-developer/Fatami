"use client";

export function AnnouncementBar() {
  const messages = [
    "شحن مجاني للطلبات فوق ١٠٠ د.ك داخل الكويت",
    "إصدارات جديدة — مجموعة خريف ٢٠٢٦",
    "الدفع عند الاستلام متاح لجميع المحافظات",
    "تسوّقي الآن وادفعي عبر UPayments بأمان",
  ];
  return (
    <div className="bg-black text-white text-center overflow-hidden">
      <div className="relative flex whitespace-nowrap py-2.5">
        <div className="flex animate-marquee shrink-0">
          {[...messages, ...messages].map((m, i) => (
            <span
              key={i}
              className="mx-8 text-[11px] sm:text-xs tracking-luxe uppercase font-light"
              dir="rtl"
            >
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
