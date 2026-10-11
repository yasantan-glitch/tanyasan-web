"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { SERVICES } from "@/app/content/services";
import { clamp01, smooth } from "./heroMath";
import { HeroLogoOutline, HeroLogoSolid } from "./HeroLogo";
import {
  HERO_INTRO_DOCK_SHARE,
  HERO_INTRO_FADE_SHARE,
  HERO_INTRO_PHASE_END,
} from "./heroIntroTiming";
import {
  LOGO_TAGLINE_ELEMENTS,
  LOGO_VIEWBOX,
  LOGO_WORDMARK_ELEMENTS,
} from "./logoData";

/**
 * Faz 1'in açılış intro'su (Ekim 2026) — header logosu ile statement
 * arasındaki boş koyu bandı dolduran ~5 sn'lik dekoratif sahne:
 *
 *   0–0.8 s    sarı inşa çizgileri (logonun üst/taban hattı, yan kenarları)
 *   0.3–1.2 s  logonun sarı üçgeni "tohum" olarak yerine düşer
 *   1.5–3.3 s  tarama çizgisi soldan sağa geçer, arkasında logo konturu açılır
 *   3.0–3.5 s  dolu logo belirir, kontur söner, çizgiler kısılır
 *   3.5–5 s    altı hizmet adı (services.ts) mono etiket olarak tek tek yanar
 *
 * Statement 3.5 s'de giriyor: .hero-stage'deki `hero-intro-lead` sınıfı
 * mevcut hero-intro-rise animasyonlarının yalnızca BAŞLANGICINI öteliyor
 * (globals.css). Alt başlık transform-only girdiği için ilk karede boyalı
 * kalıyor — LCP öğesi o.
 *
 * NEDEN CSS ANİMASYONU: zamanlama HTML ile birlikte iniyor, hydration'ı
 * beklemiyor ve onu geciktirmiyor. Yalnızca transform/opacity, yalnızca
 * HTML kutularında ya da bütün <svg>'lerde — compositor'da koşuyor, telefonda
 * hydration'ın ana thread'i kilitlediği saniyelerde takılmıyor. Kontur
 * "çizimi" bu yüzden stroke-dashoffset DEĞİL (ana thread boyaması): taşmayı
 * kırpan sarmalayıcı soldan kayarken içeriği ters yönde kayıyor, açılan
 * kenarda bir tarama çizgisi ilerliyor.
 *
 * Bütün animasyonlar `both` dolgulu ve TABAN STİL SON KAREDİR: animasyon
 * bitirilince ya da hiç yokken (reduced-motion, istemci tarafı ikinci mount)
 * bitmiş kompozisyon görünür.
 *
 * FONT BEKLEMESİ + ATLAMA (heroIntroScript.ts, hydration'dan önce de
 * çalışsın diye HTML'deki inline script): kompozisyon hero fontları inene
 * dek opaklık 0'da bekler ve saat o an başlar — statement'ın font swap
 * kayması kompozisyonu CLS'e katmasın. İlk scroll/dokunuş/tuşta intro
 * anında son karesine atlar, statement hemen girer.
 *
 * ÇIKIŞ (aşağıdaki denetleyici; useHeroScroll'a dokunulmadı): etiketler ve
 * çizgiler faz 1'in ilk %35'inde scroll'la söner. LOGO ise header'a gider:
 * anasayfada header logosu kompozisyon ekrandayken GİZLİ (globals.css,
 * `html:has(...)`), scroll'la kompozisyondaki logo header logosunun tam
 * yerine ve boyutuna taşınır (translate + scale), vardığı karede gerçek
 * logo görünür, kopya kaybolur. Geri scroll tersini yapar.
 *
 * Yolculuk yapan kopya hero'nun İÇİNDE DEĞİL, header'a portal: header
 * (z-index 100) hero sahnesinin üstünde ve sahnenin tepesinde koyu bir scrim
 * (::before) taşıyor — sahnede kalan bir kopya varırken o scrim'in altında
 * kararır, gerçek logoya geçişte "parlardı". Kopya /Logo_Beyaz.svg ile aynı
 * geometriden (logoData.ts) çiziliyor; iki geçiş de birebir aynı konum ve
 * boyutta, aynı karede: başta kompozisyon logosu → kopya, sonda kopya →
 * header logosu.
 *
 * Kural (docs/CLAUDE.md): giriş animasyonu ile scroll sürüşü aynı elemente
 * yazmaz — scroll yazımları animasyonsuz sarmalayıcılara (çizgi katmanı,
 * etiketin dış span'ı, logo grubu) gidiyor.
 */

/** Sayfa yüklemesi başına bir kez: istemci tarafı gezinmeyle anasayfaya
 * dönüldüğünde intro yeniden oynamaz. Sunucu ve ilk (hydration) render'ı
 * `false` okur — işaret mount effect'inde kalkıyor. */
let introPlayed = false;
export function hasHeroIntroPlayed() {
  return introPlayed;
}

/** Sönerken yukarı kayma (vh). */
const FADE_RISE_VH = 4;
/** Kopyanın etiket satırı ("Design & Digital Agency") yolculuğun bu
 * noktasından sonra belirir; varışta tam opak (header logosuyla aynı). */
const TAGLINE_FROM = 0.4;
/** Kırpılmış wordmark kutusunun (0 4 1080 200) tam logodaki (0 0 1080 335)
 * üst kenarı — viewBox birimi. */
const WORDMARK_TOP = 4;
const LOGO_UNITS = 1080;

const [TAN, Y, ASAN, TRIANGLE] = LOGO_WORDMARK_ELEMENTS;
const LOGO_BODY = [TAN, Y, ASAN];

/** Header'ın kendisi — kopya oraya portal ediliyor. Sunucuda ve hydration
 * render'ında `null` (portal yalnızca hydration'dan sonra kuruluyor). */
const subscribeNothing = () => () => {};
const getSiteHeader = () => document.querySelector<HTMLElement>(".site-header");
const getNoHeader = () => null;

/** İnşa çizgileri — logonun viewBox'ından (0 4 1080 200) türetilmiş konumlar:
 * üst hat y=11, taban y=190.8; sol kenar x=4.8, sağ kenar x≈1070, üçgenin
 * tepesi x=834.6 (tohumun düştüğü eksen). */
const GRID_LINES = [
  { axis: "h", at: "3.5%" },
  { axis: "h", at: "93.4%" },
  { axis: "v", at: "0.44%" },
  { axis: "v", at: "77.28%" },
  { axis: "v", at: "99.08%" },
] as const;

export default function HeroIntroArt({
  animated,
  scrollFade,
}: {
  /** false → animasyonsuz, doğrudan son kare. */
  animated: boolean;
  /** true → faz 1'in başında scroll'la söner, logo header'a gider
   * (yalnızca hareketli dal). */
  scrollFade: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const dockRef = useRef<HTMLDivElement>(null);
  const dockTagRef = useRef<HTMLDivElement>(null);
  const header = useSyncExternalStore(subscribeNothing, getSiteHeader, getNoHeader);

  // Durağan dal (reduced-motion) hydration'dan SONRA yeni node olarak
  // mount oluyor; fontlar hâlâ iniyorsa onlar gelene dek görünmez kalsın —
  // aynı CLS gerekçesi, bkz. heroIntroScript.ts. Hareketli dalda bunu
  // HTML'deki inline script yapıyor.
  useEffect(() => {
    const el = rootRef.current;
    const fonts = typeof document !== "undefined" ? document.fonts : undefined;
    if (animated || !el?.animate || !fonts || fonts.status !== "loading") return;
    const hold = el.animate([{ opacity: 0 }, { opacity: 0 }], { duration: 1e9 });
    const release = () => hold.cancel();
    const cap = window.setTimeout(release, 2000);
    void fonts.ready.then(release);
    return () => {
      window.clearTimeout(cap);
      release();
    };
  }, [animated]);

  useEffect(() => {
    if (animated) introPlayed = true;
    if (!scrollFade) return;
    const art = rootRef.current;
    const mark = markRef.current;
    const lines = linesRef.current;
    const group = groupRef.current;
    const wrap = art?.parentElement;
    const section = art?.closest("section");
    const stage = art?.closest<HTMLElement>(".hero-stage");
    if (!art || !mark || !lines || !group || !wrap || !section || !stage) return;
    const labels = labelRefs.current.filter((el): el is HTMLSpanElement => !!el);
    const fading: HTMLElement[] = [lines, ...labels];
    // Kopya ve header logosu yalnızca portal kurulduktan sonra var.
    const dock = dockRef.current;
    const tag = dockTagRef.current;
    const logo = header?.querySelector<HTMLElement>(".site-header-logo") ?? null;

    let top = 0;
    let fadePx = 1;
    let dockPx = 1;
    /** Yolculuk mümkün mü: kopya + header logosu var ve kompozisyon
     * görünür (kısa ekranlarda display:none — orada header logosu zaten
     * CSS'te gizlenmiyor). */
    let handoff = false;
    // Yolculuğun iki ucu (viewport px). Başta kopya kompozisyon logosunun
    // üstüne oturur (ölçek k), sonda header logosunun kutusunda (ölçek 1).
    let x0 = 0;
    let y0 = 0;
    let k = 1;
    let x1 = 0;
    let y1 = 0;
    let raf = 0;

    const measure = () => {
      top = section.getBoundingClientRect().top + window.scrollY;
      const travel = Math.max(section.offsetHeight - stage.offsetHeight, 1);
      const introPx = HERO_INTRO_PHASE_END * travel;
      fadePx = Math.max(introPx * HERO_INTRO_FADE_SHARE, 1);
      dockPx = Math.max(introPx * HERO_INTRO_DOCK_SHARE, 1);
      handoff = !!(dock && logo && getComputedStyle(art).display !== "none");
      if (!handoff || !dock || !logo) return;
      // Sahne yolculuk boyunca viewport'un tepesine yapışık: konumu sahneye
      // göre ölçmek, sayfa aşağıdayken gelen bir resize'da da doğru.
      const stageRect = stage.getBoundingClientRect();
      const markRect = mark.getBoundingClientRect();
      const logoRect = logo.getBoundingClientRect();
      const w = logoRect.width;
      // Kompozisyondaki logo layout'ta cihaz pikseline oturtulmuş çiziliyor,
      // transform'lu kopya oturtulmuyor — başlangıç noktası da oturtulmazsa
      // ilk geçişte 1 cihaz pikseli kayma görünüyordu (ölçüldü, 3x telefon).
      const dpr = window.devicePixelRatio || 1;
      const snap = (v: number) => Math.round(v * dpr) / dpr;
      k = markRect.width / w;
      x0 = snap(markRect.left - stageRect.left);
      y0 = snap(markRect.top - stageRect.top) - (k * WORDMARK_TOP * w) / LOGO_UNITS;
      x1 = logoRect.left;
      y1 = logoRect.top;
      dock.style.width = `${w}px`;
      dock.style.height = `${logoRect.height}px`;
    };

    const setFade = (u: number) => {
      const opacity = u > 0 ? (1 - u).toFixed(3) : "";
      const transform = u > 0 ? `translate3d(0, ${(-u * FADE_RISE_VH).toFixed(2)}vh, 0)` : "";
      for (const el of fading) {
        el.style.opacity = opacity;
        el.style.transform = transform;
      }
    };

    const apply = () => {
      raf = 0;
      const y = window.scrollY - top;
      setFade(smooth(clamp01(y / fadePx)));
      if (!handoff || !dock || !tag || !logo) {
        group.style.opacity = "";
        if (logo) logo.style.opacity = "";
        return;
      }
      const t = clamp01(y / dockPx);
      // Üç durum, tek karede yazılır — iki logo hiçbir karede birlikte
      // görünmez, hiçbir karede logo eksik kalmaz.
      if (t <= 0) {
        group.style.opacity = "";
        dock.style.opacity = "";
        logo.style.opacity = "";
      } else if (t < 1) {
        const e = smooth(t);
        const s = k + (1 - k) * e;
        const x = x0 + (x1 - x0) * e;
        const yy = y0 + (y1 - y0) * e;
        dock.style.transform = `translate(${x.toFixed(2)}px, ${yy.toFixed(2)}px) scale(${s.toFixed(4)})`;
        tag.style.opacity = smooth(clamp01((t - TAGLINE_FROM) / (1 - TAGLINE_FROM))).toFixed(3);
        dock.style.opacity = "1";
        group.style.opacity = "0";
        logo.style.opacity = "";
      } else {
        group.style.opacity = "0";
        dock.style.opacity = "";
        logo.style.opacity = "1";
      }
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const remeasure = () => {
      measure();
      schedule();
    };

    measure();
    apply();
    // Hydration öncesi yedeği (inline script, sayfa aşağıda açıldıysa header
    // logosunu gösteriyordu) devralındı — aynı görevde, kare arası boşluk yok.
    window.__heroIntroPre?.stop();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", remeasure, { passive: true });
    // Font swap'ı statement'ı (dolayısıyla kompozisyonu) kaydırıyor; header
    // logosu kırılımda boyut değiştiriyor.
    const ro = new ResizeObserver(remeasure);
    ro.observe(wrap);
    if (logo) ro.observe(logo);
    let alive = true;
    void document.fonts?.ready.then(() => {
      if (alive) remeasure();
    });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", remeasure);
      setFade(0);
      group.style.opacity = "";
      if (logo) logo.style.opacity = "";
    };
  }, [animated, scrollFade, header]);

  return (
    <div
      ref={rootRef}
      className="hero-intro-art"
      data-static={animated ? undefined : ""}
      aria-hidden="true"
    >
      <div className="hero-intro-grid">
        <div ref={markRef} className="hero-intro-mark">
          <div ref={linesRef} className="hero-intro-lines">
            {GRID_LINES.map((line, index) => (
              <span
                key={`${line.axis}${line.at}`}
                className={`hero-intro-line hero-intro-line--${line.axis}`}
                style={{ "--at": line.at, "--i": index } as React.CSSProperties}
              />
            ))}
          </div>
          <div className="hero-intro-wipe">
            <div className="hero-intro-wipe-inner">
              <HeroLogoOutline className="hero-intro-logo hero-intro-outline" elements={LOGO_BODY} />
            </div>
          </div>
          <div ref={groupRef} className="hero-intro-logo-group">
            <HeroLogoSolid decorative className="hero-intro-logo hero-intro-fill" elements={LOGO_BODY} />
            <HeroLogoSolid decorative className="hero-intro-logo hero-intro-seed" elements={[TRIANGLE]} />
          </div>
          <span className="hero-intro-scan" />
        </div>
        {SERVICES.map((service, index) => (
          <span
            key={service.id}
            ref={(node) => {
              labelRefs.current[index] = node;
            }}
            className="hero-intro-label"
            style={{ gridArea: `l${index + 1}` }}
          >
            <span className="hero-intro-label-in" style={{ "--i": index } as React.CSSProperties}>
              <span className="hero-intro-label-index">{String(index + 1).padStart(2, "0")}</span>
              {service.title}
            </span>
          </span>
        ))}
      </div>
      {header && scrollFade
        ? createPortal(
            <div ref={dockRef} className="hero-intro-dock" aria-hidden="true">
              <HeroLogoSolid
                decorative
                viewBox={LOGO_VIEWBOX}
                className="hero-intro-dock-logo"
                elements={LOGO_WORDMARK_ELEMENTS}
              />
              <div ref={dockTagRef} className="hero-intro-dock-tag">
                <HeroLogoSolid
                  decorative
                  viewBox={LOGO_VIEWBOX}
                  className="hero-intro-dock-logo"
                  elements={LOGO_TAGLINE_ELEMENTS}
                />
              </div>
            </div>,
            header
          )
        : null}
    </div>
  );
}
