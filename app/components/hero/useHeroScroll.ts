"use client";

import { useEffect, useRef } from "react";
import {
  HERO_PHASES,
  HERO_PHASE_COUNT,
  INTRO_PHASE_INDEX,
  PHASE_RANGES,
  RESOLVE_PHASE_INDEX,
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
/** Path'lerin/kalemlerin sırayla (staggered) belirmesi için — motorun kinetic
 * metin stagger'ıyla aynı formül. Logo çiziminde ve hizmet kalemlerinde
 * aynısı kullanılıyor ki iki hareket aynı ritmi paylaşsın. */
function staggerDraw(linear: number, index: number, total: number, spread = 0.62) {
  const uStart = (index / Math.max(total, 1)) * spread;
  return smooth(clamp01((linear - uStart) / (1 - spread + 0.0001)));
}
/** Faz aralığı içindeki yerel ilerleme. */
function phaseProgress(p: number, index: number) {
  const { start, end } = PHASE_RANGES[index];
  return clamp01((p - start) / Math.max(end - start, 0.0001));
}

const isMobile = () =>
  typeof window !== "undefined" && window.matchMedia("(max-width: 860px)").matches;

/**
 * Klibin hero boyunca kaç kez taranacağı. 1 = tek doğrusal geçiş.
 * >1 denemeden önce: klip kusursuz loop'lamıyor ve geri seek sparse-GOP
 * h264'te pahalı (dense-GOP re-encode kapsam dışı — bkz. design-system.md).
 */
const HERO_VIDEO_CYCLES = 1;

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

export interface HeroScrollHandle {
  sectionRef: React.RefObject<HTMLElement | null>;
  stageInnerRef: React.RefObject<HTMLDivElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  vignetteRef: React.RefObject<HTMLDivElement | null>;
  scrollHintRef: React.RefObject<HTMLDivElement | null>;
  logoLayerRef: React.RefObject<HTMLDivElement | null>;
  logoStrokeWrapRef: React.RefObject<HTMLDivElement | null>;
  logoSolidWrapRef: React.RefObject<HTMLDivElement | null>;
  logoPathRefs: React.RefObject<Array<SVGPathElement | SVGPolygonElement | null>>;
  title1Ref: React.RefObject<HTMLSpanElement | null>;
  title2Ref: React.RefObject<HTMLSpanElement | null>;
  subtitleRef: React.RefObject<HTMLParagraphElement | null>;
  ctaRef: React.RefObject<HTMLDivElement | null>;
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
export function useHeroScroll(videoSrc: string, logoPathCount: number): HeroScrollHandle {
  const sectionRef = useRef<HTMLElement>(null);
  const stageInnerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const logoLayerRef = useRef<HTMLDivElement>(null);
  const logoStrokeWrapRef = useRef<HTMLDivElement>(null);
  const logoSolidWrapRef = useRef<HTMLDivElement>(null);
  const logoPathRefs = useRef<Array<SVGPathElement | SVGPolygonElement | null>>([]);
  const title1Ref = useRef<HTMLSpanElement>(null);
  const title2Ref = useRef<HTMLSpanElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const phaseRootRefs = useRef<Array<HTMLDivElement | null>>([]);
  const phaseIconRefs = useRef<Array<HTMLDivElement | null>>([]);
  const phaseRuleRefs = useRef<Array<HTMLDivElement | null>>([]);
  const phaseTitleRefs = useRef<Array<HTMLHeadingElement | null>>([]);
  const phaseItemRefs = useRef<Array<Array<HTMLLIElement | null>>>([]);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const phaseTickRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    let vh = window.innerHeight;
    let top = 0;
    let height = 0;
    const pathLengths: number[] = [];
    let ctaOn = false;
    let blobUrl: string | null = null;
    let destroyed = false;

    // Fazların çoğu her frame'de görünmez. Görünmez bir fazın ~9 node'una
    // stil yazmak boşuna "Recalculate Style" maliyeti — bir kez sıfırlayıp
    // o faz tekrar aktif olana dek atlıyoruz.
    const zeroed: boolean[] = new Array(HERO_PHASE_COUNT).fill(false);
    let activeTick = -1;

    const playhead = { cur: 0, target: 0, ready: false, duration: 1, stuckAt: 0 };

    function measureLogoLengths() {
      logoPathRefs.current.forEach((el, i) => {
        if (!el) return;
        const len = el.getTotalLength();
        pathLengths[i] = len;
        el.style.strokeDasharray = String(len);
        el.style.strokeDashoffset = String(len);
      });
    }

    function layout() {
      vh = window.innerHeight;
      const rect = section!.getBoundingClientRect();
      top = rect.top + window.scrollY;
      height = section!.offsetHeight;
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

    function read() {
      const y = window.scrollY;
      const travel = Math.max(height - vh, 1);
      const p = clamp01((y - top) / travel);

      playhead.target = HERO_VIDEO_CYCLES === 1 ? p : (p * HERO_VIDEO_CYCLES) % 1;

      // --- faz katmanı: yalnızca aktif faz sürülür ---
      for (let i = 0; i < HERO_PHASE_COUNT; i++) {
        if (HERO_PHASES[i].kind !== "service") continue;
        const { start, end } = PHASE_RANGES[i];
        if (p >= start && p <= end) drawServicePhase(i, phaseProgress(p, i));
        else zeroPhase(i);
      }

      const introQ = phaseProgress(p, INTRO_PHASE_INDEX);
      const resolveQ = phaseProgress(p, RESOLVE_PHASE_INDEX);
      const resolveRange = PHASE_RANGES[RESOLVE_PHASE_INDEX];
      const introRange = PHASE_RANGES[INTRO_PHASE_INDEX];

      // --- logo: intro fazında stagger'lı çizim (LOGO_ELEMENT_COUNT === 4,
      // granülarite düşük — çizimi 8 faza yaymak yerine tek faza sığdırıyoruz) ---
      const logoLinear = clamp01((introQ - 0.08) / 0.7);
      for (let i = 0; i < logoPathRefs.current.length; i++) {
        const el = logoPathRefs.current[i];
        const len = pathLengths[i];
        if (!el || !len) continue;
        const uv = staggerDraw(logoLinear, i, logoPathCount);
        el.style.strokeDashoffset = String(len * (1 - uv));
      }
      // Hizmet fazları boyunca logo sönük bir marka izi; resolve'da geri döner.
      if (logoLayerRef.current) {
        const dim = 0.22 + 0.78 * Math.max(cue(p, 0, introRange.end, 0.5, 0.35), smooth(resolveQ / 0.35));
        logoLayerRef.current.style.opacity = String(clamp01(dim).toFixed(3));
      }
      // resolve fazının ilk üçte birinde dolu logoya crossfade
      const solidVis = smooth(clamp01((resolveQ - 0.12) / 0.22));
      if (logoStrokeWrapRef.current) logoStrokeWrapRef.current.style.opacity = String(1 - solidVis);
      if (logoSolidWrapRef.current) logoSolidWrapRef.current.style.opacity = String(solidVis);

      // --- kaydır ipucu: intro fazının ilk %25'inde kaybolur ---
      if (scrollHintRef.current) {
        scrollHintRef.current.style.opacity = String(1 - smooth(clamp01(introQ / 0.25)));
      }

      // --- slogan: iki pencereli. Intro'da girer, faz 1 sonunda çıkar,
      // resolve'da CTA'lardan önce geri gelir. ---
      const introTitle1 = cue(introQ, 0.18, 1.0, 0.5, 0.14);
      const introTitle2 = cue(introQ, 0.42, 1.0, 0.5, 0.14);
      const resolveTitle = cue(resolveQ, 0.05, 1.0, 0.35, 0);

      const t1 = Math.max(introTitle1, resolveTitle);
      if (title1Ref.current) {
        title1Ref.current.style.opacity = String(t1.toFixed(3));
        title1Ref.current.style.transform = `translate3d(0, ${((1 - t1) * 2.4).toFixed(2)}vh, 0)`;
      }
      {
        const t2 = Math.max(introTitle2, resolveTitle);
        const t2transform = `translate3d(0, ${((1 - t2) * 2.4).toFixed(2)}vh, 0)`;
        if (title2Ref.current) {
          title2Ref.current.style.opacity = String(t2.toFixed(3));
          title2Ref.current.style.transform = t2transform;
        }
        if (subtitleRef.current) {
          subtitleRef.current.style.opacity = String(t2.toFixed(3));
          subtitleRef.current.style.transform = t2transform;
        }
      }

      // --- CTA: yalnızca resolve fazı; yeterince görünürken tıklanabilir ---
      if (ctaRef.current) {
        const cvis = cue(resolveQ, 0.34, 1.0, 0.5, 0);
        ctaRef.current.style.opacity = String(cvis.toFixed(3));
        ctaRef.current.style.transform = `translate3d(0, ${((1 - cvis) * 1.6).toFixed(2)}vh, 0)`;
        const on = cvis > 0.5;
        if (on !== ctaOn) {
          ctaOn = on;
          ctaRef.current.style.pointerEvents = on ? "auto" : "none";
        }
      }

      // --- faz göstergesi: hizmet fazları boyunca görünür ---
      if (indicatorRef.current) {
        const ivis = cue(p, introRange.end - 0.03, resolveRange.start + 0.03, 0.14, 0.14);
        indicatorRef.current.style.opacity = String(ivis.toFixed(3));
      }
      {
        let current = 0;
        for (let i = 0; i < HERO_PHASE_COUNT; i++) {
          if (p >= PHASE_RANGES[i].start) current = i;
        }
        if (current !== activeTick) {
          const prev = phaseTickRefs.current[activeTick];
          if (prev) prev.dataset.active = "false";
          const next = phaseTickRefs.current[current];
          if (next) next.dataset.active = "true";
          activeTick = current;
        }
      }

      // --- kamera ağın içinden geçiyor hissi: resolve fazı ---
      if (stageInnerRef.current) {
        stageInnerRef.current.style.transform = `scale(${(1 + resolveQ * 0.06).toFixed(4)})`;
      }
      if (vignetteRef.current) {
        vignetteRef.current.style.opacity = String((resolveQ * 0.35).toFixed(3));
      }
    }

    const tick = () => {
      if (destroyed) return;
      if (playhead.ready) {
        const eps = isMobile() ? 0.02 : 0.008;
        if (video.seeking) {
          const now = performance.now();
          if (!playhead.stuckAt) playhead.stuckAt = now;
          else if (now - playhead.stuckAt > 700) {
            playhead.stuckAt = now;
            try {
              video.currentTime = video.currentTime + 0.001;
            } catch {
              /* seek atlanır */
            }
          }
        } else {
          playhead.stuckAt = 0;
          playhead.cur += (playhead.target - playhead.cur) * 0.18;
          const t = clamp(playhead.cur, 0, 0.999) * playhead.duration;
          if (Math.abs(video.currentTime - t) > eps) {
            try {
              video.currentTime = t;
            } catch {
              /* seek atlanır */
            }
          }
        }
      }
      requestAnimationFrame(tick);
    };

    // ---- blob-preload video (güvenilir seek için) ----
    // AbortController şart: reduced-motion kullanıcısında SSR önce bu dalı
    // basıyor (server snapshot false), hydration'da HeroReduced'a geçiliyor.
    // Abort olmazsa o birkaç ms'de başlayan 7.4 MB indirme, hook unmount
    // olduktan sonra da arka planda sürüyor.
    const controller = new AbortController();
    fetch(videoSrc, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.blob();
      })
      .then((blob) => {
        if (destroyed) return;
        blobUrl = URL.createObjectURL(blob);
        video.addEventListener(
          "loadedmetadata",
          () => {
            playhead.ready = true;
            playhead.duration = video.duration || 1;
            try {
              video.currentTime = Math.max(playhead.target * playhead.duration, 0.001);
            } catch {
              /* seek atlanır */
            }
            read();
          },
          { once: true }
        );
        video.preload = "auto";
        video.muted = true;
        video.playsInline = true;
        video.src = blobUrl;
      })
      .catch(() => {
        /* video yüklenemezse poster ekranda kalır */
      });

    // ---- iOS priming: sessiz video hiç play edilmeden seek edilirse
    // Safari kare boyamaz. İlk kullanıcı etkileşiminde bir kere primele. ----
    let primed = false;
    const prime = () => {
      if (primed || !video.src) return;
      primed = true;
      const p = video.play();
      if (p && p.then) {
        p.then(
          () => video.pause(),
          () => {
            primed = false;
          }
        );
      } else {
        video.pause();
      }
    };
    const primeEvents: (keyof WindowEventMap)[] = ["touchstart", "touchend", "pointerdown", "click", "scroll"];
    primeEvents.forEach((ev) => window.addEventListener(ev, prime, { passive: true }));

    // ---- ölçüm ve dinleyiciler ----
    // Ref dizileri remount/HMR'da bayat girdi taşımasın diye kırpılır.
    logoPathRefs.current.length = logoPathCount;
    measureLogoLengths();
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
      controller.abort();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", layout);
      primeEvents.forEach((ev) => window.removeEventListener(ev, prime));
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [videoSrc, logoPathCount]);

  return {
    sectionRef,
    stageInnerRef,
    videoRef,
    vignetteRef,
    scrollHintRef,
    logoLayerRef,
    logoStrokeWrapRef,
    logoSolidWrapRef,
    logoPathRefs,
    title1Ref,
    title2Ref,
    subtitleRef,
    ctaRef,
    phaseRootRefs,
    phaseIconRefs,
    phaseRuleRefs,
    phaseTitleRefs,
    phaseItemRefs,
    indicatorRef,
    phaseTickRefs,
  };
}
