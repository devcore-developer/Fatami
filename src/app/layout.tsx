import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const arabicFont = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Futami DESIGNS | أزياء فاخرة للمرأة العصرية",
  description:
    "Futami DESIGNS — علامة أزياء كويتية فاخرة. تصاميم راقية بجودة عالية للمرأة العصرية. تسوق أحدث الإصدارات والمجموعات المميزة.",
  keywords: [
    "Futami DESIGNS",
    "أزياء كويتية",
    "أزياء نسائية",
    "موضة",
    "Kuwait fashion",
    "luxury fashion",
  ],
  authors: [{ name: "Futami DESIGNS" }],
  openGraph: {
    title: "Futami DESIGNS | أزياء فاخرة",
    description: "علامة أزياء كويتية فاخرة للمرأة العصرية",
    siteName: "Futami DESIGNS",
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
        className={`${arabicFont.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}