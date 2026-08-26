"use client";

import { useEffect, useRef } from "react";

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
/** Path'lerin sırayla (staggered) çizilmesi için — motorun kinetic metin
 * stagger'ıyla aynı formül. */
function staggerDraw(linear: number, index: number, total: number, spread = 0.62) {
  const uStart = (index / Math.max(total, 1)) * spread;
  return smooth(clamp01((linear - uStart) / (1 - spread + 0.0001)));
}

const isMobile = () =>
  typeof window !== "undefined" && window.matchMedia("(max-width: 860px)").matches;

export interface HeroScrollHandle {
  sectionRef: React.RefObject<HTMLElement | null>;
  stageInnerRef: React.RefObject<HTMLDivElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  posterRef: React.RefObject<HTMLImageElement | null>;
  vignetteRef: React.RefObject<HTMLDivElement | null>;
  scrollHintRef: React.RefObject<HTMLDivElement | null>;
  logoStrokeWrapRef: React.RefObject<HTMLDivElement | null>;
  logoSolidWrapRef: React.RefObject<HTMLDivElement | null>;
  logoPathRefs: React.MutableRefObject<Array<SVGGeometryElement | null>>;
  title1Ref: React.RefObject<HTMLSpanElement | null>;
  title2Ref: React.RefObject<HTMLSpanElement | null>;
  subtitleRef: React.RefObject<HTMLParagraphElement | null>;
  ctaRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Hero'nun scroll-scrubbing motoru. scrollcraft.js'in tekniklerinin
 * (sticky-pin + normalize progress, lerp'lenmiş/deadband'li video playhead,
 * blob-preload, iOS priming) React'e portu — bkz. plan §1.
 *
 * Per-frame değerler React state'i olarak TUTULMUYOR; read()/tick() ref'lenmiş
 * DOM node'larına doğrudan yazıyor. Bu yalnızca reduced-motion KAPALIYKEN
 * mount edilmeli (Hero.tsx dallanmasında).
 */
export function useHeroScroll(videoSrc: string, logoPathCount: number): HeroScrollHandle {
  const sectionRef = useRef<HTMLElement>(null);
  const stageInnerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const logoStrokeWrapRef = useRef<HTMLDivElement>(null);
  const logoSolidWrapRef = useRef<HTMLDivElement>(null);
  const logoPathRefs = useRef<Array<SVGGeometryElement | null>>([]);
  const title1Ref = useRef<HTMLSpanElement>(null);
  const title2Ref = useRef<HTMLSpanElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

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

    function read() {
      const y = window.scrollY;
      const travel = Math.max(height - vh, 1);
      const p = clamp01((y - top) / travel);

      playhead.target = p;

      // --- logo: [0.20, 0.80] penceresinde stagger'lı çizim ---
      const logoLinear = clamp01((p - 0.2) / 0.6);
      const n = logoPathCount;
      for (let i = 0; i < logoPathRefs.current.length; i++) {
        const el = logoPathRefs.current[i];
        const len = pathLengths[i];
        if (!el || !len) continue;
        const uv = staggerDraw(logoLinear, i, n);
        el.style.strokeDashoffset = String(len * (1 - uv));
      }
      // çizim bitince (p>=0.8) dolu logoya crossfade
      const solidVis = smooth(clamp01((p - 0.76) / 0.06));
      if (logoStrokeWrapRef.current) logoStrokeWrapRef.current.style.opacity = String(1 - solidVis);
      if (logoSolidWrapRef.current) logoSolidWrapRef.current.style.opacity = String(solidVis);

      // --- kaydır ipucu: %0-18 arası görünür ---
      if (scrollHintRef.current) {
        const hint = 1 - smooth(clamp01(p / 0.18));
        scrollHintRef.current.style.opacity = String(hint);
      }

      // --- başlık 1. satır: %22'de girer, bir daha solmadan sona kadar kalır ---
      if (title1Ref.current) {
        const t1 = cue(p, 0.22, 1.0, 0.3, 0);
        title1Ref.current.style.opacity = String(t1);
        title1Ref.current.style.transform = `translate3d(0, ${((1 - t1) * 2.4).toFixed(2)}vh, 0)`;
      }

      // --- başlık 2. satır + alt başlık: %52'de girer, sona kadar kalır
      // (aynı cue, iki ayrı ref) ---
      {
        const t2 = cue(p, 0.52, 1.0, 0.3, 0);
        const t2transform = `translate3d(0, ${((1 - t2) * 2.4).toFixed(2)}vh, 0)`;
        if (title2Ref.current) {
          title2Ref.current.style.opacity = String(t2);
          title2Ref.current.style.transform = t2transform;
        }
        if (subtitleRef.current) {
          subtitleRef.current.style.opacity = String(t2);
          subtitleRef.current.style.transform = t2transform;
        }
      }

      // --- CTA: %80-100, yalnızca yeterince görünürken tıklanabilir ---
      if (ctaRef.current) {
        const cvis = cue(p, 0.8, 1.0, 0.35, 0);
        ctaRef.current.style.opacity = String(cvis);
        ctaRef.current.style.transform = `translate3d(0, ${((1 - cvis) * 1.6).toFixed(2)}vh, 0)`;
        const on = cvis > 0.5;
        if (on !== ctaOn) {
          ctaOn = on;
          ctaRef.current.style.pointerEvents = on ? "auto" : "none";
        }
      }

      // --- kamera ağın içinden geçiyor hissi: %80-100 ---
      const camP = clamp01((p - 0.8) / 0.2);
      if (stageInnerRef.current) {
        stageInnerRef.current.style.transform = `scale(${(1 + camP * 0.06).toFixed(4)})`;
      }
      if (vignetteRef.current) {
        vignetteRef.current.style.opacity = String((camP * 0.35).toFixed(3));
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
    fetch(videoSrc)
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
    posterRef,
    vignetteRef,
    scrollHintRef,
    logoStrokeWrapRef,
    logoSolidWrapRef,
    logoPathRefs,
    title1Ref,
    title2Ref,
    subtitleRef,
    ctaRef,
  };
}
