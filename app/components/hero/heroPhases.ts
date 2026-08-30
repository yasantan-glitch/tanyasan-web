import type { LucideIcon } from "lucide-react";

import { SERVICES } from "@/app/content/services";

/**
 * Hero'nun 8 fazlı anlatısının tek kaynağı: faz SIRASI ve scroll bütçesi payı
 * burada durur. Hizmet İÇERİĞİ (ikon/başlık/kalemler) bir katman aşağıda,
 * `app/content/services.ts`'te — /hizmetler sayfası da aynı diziyi okuyor,
 * liste iki yerde kopyalanmıyor. Faz aralıkları ağırlıklardan TÜRETİLİR — useHeroScroll'un
 * read() döngüsüne elle sabit yazılmaz. Bir ağırlık değiştiğinde tüm zamanlama
 * kendiliğinden yeniden dağılır.
 *
 * Ağırlık = temel süre + kalem sayısı payı. Faz 1 (slogan) ve faz 8 (toparlanma
 * + CTA) en uzun nefesi alır; hizmet fazları kalem sayısına göre ölçeklenir, ki
 * 6 kalemli GRAFİK 3 kalemli WEB kadar sıkışık geçmesin.
 */

export type HeroPhaseKind = "intro" | "service" | "resolve";

export interface HeroPhase {
  id: string;
  kind: HeroPhaseKind;
  /** Toplam scroll bütçesindeki payı — mutlak değil, oransal. */
  weight: number;
  icon?: LucideIcon;
  title?: string;
  items?: string[];
  /** Fazın kendi klibi. YALNIZCA hizmet fazlarında; intro'da video yok
   * (statik zemin, bkz. globals.css .hero-bg-static), resolve'da da yok
   * (kapanış sahnesinin hiç medyası yok — bkz. HeroResolvePhase). */
  videoSrc?: string;
}

/** İkon/başlık/kalemlerin garanti olduğu daraltılmış tip. */
export interface HeroServicePhase extends HeroPhase {
  kind: "service";
  icon: LucideIcon;
  title: string;
  items: string[];
  videoSrc: string;
}

/** Faz 8 (resolve) hiçbir medya taşımıyor: ne klip ne fotoğraf. Kapanış
 * sahnesi tamamen kod tabanlı — beyaza dönen zemin üstünde SVG bir dikey ray,
 * onu çizen bir nokta, raydan çıkan slogan/CTA ve nokta bulutundan bir küre.
 * Böylece sahne her ölçekte keskin, ilk yükte ağırlıksız ve tema
 * token'larına bağlı kalıyor (bkz. docs/design-system.md §8). */
export interface HeroResolvePhase extends HeroPhase {
  kind: "resolve";
}

/** Faz 1'in statement'ı — satır satır, satır içinde kelime kelime. Çıkışta
 * her kelime kendi yön/hız/gecikmesiyle dağıldığı için metin burada sözcük
 * dizisi olarak durur (bkz. useHeroScroll'daki saçılma). */
export const HERO_STATEMENT_LINES: string[][] = [
  ["FARK", "YARATAN", "TASARIM,"],
  ["İŞLEYEN", "SİSTEM"],
];

/** Faz 8'in kapanışa özel mesajı — faz 1'in ana sloganıyla aynı DEĞİL.
 * SATIR SATIR durur: her satır dikey raydan ayrı ayrı, kendi gecikmesi ve
 * yaylanmasıyla çıkıyor (bkz. useHeroScroll'daki OUTRO_LINES_*). Tamamı
 * büyük harf; vurgu kelimesi RESOLVE_SLOGAN_ACCENT_LINE ile işaretli. */
export const RESOLVE_SLOGAN_LINES = ["FİKİRDEN", "SONUCA,", "TEK", "EKİPLE"];

/** Accent renginde çıkacak satırın indeksi ("TEK"). Renk JSX'te iki dala
 * kopyalanmasın diye tek kaynak burada. */
export const RESOLVE_SLOGAN_ACCENT_LINE = 2;

/**
 * Hizmet fazlarının scroll bütçesi payı. Ağırlık = temel süre + kalem sayısı
 * payı; içerikten bağımsız olduğu için burada kalıyor (services.ts sırayı ve
 * metni taşır, zamanlamayı değil).
 */
const SERVICE_WEIGHTS: Record<string, number> = {
  grafik: 1.15,
  dijital: 1.05,
  web: 0.85,
  yazilim: 0.95,
  foto: 0.85,
  danismanlik: 0.85,
};

/** Fazın kendi klibi. Yalnızca hero'yu ilgilendirir — /hizmetler medyasız. */
const SERVICE_VIDEOS: Record<string, string> = {
  grafik: "/hero-videos/grafik-tasarim.mp4",
  dijital: "/hero-videos/dijital-pazarlama.mp4",
  web: "/hero-videos/web-tasarimi.mp4",
  yazilim: "/hero-videos/yazilim-uygulama.mp4",
  foto: "/hero-videos/foto-video.mp4",
  danismanlik: "/hero-videos/danismanlik-egitim.mp4",
};

/**
 * İçerik (ikon/başlık/kalemler) services.ts'ten gelir, zamanlama buradan.
 * Sıra da services.ts'in sırasıdır: aradan bir hizmet eklemek/çıkarmak için
 * o diziye dokunmak ve buraya ağırlık + klip eklemek yeterli.
 */
const SERVICE_HERO_PHASES: HeroServicePhase[] = SERVICES.map((service) => ({
  id: service.id,
  kind: "service",
  weight: SERVICE_WEIGHTS[service.id],
  icon: service.icon,
  videoSrc: SERVICE_VIDEOS[service.id],
  title: service.title,
  items: service.items,
}));

export const HERO_PHASES: HeroPhase[] = [
  { id: "intro", kind: "intro", weight: 1.3 },
  ...SERVICE_HERO_PHASES,
  { id: "resolve", kind: "resolve", weight: 1.4 },
];

export interface PhaseRange {
  /** Normalize hero ilerlemesinde (p ∈ [0,1]) faz başlangıcı. */
  start: number;
  end: number;
}

/** Ağırlıklardan türetilen, kümülatif normalize faz aralıkları. */
export const PHASE_RANGES: PhaseRange[] = (() => {
  const total = HERO_PHASES.reduce((sum, phase) => sum + phase.weight, 0);
  let acc = 0;
  return HERO_PHASES.map((phase) => {
    const start = acc / total;
    acc += phase.weight;
    return { start, end: acc / total };
  });
})();

export function isServicePhase(phase: HeroPhase): phase is HeroServicePhase {
  return phase.kind === "service";
}

export const HERO_PHASE_COUNT = HERO_PHASES.length;
export const SERVICE_PHASES: HeroServicePhase[] = HERO_PHASES.filter(isServicePhase);

export const INTRO_PHASE_INDEX = HERO_PHASES.findIndex((phase) => phase.kind === "intro");
export const RESOLVE_PHASE_INDEX = HERO_PHASES.findIndex((phase) => phase.kind === "resolve");
