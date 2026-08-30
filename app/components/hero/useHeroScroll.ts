"use client";

import { useEffect, useRef } from "react";
import { hash01 } from "./heroMath";
import {
  HERO_PHASES,
  HERO_PHASE_COUNT,
  INTRO_PHASE_INDEX,
  PHASE_RANGES,
  RESOLVE_PHASE_INDEX,
  isServicePhase,
} from "./heroPhases";

// ---- math helpers (scrollcraft'ın read() mantığının portu) ----------------
function clamp(x: number, a: number, b: number) {
  return x < a ? a : x > b ? b : x;
}
function clamp01(x: number) {
  return clamp(x, 0, 1);
}
function smooth(x: number) {
  x = clamp01(x);
  return x * x * (3 - 2 * x);
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
/** Girişte yumuşak geçiş, ortada plato, çıkışta yumuşak geçiş. */
function cue(p: number, from: number, to: number, rIn = 0.3, rOut = 0.3) {
  const win = Math.max(to - from, 0.0001);
  const inEnd = from + win * rIn;
  const outStart = to - win * rOut;
  if (p < from) return 0;
  if (p < inEnd) return smooth((p - from) / Math.max(inEnd - from, 0.0001));
  if (p <= outStart) return 1;
  return smooth(1 - (p - outStart) / Math.max(to - outStart, 0.0001));
}
/** Kalemlerin/kelimelerin sırayla (staggered) belirmesi için — motorun kinetic
 * metin stagger'ıyla aynı formül. Hizmet kalemlerinde ve faz 8'in kapanış
 * sloganında aynısı kullanılıyor ki iki hareket aynı ritmi paylaşsın. */
function staggerDraw(linear: number, index: number, total: number, spread = 0.62) {
  const uStart = (index / Math.max(total, 1)) * spread;
  return smooth(clamp01((linear - uStart) / (1 - spread + 0.0001)));
}
/**
 * Yaylanmalı yerleşme (sönümlü kosinüs). Hedefe varmadan önce bir miktar
 * aşıp geri salınır — kapanış sahnesinde satırlar ve butonlar sert durmasın
 * diye. YALNIZCA KONUMA uygulanır: opaklığa uygulansaydı overshoot 1'i aşıp
 * geri döndüğü için gözle görülür bir titreme olurdu (opaklık monotonik
 * `smooth` ile sürülüyor).
 *
 * t=0'da tam 0. t=1'de artık ~0.005 kalıyor (e^-5.2·cos 6.6); bu, en büyük
 * mesafede bile pikselin altında — yine de uçta sert olarak 1'e kilitleniyor
 * ki scroll geri geldiğinde tam kapanan bir eğri olsun.
 */
function springOut(t: number) {
  t = clamp01(t);
  if (t >= 1) return 1;
  return 1 - Math.exp(-5.2 * t) * Math.cos(6.6 * t);
}

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

const isMobile = () =>
  typeof window !== "undefined" && window.matchMedia("(max-width: 860px)").matches;

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
 * uzaklaşınca src'si bırakılır. Taban katman kavramı yok.
 */
interface VideoLayer {
  el: HTMLVideoElement;
  src: string;
  /** Faz indeksi (hizmet veya resolve). */
  phaseIndex: number;
  /** lerp'lenen ve hedef playhead — ikisi de [0,1] normalize. */
  cur: number;
  target: number;
  ready: boolean;
  duration: number;
  stuckAt: number;
  blobUrl: string | null;
  controller: AbortController | null;
  requested: boolean;
  /** Son yazılan opaklık — aynı değeri tekrar yazıp style recalc tetiklemeyiz. */
  opacity: number;
}

// ---- faz içi koreografi pencereleri (q ∈ [0,1], faza göre yerel) ----------
// Sıra: ikon ağdan doğar → ayraç iner → başlık → kalemler stagger'lı.
// Çıkış faz aralığının İÇİNDE biter (0.98) ve sonraki fazın girişi kendi
// aralığının %10'unda başlar; bu yüzden iki faz asla üst üste binmez.
const PHASE_ENVELOPE = { from: 0.06, to: 0.98, rIn: 0.14, rOut: 0.12 };
const ICON_WINDOW = { from: 0.1, to: 0.98, rIn: 0.16, rOut: 0.08 };
const RULE_WINDOW = { from: 0.18, to: 0.98, rIn: 0.16, rOut: 0.06 };
const TITLE_WINDOW = { from: 0.28, to: 0.98, rIn: 0.14, rOut: 0.06 };
const ITEMS_FROM = 0.3;
// Son kalem faz süresinin %46'sında yerine oturur. Bu değer plato uzunluğunu
// doğrudan belirliyor: giriş ne kadar geç biterse "her şey görünür" penceresi
// o kadar kısalır ve hızlı scroll'da kalemler okunmadan geçer.
const ITEMS_TO = 0.46;
const ITEMS_SPREAD = 0.55;

/**
 * Faz 1 → Faz 2 devri. Faz sınırının İKİ yanına yayılan tek bir eğri: faz 1'in
 * kopyası yukarı kayıp küçülerek çıkarken faz 2'nin bloğu aynı eğri üzerinde
 * aşağıdan sahneye giriyor. Crossfade (biri kapanır, diğeri açılır) yerine tek
 * bir devam eden hareket — sınırda duraklama/kesim hissi olmasın diye.
 *
 * Global p ekseninde ±HANDOFF_SPAN; faz 2 bu kadar erken çizilmeye başlar
 * (bkz. read()'te inRange'in bu faz için genişletilmesi). Değer faz 2'nin
 * payının (~0.137) beşte biri — kendi zarfı devralmadan önceki köprü.
 */
const HANDOFF_SPAN = 0.028;
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
const SCATTER_LEAD = 0.05;
const SCATTER_SPREAD = 0.5;
/** Kelime başına savrulma aralıkları — hash kanalları bu aralıklara eşlenir. */
const SCATTER_X_MIN_VW = 8;
const SCATTER_X_MAX_VW = 30;
const SCATTER_RISE_MIN_VH = 6;
const SCATTER_RISE_MAX_VH = 16;
const SCATTER_ROTATE_DEG = 7;
const SCATTER_BLUR_PX = 5;
/** Alt başlık aynı dili daha sakin konuşur: tek yön, rotasyon yok, biraz erken.
 * SCATTER_SUB_LEAD küçük tutulmalı — pencere `introEnd - SCATTER_LEAD - LEAD`
 * noktasında AÇILIYOR, yani büyük bir değer alt başlığı faz 1'in daha
 * başındayken soldurur (0.12'de sayfanın tepesinden itibaren sönüyordu). */
const SCATTER_SUB_SHIFT_VW = 6;
const SCATTER_SUB_LEAD = 0.02;

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
 * nefes alan bir nokta bulutu küresi.
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

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let vh = window.innerHeight;
    let top = 0;
    let height = 0;
    let ctaOn = false;
    let destroyed = false;
    /** matchMedia sonucu layout'ta bir kez okunur — her frame sorgulanmaz. */
    let mobile = isMobile();

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

    function addLayer(el: HTMLVideoElement, src: string, phaseIndex: number) {
      const layer: VideoLayer = {
        el,
        src,
        phaseIndex,
        cur: 0,
        target: 0,
        ready: false,
        duration: 1,
        stuckAt: 0,
        blobUrl: null,
        controller: null,
        requested: false,
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
      if (isServicePhase(phase)) addLayer(el, phase.videoSrc, i);
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
    // AbortController şart: reduced-motion kullanıcısında SSR önce bu dalı
    // basıyor (server snapshot false), hydration'da HeroReduced'a geçiliyor.
    // Abort olmazsa o birkaç ms'de başlayan indirme, hook unmount olduktan
    // sonra da arka planda sürüyor.
    function ensureLoaded(layer: VideoLayer) {
      if (layer.requested || destroyed) return;
      layer.requested = true;

      const controller = new AbortController();
      layer.controller = controller;
      fetch(layer.src, { signal: controller.signal })
        .then((r) => {
          if (!r.ok) throw new Error(String(r.status));
          return r.blob();
        })
        .then((blob) => {
          // Arada unload olmuşsa (hızlı scroll) bu blob'u hiç bağlamıyoruz.
          if (destroyed || layer.controller !== controller) return;
          const url = URL.createObjectURL(blob);
          layer.blobUrl = url;
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
              if (primed) primeLayer(layer);
              read();
            },
            { once: true }
          );
          layer.el.preload = "auto";
          layer.el.muted = true;
          layer.el.playsInline = true;
          layer.el.src = url;
        })
        .catch(() => {
          /* klip yüklenemezse alttaki statik zemin / poster ekranda kalır */
        });
    }

    /** Uzaklaşan fazın klibini bellekten bırakır; geri scroll'da fetch HTTP
     * cache'ten döner. */
    function unload(layer: VideoLayer) {
      if (!layer.requested) return;
      layer.controller?.abort();
      layer.controller = null;
      if (layer.blobUrl) {
        URL.revokeObjectURL(layer.blobUrl);
        layer.blobUrl = null;
      }
      layer.el.removeAttribute("src");
      layer.el.load();
      layer.ready = false;
      layer.requested = false;
      layer.cur = 0;
      layer.stuckAt = 0;
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
      railSpanPx = Math.max(cta.offsetTop + cta.offsetHeight / 2 - railTopPx, 1);
      // Ray tam olarak tepe noktasıyla durma noktası arasını kaplar; viewBox
      // `preserveAspectRatio: none` ile bu yüksekliğe gerilir (x ölçeği 1
      // kaldığı için çizgi kalınlığı bozulmaz).
      rail.style.top = `${railTopPx.toFixed(1)}px`;
      rail.style.height = `${railSpanPx.toFixed(1)}px`;
    }

    function layout() {
      vh = window.innerHeight;
      mobile = isMobile();
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
      else unload(layer);
    }

    function read() {
      const y = window.scrollY;
      const travel = Math.max(height - vh, 1);
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
      if (scrollHintRef.current) {
        const hint = 1 - smooth(clamp01(introQ / 0.25));
        scrollHintRef.current.style.opacity = String((hint * 0.55).toFixed(3));
        // Aşağı + sağa: dağılma dilinin en sakin tonu.
        scrollHintRef.current.style.transform =
          `translate3d(${((1 - hint) * 2).toFixed(2)}vw, ${((1 - hint) * 1.2).toFixed(2)}vh, 0)`;
      }

      // --- faz 8: kapanış sahnesi. Zemin beyaza döner; sayfanın 2/3
      // hattındaki dikey rayı bir nokta çizerek iner; slogan satırları o
      // raydan SOLA, CTA'lar ters yönde SAĞA çıkar; sağda nokta bulutu
      // küresi yerleşir. Hareketin tamamı scroll'a bağlı — CSS transition
      // YOK, tek istisna kürenin kendi nefes döngüsü (bkz. .hero-outro-orb).
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
      // buradan; nefes alma ve renk döngüsü SVG'nin içindeki <g>'de sürekli
      // bir CSS animasyonu (scroll'dan bağımsız, reduced-motion'da kapalı). ---
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
        const ivis = cue(p, introRange.end - 0.03, resolveRange.start + 0.03, 0.14, 0.14) * (1 - wash);
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
    let primed = false;
    function primeLayer(layer: VideoLayer) {
      if (!layer.el.src) return;
      const pr = layer.el.play();
      if (pr && pr.then) {
        pr.then(
          () => layer.el.pause(),
          () => {
            primed = false;
          }
        );
      } else {
        layer.el.pause();
      }
    }
    const prime = () => {
      if (primed) return;
      const loaded = layers.filter((layer) => layer.el.src);
      if (!loaded.length) return;
      primed = true;
      loaded.forEach(primeLayer);
    };
    const primeEvents: (keyof WindowEventMap)[] = ["touchstart", "touchend", "pointerdown", "click", "scroll"];
    primeEvents.forEach((ev) => window.addEventListener(ev, prime, { passive: true }));

    // ---- ölçüm ve dinleyiciler ----
    layout();

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
      layers.forEach((layer) => {
        layer.controller?.abort();
        if (layer.blobUrl) URL.revokeObjectURL(layer.blobUrl);
      });
    };
  }, []);

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
  };
}
