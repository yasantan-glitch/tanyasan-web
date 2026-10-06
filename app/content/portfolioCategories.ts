import type { PortfolioItem } from "./portfolio";
import { getFolderCategories } from "./portfolioFolders";
import { SERVICES } from "./services";

/**
 * /portfolyo'nun üst üste binen kategori kartları (Ekim 2026, gertix.studio
 * /portfolio referansı). Her kart BİR başlık + BİR ana görsel; karta
 * tıklanınca ana görsel başlığın altına küçülüp kategorinin diğer işleri
 * sağ alttan sırayla giriyor (bkz. app/portfolyo/PortfolioStack.tsx).
 *
 * İŞLER klasörlerden okunuyor (portfolioFolders.ts) — buradaki tek şey kart
 * metni. Kategori klasörüne dosya atılınca detay görünümüne kendiliğinden girer.
 *
 * METİN UYDURULMADI: kart açıklamaları `services.ts`'in ilgili hizmetinin
 * cümleleri (tek kaynak), etiketler kategorideki işlerin MARKALARI.
 * "YAZILIM & UYGULAMA" kartı istisna: detay görünümü yok, doğrudan vaka
 * sayfasına gidiyor (`href`).
 */
export interface PortfolioCategory {
  id: string;
  /** BÜYÜK HARF (Türkçe büyütme notu, portfolio.ts). */
  title: string;
  /** Kart üstündeki etiketler. */
  labels: readonly string[];
  excerpt: string;
  cover: { src: string; alt: string };
  /** 16:9 kapak (web ekranı, cihaz mockup'ı) — çerçevede yatay yuvaya
   * oturur, dikey çerçeveye kırpılmaz. */
  coverWide?: boolean;
  /** Detayda sırayla giren kareler (klasör kategorilerinde kapak dahil). */
  items: readonly PortfolioItem[];
  /** Kategorideki İŞ sayısı (butonda; gruplanan dosyalar tek sayılır). */
  workCount: number;
  /** Varsa kart detay açmaz, bu adrese gider. */
  href?: string;
  cta: string;
}

const serviceText = (id: string, field: "lead" | "body0") => {
  const service = SERVICES.find((entry) => entry.id === id);
  if (!service) return "";
  return field === "lead" ? service.lead : service.body[0];
};

/** Kategori sırası, kapaklar ve işler `portfolioFolders.ts`'ten (klasörler);
 * buradaki tek şey kart metni. Afiş için ayrı hizmet cümlesi yok — grafik
 * tasarımın girişi kullanılıyor (metin uydurulmadı). */
const EXCERPTS: Readonly<Record<string, string>> = {
  "kurumsal-kimlik": serviceText("grafik", "body0"),
  logo: serviceText("grafik", "lead"),
  "sosyal-medya": serviceText("dijital", "lead"),
  afis: serviceText("grafik", "lead"),
  web: `${serviceText("web", "lead")} ${serviceText("web", "body0")}`,
};

export const PORTFOLIO_CATEGORIES: readonly PortfolioCategory[] = [
  ...getFolderCategories().map((category) => ({
    id: category.id,
    title: category.title,
    labels: category.labels,
    excerpt: EXCERPTS[category.id] ?? "",
    cover: category.cover,
    coverWide: category.coverWide,
    items: category.items,
    workCount: category.workCount,
    cta: "İşleri Gör",
  })),
  {
    id: "yazilim-uygulama",
    title: "YAZILIM & UYGULAMA",
    labels: ["EMLAK CRM PRO", "WEB UYGULAMASI", "YÖNETİM PANELİ", "SAAS"],
    excerpt: serviceText("yazilim", "lead"),
    cover: {
      src: "/images/hizmetler/Yazilim-uyguluma.png",
      alt: "Emlak CRM Pro'nun dizüstü, tablet ve telefonda açık portföy ekranı",
    },
    coverWide: true,
    items: [],
    workCount: 1,
    href: "/portfolyo/emlak-crm-pro",
    cta: "Projeyi İncele",
  },
];
