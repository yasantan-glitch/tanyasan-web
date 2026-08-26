"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { HeroLogoSolid, HeroLogoStroke, LOGO_ELEMENT_COUNT } from "./HeroLogo";
import { useHeroScroll } from "./useHeroScroll";

const VIDEO_SRC = "/hero-network.mp4";
const POSTER_SRC = "/hero-poster.jpg";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}
function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}
function getReducedMotionServerSnapshot() {
  return false;
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
}

const heroTitleStyle: React.CSSProperties = {
  fontSize: "var(--text-display-hero)",
  lineHeight: "var(--text-display-hero--line-height)",
  letterSpacing: "var(--text-display-hero--letter-spacing)",
};

const ctaLinkClass =
  "eyebrow px-6 py-3 rounded-(--radius-sm) transition-colors duration-(--duration-base)";

export default function Hero() {
  const reduced = useReducedMotion();
  return reduced ? <HeroReduced /> : <HeroInteractive />;
}

/** Ana, scroll-scrubbing'li hero. prefers-reduced-motion: no-preference. */
function HeroInteractive() {
  const {
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
  } = useHeroScroll(VIDEO_SRC, LOGO_ELEMENT_COUNT);

  return (
    <section ref={sectionRef} className="relative" style={{ height: "var(--hero-span)" }}>
      <div className="hero-stage">
        <div ref={stageInnerRef} className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={posterRef} src={POSTER_SRC} alt="" className="hero-media" />
          <video
            ref={videoRef}
            className="hero-media hero-video"
            muted
            playsInline
            preload="none"
            aria-hidden="true"
          />
        </div>
        <div className="hero-scrim" />
        <div ref={vignetteRef} className="hero-vignette" />

        <div className="hero-logo-layer">
          <div
            ref={logoStrokeWrapRef}
            style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}
          >
            <HeroLogoStroke pathRefs={logoPathRefs} />
          </div>
          <div
            ref={logoSolidWrapRef}
            style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", opacity: 0 }}
          >
            <HeroLogoSolid />
          </div>
        </div>

        <div
          ref={scrollHintRef}
          className="eyebrow absolute inset-x-0 bottom-8 flex justify-center text-fg-on-ink-muted"
          style={{ color: "var(--color-fg-on-ink-muted)" }}
        >
          kaydır ↓
        </div>

        <div className="absolute inset-x-0 bottom-0 px-(--spacing-gutter) pb-(--spacing-section-tight)">
          <h1 className="font-display font-extrabold" style={heroTitleStyle}>
            <span
              ref={title1Ref}
              className="text-accent-auto block"
              style={{ opacity: 0, color: "var(--color-accent)" }}
            >
              FARK YARATAN TASARIM,
            </span>
            <span
              ref={title2Ref}
              className="block"
              style={{ opacity: 0, color: "var(--color-fg-on-ink)" }}
            >
              İŞLEYEN SİSTEM
            </span>
          </h1>
          <p
            ref={subtitleRef}
            className="text-lead mt-8 max-w-(--container-prose)"
            style={{ opacity: 0, color: "var(--color-fg-on-ink-body)" }}
          >
            Markanızı görünür kılın, süreçlerinizi hızlandırın.
          </p>
          <div ref={ctaRef} className="mt-10 flex flex-wrap gap-4" style={{ opacity: 0, pointerEvents: "none" }}>
            <Link
              href="/hizmetler"
              className={`${ctaLinkClass} bg-(--color-accent) text-(--color-ink-900) hover:bg-(--color-accent-hi)`}
            >
              Hizmetler
            </Link>
            <Link
              href="/portfolyo"
              className={`${ctaLinkClass} border-hairline border hover:border-(--color-accent)`}
              style={{ color: "var(--color-fg-on-ink)" }}
            >
              Projelerimiz
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/** prefers-reduced-motion: reduce — durağan kare + tek seferlik fade-in. */
function HeroReduced() {
  return (
    <section className="hero-stage relative" style={{ position: "relative", height: "100svh" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={POSTER_SRC} alt="" className="hero-media" />
      <div className="hero-scrim" />

      <div className="hero-logo-layer">
        <HeroLogoSolid />
      </div>

      <div className="absolute inset-x-0 bottom-0 px-(--spacing-gutter) pb-(--spacing-section-tight)">
        <h1 className="font-display font-extrabold" style={heroTitleStyle}>
          <span className="block" style={{ color: "var(--color-accent)" }}>
            FARK YARATAN TASARIM,
          </span>
          <span className="block" style={{ color: "var(--color-fg-on-ink)" }}>
            İŞLEYEN SİSTEM
          </span>
        </h1>
        <p className="text-lead mt-8 max-w-(--container-prose)" style={{ color: "var(--color-fg-on-ink-body)" }}>
          Markanızı görünür kılın, süreçlerinizi hızlandırın.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/hizmetler"
            className={`${ctaLinkClass} bg-(--color-accent) text-(--color-ink-900) hover:bg-(--color-accent-hi)`}
          >
            Hizmetler
          </Link>
          <Link
            href="/portfolyo"
            className={`${ctaLinkClass} border-hairline border hover:border-(--color-accent)`}
            style={{ color: "var(--color-fg-on-ink)" }}
          >
            Projelerimiz
          </Link>
        </div>
      </div>
    </section>
  );
}
