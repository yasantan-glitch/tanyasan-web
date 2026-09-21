"use client";

import Link from "next/link";
import { Fragment, useSyncExternalStore } from "react";
import {
  HERO_PHASES,
  HERO_STATEMENT_LINES,
  RESOLVE_SLOGAN_ACCENT_LINE,
  RESOLVE_SLOGAN_LINES,
  SERVICE_PHASES,
  isServicePhase,
  type HeroServicePhase,
} from "./heroPhases";
import { ORB_DOTS, ORB_VIEWBOX } from "./outroOrb";
import { useHeroScroll } from "./useHeroScroll";

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

// Buton görünümünün tek kaynağı globals.css'teki .btn ailesi — nav CTA'sı
// da aynı sınıfları kullanıyor.
const ctaLinkClass = "btn eyebrow";

export default function Hero() {
  const reduced = useReducedMotion();
  return reduced ? <HeroReduced /> : <HeroInteractive />;
}

/**
 * Faz 1'in kopyası. `animated` yalnızca tek seferlik CSS load animasyonunu
 * (.hero-intro-rise) açar — kopya her iki dalda da ilk karede EKRANDADIR;
 * scroll yalnızca çıkışı sürer (bkz. useHeroScroll'daki handoff).
 */
const STATEMENT_LINE_COLORS = ["var(--color-accent)", "var(--color-fg-on-ink)"];

function HeroSlogan({
  animated,
  statementWordRefs,
  subtitleRef,
}: {
  animated: boolean;
  statementWordRefs?: React.RefObject<Array<Array<HTMLSpanElement | null>>>;
  subtitleRef?: React.RefObject<HTMLParagraphElement | null>;
}) {
  return (
    <div className={animated ? "hero-intro-rise" : undefined}>
      {/* Faz 1'in tek görsel öğesi: statement. Logo grafiği kaldırıldı —
          logonun tek yeri nav (bkz. .site-header-logo). Tip ölçüsü ve
          word-spacing fix'i .hero-statement'ta (globals.css).

          Kelimeler ayrı span: çıkışta her biri kendi yönüne savruluyor
          (bkz. useHeroScroll'daki scatterOf). Aralarındaki boşluklar gerçek
          text node — word-spacing fix'i ve satır kaydırma korunuyor, ekran
          okuyucu cümleyi bütün okuyor. */}
      <h1 className="hero-statement font-display">
        {HERO_STATEMENT_LINES.map((words, lineIndex) => (
          <span
            key={words.join(" ")}
            className="block"
            style={{ color: STATEMENT_LINE_COLORS[lineIndex] }}
          >
            {words.map((word, wordIndex) => (
              <Fragment key={word}>
                <span
                  ref={(node) => {
                    if (!statementWordRefs) return;
                    const line = (statementWordRefs.current[lineIndex] ??= []);
                    line[wordIndex] = node;
                  }}
                  className="hero-statement-word"
                >
                  {word}
                </span>
                {wordIndex < words.length - 1 ? " " : ""}
              </Fragment>
            ))}
          </span>
        ))}
      </h1>
      {/* Sarmalayıcı GİRİŞ animasyonunu, içteki <p> scroll'a bağlı ÇIKIŞI
          taşır. İkisi aynı elementte olamaz: CSS animasyonunun çıktısı
          kaskadda inline stilin üstünde, `fill-mode: both` ile animasyon
          bittikten sonra da son karesini tutuyor ve motorun her frame
          yazdığı opacity/transform'u eziyordu — alt başlık faz 1'den sonra
          ekranda kalıyordu. Statement'ta aynı ayrım zaten var (animasyon
          satır span'ında, scroll kelime span'ında). */}
      <div className="hero-intro-sub">
        <p
          ref={subtitleRef}
          className="text-lead mt-8 max-w-(--container-prose)"
          style={{ color: "var(--color-fg-on-ink-body)" }}
        >
          Markanızı görünür kılın, süreçlerinizi hızlandırın.
        </p>
      </div>
    </div>
  );
}

/**
 * Kapanışın iki CTA'sı — içerik tek kaynakta. Hareketli dal bu diziyi kendi
 * içinde map'liyor (her butona ayrı ref bağlaması gerekiyor: faz 8'de
 * butonlar raydan tek tek çıkıyor, bkz. OUTRO_CTA_*), reduced dalı ise
 * aşağıdaki <HeroCtas /> ile durağan basıyor.
 */
const HERO_CTAS = [
  { href: "/hizmetler", label: "Hizmetler", variant: "btn-accent" },
  { href: "/portfolyo", label: "Projelerimiz", variant: "btn-ghost" },
] as const;

function HeroCtas() {
  return (
    <>
      {HERO_CTAS.map((cta) => (
        <Link key={cta.href} href={cta.href} className={`${ctaLinkClass} ${cta.variant}`}>
          {cta.label}
        </Link>
      ))}
    </>
  );
}

/**
 * Faz 8'in küresi: nokta bulutundan bir küre. Koordinatların YANI SIRA her
 * noktanın nefes parametreleri de deterministik (bkz. outroOrb.ts) ve inline
 * custom property olarak basılıyor; hareketin kendisi CSS'te, tek bir
 * paylaşılan @keyframes'te (hero-orb-dot).
 *
 * Neden per-nokta CSS animasyonu, JS rAF değil: bu döngü scroll'dan bağımsız
 * ve sonsuz. rAF'ta olsaydı 280 elemana kare başına iki özellik yazmak
 * gerekirdi ve bu iş, video playhead'ini süren mevcut tick() ile aynı kare
 * bütçesine binerdi. CSS'te JS işi sıfır, tarayıcı ekran dışında/arka plan
 * sekmesinde animasyonu kendiliğinden kısıyor ve prefers-reduced-motion
 * motorda dal açmadan çözülüyor.
 *
 * `will-change` bilinçli olarak YOK: 280 noktaya verilseydi 280 ayrı katman
 * oluşurdu — kazançtan çok maliyet.
 */
function HeroOutroOrb() {
  return (
    <svg
      className="hero-outro-orb"
      viewBox={`0 0 ${ORB_VIEWBOX} ${ORB_VIEWBOX}`}
      aria-hidden="true"
      focusable="false"
    >
      <g>
        {ORB_DOTS.map((dot, index) => (
          <circle
            key={index}
            cx={dot.cx}
            cy={dot.cy}
            r={dot.r}
            opacity={dot.opacity}
            style={
              {
                "--odx": `${dot.dx}px`,
                "--ody": `${dot.dy}px`,
                "--os": dot.scale,
                "--odur": `${dot.duration}s`,
                "--odly": `${dot.delay}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </g>
    </svg>
  );
}

/** Ana, scroll-scrubbing'li hero. prefers-reduced-motion: no-preference. */
function HeroInteractive() {
  const {
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
  } = useHeroScroll();

  return (
    // surface-ink: hairline/focus/fg değişkenlerini koyu zemine bağlar —
    // içindeki .btn-ghost ve focus halkası doğru tonu alsın diye.
    <section
      ref={sectionRef}
      className="surface-ink relative"
      style={{ height: "var(--hero-span)" }}
    >
      <div className="hero-stage">
        <div ref={stageInnerRef} className="absolute inset-0">
          {/* Statik koyu zemin: intro fazı ve hizmet klipleri arası her
              boşlukta görünür. Hiç sürülmez — her video katmanı opacity:0'dan
              başlayıp yalnızca kendi fazında üzerine fade eder. */}
          <div className="hero-media hero-bg-static" aria-hidden="true" />
          {/* Hizmet klipleri (faz 2-7). src JSX'te VERİLMEZ: motor yalnızca
              aktif fazın ve komşularının blob'unu bağlar, uzaklaşanı bırakır —
              yani DOM'da 6 etiket var ama en fazla 3'ü yüklü. */}
          {HERO_PHASES.map((phase, index) =>
            isServicePhase(phase) ? (
              <video
                key={phase.id}
                ref={(node) => {
                  mediaVideoRefs.current[index] = node;
                }}
                className="hero-media hero-video"
                style={{ opacity: 0 }}
                muted
                playsInline
                preload="none"
                aria-hidden="true"
              />
            ) : null
          )}
          {/* Faz 8'in beyaz zemini — kapanış sahnesinin altında, zemini
              koyudan beyaza çeviren katman. */}
          <div ref={bgWashRef} className="hero-media hero-bg-wash" style={{ opacity: 0 }} aria-hidden="true" />
        </div>
        <div ref={scrimRef} className="hero-scrim" />
        <div ref={lightScrimRef} className="hero-light-scrim" style={{ opacity: 0 }} aria-hidden="true" />

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

        {/* Faz 8'in kapanış sahnesi — tamamen kod tabanlı, hiç medya yok.
            Ray ve nokta ayrı iki SVG: ikisinin de kutu genişliği kendi
            viewBox genişliğine EŞİT, yani x ölçeği tam 1 — `preserveAspectRatio:
            none` yalnızca rayı dikeyde geriyor, noktayı hiç bozmuyor.
            Konum/uzunluk ölçüleri JS'ten px olarak yazılıyor (bkz.
            useHeroScroll'daki outro layout ölçümü). */}
        <div className="hero-outro-scene" aria-hidden="true">
          <svg
            ref={outroRailRef}
            className="hero-outro-rail"
            viewBox="0 0 24 1000"
            preserveAspectRatio="none"
            focusable="false"
          >
            {/* pathLength=1: dash uzunlukları ekran yüksekliğinden bağımsız,
                dashoffset doğrudan "çizilmemiş oran" oluyor. */}
            <line
              x1="12"
              y1="0"
              x2="12"
              y2="1000"
              pathLength="1"
              strokeDasharray="1 1"
              strokeDashoffset="1"
            />
          </svg>
          <svg
            ref={outroDotRef}
            className="hero-outro-dot"
            viewBox="0 0 28 28"
            focusable="false"
            style={{ opacity: 0 }}
          >
            <circle className="hero-outro-dot-halo" cx="14" cy="14" r="11" />
            <circle className="hero-outro-dot-core" cx="14" cy="14" r="4" />
          </svg>
        </div>

        {/* Küre: sahnenin sağında, butonların üstünde. Görünürlüğü scroll'dan
            (svg kökünde), nefes alması CSS'ten (iç <g>) sürülüyor — iki
            hareket ayrı elemanlarda olmak zorunda, aksi halde her frame
            yazılan transform animasyonun karesini eziyor. */}
        <div className="hero-outro-orb-wrap" aria-hidden="true">
          <div ref={outroOrbRef} style={{ opacity: 0 }}>
            <HeroOutroOrb />
          </div>
        </div>

        {/* Faz 8'in kapanış mesajı — faz 1'in sloganıyla aynı değil. Blok
            sağ kenarından raya yaslı, satırlar raydan çıkıp SOLA uzuyor;
            yerine otururken yaylanıyor (bkz. springOut). aria-hidden
            VERİLMİYOR: opacity:0 ekran okuyucudan gizlemez. */}
        <p className="hero-outro-slogan on-paper font-display">
          {RESOLVE_SLOGAN_LINES.map((line, index) => (
            <span key={line} className="hero-outro-slogan-line">
              <span
                ref={(node) => {
                  outroLineRefs.current[index] = node;
                }}
                style={{
                  opacity: 0,
                  color:
                    index === RESOLVE_SLOGAN_ACCENT_LINE
                      ? "var(--color-accent)"
                      : "var(--color-fg-on-paper)",
                }}
              >
                {line}
              </span>
            </span>
          ))}
        </p>

        {/* CTA'lar aynı raydan, ters yönde (SAĞA) çıkıyor. Faz 1'in alt
            bandında DEĞİL: kendi mutlak kutusunda, sol kenarı raya yaslı —
            nokta da bu satırın dikey merkezinde duruyor. Zemin bu anda beyaz:
            .on-paper hairline/focus/fg token'larını açık zemine bağlıyor. */}
        <div
          ref={ctaRef}
          className="hero-outro-cta on-paper"
          style={{ opacity: 0, pointerEvents: "none" }}
        >
          {HERO_CTAS.map((cta, index) => (
            <Link
              key={cta.href}
              ref={(node) => {
                ctaItemRefs.current[index] = node;
              }}
              href={cta.href}
              className={`${ctaLinkClass} ${cta.variant}`}
              style={{ opacity: 0 }}
            >
              {cta.label}
            </Link>
          ))}
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

        {/* Faz 1'e özel scroll ipucu — sağ altta. Scroll başlayınca söner
            (bkz. useHeroScroll), faz 1 dışında görünmez. Tekerlek noktasının
            döngüsü CSS keyframe'de (.hero-scroll-wheel), JS söndürmesi bu
            sarmalayıcıda — ikisi aynı elemente yazılmaz (giriş animasyonu /
            scroll sürüşü ayrımının aynısı, bkz. docs/CLAUDE.md). İkon inline
            SVG: lucide'in Mouse ikonu döngüyü sürecek ayrı bir nokta node'u
            vermiyor. */}
        <div ref={scrollHintRef} className="hero-scroll-hint eyebrow" aria-hidden="true">
          <svg className="hero-scroll-mouse" viewBox="0 0 18 28" width="18" height="28" fill="none">
            <rect x="0.5" y="0.5" width="17" height="27" rx="7" stroke="currentColor" />
            <circle className="hero-scroll-wheel" cx="9" cy="7.5" r="1.6" fill="currentColor" />
          </svg>
          Kaydır
        </div>

        <div className="absolute inset-x-0 bottom-0 px-(--spacing-gutter) pb-(--spacing-section-tight)">
          {/* Faz 1 kopyası tek bir node'da: faz 2'ye devreden çıkış hareketi
              (yukarı kayma + ölçek) bu sarmalayıcıdan sürülüyor. CTA burada
              DEĞİL — o faz 8'in sahnesine ait (bkz. .hero-outro-cta), aynı
              transform'u paylaşmamalı. */}
          <div ref={introBlockRef} style={{ transformOrigin: "left bottom" }}>
            <HeroSlogan animated statementWordRefs={statementWordRefs} subtitleRef={subtitleRef} />
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
      <section className="hero-stage-static surface-ink">
        {/* İnteraktif daldaki zeminle aynı: düz koyu radial-gradient. Eskiden
            burada artık var olmayan hero-network.mp4'ten üretilmiş bir poster
            karesi vardı (bkz. git tarihi) — reduced-motion kullanıcısı için
            fazla bir bilgi taşımıyordu, yalnızca zemindi. */}
        <div className="hero-media hero-bg-static" aria-hidden="true" />
        <div className="hero-scrim" />

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

      {/* Faz 8'in kapanışı — hareketli dalda zemin beyaza döner, bir nokta
          dikey rayı çizerek iner, slogan raydan sola / CTA raydan sağa çıkar
          ve sağda nokta bulutu küresi nefes alır. Burada aynı BİLGİ durağan:
          ray, nokta ve küre hiç render EDİLMEZ (hepsi yalnızca hareketten
          ibaret, durağan hâlde anlam taşımıyorlar), slogan ve CTA statik
          duruyor. Kendi açık yüzeyini beyan ediyor (bkz. §2). */}
      <section className="surface-paper surface-paper-raised px-(--spacing-gutter) py-(--spacing-section)">
        <div className="hero-reduced-outro mx-auto max-w-(--container-site)">
          <p className="hero-outro-slogan-static font-display">
            {RESOLVE_SLOGAN_LINES.map((line, index) => (
              <span
                key={line}
                className="block"
                style={{
                  color:
                    index === RESOLVE_SLOGAN_ACCENT_LINE
                      ? "var(--color-accent-ink)"
                      : "var(--color-fg-on-paper)",
                }}
              >
                {line}
              </span>
            ))}
          </p>
          <div className="flex flex-wrap gap-4">
            <HeroCtas />
          </div>
        </div>
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
