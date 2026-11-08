import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const tajawal = Tajawal({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FATAMI DESIGNS | أزياء فاخرة للمرأة العصرية",
  description:
    "FATAMI DESIGNS — علامة أزياء كويتية فاخرة. تصاميم راقية بجودة عالية للمرأة العصرية. تسوق أحدث الإصدارات والمجموعات المميزة.",
  keywords: [
    "FATAMI DESIGNS",
    "أزياء كويتية",
    "أزياء نسائية",
    "موضة",
    "Kuwait fashion",
    "luxury fashion",
  ],
  authors: [{ name: "FATAMI DESIGNS" }],
  openGraph: {
    title: "FATAMI DESIGNS | أزياء فاخرة",
    description: "علامة أزياء كويتية فاخرة للمرأة العصرية",
    siteName: "FATAMI DESIGNS",
    type: "website",
    locale: "ar_KW",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${tajawal.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
