import type { Metadata } from "next";
import { Archivo, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SiteHeader from "./components/nav/SiteHeader";
import SkipLink from "./components/nav/SkipLink";
import ScrollDirection from "./components/ScrollDirection";
import CursorBall from "./components/CursorBall";
import SiteFooter from "./components/footer/SiteFooter";

// Display: geniş ağırlık (100–900) ve genişlik (62–125) eksenine sahip
// endüstriyel grotesk. Hero'da büyük boyutta logonun sert diyagonalleriyle
// örtüşüyor. Gerekçe: docs/design-system.md
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  display: "swap",
});

// Gövde: nötr, 17px'te yorucu olmayan okuma yüzü.
const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

// Utility: bölüm etiketleri, teknoloji rozetleri, rakamlar —
// yazılım hizmetinin tipografik imzası.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tan Yasan Reklam ve Tasarım Ajansı",
  description:
    "Dijitalde Fark Yaratın. Grafik tasarım, dijital pazarlama, web tasarım ve yazılım geliştirme — 20 yıla yakın tecrübeyle Antalya'dan Türkiye geneline.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${archivo.variable} ${instrumentSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="surface-paper min-h-full flex flex-col relative">
        <SkipLink />
        {/* Yön bayrağı — yalnızca scroll imlecinin oku için (bkz. bileşen). */}
        <ScrollDirection />
        {/* Hayler imleci — native ok/pointer'ın yerine izleyen amber kare. */}
        <CursorBall />
        <SiteHeader />
        <main id="icerik" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
