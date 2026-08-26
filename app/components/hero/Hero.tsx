"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { HeroLogoSolid, HeroLogoStroke, LOGO_ELEMENT_COUNT } from "./HeroLogo";
import {
  HERO_PHASES,
  SERVICE_PHASES,
  isServicePhase,
  type HeroServicePhase,
} from "./heroPhases";
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
  // letter-spacing negatif olduğu için boşluk karakterinin iki yanından da
  // düşülüyor (harf→boşluk, boşluk→harf) — kelimeler görsel olarak
  // birbirine yapışıyor. word-spacing bu payı yalnızca kelime aralarında
  // geri veriyor, harfler arası sıkı görünüm korunuyor.
  wordSpacing: "0.12em",
};

const ctaLinkClass =
  "eyebrow px-6 py-3 rounded-(--radius-sm) transition-colors duration-(--duration-base)";

export default function Hero() {
  const reduced = useReducedMotion();
  return reduced ? <HeroReduced /> : <HeroInteractive />;
}

function HeroSlogan({
  title1Ref,
  title2Ref,
  subtitleRef,
  animated,
}: {
  title1Ref?: React.RefObject<HTMLSpanElement | null>;
  title2Ref?: React.RefObject<HTMLSpanElement | null>;
  subtitleRef?: React.RefObject<HTMLParagraphElement | null>;
  animated: boolean;
}) {
  const hidden = animated ? { opacity: 0 } : undefined;
  return (
    <>
      <h1 className="font-display font-extrabold" style={heroTitleStyle}>
        <span
          ref={title1Ref}
          className="block"
          style={{ ...hidden, color: "var(--color-accent)" }}
        >
          FARK YARATAN TASARIM,
        </span>
        <span
          ref={title2Ref}
          className="block"
          style={{ ...hidden, color: "var(--color-fg-on-ink)" }}
        >
          İŞLEYEN SİSTEM
        </span>
      </h1>
      <p
        ref={subtitleRef}
        className="text-lead mt-8 max-w-(--container-prose)"
        style={{ ...hidden, color: "var(--color-fg-on-ink-body)" }}
      >
        Markanızı görünür kılın, süreçlerinizi hızlandırın.
      </p>
    </>
  );
}

function HeroCtas() {
  return (
    <>
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
    </>
  );
}

/** Ana, scroll-scrubbing'li hero. prefers-reduced-motion: no-preference. */
function HeroInteractive() {
  const {
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
  } = useHeroScroll(VIDEO_SRC, LOGO_ELEMENT_COUNT);

  return (
    <section ref={sectionRef} className="relative" style={{ height: "var(--hero-span)" }}>
      <div className="hero-stage">
        <div ref={stageInnerRef} className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={POSTER_SRC} alt="" className="hero-media" />
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

        {/* Hizmet fazları — hepsi DOM'da, opaklıkları scroll'dan sürülüyor.
            aria-hidden VERİLMİYOR: opacity:0 ekran okuyucudan gizlemez, bu
            sayede AT kullanıcısı 6 hizmet ailesini sırayla okuyabiliyor. */}
        <div className="hero-phase-layer">
          {HERO_PHASES.map((phase, index) =>
            isServicePhase(phase) ? (
              <div
                key={phase.id}
                ref={(node) => {
                  phaseRootRefs.current[index] = node;
                }}
                className="hero-phase"
                style={{ opacity: 0 }}
              >
                <div
                  ref={(node) => {
                    phaseIconRefs.current[index] = node;
                  }}
                  className="hero-phase-icon"
                  style={{ opacity: 0 }}
                >
                  <phase.icon strokeWidth={1.5} aria-hidden="true" />
                </div>
                <div
                  ref={(node) => {
                    phaseRuleRefs.current[index] = node;
                  }}
                  className="hero-phase-rule"
                  style={{ opacity: 0, transform: "scaleY(0)" }}
                />
                <h2
                  ref={(node) => {
                    phaseTitleRefs.current[index] = node;
                  }}
                  className="hero-phase-title font-display"
                  style={{ opacity: 0 }}
                >
                  {phase.title}
                </h2>
                <ul className="hero-phase-items">
                  {phase.items.map((item, itemIndex) => (
                    <li
                      key={item}
                      ref={(node) => {
                        const list = (phaseItemRefs.current[index] ??= []);
                        list[itemIndex] = node;
                      }}
                      style={{ opacity: 0 }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null
          )}
        </div>

        <div ref={logoLayerRef} className="hero-logo-layer">
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

        {/* 8 fazlık yolda nerede olduğunu gösterir — dekoratif. */}
        <div ref={indicatorRef} className="hero-phase-indicator" style={{ opacity: 0 }} aria-hidden="true">
          {HERO_PHASES.map((phase, index) => (
            <span
              key={phase.id}
              ref={(node) => {
                phaseTickRefs.current[index] = node;
              }}
              className="hero-phase-tick"
              data-active="false"
            />
          ))}
        </div>

        <div
          ref={scrollHintRef}
          className="eyebrow absolute inset-x-0 bottom-8 flex justify-center"
          style={{ color: "var(--color-fg-on-ink-muted)" }}
        >
          kaydır ↓
        </div>

        <div className="absolute inset-x-0 bottom-0 px-(--spacing-gutter) pb-(--spacing-section-tight)">
          <HeroSlogan
            animated
            title1Ref={title1Ref}
            title2Ref={title2Ref}
            subtitleRef={subtitleRef}
          />
          <div ref={ctaRef} className="mt-10 flex flex-wrap gap-4" style={{ opacity: 0, pointerEvents: "none" }}>
            <HeroCtas />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * prefers-reduced-motion: reduce — video, scrub ve rAF döngüsü hiç mount
 * edilmez. 8 fazın taşıdığı bilginin tamamı statik olarak verilir: durağan
 * kare + hairline ayraçlı hizmet listesi (kart grid'i değil —
 * bkz. docs/design-system.md §4). İçerik heroPhases.ts'ten geliyor, iki
 * dalda kopyalanmıyor.
 */
function HeroReduced() {
  return (
    <>
      <section className="hero-stage-static">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={POSTER_SRC} alt="" className="hero-media" />
        <div className="hero-scrim" />

        <div className="hero-logo-layer">
          <HeroLogoSolid />
        </div>

        <div className="absolute inset-x-0 bottom-0 px-(--spacing-gutter) pb-(--spacing-section-tight)">
          <HeroSlogan animated={false} />
          <div className="mt-10 flex flex-wrap gap-4">
            <HeroCtas />
          </div>
        </div>
      </section>

      <section className="surface-ink surface-ink-deep px-(--spacing-gutter) py-(--spacing-section)">
        <ul className="mx-auto max-w-(--container-site)">
          {SERVICE_PHASES.map((phase) => (
            <HeroReducedService key={phase.id} phase={phase} />
          ))}
        </ul>
      </section>
    </>
  );
}

function HeroReducedService({ phase }: { phase: HeroServicePhase }) {
  return (
    <li className="hero-service-row border-hairline">
      <div className="hero-phase-icon">
        <phase.icon strokeWidth={1.5} aria-hidden="true" />
      </div>
      <div>
        <h2 className="hero-phase-title font-display">{phase.title}</h2>
        <ul className="hero-phase-items">
          {phase.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </li>
  );
}
