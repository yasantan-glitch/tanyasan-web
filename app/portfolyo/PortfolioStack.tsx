"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";

import DragGallery from "@/app/components/gallery/DragGallery";
import GalleryCard from "@/app/components/gallery/GalleryCard";
import type { PortfolioCategory } from "@/app/content/portfolioCategories";

import WorkLightbox from "./WorkLightbox";

/**
 * /portfolyo'nun kategori kartları — gertix.studio/portfolio referansı
 * (Ekim 2026). İki katman:
 *
 * 1. ÜST ÜSTE BİNEN KARTLAR (saf CSS, globals.css `.pf-stack`): bölüm
 *    `N × 100svh` uzunluğunda, içindeki sahne sticky; her kart bir öncekinin
 *    üstüne alttan kayarak biniyor (`pf-card-rise`, bölümün named
 *    view-timeline'ı). Menzil her kart için satır içi `--rise-from/--rise-to`
 *    olarak yazılıyor — kart sayısı içerikten geliyor, CSS'te indeks yok.
 *    Destek yoksa / reduced-motion / ≤860px: kartlar alt alta akan bloklar.
 *
 * 2. DETAY (bu bileşen): başlığa, görsele ya da butona tıklayınca ana görsel
 *    başlığın altındaki yuvaya küçülerek taşınıyor, kategorinin diğer işleri
 *    sağ alttan sırayla giriyor. Kapatınca görsel yerine dönüyor, işler sağ
 *    alta çekiliyor; sayfa kaymıyor, kullanıcı aynı karttan devam ediyor.
 *
 * GÖRSELİN YOLCULUĞU: kapak iki yuvadan birinin (`media` / `thumb`) ölçülen
 * kutusuna `top/left/width/height` ile oturuyor ve CSS geçişi ikisi arasında
 * akıyor. Ölçek (`transform: scale`) DEĞİL boyut animasyonu: iki yuvanın oranı
 * farklı, `object-fit: cover` her karede yeni kutuya göre kırptığı için görsel
 * hiç esnemiyor. Ölçü `offsetTop/Left` ile — kartın scroll'a bağlı transform'u
 * ölçüye karışmıyor. Hızlı aç/kapa: geçiş o anki değerden yeni hedefe döner.
 *
 * "YAZILIM & UYGULAMA" kartı (`href`) detay açmaz; başlık, görsel ve buton
 * doğrudan vaka sayfasına gider.
 */

type Phase = "closed" | "open" | "closing";
const EXIT_MS = 520;
/** Kapanışta kapağın yerine dönüş geçişi (globals.css 0.9s) + pay. Sayfa
 * kilidi ancak bundan sonra açılıyor — bir sonraki kartın yükselişi kapanış
 * tamamen bitmeden başlamasın (kullanıcı geri bildirimi, Ekim 2026). */
const RELEASE_MS = 950;

/**
 * Üst üste binme geometrisi. Her kart önce `HOLD` kadar yerinde DURUR, sonra
 * bir sonraki kart `1` birim boyunca alttan yükselir; son kart da bir `HOLD`
 * durur. Birim = 100svh scroll. Bölüm yüksekliği = 100svh + toplam birim.
 * Eskiden kartlar aralıksız yükseliyordu: ilk kart hiç durmuyor, bir kart
 * açılınca küçük bir scroll bile sonraki kartı üstüne çekiyordu.
 */
const HOLD = 0.45;
export function stackGeometry(count: number) {
  const total = count * HOLD + Math.max(0, count - 1);
  const pct = (units: number) => (total ? (units / total) * 100 : 0);
  return {
    total,
    rise: (i: number) => ({
      from: pct(i * HOLD + (i - 1)),
      to: pct(i * HOLD + i),
    }),
    /** Kartın tam oturduğu duruşun ortası — contain menzilinin kesri. */
    rest: (i: number) => (i * HOLD + i + HOLD / 2) / (total || 1),
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

function StackCard({
  category,
  index,
  count,
  rise,
  onOpen,
  onRelease,
}: {
  category: PortfolioCategory;
  index: number;
  /** Kart sayısı — ton rampası sıradan türüyor. */
  count: number;
  rise: { from: number; to: number };
  /** Detay açılırken: kartı duruşuna yumuşakça getir + sayfayı kilitle. */
  onOpen: (index: number) => void;
  /** Kapanış geçişi bittikten sonra: sayfa kilidini aç. */
  onRelease: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("closed");
  const open = phase === "open";
  const cardRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const exitTimer = useRef<number | undefined>(undefined);
  const releaseTimer = useRef<number | undefined>(undefined);
  const galleryId = `${category.id}-isler`;

  // Detay: etiketler ↔ galeri eşleşmesi ve tam ekran görünüm.
  const galleryApi = useRef<{ goTo: (index: number) => void } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState<number | null>(null);
  /** Detay hangi kareden açıldı: 0 = baştan (buton/başlık/kapak), >0 = bir
   * iş etiketinden (galeri o kareyle açılır). */
  const [entryFrom, setEntryFrom] = useState(0);
  const firstOf = useMemo(() => {
    const map = new Map<string, number>();
    category.items.forEach((item, i) => {
      if (!map.has(item.brand)) map.set(item.brand, i);
    });
    return map;
  }, [category.items]);
  const activeBrand = category.items[activeIndex]?.brand;

  // Kapağı aktif yuvaya oturt. Yuva ölçüsü layout'tan (offset*), transform'suz.
  const place = useCallback((target: "media" | "thumb") => {
    const card = cardRef.current;
    const cover = coverRef.current;
    const slot = target === "thumb" ? thumbRef.current : mediaRef.current;
    if (!card || !cover || !slot) return;
    let x = 0;
    let y = 0;
    for (let node: HTMLElement | null = slot; node && node !== card; ) {
      x += node.offsetLeft;
      y += node.offsetTop;
      node = node.offsetParent as HTMLElement | null;
    }
    cover.style.setProperty("--cx", `${x}px`);
    cover.style.setProperty("--cy", `${y}px`);
    cover.style.setProperty("--cw", `${slot.offsetWidth}px`);
    cover.style.setProperty("--ch", `${slot.offsetHeight}px`);
    card.dataset.placed = "true";
  }, []);

  // İlk ölçü geçişsiz; ondan sonra kart "canlı" — geçişler açılıyor.
  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    place("media");
    const raf = requestAnimationFrame(() => (card.dataset.live = "true"));
    return () => cancelAnimationFrame(raf);
  }, [place]);

  useLayoutEffect(() => {
    place(open ? "thumb" : "media");
  }, [open, place]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    let width = card.offsetWidth;
    const observer = new ResizeObserver(() => {
      const target = card.dataset.phase === "open" ? "thumb" : "media";
      // Yalnızca GENİŞLİK değişimi gerçek bir yeniden boyutlandırma: orada
      // geçiş yok, görsel yeni düzene anında otursun. Yükseklik değişimi
      // (akış düzeninde galeri açılınca kart uzar) geçişi kesmemeli.
      if (card.offsetWidth !== width) {
        width = card.offsetWidth;
        delete card.dataset.live;
        place(target);
        requestAnimationFrame(() => (card.dataset.live = "true"));
      } else {
        place(target);
      }
    });
    observer.observe(card);
    return () => observer.disconnect();
  }, [place]);

  useEffect(
    () => () => {
      window.clearTimeout(exitTimer.current);
      window.clearTimeout(releaseTimer.current);
    },
    []
  );

  // Uçuş süresince galeri penceresi kırpmasın (globals.css
  // `[data-entering]`): son karenin gecikmesi + kendi süresi. DOM bayrağı —
  // React state'i değil, ikinci bir render gerekmiyor.
  // Bir iş etiketinden açılınca (entryFrom > 0) bayrak YOK: kırpmasız
  // pencere (`overflow: visible`) kaydırılamaz, galeri o kareye atlayamazdı.
  // O durumda kareler pencerenin içinde, hedef kareden başlayarak girer.
  const galleryRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const gallery = galleryRef.current;
    if (!open || !gallery || entryFrom > 0) return;
    gallery.dataset.entering = "";
    const timer = window.setTimeout(
      () => delete gallery.dataset.entering,
      Math.max(0, category.items.length - 1) * 120 + 200 + 950
    );
    return () => {
      window.clearTimeout(timer);
      delete gallery.dataset.entering;
    };
  }, [open, category.items.length, entryFrom]);

  // Yan etki (zamanlayıcı) state güncelleyicisinin İÇİNDE değil: React
  // güncelleyiciyi iki kez çağırabilir, sızan ikinci zamanlayıcı hızlı
  // aç/kapa'da kartı yanlışlıkla kapatıyordu. Güncel faz ref'ten okunuyor.
  const phaseRef = useRef<Phase>("closed");
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const toggle = useCallback(() => {
    window.clearTimeout(exitTimer.current);
    window.clearTimeout(releaseTimer.current);
    if (phaseRef.current === "open") {
      phaseRef.current = "closing";
      setPhase("closing");
      exitTimer.current = window.setTimeout(() => {
        phaseRef.current = "closed";
        setPhase("closed");
      }, EXIT_MS);
      releaseTimer.current = window.setTimeout(onRelease, RELEASE_MS);
    } else {
      phaseRef.current = "open";
      setPhase("open");
      onOpen(index);
    }
  }, [index, onOpen, onRelease]);

  // Başlık, kapak ve "İşleri Gör": detay baştan açılır.
  const onToggleClick = () => {
    if (phaseRef.current === "closed") setEntryFrom(0);
    toggle();
  };

  // İş etiketi: kapalıysa detayı o işin karesiyle aç, açıksa galeriyi oraya
  // kaydır. Kapanırken basılırsa kapanış iptal, galeri hâlâ yerinde.
  const showWork = (target: number) => {
    if (phaseRef.current === "closed") {
      setEntryFrom(target);
      toggle();
      return;
    }
    if (phaseRef.current === "closing") toggle();
    galleryApi.current?.goTo(target);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape" && open) {
      event.stopPropagation();
      toggle();
      toggleRef.current?.focus();
    }
  };

  const link = category.href;
  // Header: gri logo (#676767) ~#979797 zeminde kaybolur — p ≥ 0.35'ten
  // itibaren beyaz logo. Ton rampası: 0 (beyaz) → 1 (ink-950), kartlara eşit dağılıyor. Eşikler
  // globals.css `.pf-card[data-tone]` yorumuyla aynı.
  const p = count > 1 ? index / (count - 1) : 0;
  const tone = p < 0.45 ? "light" : p < 0.7 ? "mid" : "dark";
  const style = {
    "--pf-p": p,
    "--rise-from": rise.from,
    "--rise-to": rise.to,
  } as CSSProperties;

  const cover = (
    <Image
      src={category.cover.src}
      alt={category.cover.alt}
      fill
      sizes="(max-width: 860px) 100vw, 50vw"
      draggable={false}
    />
  );

  return (
    <article
      ref={cardRef}
      id={category.id}
      className="pf-card"
      data-tone={tone}
      data-phase={phase}
      data-header-tone={p < 0.35 ? "light" : "dark"}
      data-cover-wide={category.coverWide ? "" : undefined}
      style={style}
      onKeyDown={onKeyDown}
      aria-labelledby={`${category.id}-baslik`}
    >
      <span className="pf-card__num">{pad(index + 1)}</span>

      <h2 id={`${category.id}-baslik`} className="pf-card__title">
        {link ? (
          <Link href={link}>{category.title}</Link>
        ) : (
          <button
            type="button"
            onClick={onToggleClick}
            aria-expanded={open}
            aria-controls={galleryId}
          >
            {category.title}
          </button>
        )}
      </h2>

      <ul className="pf-card__labels" aria-label="Markalar">
        {category.labels.map((label) => {
          const target = firstOf.get(label);
          // Her iş etiketi her zaman düğme (kapak da galeride, her işin bir
          // karesi var). Vurgu yalnızca detay açıkken, galeriyle senkron.
          // Detaysız kart (Yazılım & Uygulama): etiketler de vaka sayfasına.
          if (link) {
            return (
              <li key={label}>
                <Link href={link}>{label}</Link>
              </li>
            );
          }
          if (target === undefined) return <li key={label}>{label}</li>;
          const active = open && label === activeBrand;
          return (
            <li key={label} data-active={active ? "" : undefined}>
              <button
                type="button"
                aria-pressed={open ? active : undefined}
                aria-controls={galleryId}
                onClick={() => showWork(target)}
              >
                {label}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Açıkken kapağın küçülüp oturduğu yuva — başlığın hemen altı. */}
      <div ref={thumbRef} className="pf-card__thumb-slot" aria-hidden="true" />

      <p className="pf-card__excerpt">{category.excerpt}</p>

      <div className="pf-card__cta">
        {link ? (
          <Link href={link} className="pf-btn">
            <span className="pf-btn__title">{category.cta}</span>
            <span className="pf-btn__arrow" aria-hidden="true" />
          </Link>
        ) : (
          <button
            ref={toggleRef}
            type="button"
            className="pf-btn"
            onClick={onToggleClick}
            aria-expanded={open}
            aria-controls={galleryId}
          >
            <span className="pf-btn__title">
              {open ? "Kapat" : `${category.cta} (${pad(category.workCount)})`}
            </span>
            <span
              className={`pf-btn__arrow${open ? " pf-btn__arrow--close" : ""}`}
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      {/* Kapalıyken kapağın çerçevesi (gertix: kesik çizgili kutu, 0.5rem
          iç pay). Yuva boş; kapak ölçüsünü buradan alıyor. */}
      <div className="pf-card__media-slot" aria-hidden="true">
        <div ref={mediaRef} className="pf-card__media-inner" />
      </div>

      {/* Kapak — iki yuva arasında gezen TEK eleman. */}
      <div ref={coverRef} className="pf-card__cover">
        {link ? (
          <Link href={link} tabIndex={-1} aria-hidden="true" className="pf-card__cover-hit">
            {cover}
          </Link>
        ) : (
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            className="pf-card__cover-hit"
            onClick={onToggleClick}
          >
            {cover}
          </button>
        )}
      </div>

      {link ? null : (
        <div
          ref={galleryRef}
          id={galleryId}
          className="pf-card__gallery"
          data-phase={phase}
          hidden={phase === "closed"}
        >
          {phase !== "closed" ? (
            <button
              type="button"
              className="pf-card__close"
              onClick={() => {
                toggle();
                toggleRef.current?.focus();
              }}
            >
              Kapat <span aria-hidden="true">×</span>
            </button>
          ) : null}
          {phase !== "closed" ? (
            <DragGallery
              label={`${category.title} işleri`}
              className="pf-gallery"
              apiRef={galleryApi}
              onActive={setActiveIndex}
              initialIndex={entryFrom}
            >
              {category.items.map((item, itemIndex) => (
                <GalleryCard
                  key={item.src}
                  src={item.src}
                  alt={item.alt}
                  brand={item.brand}
                  meta={item.event ?? item.category}
                  description={item.alt}
                  onOpen={() => setZoom(itemIndex)}
                  sizes="(max-width: 860px) 70vw, 24rem"
                  className={item.wide ? "gallery-card--wide" : undefined}
                  style={{ "--i": Math.max(0, itemIndex - entryFrom) } as CSSProperties}
                />
              ))}
            </DragGallery>
          ) : null}
        </div>
      )}

      {zoom !== null ? (
        <WorkLightbox
          items={category.items}
          index={zoom}
          onIndex={setZoom}
          onClose={(index) => {
            setZoom(null);
            // Odak ve galeri, kapanırken gösterilen işe dönsün.
            galleryApi.current?.goTo(index);
            galleryRef.current
              ?.querySelectorAll<HTMLButtonElement>(".gallery-card__zoom")
              [index]?.focus({ preventScroll: true });
          }}
        />
      ) : null}
    </article>
  );
}

export default function PortfolioStack({
  categories,
}: {
  categories: readonly PortfolioCategory[];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const geometry = useMemo(() => stackGeometry(categories.length), [categories.length]);

  // Üst üste binme modunda mıyız? (gated CSS: sahne sticky). Akış
  // düzeninde (mobil, reduced-motion) kilit ve hizalama YOK — orada açılan
  // galeri kartın altına uzuyor, okumak için scroll gerekiyor.
  const stacked = useCallback(() => {
    const sticky = sectionRef.current?.querySelector<HTMLElement>(".pf-stack__sticky");
    return !!sticky && getComputedStyle(sticky).position === "sticky";
  }, []);

  const restTop = useCallback(
    (index: number) => {
      const section = sectionRef.current;
      if (!section) return 0;
      const top = section.getBoundingClientRect().top + window.scrollY;
      const travel = section.offsetHeight - window.innerHeight;
      return top + travel * geometry.rest(index);
    },
    [geometry]
  );

  // Detay açıkken sayfa kilitli: tekerlek/dokunma/klavye diğer kartları
  // hareket ettirmez. `html`de kalıcı `scrollbar-gutter: stable` var — kilit
  // anında genişlik değişmiyor. Programatik (yumuşak) scroll kilitliyken de
  // çalışıyor; kart önce kendi duruşuna kayıyor, sonraki kart hiç görünmüyor.
  const onOpen = useCallback(
    (index: number) => {
      if (!stacked()) return;
      document.documentElement.style.overflow = "hidden";
      window.scrollTo({ top: restTop(index), behavior: "smooth" });
    },
    [stacked, restTop]
  );

  const onRelease = useCallback(() => {
    document.documentElement.style.overflow = "";
  }, []);

  useEffect(() => onRelease, [onRelease]);

  // Çapa (#kurumsal-kimlik …): sticky modda kartlar mutlak konumlu olduğu
  // için tarayıcının kendi atlaması kartın gerçek yerini bulamaz — kartın
  // duruş noktası geometriden hesaplanıyor.
  useEffect(() => {
    const go = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      const index = categories.findIndex((entry) => entry.id === id);
      if (index < 0 || !stacked()) return;
      window.scrollTo({ top: restTop(index), behavior: "instant" });
    };
    const timer = window.setTimeout(go, 60);
    window.addEventListener("hashchange", go);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("hashchange", go);
    };
  }, [categories, stacked, restTop]);

  return (
    <section
      ref={sectionRef}
      className="pf-stack"
      style={{ "--pf-units": geometry.total + 1 } as CSSProperties}
      aria-label="Portfolyo kategorileri"
    >
      <div className="pf-stack__sticky">
        <div className="pf-stack__grid">
          {categories.map((category, index) => (
            <StackCard
              key={category.id}
              category={category}
              index={index}
              count={categories.length}
              rise={geometry.rise(index)}
              onOpen={onOpen}
              onRelease={onRelease}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
