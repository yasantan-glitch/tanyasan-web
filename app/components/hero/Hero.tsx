"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef, useSyncExternalStore } from "react";
import {
  HERO_MOBILE_VIDEO_MEDIA,
  HERO_PHASES,
  HERO_STATEMENT_LINES,
  RESOLVE_SLOGAN_ACCENT_LINE,
  RESOLVE_SLOGAN_LINES,
  SERVICE_PHASES,
  isServicePhase,
  type HeroServicePhase,
} from "./heroPhases";
import { buildOrbParticles, drawOrb, type OrbPalette } from "./outroOrb";
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
 * Faz 8'in küresi: dönen, bir yanından dağılan 3B parçacık küresi (Canvas).
 * Geometri ve çizim outroOrb.ts'te; burada yalnızca yaşam döngüsü.
 *
 * NE ZAMAN ÇİZİYOR: yalnızca görünürken. Küre faz 8'e kadar opaklık 0'da
 * (useHeroScroll üst div'e yazıyor); o sürede kare atlanıyor. Ekran dışında
 * (IntersectionObserver) döngü tamamen duruyor. Arka plan sekmesinde rAF
 * zaten tarayıcı tarafından durduruluyor.
 *
 * NEDEN AYRI rAF: döngü scroll'dan bağımsız ve sonsuz (dönüş). Hero'nun
 * tick()'i yalnızca scroll'da çalışıyor; dönüşü oraya bağlamak kullanıcı
 * scroll etmeyi bıraktığı anda küreyi dondururdu.
 *
 * RENKLER token'lardan, çalışma anında okunuyor (--color-fg-on-paper,
 * --color-accent) — canvas CSS değişkeni bilmiyor, ikinci bir hex yazılmıyor.
 *
 * Hareketi kapalı kullanıcıda bu bileşen hiç mount edilmiyor (HeroReduced);
 * yine de mount olursa tek bir durağan kare çiziyor.
 */
/** Kürenin kare aralığı (ms) — 30 fps, yuvarlama payıyla. */
const ORB_FRAME_MS = 1000 / 30 - 2;

function HeroOutroOrb() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const particles = buildOrbParticles();
    const styles = getComputedStyle(canvas);
    const palette: OrbPalette = {
      body: styles.getPropertyValue("--color-fg-on-paper").trim() || "#1c1c1c",
      accent: styles.getPropertyValue("--color-accent").trim() || "#e8ae30",
    };
    // Görünürlüğü süren eleman: useHeroScroll'un opaklık yazdığı div.
    const gate = canvas.closest<HTMLElement>(".hero-outro-orb-wrap > div");

    let size = 0;
    const resize = () => {
      const cssSize = canvas.clientWidth;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (cssSize === 0) return;
      size = cssSize;
      canvas.width = Math.round(cssSize * dpr);
      canvas.height = Math.round(cssSize * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      drawOrb(ctx, particles, 0, size, palette);
      return () => ro.disconnect();
    }

    let raf = 0;
    let running = false;
    let last = 0;
    const start = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      // 30 kare/sn tavanı. Küre 48 sn'de bir tur atıyor — karede ~0.25°;
      // 60'la 30 arasındaki fark gözle seçilmiyor, çizim maliyeti yarıya
      // iniyor (ölçüldü: 4200 parçacıkta 60 fps'te çizim hero'nun kendi
      // tick()'iyle birlikte kare bütçesini aşıyordu).
      if (now - last < ORB_FRAME_MS) return;
      last = now;
      // Opaklık 0 → kimse görmüyor, çizme. Satır içi stil okumak ucuz
      // (layout tetiklemiyor).
      if (gate && gate.style.opacity !== "" && Number(gate.style.opacity) <= 0) return;
      if (size === 0) return;
      drawOrb(ctx, particles, (now - start) / 1000, size, palette);
    };
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true;
        raf = requestAnimationFrame(frame);
      } else if (!entry.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-outro-orb" aria-hidden="true" />;
}

/**
 * İlk hizmet klibinin (faz 2) ve posterinin ön yüklemesi — HTML'de, JS
 * inmeden başlasın diye. React 19 <link>'i <head>'e taşıyor; sunucu
 * snapshot'ı bu dalı bastığı için etiketler ilk HTML'de.
 *
 * `media` iki işi birden görüyor: motorla AYNI sorguyla (HERO_MOBILE_VIDEO_
 * MEDIA) tek bir klip seçiliyor — useHeroScroll'daki fetch() aynı URL'i
 * istediği için preload edilen yanıtı devralıyor (`crossOrigin` bu eşleşme
 * için şart) — ve reduced-motion kullanıcısı (video hiç yok) hiçbirini
 * indirmiyor. Masaüstü sorgusu mobilinkinin tümleyeni.
 */
const MOTION_OK = "(prefers-reduced-motion: no-preference)";
const MOBILE_PRELOAD_MEDIA = `${HERO_MOBILE_VIDEO_MEDIA} and ${MOTION_OK}`;
const DESKTOP_PRELOAD_MEDIA = `(min-width: 861px) and ${MOTION_OK}, (min-aspect-ratio: 601/1000) and ${MOTION_OK}`;

function HeroVideoPreloads() {
  const first = SERVICE_PHASES[0]?.video;
  if (!first) return null;
  return (
    <>
      <link
        rel="preload"
        as="fetch"
        href={first.mobileSrc}
        crossOrigin="anonymous"
        media={MOBILE_PRELOAD_MEDIA}
      />
      <link
        rel="preload"
        as="image"
        href={first.posterMobile}
        fetchPriority="high"
        media={MOBILE_PRELOAD_MEDIA}
      />
      <link
        rel="preload"
        as="fetch"
        href={first.src}
        crossOrigin="anonymous"
        media={DESKTOP_PRELOAD_MEDIA}
      />
    </>
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
      <HeroVideoPreloads />
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

        {/* Küre: sahnenin sağında, butonların üstünde. Görünürlüğü ve giriş
            ölçeği scroll'dan (bu div), dönüşü kendi rAF'ından (canvas)
            sürülüyor — bkz. HeroOutroOrb. */}
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
