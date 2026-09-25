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
/*
 * ×1.4 (Eylül 2026): eski değerlerle (1.15/1.05/0.85/0.95/0.85/0.85) GRAFİK
 * fazının "her şey görünür" platosu ~50vh'ydi — tek bir tekerlek hamlesi,
 * başlık okunmadan geçiyordu. Ağırlıklar oransal olduğu için yalnızca bu
 * tabloyu büyütmek intro/resolve'u da KISALTIRDI; bu yüzden globals.css'teki
 * `--hero-travel` aynı oranda (800vh → 1020vh) büyütüldü, ağırlık başına düşen
 * yol (~95vh) sabit kaldı. Sonuç: intro ve kapanışın mutlak süresi aynı,
 * yalnızca hizmet fazları uzun.
 */
/*
 * ×1.236 (Eylül 2026, ikinci geçiş): canlı test geri bildirimi — hizmet
 * fazlarının METNİ (ikon/başlık/kalemler) hâlâ çok çabuk beliriyordu,
 * ~1.5 saniyelik (≈30vh) bir gecikme istendi. Bu YİNE bir ağırlık çarpanı,
 * ama bu kez yalnızca İÇERİK PENCERELERİNİ değil ONLARIN GECİKMESİNİ de
 * ayarlıyor — bkz. useHeroScroll.ts'teki ICON_WINDOW/RULE_WINDOW/
 * TITLE_WINDOW/ITEMS_FROM/ITEMS_TO'nun yanındaki not: bu ağırlıklarla
 * `--hero-travel`i (globals.css) AYNI oranda büyütmenin matematiği,
 * içerik pencerelerini `new = (old + 0.236) / 1.236` ile yeniden yazmakla
 * BİRLİKTE çalışıyor — sonuç: ortalama ~30vh'lik bir gecikme (kısa
 * fazlarda ~27vh, uzun fazlarda ~36vh, fazın kendi uzunluğuyla orantılı)
 * EKLENİYOR ve eskiden beri var olan "her şey görünür" platosunun MUTLAK
 * (vh) uzunluğu KORUNUYOR — plato daha geç başlıyor, aynı sürede bitiyor.
 * Video playhead'i (VIDEO_FADE, driveVideoLayer) bu değişiklikten
 * ETKİLENMİYOR: o hâlâ fazın TAM yerel `q ∈ [0,1]`'ini 0→1 oynatıyor,
 * fazın kaç vh sürdüğünden bağımsız.
 */
const SERVICE_WEIGHTS: Record<string, number> = {
  grafik: 1.99,
  dijital: 1.817,
  web: 1.471,
  yazilim: 1.644,
  foto: 1.471,
  danismanlik: 1.471,
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

/** Ağırlıkların toplamı. Normalize p ekseninde BİR ağırlık birimi
 * `1 / HERO_WEIGHT_TOTAL`'dir — faz sınırını aşan köprü süreleri (handoff,
 * saçılma, gösterge payı) bu birim cinsinden yazılır ki bir ağırlık
 * değiştiğinde mutlak süreleri sessizce kısalmasın (bkz. useHeroScroll). */
export const HERO_WEIGHT_TOTAL = HERO_PHASES.reduce((sum, phase) => sum + phase.weight, 0);

/** Ağırlıklardan türetilen, kümülatif normalize faz aralıkları. */
export const PHASE_RANGES: PhaseRange[] = (() => {
  const total = HERO_WEIGHT_TOTAL;
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
