"use client";

import { useEffect, useRef } from "react";

/** Halenin imleci yakalama katsayısı. 1 = anında, düşük = daha tembel. */
const GLOW_LERP = 0.34;
/** Üç uydunun farklı gecikmeleri — dağılmayı yaratan tek şey bu fark. */
const SHARD_LERPS = [0.22, 0.15, 0.1];
/** Uydunun tam görünür olduğu gecikme mesafesi (px). */
const SHARD_FULL_LAG = 52;
const SHARD_MAX_OPACITY = 0.62;
const SHARD_MAX_BLUR_PX = 3.2;
/** Görsel üstündeki optik büyütme oranı. */
const ZOOM = 1.9;
/** Bu eşiğin altındaki oynamalar DOM'a yazılmaz. */
const MIN_WRITE_PX = 0.1;
/** Fare bu süre boyunca oynamazsa ve her şey yerine oturmuşsa döngü durur. */
const IDLE_MS = 320;

/**
 * Bir lens bölgesinin ölçüleri. Konum BELGE koordinatında saklanır:
 * scroll sırasında yeniden ölçüm yapmadan `scrollX/Y` farkıyla viewport
 * koordinatına çevrilebiliyor — döngü içinde `getBoundingClientRect` yok.
 */
type LensRegion = {
  docLeft: number;
  docTop: number;
  w: number;
  h: number;
  url: string;
  /** Görselin `object-fit: cover` ile çerçeveye oturmuş hâli. */
  coverW: number;
  coverH: number;
  coverOffsetX: number;
  coverOffsetY: number;
};

/**
 * İmleç katmanının motoru.
 *
 * `useHeroScroll` ile YAZIM DİSİPLİNİNİ paylaşır, kodunu paylaşmaz: orada
 * scroll'a bağlı 8 fazlı bir anlatı var, burada işaretçiye bağlı iki modlu
 * küçük bir katman. Ortak olan üç kural:
 *   1. Olay dinleyicisi hiçbir zaman `setState` çağırmaz — yalnızca hedef
 *      koordinatı bir closure değişkenine yazar. React re-render'ı sıfır.
 *   2. Ölçüm (rect okuma) yalnızca bölgeye girişte ve `resize`'da yapılır;
 *      rAF döngüsünün içinde layout'u zorlayan hiçbir okuma yok.
 *   3. Bir değer gerçekten değişmediyse DOM'a yazılmaz.
 *
 * Hero'dan bir adım ileri gittiği yer: döngü SÜREKLİ DÖNMEZ. Her şey hedefe
 * oturduktan ~320ms sonra `cancelAnimationFrame` ile kendini askıya alır ve
 * `will-change`'i bırakır; sonraki `pointermove` yeniden başlatır. Fare
 * durduğunda bu bileşenin maliyeti tam olarak sıfırdır.
 */
export function useCursorLens() {
  const rootRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const shardRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (!rootRef.current || !glowRef.current || !zoomRef.current) return;
    // Tipler açıkça yazılıyor: aşağıdaki kapanışlar (rAF döngüsü, olay
    // dinleyicileri) fonksiyon BİLDİRİMİ olduğu için TS daraltmayı içeri
    // taşımıyor; bildirilmiş tip null'suz olunca her erişim temiz.
    const root: HTMLDivElement = rootRef.current;
    const glow: HTMLDivElement = glowRef.current;
    const zoom: HTMLDivElement = zoomRef.current;

    const shards = shardRefs.current.filter((el): el is HTMLDivElement => !!el);

    // Fare imleci ilk kez görülene dek katman görünmez ve `cursor: none`
    // hiçbir yerde uygulanmaz. Dokunmatik ekranı da olan dizüstülerde
    // `(pointer: fine)` doğru dönebiliyor; asıl kanıt gerçek bir mouse olayı.
    let activated = false;

    let targetX = 0;
    let targetY = 0;
    let glowX = 0;
    let glowY = 0;
    const shardX = shards.map(() => 0);
    const shardY = shards.map(() => 0);

    // Son DOM'a yazılan değerler — MIN_WRITE_PX karşılaştırması için.
    let wroteGlowX = Number.NaN;
    let wroteGlowY = Number.NaN;
    const wroteShardX = shards.map(() => Number.NaN);
    const wroteShardY = shards.map(() => Number.NaN);
    const wroteShardOpacity = shards.map(() => Number.NaN);

    let regionEl: HTMLElement | null = null;
    let region: LensRegion | null = null;
    let appliedUrl = "";
    let wroteBgX = Number.NaN;
    let wroteBgY = Number.NaN;
    /** Lensin kenar uzunluğu CSS'ten gelir ve sabittir; döngü içinde
     * `offsetWidth` okumak her frame layout'u zorlardı. Bölgeye girişte bir
     * kez alınıyor. */
    let zoomSize = 0;

    let raf = 0;
    let running = false;
    let lastMoveAt = 0;

    /**
     * Çerçevenin ölçüsünü ve içindeki görselin kaynağını bir kez okur.
     * Görsel henüz decode edilmediyse veya şerit birleşme efekti sürüyorsa
     * (`data-reveal="pending"`) bölge açılmaz — yarım bir kareyi büyütmek
     * efektin kendisini bozardı.
     */
    function readRegion(el: HTMLElement): LensRegion | null {
      if (el.dataset.reveal === "pending") return null;
      const img = el.querySelector("img");
      if (!img || !img.complete || !img.naturalWidth || !img.naturalHeight) return null;

      const rect = el.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return null;

      // Çerçevedeki tüm görseller `object-fit: cover`. Arka plan olarak
      // yeniden çizerken aynı kırpımı üretmezsek büyütülen kare, altındaki
      // görselden kaymış görünür.
      const scale = Math.max(rect.width / img.naturalWidth, rect.height / img.naturalHeight);
      const coverW = img.naturalWidth * scale;
      const coverH = img.naturalHeight * scale;

      return {
        docLeft: rect.left + window.scrollX,
        docTop: rect.top + window.scrollY,
        w: rect.width,
        h: rect.height,
        url: img.currentSrc || img.src,
        coverW,
        coverH,
        coverOffsetX: (rect.width - coverW) / 2,
        coverOffsetY: (rect.height - coverH) / 2,
      };
    }

    function applyRegion() {
      if (region) {
        if (region.url !== appliedUrl) {
          appliedUrl = region.url;
          zoom.style.backgroundImage = `url("${region.url}")`;
        }
        zoom.style.backgroundSize = `${(region.coverW * ZOOM).toFixed(1)}px ${(
          region.coverH * ZOOM
        ).toFixed(1)}px`;
        zoomSize = zoom.offsetWidth;
        wroteBgX = Number.NaN;
        wroteBgY = Number.NaN;
      }
      root.dataset.mode = region ? "zoom" : "glow";
    }

    function setRegionFrom(el: HTMLElement | null) {
      if (el === regionEl) return;
      regionEl = el;
      region = el ? readRegion(el) : null;
      applyRegion();
    }

    /** Büyütülmüş kırpımı imlecin altındaki noktaya hizalar. */
    function paintZoom(cx: number, cy: number) {
      if (!region || !zoomSize) return;

      const left = region.docLeft - window.scrollX;
      const topEdge = region.docTop - window.scrollY;
      const size = zoomSize;
      const r = size / 2;

      // İmlecin cover-ölçekli görsel içindeki konumu, sonra ZOOM'la büyütülmüş
      // hâli; onu lensin ortasına getiren arka plan kaydırması.
      const px = (cx - left - region.coverOffsetX) * ZOOM;
      const py = (cy - topEdge - region.coverOffsetY) * ZOOM;

      // Kenarlarda lensin boş alan göstermemesi için kırpım sınırlanır.
      const maxX = Math.max(region.coverW * ZOOM - size, 0);
      const maxY = Math.max(region.coverH * ZOOM - size, 0);
      const bgX = -Math.min(Math.max(px - r, 0), maxX);
      const bgY = -Math.min(Math.max(py - r, 0), maxY);

      if (
        Math.abs(bgX - wroteBgX) < MIN_WRITE_PX &&
        Math.abs(bgY - wroteBgY) < MIN_WRITE_PX
      ) {
        return;
      }
      wroteBgX = bgX;
      wroteBgY = bgY;
      zoom.style.backgroundPosition = `${bgX.toFixed(1)}px ${bgY.toFixed(1)}px`;
    }

    function setWillChange(on: boolean) {
      const value = on ? "transform" : "auto";
      glow.style.willChange = value;
      zoom.style.willChange = value;
      for (const shard of shards) shard.style.willChange = value;
    }

    function tick() {
      glowX += (targetX - glowX) * GLOW_LERP;
      glowY += (targetY - glowY) * GLOW_LERP;

      // Halenin hedefe olan gecikmesi aynı zamanda hız göstergemiz — ayrı bir
      // hız ölçümü tutmuyoruz.
      let maxDrift = Math.hypot(targetX - glowX, targetY - glowY);

      if (
        Math.abs(glowX - wroteGlowX) >= MIN_WRITE_PX ||
        Math.abs(glowY - wroteGlowY) >= MIN_WRITE_PX
      ) {
        wroteGlowX = glowX;
        wroteGlowY = glowY;
        const transform = `translate3d(${glowX.toFixed(2)}px, ${glowY.toFixed(2)}px, 0)`;
        glow.style.transform = transform;
        zoom.style.transform = transform;
      }

      for (let i = 0; i < shards.length; i++) {
        shardX[i] += (targetX - shardX[i]) * SHARD_LERPS[i];
        shardY[i] += (targetY - shardY[i]) * SHARD_LERPS[i];

        const lag = Math.hypot(targetX - shardX[i], targetY - shardY[i]);
        if (lag > maxDrift) maxDrift = lag;

        if (
          Math.abs(shardX[i] - wroteShardX[i]) >= MIN_WRITE_PX ||
          Math.abs(shardY[i] - wroteShardY[i]) >= MIN_WRITE_PX
        ) {
          wroteShardX[i] = shardX[i];
          wroteShardY[i] = shardY[i];
          shards[i].style.transform = `translate3d(${shardX[i].toFixed(
            2
          )}px, ${shardY[i].toFixed(2)}px, 0)`;
        }

        // DAĞILMA: uydu ne kadar geride kaldıysa o kadar görünür ve o kadar
        // dağınık. Fare durunca lag 0'a iner, üçü de halenin içinde eriyip
        // kaybolur — durağan ekranda hiçbir şey boyanmaz.
        const u = Math.min(lag / SHARD_FULL_LAG, 1);
        const opacity = u * SHARD_MAX_OPACITY;
        if (Math.abs(opacity - wroteShardOpacity[i]) >= 0.004) {
          wroteShardOpacity[i] = opacity;
          shards[i].style.opacity = opacity.toFixed(3);
          shards[i].style.filter = u > 0.01 ? `blur(${(u * SHARD_MAX_BLUR_PX).toFixed(2)}px)` : "";
        }
      }

      if (region) paintZoom(glowX, glowY);

      // Askıya alma: hem hedefe oturmuş hem de bir süredir hareket yok.
      if (maxDrift < 0.2 && performance.now() - lastMoveAt > IDLE_MS) {
        running = false;
        raf = 0;
        setWillChange(false);
        return;
      }
      raf = requestAnimationFrame(tick);
    }

    function start() {
      if (running) return;
      running = true;
      setWillChange(true);
      raf = requestAnimationFrame(tick);
    }

    function activate() {
      if (activated) return;
      activated = true;
      root.dataset.active = "true";
      // `cursor: none` YALNIZCA gerçek bir fare kanıtlandıktan sonra ve
      // yalnızca lens bölgelerinde geçerli olsun diye kapı burada açılıyor
      // (bkz. globals.css `[data-cursor-lens-on]`). JS hiç çalışmazsa hiçbir
      // yerde imleç kaybolmaz.
      document.documentElement.dataset.cursorLensOn = "true";
    }

    function onPointerMove(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;

      if (!activated) {
        activate();
        // İlk kare lerp EDİLMEZ: katman ekranın köşesinden süzülerek gelmesin
        // diye hale de uydular da doğrudan imlecin altında doğar.
        glowX = event.clientX;
        glowY = event.clientY;
        shardX.fill(event.clientX);
        shardY.fill(event.clientY);
      }

      targetX = event.clientX;
      targetY = event.clientY;
      lastMoveAt = performance.now();
      start();
    }

    function onPointerOver(event: PointerEvent) {
      if (!activated || event.pointerType !== "mouse") return;
      const target = event.target;
      const el =
        target instanceof Element
          ? (target.closest("[data-cursor-lens]") as HTMLElement | null)
          : null;
      setRegionFrom(el);
    }

    /** İmleç pencereden çıktı: katman gizlenir, bölge bırakılır. */
    function onPointerLeave() {
      setRegionFrom(null);
      root.dataset.active = "false";
      activated = false;
      delete document.documentElement.dataset.cursorLensOn;
    }

    function onResize() {
      // Ölçüler değişti; açık bölge yeniden okunur. Scroll'da GEREKMEZ —
      // konum belge koordinatında tutuluyor.
      if (!regionEl) return;
      region = readRegion(regionEl);
      applyRegion();
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerover", onPointerOver, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
      delete document.documentElement.dataset.cursorLensOn;
    };
  }, []);

  return { rootRef, glowRef, zoomRef, shardRefs };
}
