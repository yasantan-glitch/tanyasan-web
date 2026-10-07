"use client";

import { useEffect, useRef } from "react";
import {
  clamp,
  clamp01,
  cue,
  hash01,
  lerp,
  smooth,
  springOut,
  staggerDraw,
} from "./heroMath";
import {
  HERO_MOBILE_VIDEO_MEDIA,
  HERO_PHASES,
  HERO_PHASE_COUNT,
  HERO_WEIGHT_TOTAL,
  INTRO_PHASE_INDEX,
  PHASE_RANGES,
  RESOLVE_PHASE_INDEX,
  SERVICE_PHASES,
  SERVICE_PHASE_INDICES,
  isServicePhase,
  type HeroVideoSources,
} from "./heroPhases";

// Eğriler `heroMath.ts`'te — site genelindeki hareket onlarla aynı dili
// konuşsun diye. Aşağıdakiler PHASE_RANGES'e ve hero sabitlerine bağlı
// oldukları için burada kalıyor.

/** Faz aralığı içindeki yerel ilerleme. */
function phaseProgress(p: number, index: number) {
  const { start, end } = PHASE_RANGES[index];
  return clamp01((p - start) / Math.max(end - start, 0.0001));
}
/** Faz 2'ye özel: içerik zaman çizgisi kendi aralığından `lead` kadar önce
 * başlar. Faz 1'in çıkış hareketi sürerken ikonun sahneye girmesi gerekiyor;
 * yalnızca kök opaklığını açmak yetmiyor, iç koreografi de yol almalı.
 * Video playhead'i bunu KULLANMAZ — klip kendi gerçek aralığında sürülür. */
function leadingPhaseProgress(p: number, index: number, lead: number) {
  const { start, end } = PHASE_RANGES[index];
  return clamp01((p - (start - lead)) / Math.max(end - start + lead, 0.0001));
}

/**
 * Bir statement kelimesinin dağılma parametreleri. Üç bağımsız hash kanalı
 * (yön/mesafe, yükselme, sıra) + parite harmanı: parite tek başına kullanılsa
 * kelimeler sırayla sağ-sol-sağ dizilir (fazla düzenli), hash tek başına
 * kullanılsa bir satırın tamamı aynı yöne düşebilir (blok savrulması). İkisinin
 * XOR'u her satırda iki yönü de garanti eder ama ritmi düzensiz tutar.
 */
function scatterOf(lineIndex: number, wordIndex: number) {
  const n = lineIndex * 31 + wordIndex;
  const dirHash = hash01(n) > 0.5;
  const dir = dirHash !== (wordIndex % 2 === 0) ? 1 : -1;
  const spread = hash01(n + 101);
  const rise = hash01(n + 211);
  return {
    x: dir * (SCATTER_X_MIN_VW + spread * (SCATTER_X_MAX_VW - SCATTER_X_MIN_VW)),
    rise: SCATTER_RISE_MIN_VH + rise * (SCATTER_RISE_MAX_VH - SCATTER_RISE_MIN_VH),
    rotate: dir * SCATTER_ROTATE_DEG * (0.4 + spread * 0.6),
    /** Stagger sırası — soldan sağa değil, hash'in verdiği sırada. */
    order: hash01(n + 307),
  };
}

/**
 * Normalize p ekseninde BİR ağırlık birimi (bkz. heroPhases.ts
 * HERO_WEIGHT_TOTAL). Faz sınırını aşan köprüler (handoff, saçılma, gösterge
 * payı) ham p ile değil bu birimle yazılır: ham p'de yazılsalardı hizmet
 * ağırlıkları büyüdüğünde (Eylül 2026, ×1.4) toplam da büyüyüp bu köprüleri
 * sessizce kısaltırdı. Katsayılar eski ham değerler × 8.40 (o günkü toplam) —
 * yani mutlak süreleri birebir korunuyor.
 */
const WEIGHT_UNIT = 1 / HERO_WEIGHT_TOTAL;

/** Faz gezgininin sayacı ("03/06") — SSR ilk karesi (Hero.tsx) ve read()'in
 * faz değişiminde yazdığı metin aynı biçimi buradan alır. */
export function dockCount(serviceIndex: number) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(serviceIndex + 1)}/${pad(SERVICE_PHASES.length)}`;
}

const isMobile = () =>
  typeof window !== "undefined" && window.matchMedia("(max-width: 860px)").matches;

/** Data Saver / Save-Data açık mı — açıksa mobilde de klipler yalnızca
 * talep üzerine (aktif ±1) iner, toplu ön yükleme yapılmaz. */
const saveDataOn = () =>
  typeof navigator !== "undefined" &&
  (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

/** `?herodebug` ile gerçek cihazda konsola klip/priming olaylarını yazar
 * (Safari Web Inspector / chrome://inspect). Parametre yoksa sessiz. */
const heroDebug = () =>
  typeof window !== "undefined" && /[?&]herodebug\b/.test(window.location.search);

/**
 * Hizmet klibinin faz-yerel crossfade penceresi. Fazın ilk/son %12'sinde
 * çözülür, ortada plato. İçerik zarfı (PHASE_ENVELOPE 0.06 → 0.98) bunun
 * içinde kaldığı için video, metin belirmeden yerini alır ve metin gittikten
 * sonra kapanır.
 */
const VIDEO_FADE = { rIn: 0.12, rOut: 0.12 };

/** Aktif fazın kaç komşusunun klibi yüklü tutulur (1 = önceki + sonraki).
 * Yalnızca hizmet fazları için: faz 8'in hiç medyası yok. */
const VIDEO_PRELOAD_RADIUS = 1;

/**
 * Scroll'a bağlı sürülen tek bir video katmanı. Her katman kendi fazının
 * klibini taşır (phaseIndex ile heroPhases.ts'e eşlenir) ve aktif fazdan
 * uzaklaşınca src'si bırakılır — mobilde de: aynı anda en fazla aktif ±1
 * (≤3) <video> bağlı. iOS Safari'de 6 klibin birden bağlı/primelenmiş olması
 * oynatmayı tamamen durdurdu (Ekim 2026). Taban katman kavramı yok.
 *
 * İNDİRME ile BAĞLAMA ayrı: `download` ağ isteğidir ve scroll'da ASLA iptal
 * edilmez (yalnızca unmount'ta) — hızlı scroll'da bitmek üzere olan bir klip
 * kesilip baştan indirilmesin. Mobil eager modda bitmiş indirmenin Blob'u
 * bellekte kalır, yeniden bağlama anında olur. `wanted` ise katmanın
 * src'sinin bağlı olup olmaması gerektiğidir.
 */
interface VideoLayer {
  el: HTMLVideoElement;
  sources: HeroVideoSources;
  /** Faz indeksi (hizmet veya resolve). */
  phaseIndex: number;
  /** lerp'lenen ve hedef playhead — ikisi de [0,1] normalize. */
  cur: number;
  target: number;
  ready: boolean;
  duration: number;
  stuckAt: number;
  blobUrl: string | null;
  /** Sürmekte olan ya da bitmiş indirme; başarısızlıkta null'a döner. */
  download: Promise<Blob> | null;
  wanted: boolean;
  /** Bağlı src bir play()/pause() ile primelendi mi — her bağlamada sıfırlanır. */
  primed: boolean;
  /** Son yazılan opaklık — aynı değeri tekrar yazıp style recalc tetiklemeyiz. */
  opacity: number;
}

// ---- faz içi koreografi pencereleri (q ∈ [0,1], faza göre yerel) ----------
// Sıra: ikon ağdan doğar → ayraç iner → başlık → kalemler stagger'lı.
// Girişler Eylül 2026'da önce SIKIŞTIRILDI (ikon 0.10→0.08, ayraç 0.18→0.12,
// başlık 0.28→0.16, kalemler 0.30–0.46 → 0.18–0.34: koreografinin sırası
// aynı, yalnızca daha erken bitiyor — kazanılan pay platoya gitti), sonra
// İKİNCİ bir geçişte GECİKTİRİLDİ (canlı test: metin hâlâ çok çabuk
// beliriyordu, ~1.5s/~30vh istendi). PHASE_ENVELOPE'A DOKUNULMADI: kökün
// (`.hero-phase` root, opacity) kendi fade-in'i eskisi gibi q=0.06'da
// başlıyor — yalnızca İÇERİK (ikon/ayraç/başlık/kalemler) daha geç geliyor.
// Bilinçli tercih: PHASE_ENVELOPE de geciktirilseydi, faz 1→2 devrinde
// (leadingPhaseProgress, HANDOFF_SPAN) kök uzunca bir süre tamamen görünmez
// kalırdı — video zaten oynuyorken boş bir çerçeve asılı dururdu. Kökün
// erken fade-in'i sayesinde bu boşluk hiç açılmıyor: video + koyu zemin
// erken görünür, yalnızca ikon/başlık/kalemler bekletiliyor.
//
// Yeni değerler `heroPhases.ts`teki SERVICE_WEIGHTS ×1.236 ile BİRLİKTE
// çalışıyor: `new = (old + 0.236) / 1.236` — bu affine dönüşüm, fazı
// %23.6 uzatıp EN BAŞINA sabit bir gecikme eklemenin yerel q karşılığı
// (türetim: docs/design-system.md §8). Sonuç, fazın kendi uzunluğuyla
// orantılı ~27–36vh (ortalama ~30vh) bir gecikme ve PLATONUN (her şey
// görünür kaldığı süre) MUTLAK vh uzunluğunun KORUNMASI — ölçüldü
// (GRAFİK): eski plato ~98.6vh, yeni plato ~97.8vh (fark yuvarlama payı).
//
// Çıkış faz aralığının İÇİNDE biter (0.98) ve sonraki fazın girişi kendi
// aralığının %10'unda başlar; bu yüzden iki faz asla üst üste binmez.
const PHASE_ENVELOPE = { from: 0.06, to: 0.98, rIn: 0.14, rOut: 0.12 };
const ICON_WINDOW = { from: 0.256, to: 0.98, rIn: 0.14, rOut: 0.08 };
const RULE_WINDOW = { from: 0.288, to: 0.98, rIn: 0.12, rOut: 0.06 };
const TITLE_WINDOW = { from: 0.321, to: 0.98, rIn: 0.12, rOut: 0.06 };
const ITEMS_FROM = 0.337;
// Son kalem faz süresinin %46.6'sında yerine oturur (eskiden %34, ikinci
// geçişte geciktirildi — yukarıdaki nota bakın). Bu değer plato uzunluğunu
// doğrudan belirliyor: giriş ne kadar geç biterse "her şey görünür" penceresi
// o kadar kısalır ve hızlı scroll'da kalemler okunmadan geçer.
const ITEMS_TO = 0.466;
const ITEMS_SPREAD = 0.55;

/**
 * Faz gezgininden (bkz. Hero.tsx HeroDock) bir faza atlanınca inilen yerel q.
 * Son kalemin yerine oturduğu andan (ITEMS_TO) biraz sonra: ikon, başlık ve
 * kalemlerin hepsi görünür, video çoktan tam opak (VIDEO_FADE.rIn 0.12) ve
 * plato (→ ~0.86) önümüzde. ITEMS_TO'dan türetilir — giriş koreografisi
 * yeniden ayarlanırsa iniş noktası da onunla kayar.
 */
const PHASE_SETTLE_Q = ITEMS_TO + 0.08;

/**
 * Faz 1 → Faz 2 devri. Faz sınırının İKİ yanına yayılan tek bir eğri: faz 1'in
 * kopyası yukarı kayıp küçülerek çıkarken faz 2'nin bloğu aynı eğri üzerinde
 * aşağıdan sahneye giriyor. Crossfade (biri kapanır, diğeri açılır) yerine tek
 * bir devam eden hareket — sınırda duraklama/kesim hissi olmasın diye.
 *
 * Global p ekseninde ±HANDOFF_SPAN; faz 2 bu kadar erken çizilmeye başlar
 * (bkz. read()'te inRange'in bu faz için genişletilmesi). Değer ~0.24
 * ağırlık birimi (≈22vh) — faz 2'nin kendi zarfı devralmadan önceki köprü.
 */
const HANDOFF_SPAN = 0.2352 * WEIGHT_UNIT;
/** Faz 1 kopyasının çıkışta kat ettiği mesafe / ölçek kaybı. */
const HANDOFF_RISE_VH = 11;
const HANDOFF_SCALE = 0.07;
/** Faz 2 bloğunun aynı eğri üzerinde aşağıdan yükseldiği mesafe. */
const HANDOFF_ENTER_VH = 9;

/**
 * Faz 1'in dağılma çıkışı. Statement blok hâlinde sönmüyor: her kelime kendi
 * yönüne (sola/sağa) kendi hızıyla savruluyor, aynı anda yukarı kayıp
 * bulanıklaşarak sönüyor — cümle "çözülüyor". Eğri handoff'tan SCATTER_LEAD
 * kadar ÖNCE başlar ve handoff ile AYNI ANDA biter; böylece sınırda ne ani bir
 * kesim ne de geride kalan kelime olur.
 */
const SCATTER_LEAD = 0.42 * WEIGHT_UNIT;
const SCATTER_SPREAD = 0.5;
/** Kelime başına savrulma aralıkları — hash kanalları bu aralıklara eşlenir. */
const SCATTER_X_MIN_VW = 8;
const SCATTER_X_MAX_VW = 30;
const SCATTER_RISE_MIN_VH = 6;
const SCATTER_RISE_MAX_VH = 16;
const SCATTER_ROTATE_DEG = 7;
const SCATTER_BLUR_PX = 5;
/** Scroll ipucunun (mouse ikonu) tam görünür opaklığı. globals.css'teki
 * `.hero-scroll-hint { opacity }` ilk karesiyle aynı tutulmalı; JS burayı
 * intro'nun ilk çeyreğinde 0'a çeker. */
const HINT_OPACITY = 0.85;
/** Alt başlık aynı dili daha sakin konuşur: tek yön, rotasyon yok, biraz erken.
 * SCATTER_SUB_LEAD küçük tutulmalı — pencere `introEnd - SCATTER_LEAD - LEAD`
 * noktasında AÇILIYOR, yani büyük bir değer alt başlığı faz 1'in daha
 * başındayken soldurur (0.12'de sayfanın tepesinden itibaren sönüyordu). */
const SCATTER_SUB_SHIFT_VW = 6;
const SCATTER_SUB_LEAD = 0.168 * WEIGHT_UNIT;
/** Faz göstergesinin intro sonundan önce belirip resolve başından sonra
 * sönmesi için pay. */
const INDICATOR_PAD = 0.252 * WEIGHT_UNIT;
/** Alt dok (mobil): gezgin intro'nun son DOCK_PAD'inde belirir — faz 1'in
 * kelimeleri dağılırken; dokun tamamı faz 7'nin son DOCK_PAD'inde söner, yani
 * kapanış sahnesine (beyaz zemin, CTA'lar) hiç taşmaz. Gösterge payıyla aynı
 * ağırlık birimi. */
const DOCK_PAD = INDICATOR_PAD;

/** Faz 8: zemin geçişi. Koyu sahne beyaza bu pencerede döner (resolve-yerel
 * q). Faz 7'nin içeriği kendi zarfıyla faz sınırında zaten 0'a inmiş olduğu
 * için beyaz, okunmakta olan bir metnin altını yıkamıyor; slogan (0.18) ve
 * CTA (0.34) da bu pencereden SONRA belirmeye başlıyor — yani ikisi de koyu
 * zeminde hiç görünmüyor, renkleri statik olarak açık zemine göre. */
const OUTRO_WASH_TO = 0.12;

/**
 * Faz 8'in kapanış koreografisi (hepsi resolve-yerel q). Sahne tamamen kod
 * tabanlı: sayfanın 2/3 hattında dikey bir ray, onu çizerek inen bir nokta,
 * raydan SOLA çıkan slogan satırları, raydan SAĞA çıkan CTA'lar ve sağda
 * dönen bir parçacık küresi.
 *
 * Sıra bilinçli: nokta önce belirir, inerken rayı çizer, iniş sürerken slogan
 * satırları raydan sökülür, nokta CTA hizasında DURDUĞU anda (0.55) butonlar
 * ters yöne çıkar, küre en son yerleşir. Böylece her öğenin sahneye girişinin
 * bir nedeni var — hiçbiri kendiliğinden belirmiyor.
 */
/** Rayın tepe noktası, sahne yüksekliğinin oranı olarak. */
const OUTRO_RAIL_TOP_RATIO = 0.08;
/** Nokta belirir. */
const OUTRO_DOT_FROM = 0.06;
const OUTRO_DOT_TO = 0.14;
/** Nokta iner ve rayı çizer; bitişte CTA hizasında durur. */
const OUTRO_RAIL_FROM = 0.1;
const OUTRO_RAIL_TO = 0.55;

/** Slogan satırları: raydan sökülüp sola uzar. Pencere rayın inişiyle
 * ÖRTÜŞÜR (0.20 < 0.55) — satırlar nokta inerken çıkmalı, sonra değil. */
const OUTRO_LINES_FROM = 0.2;
const OUTRO_LINES_TO = 0.64;
const OUTRO_LINES_SPREAD = 0.55;
const OUTRO_LINES_SHIFT_VW = 14;

/** CTA'lar: nokta durduktan SONRA, ters yönde (sağa). */
const OUTRO_CTA_FROM = 0.58;
const OUTRO_CTA_TO = 0.8;
const OUTRO_CTA_SPREAD = 0.4;
const OUTRO_CTA_SHIFT_VW = 10;
/** Mobilde rayın sağında CTA'nın kayacağı yer dar; genlik kısılıyor
 * (masaüstündeki 10vw dar ekranda butonu sahnenin dışına atıyordu). */
const OUTRO_MOBILE_SHIFT_DAMP = 0.34;

/** Küre en son yerleşir; fazın sonuna kadar ekranda kalır. */
const OUTRO_ORB_FROM = 0.66;
const OUTRO_ORB_TO = 0.9;
const OUTRO_ORB_SCALE_FROM = 0.86;

export interface HeroScrollHandle {
  sectionRef: React.RefObject<HTMLElement | null>;
  stageInnerRef: React.RefObject<HTMLDivElement | null>;
  /** Hizmet klipleri, faz indeksiyle indekslenir (phaseRootRefs ile aynı desen).
   * Faz 8'in video katmanı yok — kapanış artık statik görsel. */
  mediaVideoRefs: React.RefObject<Array<HTMLVideoElement | null>>;
  /** Faz 8'in beyaz zemin katmanı — kapanış sahnesinin altında. */
  bgWashRef: React.RefObject<HTMLDivElement | null>;
  /** Koyu okunurluk gradyanı; faz 8'de zeminle birlikte sönüyor. */
  scrimRef: React.RefObject<HTMLDivElement | null>;
  /** Faz 8'in açık zemin okunurluk gradyanı. */
  lightScrimRef: React.RefObject<HTMLDivElement | null>;
  scrollHintRef: React.RefObject<HTMLDivElement | null>;
  /** Faz 1'in kopya bloğu (statement + alt başlık) — GİRİŞİ tek seferlik bir
   * CSS load animasyonundan (bkz. .hero-intro-rise), ÇIKIŞI (faz 2'ye devreden
   * hareket) buradan sürülür. Hero'nun ilk karesinde başka öğe olmadığı için
   * kopya scroll beklemeden ekranda olmalı. */
  introBlockRef: React.RefObject<HTMLDivElement | null>;
  /** Statement kelimeleri: [satır][kelime]. Çıkışta her biri kendi yönüne
   * savrulduğu için tek tek sürülüyor. */
  statementWordRefs: React.RefObject<Array<Array<HTMLSpanElement | null>>>;
  /** Faz 1'in alt başlığı — kelimelerden daha sakin, tek yönde çıkar. */
  subtitleRef: React.RefObject<HTMLParagraphElement | null>;
  /** Faz 8'in CTA kutusu: opaklık ve tıklanabilirlik buradan. Transform
   * YAZILMAZ — kutunun layout kutusu noktanın duracağı y'yi veriyor
   * (offsetTop), transform onu kaydırırdı. */
  ctaRef: React.RefObject<HTMLDivElement | null>;
  /** İki CTA ayrı ayrı: raydan sağa, stagger'lı ve yaylanarak çıkıyorlar. */
  ctaItemRefs: React.RefObject<Array<HTMLAnchorElement | null>>;
  /** Faz 8'in dikey rayı (SVG). Konumu/yüksekliği layout'ta px olarak,
   * çizilme oranı her frame stroke-dashoffset ile yazılır. */
  outroRailRef: React.RefObject<SVGSVGElement | null>;
  /** Rayı çizerek inen nokta (SVG). */
  outroDotRef: React.RefObject<SVGSVGElement | null>;
  /** Kapanış sloganının satırları — her biri raydan ayrı çıkıyor. */
  outroLineRefs: React.RefObject<Array<HTMLSpanElement | null>>;
  /** Nokta bulutu küresinin sarmalayıcısı: yalnızca GÖRÜNÜRLÜĞÜ scroll'dan
   * sürülür, nefes alması SVG'nin içindeki <g>'de CSS animasyonu. */
  outroOrbRef: React.RefObject<HTMLDivElement | null>;
  // --- faz katmanı ---
  phaseRootRefs: React.RefObject<Array<HTMLDivElement | null>>;
  phaseIconRefs: React.RefObject<Array<HTMLDivElement | null>>;
  phaseRuleRefs: React.RefObject<Array<HTMLDivElement | null>>;
  phaseTitleRefs: React.RefObject<Array<HTMLHeadingElement | null>>;
  phaseItemRefs: React.RefObject<Array<Array<HTMLLIElement | null>>>;
  indicatorRef: React.RefObject<HTMLDivElement | null>;
  phaseTickRefs: React.RefObject<Array<HTMLSpanElement | null>>;
  // --- alt dok: scroll ipucu + faz gezgini + atla (mobil) ---
  /** Dokun tamamı — kapanışa girerken söner. */
  dockRef: React.RefObject<HTMLDivElement | null>;
  /** "Kaydırın" ipucu — intro'nun ilk çeyreğinde söner. */
  dockCueRef: React.RefObject<HTMLDivElement | null>;
  /** "03/06 · BAŞLIK" satırı ve segmentler — hizmet fazları boyunca. */
  dockStatusRef: React.RefObject<HTMLParagraphElement | null>;
  dockCountRef: React.RefObject<HTMLSpanElement | null>;
  dockNameRef: React.RefObject<HTMLSpanElement | null>;
  dockNavRef: React.RefObject<HTMLElement | null>;
  /** Segment düğmeleri ve dolguları — HİZMET sırasıyla (0-5) indekslenir,
   * faz indeksiyle değil. */
  dockSegRefs: React.RefObject<Array<HTMLButtonElement | null>>;
  dockFillRefs: React.RefObject<Array<HTMLSpanElement | null>>;
  /** Faz indeksine (HERO_PHASES) yumuşak scroll — fazın her şeyi görünür
   * olduğu noktaya (PHASE_SETTLE_Q). */
  scrollToPhase: (phaseIndex: number) => void;
  /** Hero'nun bittiği yere (ilk bölümün başı) yumuşak scroll. `moveFocus`
   * klavyeyle tetiklendiğinde odağı da o bölüme taşır. */
  skipHero: (moveFocus: boolean) => void;
}

/**
 * Hero'nun scroll-scrubbing motoru. scrollcraft.js'in tekniklerinin
 * (sticky-pin + normalize progress, lerp'lenmiş/deadband'li video playhead,
 * blob-preload, iOS priming) React'e portu.
 *
 * Zamanlama heroPhases.ts'teki ağırlıklardan türetilen PHASE_RANGES'ten gelir;
 * burada faz sınırı sabiti YOK.
 *
 * Per-frame değerler React state'i olarak TUTULMUYOR; read()/tick() ref'lenmiş
 * DOM node'larına doğrudan yazıyor. Bu yalnızca reduced-motion KAPALIYKEN
 * mount edilmeli (Hero.tsx dallanmasında).
 */
export function useHeroScroll(): HeroScrollHandle {
  const sectionRef = useRef<HTMLElement>(null);
  const stageInnerRef = useRef<HTMLDivElement>(null);
  const mediaVideoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const bgWashRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const lightScrimRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const introBlockRef = useRef<HTMLDivElement>(null);
  const statementWordRefs = useRef<Array<Array<HTMLSpanElement | null>>>([]);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const ctaItemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const outroRailRef = useRef<SVGSVGElement>(null);
  const outroDotRef = useRef<SVGSVGElement>(null);
  const outroLineRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const outroOrbRef = useRef<HTMLDivElement>(null);

  const phaseRootRefs = useRef<Array<HTMLDivElement | null>>([]);
  const phaseIconRefs = useRef<Array<HTMLDivElement | null>>([]);
  const phaseRuleRefs = useRef<Array<HTMLDivElement | null>>([]);
  const phaseTitleRefs = useRef<Array<HTMLHeadingElement | null>>([]);
  const phaseItemRefs = useRef<Array<Array<HTMLLIElement | null>>>([]);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const phaseTickRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const dockRef = useRef<HTMLDivElement>(null);
  const dockCueRef = useRef<HTMLDivElement>(null);
  const dockStatusRef = useRef<HTMLParagraphElement>(null);
  const dockCountRef = useRef<HTMLSpanElement>(null);
  const dockNameRef = useRef<HTMLSpanElement>(null);
  const dockNavRef = useRef<HTMLElement>(null);
  const dockSegRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const dockFillRefs = useRef<Array<HTMLSpanElement | null>>([]);
  /** Effect'in priming'i — dok düğmeleri dokunuş anında çağırır. */
  const activateRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    /** Pin uzunluğu = sticky sahnenin yüksekliği (100svh). window.innerHeight
     * DEĞİL: mobilde adres çubuğu açılıp kapandıkça innerHeight değişiyor,
     * sahne (svh) değişmiyor — p her seferinde sıçrıyordu. Masaüstünde ikisi
     * aynı sayı. */
    let stageH = window.innerHeight;
    let top = 0;
    let height = 0;
    let ctaOn = false;
    let dockOn = true;
    let navOn = false;
    /** Aktif segment (hizmet sırası): -1 intro, SERVICE_PHASES.length kapanış. */
    let activeSeg = -2;
    let destroyed = false;
    /** matchMedia sonucu layout'ta bir kez okunur — her frame sorgulanmaz. */
    let mobile = isMobile();
    /** Yeni yüklenecek kliplerin dikey telefon kaynağını mı alacağı —
     * layout'ta HERO_MOBILE_VIDEO_MEDIA'dan (preload etiketleriyle aynı
     * sorgu) okunur. Zaten indirilmiş klip değiştirilmez. */
    const mobileVideoMq = window.matchMedia(HERO_MOBILE_VIDEO_MEDIA);
    let mobileSource = mobileVideoMq.matches;
    /**
     * Mobil eager mod — mount'ta bir kez karar verilir. Açıkken: tüm
     * posterler hemen bağlanır, klipler faz sırasıyla arka planda TEK TEK
     * iner ve Blob'ları bellekte tutulur (6 küçük klip ≈ 2.3 MB). BAĞLAMA ise
     * her iki modda da aktif ±1 penceresiyle sınırlı. Kapalıyken (masaüstü —
     * klipler büyük; ya da Save-Data) yalnızca pencere iner, uzaklaşan klibin
     * Blob'u bırakılır.
     */
    const saveData = saveDataOn();
    const eager = mobileSource && !saveData;
    /** Tek ağ iptali: yalnızca unmount'ta. Reduced-motion kullanıcısında SSR
     * önce bu dalı basıyor, hydration'da HeroReduced'a geçiliyor — o birkaç
     * ms'de başlayan indirme hook'tan sonra arka planda sürmesin. */
    const net = new AbortController();

    const debug = heroDebug();
    const log = (...args: unknown[]) => {
      if (debug) console.info("[hero]", ...args);
    };
    log("mount", { mobileSource, saveData, eager });

    // Fazların çoğu her frame'de görünmez. Görünmez bir fazın ~9 node'una
    // stil yazmak boşuna "Recalculate Style" maliyeti — bir kez sıfırlayıp
    // o faz tekrar aktif olana dek atlıyoruz.
    const zeroed: boolean[] = new Array(HERO_PHASE_COUNT).fill(false);
    let activeTick = -1;

    // ---- video katmanları ----------------------------------------------
    // Her katman bir hizmet fazına ait (fazlar 2-7); DOM sırası z-sırası
    // (hepsi position: absolute, bkz. .hero-media), altındaki .hero-bg-static
    // her zaman opacity:1 statik zemin, video katmanları onun üzerine fade eder.
    // Faz 8'in video katmanı YOK — kapanış statik bir görsel.
    const layers: VideoLayer[] = [];
    const layerByPhase: Array<VideoLayer | null> = new Array(HERO_PHASE_COUNT).fill(null);

    function addLayer(el: HTMLVideoElement, sources: HeroVideoSources, phaseIndex: number) {
      // iOS sessiz oynatma iznini ilk play()'den önce görmeli: React'in
      // `muted` prop'u yalnızca property'yi yazar, attribute'u değil.
      // Attribute + defaultMuted + property üçü birden, src bağlanmadan önce.
      el.setAttribute("muted", "");
      el.defaultMuted = true;
      el.muted = true;
      el.setAttribute("playsinline", "");
      el.setAttribute("webkit-playsinline", "");
      el.playsInline = true;
      if (debug) {
        el.addEventListener("error", () =>
          console.warn("[hero] video error", phaseIndex, el.currentSrc, el.error?.code, el.error)
        );
        el.addEventListener("loadeddata", () => log("loadeddata", phaseIndex, el.duration));
        el.addEventListener("stalled", () => log("stalled", phaseIndex));
      }

      const layer: VideoLayer = {
        el,
        sources,
        phaseIndex,
        cur: 0,
        target: 0,
        ready: false,
        duration: 1,
        stuckAt: 0,
        blobUrl: null,
        download: null,
        wanted: false,
        primed: false,
        opacity: 0,
      };
      layers.push(layer);
      layerByPhase[phaseIndex] = layer;
      return layer;
    }

    for (let i = 0; i < HERO_PHASE_COUNT; i++) {
      const phase = HERO_PHASES[i];
      const el = mediaVideoRefs.current[i];
      if (!el) continue;
      if (isServicePhase(phase)) addLayer(el, phase.video, i);
    }

    /** Opaklık yalnızca gerçekten değiştiğinde DOM'a yazılır. */
    function setLayerOpacity(layer: VideoLayer, value: number) {
      if (value === layer.opacity) return;
      // 0 ve 1 uçları her zaman yazılır; aradaki mikro oynamalar atlanır.
      if (value !== 0 && value !== 1 && Math.abs(layer.opacity - value) < 0.002) return;
      layer.opacity = value;
      layer.el.style.opacity = value.toFixed(3);
    }

    // ---- blob-preload (güvenilir seek için) ----
    // Klip için <link rel="preload" as="fetch"> YOK (Ekim 2026'da kaldırıldı):
    // iOS'ta preload yanıtının fetch()'e devri doğrulanamadı; yalnızca ilk
    // poster HTML'den önyükleniyor (bkz. Hero.tsx HeroVideoPreloads).
    //
    // Poster: klip inene ya da cihaz kareyi boyayana dek (yavaş hücresel ağ,
    // iOS Düşük Güç Modu'nda reddedilen play()) katman boş koyu zemin yerine
    // ilk kareyi gösterir. Eager modda hepsi mount'ta bağlanır; aksi hâlde
    // yalnızca yükleme penceresine giren faz için.
    //
    // Dikey telefon klibi yoksa (dosyalar henüz deploy edilmemiş) bir kez
    // masaüstü klibine düşülür.
    function setPoster(layer: VideoLayer) {
      if (layer.el.getAttribute("poster")) return;
      layer.el.poster = mobileSource ? layer.sources.posterMobile : layer.sources.poster;
    }

    /** Klibi indirir (ya da süren/bitmiş indirmeyi döndürür). Scroll'da
     * iptal edilmez; yalnızca unmount `net`i iptal eder. */
    function download(layer: VideoLayer): Promise<Blob> {
      if (layer.download) return layer.download;
      const { src, mobileSrc, poster } = layer.sources;
      const fetchBlob = (url: string) =>
        fetch(url, { signal: net.signal }).then((r) => {
          if (!r.ok) throw new Error(`${r.status} ${url}`);
          return r.blob().then((raw) => {
            // iOS blob: URL'inde türü Blob'dan okuyor; Content-Type eksik ya
            // da yanlış gelirse (proxy, önbellek) klip çözülemez.
            const blob = raw.type.startsWith("video/")
              ? raw
              : new Blob([raw], { type: "video/mp4" });
            log(
              "fetched",
              layer.phaseIndex,
              url,
              `${Math.round(blob.size / 1024)} KB`,
              raw.type || "(tür yok)"
            );
            return blob;
          });
        });
      const pending = mobileSource
        ? fetchBlob(mobileSrc).catch((err) => {
            if (net.signal.aborted) throw err;
            log("mobil klip yüklenemedi, masaüstü klibine düşülüyor", err);
            layer.el.poster = poster;
            return fetchBlob(src);
          })
        : fetchBlob(src);
      layer.download = pending;
      pending.catch((err) => {
        // Bir sonraki ziyarette yeniden denenebilsin.
        if (layer.download === pending) layer.download = null;
        if (!net.signal.aborted && debug) {
          console.warn("[hero] klip yüklenemedi", layer.phaseIndex, err);
        }
      });
      return pending;
    }

    /** `?herodebug`: o an src'si bağlı <video> sayısı (≤3 beklenir). */
    const logAttached = () =>
      log("attached", layers.filter((layer) => layer.blobUrl).length);

    /** İnmiş blob'u video elemanına bağlar. */
    function attach(layer: VideoLayer, blob: Blob) {
      const url = URL.createObjectURL(blob);
      layer.blobUrl = url;
      layer.primed = false;
      log("attach", layer.phaseIndex, blob.type, `${Math.round(blob.size / 1024)} KB`);
      layer.el.addEventListener(
        "loadedmetadata",
        () => {
          if (layer.blobUrl !== url) return;
          layer.ready = true;
          layer.duration = layer.el.duration || 1;
          // Yeni gelen katman lerp'i sıfırdan başlatmasın — scroll zaten
          // fazın ortasında olabilir.
          layer.cur = layer.target;
          try {
            layer.el.currentTime = Math.max(layer.target * layer.duration, 0.001);
          } catch {
            /* seek atlanır */
          }
          if (activated) primeLayer(layer);
          read();
        },
        { once: true }
      );
      layer.el.preload = "auto";
      layer.el.muted = true;
      layer.el.playsInline = true;
      layer.el.src = url;
      logAttached();
    }

    function ensureLoaded(layer: VideoLayer) {
      if (layer.wanted || destroyed) return;
      layer.wanted = true;
      setPoster(layer);
      download(layer).then(
        (blob) => {
          // Arada unload olmuşsa (hızlı scroll) bağlamıyoruz; zaten bağlıysa
          // ikinci kez bağlamıyoruz.
          if (destroyed || !layer.wanted || layer.blobUrl) return;
          attach(layer, blob);
        },
        () => {
          /* poster / alttaki statik zemin ekranda kalır (log download'da) */
        }
      );
    }

    /** Uzaklaşan fazın klibini videodan çözer (src + decoder bırakılır).
     * Süren indirme İPTAL EDİLMEZ — bitmek üzere olan klip hızlı scroll'da
     * kesilip geri dönüşte baştan inmesin; dönülürse aynı promise kullanılır.
     * Bitmiş indirmenin Blob'u: eager modda bellekte KALIR (geri dönüşte
     * yeniden bağlama anında), aksi hâlde bırakılır (bellek aktif ±1'de
     * kalsın; geri dönüşte fetch HTTP cache'ten döner). */
    function unload(layer: VideoLayer) {
      if (!layer.wanted) return;
      layer.wanted = false;
      if (layer.blobUrl) {
        URL.revokeObjectURL(layer.blobUrl);
        layer.blobUrl = null;
        layer.el.removeAttribute("src");
        layer.el.load();
        log("detach", layer.phaseIndex);
        logAttached();
      }
      layer.ready = false;
      layer.primed = false;
      layer.cur = 0;
      layer.stuckAt = 0;
      if (eager) return;
      const pending = layer.download;
      pending?.then(
        () => {
          if (!layer.wanted && layer.download === pending) layer.download = null;
        },
        () => {}
      );
    }

    /** Eager mod: klipler faz sırasıyla, TEK TEK İNER — bağlanmaz. Bağlamayı
     * read()'in ±1 penceresi (ensureLoaded) yapar; inen klip pencerede ise
     * ensureLoaded'ın bekleyen then'i onu bağlar. Hızlı scroll ileride bir
     * klibi talep ederse pencere onu paralel başlatır, kuyruk aynı promise'i
     * bekler. */
    async function prefetchAll() {
      for (let i = 0; i < layers.length; i++) {
        if (destroyed) return;
        try {
          await download(layers[i]);
        } catch {
          /* sıradakine geç */
        }
        log(`prefetch ${i + 1}/${layers.length}`);
      }
    }

    /**
     * Faz 8'in ray geometrisi — px cinsinden, YALNIZCA layout'ta ölçülür.
     *
     * Nokta rastgele bir yerde değil, CTA satırının tam dikey merkezinde
     * durmalı; bu yüzden durma noktası CTA kutusunun LAYOUT kutusundan
     * (offsetTop/offsetHeight) okunuyor. getBoundingClientRect DEĞİL: rect
     * transform'u içerir, CTA'nın çocukları her frame kaydırıldığı için ölçüm
     * kaymaya başlardı. Aynı nedenle CTA sarmalayıcısına transform yazılmıyor.
     */
    let railTopPx = 0;
    let railSpanPx = 1;
    let railLine: SVGLineElement | null = null;

    function outroLayout() {
      const rail = outroRailRef.current;
      const cta = ctaRef.current;
      if (!rail || !cta) return;
      railLine = rail.querySelector("line");
      // offsetParent = .hero-stage (sticky konumlandırılmış sayılır).
      const stage = cta.offsetParent as HTMLElement | null;
      const stageH = stage?.offsetHeight ?? window.innerHeight;
      railTopPx = stageH * OUTRO_RAIL_TOP_RATIO;
      // Durma noktası masaüstünde CTA satırının DİKEY MERKEZİ (ray orada
      // butonların arasındaki boşluğa denk geliyor). Mobilde CTA artık tam
      // genişlikte (gutter'dan gutter'a) akıyor ve rayın x'i (%68) ikinci
      // butonun ÜSTÜNE denk geliyor — merkezde durursa çizgi butonun
      // gövdesinden geçer. Mobilde bu yüzden durma noktası satırın ÜSTÜ:
      // nokta rayı çizip butonların hemen üstünde duruyor, "raydan çıkan
      // CTA" okuması bozulmuyor ama çizgi buton metnine binmiyor.
      const restY = mobile ? cta.offsetTop - 10 : cta.offsetTop + cta.offsetHeight / 2;
      railSpanPx = Math.max(restY - railTopPx, 1);
      // Ray tam olarak tepe noktasıyla durma noktası arasını kaplar; viewBox
      // `preserveAspectRatio: none` ile bu yüksekliğe gerilir (x ölçeği 1
      // kaldığı için çizgi kalınlığı bozulmaz).
      rail.style.top = `${railTopPx.toFixed(1)}px`;
      rail.style.height = `${railSpanPx.toFixed(1)}px`;
    }

    function layout() {
      // stageInner sahneyi birebir kaplıyor (absolute inset-0); scale
      // transform'u offset/client ölçülerini etkilemez.
      const stage = stageInnerRef.current;
      stageH = stage?.offsetHeight || window.innerHeight;
      mobile = isMobile();
      mobileSource = mobileVideoMq.matches;
      const rect = section!.getBoundingClientRect();
      top = rect.top + window.scrollY;
      height = section!.offsetHeight;
      outroLayout();
      read();
    }

    /** Bir hizmet fazının tüm öğelerini yerel ilerlemeye göre sürer. */
    function drawServicePhase(index: number, q: number) {
      const root = phaseRootRefs.current[index];
      if (!root) return;

      const envelope = cue(
        q,
        PHASE_ENVELOPE.from,
        PHASE_ENVELOPE.to,
        PHASE_ENVELOPE.rIn,
        PHASE_ENVELOPE.rOut
      );
      root.style.opacity = String(envelope.toFixed(3));

      const icon = phaseIconRefs.current[index];
      if (icon) {
        // "ağdan doğuyormuş gibi": ölçek + bulanıklık birlikte çözülür
        const iv = cue(q, ICON_WINDOW.from, ICON_WINDOW.to, ICON_WINDOW.rIn, ICON_WINDOW.rOut);
        icon.style.opacity = String(iv.toFixed(3));
        icon.style.transform = `scale(${(0.62 + iv * 0.38).toFixed(3)})`;
        icon.style.filter = `blur(${((1 - iv) * 10).toFixed(2)}px)`;
      }

      const rule = phaseRuleRefs.current[index];
      if (rule) {
        // transform-origin: top → çubuk yukarıdan aşağı "çizilir"
        const rv = cue(q, RULE_WINDOW.from, RULE_WINDOW.to, RULE_WINDOW.rIn, RULE_WINDOW.rOut);
        rule.style.transform = `scaleY(${rv.toFixed(3)})`;
        rule.style.opacity = String(rv.toFixed(3));
      }

      const title = phaseTitleRefs.current[index];
      if (title) {
        const tv = cue(q, TITLE_WINDOW.from, TITLE_WINDOW.to, TITLE_WINDOW.rIn, TITLE_WINDOW.rOut);
        title.style.opacity = String(tv.toFixed(3));
        title.style.transform = `translate3d(0, ${((1 - tv) * 1.6).toFixed(2)}vh, 0)`;
      }

      const items = phaseItemRefs.current[index];
      if (items) {
        const linear = clamp01((q - ITEMS_FROM) / Math.max(ITEMS_TO - ITEMS_FROM, 0.0001));
        for (let i = 0; i < items.length; i++) {
          const el = items[i];
          if (!el) continue;
          const uv = staggerDraw(linear, i, items.length, ITEMS_SPREAD);
          el.style.opacity = String(uv.toFixed(3));
          el.style.transform = `translate3d(0, ${((1 - uv) * 1.1).toFixed(2)}vh, 0)`;
        }
      }

      zeroed[index] = false;
    }

    /** Görünmez fazı bir kez sıfırlar, sonra atlanır. */
    function zeroPhase(index: number) {
      if (zeroed[index]) return;
      const root = phaseRootRefs.current[index];
      if (root) root.style.opacity = "0";
      zeroed[index] = true;
    }

    /** Bir hizmet fazının video katmanını sürer: playhead + crossfade + lazy
     * pencere. İçerik koreografisinden (icon/title/items) ayrı tutulur. */
    function driveVideoLayer(index: number, q: number, inRange: boolean, current: number) {
      const layer = layerByPhase[index];
      if (!layer) return;
      layer.target = q;
      setLayerOpacity(layer, inRange ? cue(q, 0, 1, VIDEO_FADE.rIn, VIDEO_FADE.rOut) : 0);
      if (Math.abs(index - current) <= VIDEO_PRELOAD_RADIUS) ensureLoaded(layer);
      // Eager modda da bırakılır: iOS'ta en fazla 3 bağlı <video>. Blob
      // bellekte kaldığı için geri dönüşte yeniden bağlama anında.
      else unload(layer);
    }

    function read() {
      const y = window.scrollY;
      const travel = Math.max(height - stageH, 1);
      const p = clamp01((y - top) / travel);

      // Aktif faz — hem gösterge hem de klip yükleme penceresi bunu kullanır.
      let current = 0;
      for (let i = 0; i < HERO_PHASE_COUNT; i++) {
        if (p >= PHASE_RANGES[i].start) current = i;
      }

      // İlk hizmet fazı — faz 1'in devrini bu blok karşılıyor.
      const firstServiceIndex = INTRO_PHASE_INDEX + 1;

      // --- faz katmanı: yalnızca aktif faz sürülür ---
      for (let i = 0; i < HERO_PHASE_COUNT; i++) {
        if (HERO_PHASES[i].kind !== "service") continue;
        const { start, end } = PHASE_RANGES[i];
        const inRange = p >= start && p <= end;
        const q = phaseProgress(p, i);
        // Faz 2 kendi aralığından HANDOFF_SPAN kadar önce çizilmeye başlar:
        // faz 1'in çıkış hareketi sürerken sahneye girmesi gerekiyor.
        // Diğer 6 sınır dokunulmadan kalır.
        const early = i === firstServiceIndex && p >= start - HANDOFF_SPAN;
        if (inRange || early) {
          drawServicePhase(
            i,
            i === firstServiceIndex ? leadingPhaseProgress(p, i, HANDOFF_SPAN) : q
          );
        } else zeroPhase(i);
        driveVideoLayer(i, q, inRange, current);
      }

      const introQ = phaseProgress(p, INTRO_PHASE_INDEX);
      const resolveQ = phaseProgress(p, RESOLVE_PHASE_INDEX);
      const resolveRange = PHASE_RANGES[RESOLVE_PHASE_INDEX];
      const introRange = PHASE_RANGES[INTRO_PHASE_INDEX];

      // --- faz 1 → faz 2 devri: sınırın iki yanına yayılan TEK eğri ---
      const handoff = smooth(
        clamp01((p - (introRange.end - HANDOFF_SPAN)) / (HANDOFF_SPAN * 2))
      );
      // Faz 1 kopyası: blok yukarı kaymaya ve küçülmeye devam eder. Opaklık
      // burada YAZILMAZ — kelimeler kendi opaklıklarını sürüyor, ikisi birden
      // yazılsaydı çift sönme olurdu.
      if (introBlockRef.current) {
        introBlockRef.current.style.transform =
          `translate3d(0, ${(-handoff * HANDOFF_RISE_VH).toFixed(2)}vh, 0) ` +
          `scale(${(1 - handoff * HANDOFF_SCALE).toFixed(4)})`;
      }

      // --- faz 1'in dağılması: kelimeler kendi yön/hız/gecikmeleriyle savrulur.
      // Eğri handoff'tan SCATTER_LEAD kadar önce başlar, handoff ile aynı anda
      // biter — cümle blok hâlinde sönmek yerine "çözülür". ---
      const scatterU = smooth(
        clamp01((p - (introRange.end - SCATTER_LEAD)) / (SCATTER_LEAD + HANDOFF_SPAN))
      );
      {
        const lines = statementWordRefs.current;
        for (let li = 0; li < lines.length; li++) {
          const words = lines[li];
          if (!words) continue;
          for (let wi = 0; wi < words.length; wi++) {
            const el = words[wi];
            if (!el) continue;
            const s = scatterOf(li, wi);
            // staggerDraw'ın kesirli indeksle çağrımı: total=1 iken uStart
            // doğrudan order*spread olur, yani sıra soldan sağa değil hash'in
            // verdiği sırada ilerler.
            const u = staggerDraw(scatterU, s.order, 1, SCATTER_SPREAD);
            el.style.transform =
              `translate3d(${(s.x * u).toFixed(2)}vw, ${(-s.rise * u).toFixed(2)}vh, 0) ` +
              `rotate(${(s.rotate * u).toFixed(2)}deg)`;
            el.style.opacity = String((1 - u).toFixed(3));
            el.style.filter = u > 0.001 ? `blur(${(u * SCATTER_BLUR_PX).toFixed(2)}px)` : "";
          }
        }
      }
      // Alt başlık: aynı dil, daha sakin. Tek yön, rotasyon yok, kelimelerden
      // biraz önce sahneyi terk eder.
      if (subtitleRef.current) {
        const sv = smooth(
          clamp01(
            (p - (introRange.end - SCATTER_LEAD - SCATTER_SUB_LEAD)) /
              (SCATTER_LEAD + SCATTER_SUB_LEAD)
          )
        );
        subtitleRef.current.style.transform = `translate3d(${(-sv * SCATTER_SUB_SHIFT_VW).toFixed(2)}vw, 0, 0)`;
        subtitleRef.current.style.opacity = String((1 - sv).toFixed(3));
        subtitleRef.current.style.filter = sv > 0.001 ? `blur(${(sv * 3).toFixed(2)}px)` : "";
      }
      // Faz 2 bloğu: aynı eğrinin devamı olarak aşağıdan yükselir. Plato
      // boyunca handoff = 1 → transform sıfır, drawServicePhase'in kendi
      // koreografisine karışmaz.
      {
        const root = phaseRootRefs.current[firstServiceIndex];
        if (root && handoff > 0 && handoff < 1) {
          root.style.transform = `translate3d(0, ${((1 - handoff) * HANDOFF_ENTER_VH).toFixed(2)}vh, 0)`;
        } else if (root && root.style.transform) {
          root.style.transform = "";
        }
      }

      // --- kaydır ipucu: intro fazının ilk %25'inde kaybolur ---
      // Tekerlek noktasının döngüsü CSS keyframe'de (.hero-scroll-wheel);
      // burada yalnızca sarmalayıcı sürülür, iç SVG'ye dokunulmaz.
      const hint = 1 - smooth(clamp01(introQ / 0.25));
      if (scrollHintRef.current) {
        scrollHintRef.current.style.opacity = String((hint * HINT_OPACITY).toFixed(3));
        // Aşağı + sağa: dağılma dilinin en sakin tonu.
        scrollHintRef.current.style.transform =
          `translate3d(${((1 - hint) * 2).toFixed(2)}vw, ${((1 - hint) * 1.2).toFixed(2)}vh, 0)`;
      }

      // --- faz 8: kapanış sahnesi. Zemin beyaza döner; sayfanın 2/3
      // hattındaki dikey rayı bir nokta çizerek iner; slogan satırları o
      // raydan SOLA, CTA'lar ters yönde SAĞA çıkar; sağda nokta bulutu
      // küresi yerleşir. Hareketin tamamı scroll'a bağlı — CSS transition
      // YOK, tek istisna kürenin kendi dönüşü (bkz. Hero.tsx HeroOutroOrb).
      const wash = smooth(clamp01(resolveQ / OUTRO_WASH_TO));
      if (bgWashRef.current) bgWashRef.current.style.opacity = String(wash.toFixed(3));
      // Koyu okunurluk gradyanı beyaz sahnede ters etki yapar; onunla birlikte
      // açık zemin gradyanı devreye girer.
      if (scrimRef.current) scrimRef.current.style.opacity = String((1 - wash).toFixed(3));
      if (lightScrimRef.current) lightScrimRef.current.style.opacity = String(wash.toFixed(3));

      // Ray + nokta: TEK ilerleme. Nokta inişiyle rayın çizilme oranı aynı
      // değişkenden geldiği için çizgi her zaman tam noktanın arkasında biter.
      const railU = smooth(
        clamp01((resolveQ - OUTRO_RAIL_FROM) / (OUTRO_RAIL_TO - OUTRO_RAIL_FROM))
      );
      if (railLine) railLine.style.strokeDashoffset = (1 - railU).toFixed(4);
      if (outroDotRef.current) {
        const dotVis = smooth(
          clamp01((resolveQ - OUTRO_DOT_FROM) / (OUTRO_DOT_TO - OUTRO_DOT_FROM))
        );
        outroDotRef.current.style.opacity = dotVis.toFixed(3);
        outroDotRef.current.style.transform =
          `translate3d(0, ${(railTopPx + railU * railSpanPx).toFixed(1)}px, 0)`;
      }

      {
        // Slogan satırları: raydan sökülüp SOLA uzuyor. Başlangıç konumu
        // rayın sağında; her satırın kutusu (.hero-outro-slogan-line) sağ
        // kenarından raya yaslı ve kırpıyor, yani satır rayı geçene kadar
        // görünmüyor — "hattan çıkma" okuması buradan geliyor.
        //
        // Konum springOut ile yaylanıyor, opaklık monotonik u ile sürülüyor.
        const lines = outroLineRefs.current;
        const linear = clamp01(
          (resolveQ - OUTRO_LINES_FROM) / (OUTRO_LINES_TO - OUTRO_LINES_FROM)
        );
        for (let i = 0; i < lines.length; i++) {
          const el = lines[i];
          if (!el) continue;
          const u = staggerDraw(linear, i, lines.length, OUTRO_LINES_SPREAD);
          const rest = 1 - springOut(u);
          el.style.opacity = u.toFixed(3);
          el.style.transform = `translate3d(${(rest * OUTRO_LINES_SHIFT_VW).toFixed(2)}vw, 0, 0)`;
        }
      }

      // --- CTA: nokta CTA hizasında DURDUKTAN sonra, aynı raydan ama ters
      // yönde (sağa). Sarmalayıcı yalnızca opaklık ve tıklanabilirlik taşır;
      // transform butonların kendisinde — sarmalayıcının layout kutusu
      // noktanın durma y'sini veriyor, kaydırılamaz (bkz. outroLayout). ---
      if (ctaRef.current) {
        const cvis = smooth(
          clamp01((resolveQ - OUTRO_CTA_FROM) / (OUTRO_CTA_TO - OUTRO_CTA_FROM))
        );
        ctaRef.current.style.opacity = cvis.toFixed(3);
        const on = cvis > 0.5;
        if (on !== ctaOn) {
          ctaOn = on;
          ctaRef.current.style.pointerEvents = on ? "auto" : "none";
        }
        const items = ctaItemRefs.current;
        const shift = OUTRO_CTA_SHIFT_VW * (mobile ? OUTRO_MOBILE_SHIFT_DAMP : 1);
        for (let i = 0; i < items.length; i++) {
          const el = items[i];
          if (!el) continue;
          const u = staggerDraw(cvis, i, items.length, OUTRO_CTA_SPREAD);
          const rest = 1 - springOut(u);
          el.style.opacity = u.toFixed(3);
          // Negatif: butonlar rayın solundan çıkıp sağa yürüyor.
          el.style.transform = `translate3d(${(-rest * shift).toFixed(2)}vw, 0, 0)`;
        }
      }

      // --- küre: sahnenin son öğesi. Yalnızca görünürlük + giriş ölçeği
      // buradan; dönüş canvas'ın kendi rAF'ında (scroll'dan bağımsız, bkz.
      // Hero.tsx HeroOutroOrb). ---
      if (outroOrbRef.current) {
        const ovis = smooth(
          clamp01((resolveQ - OUTRO_ORB_FROM) / (OUTRO_ORB_TO - OUTRO_ORB_FROM))
        );
        outroOrbRef.current.style.opacity = ovis.toFixed(3);
        outroOrbRef.current.style.transform =
          `scale(${lerp(OUTRO_ORB_SCALE_FROM, 1, ovis).toFixed(4)})`;
      }

      // --- faz göstergesi: hizmet fazları boyunca görünür ---
      if (indicatorRef.current) {
        // (1 - wash): koyu zemin için ayarlanmış gri çizgiler beyaz sahnede
        // asılı kalmasın.
        const ivis = cue(p, introRange.end - INDICATOR_PAD, resolveRange.start + INDICATOR_PAD, 0.14, 0.14) * (1 - wash);
        indicatorRef.current.style.opacity = String(ivis.toFixed(3));
      }
      {
        if (current !== activeTick) {
          const prev = phaseTickRefs.current[activeTick];
          if (prev) prev.dataset.active = "false";
          const next = phaseTickRefs.current[current];
          if (next) next.dataset.active = "true";
          activeTick = current;
        }
      }

      // --- alt dok (mobil; masaüstünde CSS yalnızca klavye odağında
      // gösteriyor). Her frame yalnızca üç opaklık + aktif segmentin dolgusu
      // (transform) yazılır; segment durumları, aria-current ve sayaç metni
      // yalnızca faz DEĞİŞTİĞİNDE. ---
      {
        const dockVis = 1 - smooth(clamp01((p - (resolveRange.start - DOCK_PAD)) / DOCK_PAD));
        const navVis = smooth(clamp01((p - (introRange.end - DOCK_PAD)) / DOCK_PAD));
        const dock = dockRef.current;
        if (dock) {
          dock.style.opacity = dockVis.toFixed(3);
          const on = dockVis > 0.5;
          if (on !== dockOn) {
            dockOn = on;
            dock.style.pointerEvents = on ? "" : "none";
          }
        }
        if (dockCueRef.current) dockCueRef.current.style.opacity = hint.toFixed(3);
        if (dockStatusRef.current) dockStatusRef.current.style.opacity = navVis.toFixed(3);
        const nav = dockNavRef.current;
        if (nav) {
          nav.style.opacity = navVis.toFixed(3);
          // Dokun pointer-events'i çocuğun açık "auto"sunu ezmez — ikisi
          // birlikte hesaplanıyor.
          const on = navVis > 0.5 && dockVis > 0.5;
          if (on !== navOn) {
            navOn = on;
            nav.style.pointerEvents = on ? "auto" : "none";
          }
        }

        const kind = HERO_PHASES[current].kind;
        const seg =
          kind === "intro"
            ? -1
            : kind === "resolve"
              ? SERVICE_PHASES.length
              : SERVICE_PHASE_INDICES.indexOf(current);
        if (seg !== activeSeg) {
          const segs = dockSegRefs.current;
          for (let i = 0; i < segs.length; i++) {
            const el = segs[i];
            if (!el) continue;
            el.dataset.state = i < seg ? "done" : i === seg ? "active" : "todo";
            if (i === seg) el.setAttribute("aria-current", "step");
            else el.removeAttribute("aria-current");
          }
          // Önceki aktif dolgunun satır içi ölçeği bırakılır — "done"/"todo"
          // dolgusu CSS'ten gelir.
          const prevFill = dockFillRefs.current[activeSeg];
          if (prevFill) prevFill.style.transform = "";
          const phase = SERVICE_PHASES[seg];
          if (phase) {
            if (dockCountRef.current) dockCountRef.current.textContent = dockCount(seg);
            if (dockNameRef.current) dockNameRef.current.textContent = phase.title;
          }
          activeSeg = seg;
        }
        const fill = dockFillRefs.current[seg];
        if (fill) {
          fill.style.transform = `scaleX(${phaseProgress(p, current).toFixed(3)})`;
        }
      }

      // --- hafif push-in: resolve fazı ---
      if (stageInnerRef.current) {
        stageInnerRef.current.style.transform = `scale(${(1 + resolveQ * 0.06).toFixed(4)})`;
      }
    }

    /** Tek katmanın playhead'ini lerp'leyip seek eder. */
    function driveLayer(layer: VideoLayer, eps: number) {
      const el = layer.el;
      if (el.seeking) {
        const now = performance.now();
        if (!layer.stuckAt) layer.stuckAt = now;
        else if (now - layer.stuckAt > 700) {
          layer.stuckAt = now;
          try {
            el.currentTime = el.currentTime + 0.001;
          } catch {
            /* seek atlanır */
          }
        }
        return;
      }
      layer.stuckAt = 0;
      layer.cur += (layer.target - layer.cur) * 0.18;
      const t = clamp(layer.cur, 0, 0.999) * layer.duration;
      if (Math.abs(el.currentTime - t) > eps) {
        try {
          el.currentTime = t;
        } catch {
          /* seek atlanır */
        }
      }
    }

    const tick = () => {
      if (destroyed) return;
      const eps = mobile ? 0.02 : 0.008;

      for (const layer of layers) {
        if (!layer.ready) continue;
        if (layer.opacity <= 0.01) continue;
        driveLayer(layer, eps);
      }
      requestAnimationFrame(tick);
    };

    // Tüm klipler read() içindeki lazy pencereden yüklenir.

    // ---- iOS priming: sessiz video hiç play edilmeden seek edilirse
    // Safari kare boyamaz. İlk kullanıcı etkileşiminde bir kere primele.
    // Sonradan yüklenen katmanlar ensureLoaded içinde tek tek primelenir. ----
    //
    // Düşük Güç Modu (iOS) sessiz play()'i de reddeder (NotAllowedError);
    // o durumda yalnızca gerçek bir kullanıcı etkinleştirmesi (dokunup
    // bırakma, tık, tuş) kilidi açar. Reddedildikten sonra scroll/touchstart
    // gibi etkinleştirme sayılmayan olaylarda play() tekrar denenmez — her
    // scroll karesinde boşuna reddedilen bir istek atılıyordu. Bu arada
    // katmanda poster görünür.
    //
    // Priming KATMAN BAŞINA izlenir: yalnızca bağlı (≤3) ve henüz
    // primelenmemiş katmanlar play() alır. Eskiden tek bir başarısız play()
    // global bayrağı düşürüyor, sonraki her scroll olayı TÜM bağlı klipleri
    // yeniden play()/pause()'a sokuyordu.
    /** Bir etkileşim (dokunuş/scroll/tuş) oldu mu — sonradan bağlanan katman
     * loadedmetadata'da bu bayrağa bakıp kendini primeler. */
    let activated = false;
    let blockedByPolicy = false;
    const priming = new Set<VideoLayer>();
    function primeLayer(layer: VideoLayer) {
      if (!layer.el.src || layer.primed || priming.has(layer)) return;
      const src = layer.el.src;
      let pr: Promise<void> | undefined;
      try {
        pr = layer.el.play();
      } catch (err) {
        log("play() hata", layer.phaseIndex, err);
        return;
      }
      if (pr && pr.then) {
        priming.add(layer);
        pr.then(
          () => {
            priming.delete(layer);
            // Arada çözülüp başka src bağlandıysa bu sonuç eskisine ait.
            if (layer.el.src !== src) return;
            layer.el.pause();
            layer.primed = true;
            blockedByPolicy = false;
            log("primed", layer.phaseIndex);
          },
          (err: unknown) => {
            priming.delete(layer);
            const name = err instanceof DOMException ? err.name : String(err);
            if (name === "NotAllowedError") blockedByPolicy = true;
            log("play() reddedildi", layer.phaseIndex, name, err);
          }
        );
      } else {
        layer.el.pause();
        layer.primed = true;
      }
    }
    function primeAttached() {
      for (const layer of layers) if (layer.blobUrl) primeLayer(layer);
    }
    const ACTIVATION_EVENTS = new Set(["touchend", "pointerup", "click", "keydown"]);
    const prime = (event: Event) => {
      if (blockedByPolicy && !ACTIVATION_EVENTS.has(event.type)) return;
      activated = true;
      primeAttached();
    };
    // Dok düğmeleri (scrollToPhase / skipHero) bunu click işleyicisinin
    // İÇİNDE, smooth scroll'dan önce çağırır — dokunuş kesin etkinleştirme
    // sayılır, pencere dinleyicilerinin sırasına bırakılmaz.
    activateRef.current = () => {
      blockedByPolicy = false;
      activated = true;
      primeAttached();
    };
    const primeEvents: (keyof WindowEventMap)[] = [
      "touchstart",
      "touchend",
      "pointerdown",
      "pointerup",
      "click",
      "keydown",
      "scroll",
    ];
    primeEvents.forEach((ev) => window.addEventListener(ev, prime, { passive: true }));

    // ---- ölçüm ve dinleyiciler ----
    layout();

    // Mobil eager: posterler (toplam ~130 KB) hemen — hiçbir faz boş koyu
    // katman göstermesin; sonra klipler faz sırasıyla arka planda.
    if (eager) {
      layers.forEach(setPoster);
      void prefetchAll();
    }

    let ticking = false;
    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          read();
          ticking = false;
        });
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", layout, { passive: true });
    requestAnimationFrame(tick);

    return () => {
      destroyed = true;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", layout);
      primeEvents.forEach((ev) => window.removeEventListener(ev, prime));
      activateRef.current = null;
      net.abort();
      layers.forEach((layer) => {
        if (layer.blobUrl) URL.revokeObjectURL(layer.blobUrl);
      });
    };
  }, []);

  /**
   * Dokun iki eylemi. Ölçüm dokunma ANINDA bir kez yapılır (frame başına
   * değil); formül read()'inkiyle aynı: travel = section − sahne yüksekliği
   * (100svh — innerHeight DEĞİL, adres çubuğu oynadıkça kaymasın).
   *
   * iOS priming: ikisi de önce activateRef'i çağırır — click işleyicisinin
   * içinde, yani kullanıcı etkinleştirmesi sürerken ve smooth scroll
   * başlamadan bağlı klipler primelenir. Pencere dinleyicileri
   * (ACTIVATION_EVENTS) yedek olarak kalıyor.
   *
   * scroll-snap YOK — scrub'la savaşırdı; iniş noktası PHASE_SETTLE_Q.
   */
  function heroGeometry() {
    const section = sectionRef.current;
    if (!section) return null;
    const stageH = stageInnerRef.current?.offsetHeight || window.innerHeight;
    return {
      section,
      top: section.getBoundingClientRect().top + window.scrollY,
      height: section.offsetHeight,
      travel: Math.max(section.offsetHeight - stageH, 1),
    };
  }

  function scrollToPhase(phaseIndex: number) {
    activateRef.current?.();
    const geo = heroGeometry();
    const range = PHASE_RANGES[phaseIndex];
    if (!geo || !range) return;
    const p = range.start + PHASE_SETTLE_Q * (range.end - range.start);
    window.scrollTo({ top: Math.round(geo.top + p * geo.travel), behavior: "smooth" });
  }

  function skipHero(moveFocus: boolean) {
    activateRef.current?.();
    const geo = heroGeometry();
    if (!geo) return;
    window.scrollTo({ top: Math.round(geo.top + geo.height), behavior: "smooth" });
    if (!moveFocus) return;
    // Klavye kullanıcısı odakla birlikte taşınır; yoksa bir sonraki Tab onu
    // hero'nun içine geri sokardı.
    const next = geo.section.nextElementSibling;
    if (next instanceof HTMLElement) {
      if (!next.hasAttribute("tabindex")) next.tabIndex = -1;
      next.focus({ preventScroll: true });
    }
  }

  return {
    sectionRef,
    stageInnerRef,
    mediaVideoRefs,
    bgWashRef,
    scrimRef,
    lightScrimRef,
    scrollHintRef,
    introBlockRef,
    statementWordRefs,
    subtitleRef,
    ctaRef,
    ctaItemRefs,
    outroRailRef,
    outroDotRef,
    outroLineRefs,
    outroOrbRef,
    phaseRootRefs,
    phaseIconRefs,
    phaseRuleRefs,
    phaseTitleRefs,
    phaseItemRefs,
    indicatorRef,
    phaseTickRefs,
    dockRef,
    dockCueRef,
    dockStatusRef,
    dockCountRef,
    dockNameRef,
    dockNavRef,
    dockSegRefs,
    dockFillRefs,
    scrollToPhase,
    skipHero,
  };
}
