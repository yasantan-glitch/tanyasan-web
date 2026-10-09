import type { Metadata } from "next";
import { Archivo, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SiteHeader from "./components/nav/SiteHeader";
import SkipLink from "./components/nav/SkipLink";
import ScrollDirection from "./components/ScrollDirection";
import CursorBall from "./components/CursorBall";
import SiteFooter from "./components/footer/SiteFooter";

// `preload: false` (üçünde de, Ekim 2026, mobil LCP): altı font preload'u
// Lighthouse mobil ölçümünde ilk boyamayı ~2.3 s'ye itiyordu (sayfa ~0.4 s'de
// yüklenmiş olsa bile); preload'lar kalkınca ilk boyama ~0.35 s. Fontlar
// satır içi CSS'teki @font-face'ten yine erken iniyor; `swap` + next/font'un
// boyut ayarlı fallback'i kaymayı önlüyor.

// Display: geniş ağırlık (100–900) ve genişlik (62–125) eksenine sahip
// endüstriyel grotesk. Hero'da büyük boyutta logonun sert diyagonalleriyle
// örtüşüyor. Gerekçe: docs/design-system.md
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  display: "swap",
  preload: false,
});

// Gövde: nötr, 17px'te yorucu olmayan okuma yüzü.
const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: false,
});

// Utility: bölüm etiketleri, teknoloji rozetleri, rakamlar —
// yazılım hizmetinin tipografik imzası.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: false,
});

const SITE_DESCRIPTION =
  "Antalya'da web tasarım, yazılım geliştirme, dijital pazarlama ve grafik tasarım. 20 yıla yakın tecrübeyle markanız için strateji, tasarım ve kod tek çatı altında.";

export const metadata: Metadata = {
  metadataBase: new URL("https://tanyasan.com"),
  title: {
    default: "Tan Yasan Reklam ve Tasarım Ajansı | Antalya Web Tasarım & Yazılım",
    template: "%s | Tan Yasan Reklam ve Tasarım Ajansı",
  },
  description: SITE_DESCRIPTION,
  // "./" = her rota kendi URL'ine canonical verir (metadataBase'e göre çözülür).
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Tan Yasan Reklam ve Tasarım Ajansı",
    title: "Tan Yasan Reklam ve Tasarım Ajansı | Antalya Web Tasarım & Yazılım",
    description: SITE_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tan Yasan Reklam ve Tasarım Ajansı | Antalya Web Tasarım & Yazılım",
    description: SITE_DESCRIPTION,
  },
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
