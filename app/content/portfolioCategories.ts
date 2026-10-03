import { PORTFOLIO_ITEMS, type PortfolioItem } from "./portfolio";
import { SERVICES } from "./services";

/**
 * /portfolyo'nun üst üste binen kategori kartları (Ekim 2026, gertix.studio
 * /portfolio referansı). Her kart BİR başlık + BİR ana görsel; karta
 * tıklanınca ana görsel başlığın altına küçülüp kategorinin diğer işleri
 * sağ alttan sırayla giriyor (bkz. app/portfolyo/PortfolioStack.tsx).
 *
 * İŞLERİN KENDİSİ `portfolio.ts`'te kalıyor — buradaki tek şey sıralama,
 * kapak seçimi ve kart metni. Kategoriye yeni iş eklenince detay görünümüne
 * kendiliğinden girer.
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
  /** Detayda kapaktan SONRA sırayla giren işler (kapak hariç). */
  items: readonly PortfolioItem[];
  /** Varsa kart detay açmaz, bu adrese gider. */
  href?: string;
  cta: string;
}

const serviceText = (id: string, field: "lead" | "body0") => {
  const service = SERVICES.find((entry) => entry.id === id);
  if (!service) return "";
  return field === "lead" ? service.lead : service.body[0];
};

/** Kategori sırası başlığın cümlesini izliyor: kimlikten kampanyaya,
 * tasarımdan yazılıma. Kapak her kategorinin en güçlü karesi. */
const CATEGORY_ORDER: readonly {
  category: string;
  id: string;
  cover: string;
  excerpt: string;
}[] = [
  {
    category: "KURUMSAL KİMLİK",
    id: "kurumsal-kimlik",
    cover: "/images/portfolyo/Turksoy_Kurumsal.jpg",
    excerpt: serviceText("grafik", "body0"),
  },
  {
    category: "LOGO & LOGOTYPE",
    id: "logo",
    cover: "/images/portfolyo/Zenges_Logo.jpg",
    excerpt: serviceText("grafik", "lead"),
  },
  {
    category: "SOSYAL MEDYA",
    id: "sosyal-medya",
    cover: "/images/portfolyo/Rixos_Bodrum_Ozan.jpg",
    excerpt: serviceText("dijital", "lead"),
  },
  {
    category: "WEB TASARIM",
    id: "web-tasarim",
    cover: "/images/portfolyo/Poyraz_Global_Web.jpg",
    excerpt: `${serviceText("web", "lead")} ${serviceText("web", "body0")}`,
  },
];

const unique = (values: readonly string[]) => Array.from(new Set(values));

export const PORTFOLIO_CATEGORIES: readonly PortfolioCategory[] = [
  ...CATEGORY_ORDER.map(({ category, id, cover, excerpt }) => {
    const works = PORTFOLIO_ITEMS.filter((item) => item.category === category);
    const coverItem = works.find((item) => item.src === cover) ?? works[0];
    return {
      id,
      title: category,
      labels: unique(works.map((item) => item.brand)),
      excerpt,
      cover: { src: coverItem.src, alt: coverItem.alt },
      coverWide: coverItem.wide,
      items: works.filter((item) => item !== coverItem),
      cta: "İşleri Gör",
    };
  }),
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
    href: "/portfolyo/emlak-crm-pro",
    cta: "Projeyi İncele",
  },
];
