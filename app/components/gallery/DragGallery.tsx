"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Yatay galeri denetleyicisi — gertix.studio galerisinin (Swiper free-mode,
 * momentum yok, mousewheel `releaseOnEdges`) davranışı, kütüphanesiz.
 *
 * TABAN NATIVE YATAY SCROLL: kap `overflow-x: auto`. Dokunmatikte parmak
 * hareketi, klavye odağı ve ekran okuyucu bu sayede hiç JS'e muhtaç değil.
 * Üstüne eklenenler (yalnızca ihtiyaç olan yerde):
 *
 *   - FARE SÜRÜKLEME (pointerType "mouse"): 4px eşiğinden sonra sürükleme
 *     sayılır; sürükleme biten bir tıklama link'i AÇMAZ. Momentum yok —
 *     referans gibi bırakılan yerde durur.
 *   - TEKERLEK / TRACKPAD: yatay delta her zaman galeriyi kaydırır. Dikey
 *     delta yalnızca galeri ORTALANMIŞKEN yatay kaymaya döner ve bir uca
 *     varınca sayfaya bırakılır (`releaseOnEdges`). `center` açıksa
 *     (anasayfa) galeri merkeze yakınken gelen ilk dikey tekerlek önce sayfayı
 *     yumuşakça kaydırıp galeriyi tam ortalar, yatay kayma ondan sonra
 *     başlar — kullanıcı geri bildirimi: galeri ortada değilken başlayan
 *     yatay kayma kontrolü zorlaştırıyordu. Kaba fare adımları yumuşatılır,
 *     trackpad'in ince delta'ları doğrudan uygulanır.
 *   - ← / → BUTONLARI ve klavye okları: bir kare ileri/geri. Hızlı art arda
 *     basışta adım HEDEFTEN hesaplanır (o anki konumdan değil) — animasyon
 *     bitmeden basılan her tık bir kare daha ilerler, kaybolmaz.
 *
 * Konum tek bir `target` değişkeninde; tüm girişler onu değiştirir ve tek bir
 * rAF döngüsü `scrollLeft`i ona yaklaştırır. Native scroll (dokunma, scrollbar)
 * döngü çalışmıyorken `target`i kendi konumuna eşitler.
 */
const DRAG_THRESHOLD = 4;
const EASE = 0.16;

export default function DragGallery({
  label,
  children,
  className,
  head,
  center = false,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  /** Kontrol satırının solundaki başlık (anasayfa: bant başlığı ←/→ ile aynı satırda). */
  head?: ReactNode;
  /** Dikey tekerlek yatay kaymaya dönmeden önce galeriyi ekranda ortala. */
  center?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const el = viewportRef.current;
    if (!root || !el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const prev = root.querySelector<HTMLButtonElement>("[data-gallery-prev]");
    const next = root.querySelector<HTMLButtonElement>("[data-gallery-next]");
    const bar = root.querySelector<HTMLElement>("[data-gallery-progress]");

    let target = el.scrollLeft;
    let current = el.scrollLeft;
    let raf = 0;
    let uiQueued = false;

    const max = () => Math.max(0, el.scrollWidth - el.clientWidth);
    const clamp = (x: number) => Math.min(max(), Math.max(0, x));

    const syncUi = () => {
      uiQueued = false;
      const m = max();
      const x = el.scrollLeft;
      if (prev) prev.disabled = x <= 1;
      if (next) next.disabled = x >= m - 1;
      if (bar) bar.style.transform = `scaleX(${m ? Math.min(1, x / m) : 1})`;
    };
    const queueUi = () => {
      if (uiQueued) return;
      uiQueued = true;
      requestAnimationFrame(syncUi);
    };

    const step = () => {
      const k = reduced.matches ? 1 : EASE;
      current += (target - current) * k;
      if (Math.abs(target - current) < 0.5) current = target;
      el.scrollLeft = current;
      raf = current === target ? 0 : requestAnimationFrame(step);
    };
    const animateTo = (x: number) => {
      target = clamp(x);
      if (!raf) {
        current = el.scrollLeft;
        raf = requestAnimationFrame(step);
      }
    };
    const jumpTo = (x: number) => {
      cancelAnimationFrame(raf);
      raf = 0;
      target = current = clamp(x);
      el.scrollLeft = current;
    };

    // ---- kare adımları (butonlar + klavye) --------------------------------
    const itemStarts = () => {
      const pad = parseFloat(getComputedStyle(el).paddingInlineStart) || 0;
      const base = el.getBoundingClientRect().left - el.scrollLeft + pad;
      return Array.from(el.querySelectorAll<HTMLElement>(".drag-gallery__track > *")).map(
        (item) => clamp(item.getBoundingClientRect().left - base)
      );
    };
    const stepBy = (dir: 1 | -1) => {
      const starts = itemStarts();
      const from = target;
      const found =
        dir > 0
          ? starts.find((x) => x > from + 2)
          : [...starts].reverse().find((x) => x < from - 2);
      animateTo(found ?? (dir > 0 ? max() : 0));
    };
    const onPrev = () => stepBy(-1);
    const onNext = () => stepBy(1);
    prev?.addEventListener("click", onPrev);
    next?.addEventListener("click", onNext);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") stepBy(1);
      else if (event.key === "ArrowLeft") stepBy(-1);
      else if (event.key === "Home") animateTo(0);
      else if (event.key === "End") animateTo(max());
      else return;
      event.preventDefault();
    };
    el.addEventListener("keydown", onKey);

    // ---- tekerlek / trackpad -----------------------------------------------
    // Galerinin merkezi ile görünür alanın (fixed header'ın altı) merkezi
    // arasındaki fark, px.
    const centerOffset = () => {
      const r = el.getBoundingClientRect();
      const navH = document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 0;
      return r.top + r.height / 2 - (window.innerHeight + navH) / 2;
    };
    let aligningUntil = 0;
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return; // pinch-zoom
      const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
      let delta = horizontal ? event.deltaX : event.deltaY;
      if (event.deltaMode === 1) delta *= 16;
      else if (event.deltaMode === 2) delta *= el.clientWidth;
      if (!delta) return;
      if (!horizontal) {
        const offset = centerOffset();
        const near = Math.abs(offset) < window.innerHeight * (center ? 0.32 : 0.3);
        if (!near) return; // galeri henüz ortaya gelmedi → normal sayfa scroll'u
        const m0 = max();
        const releasing = (target <= 0.5 && delta < 0) || (target >= m0 - 0.5 && delta > 0);
        if (releasing) return;
        if (center && Math.abs(offset) > 6) {
          // Önce ortala (yumuşak), bu sırada gelen tekerlekleri yut.
          event.preventDefault();
          const now = performance.now();
          if (now > aligningUntil) {
            aligningUntil = now + 450;
            window.scrollTo({ top: window.scrollY + offset, behavior: "smooth" });
          }
          return;
        }
      }
      const m = max();
      const atStart = target <= 0.5 && delta < 0;
      const atEnd = target >= m - 0.5 && delta > 0;
      if (atStart || atEnd) return; // uca varıldı → sayfaya bırak
      event.preventDefault();
      const coarse = event.deltaMode !== 0 || Math.abs(delta) >= 50;
      if (coarse) animateTo(target + delta);
      else jumpTo(target + delta);
    };
    el.addEventListener("wheel", onWheel, { passive: false });

    // ---- fare sürükleme ------------------------------------------------------
    let pointerId: number | null = null;
    let startX = 0;
    let startTarget = 0;
    let dragged = false;
    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startTarget = el.scrollLeft;
      dragged = false;
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      const dx = event.clientX - startX;
      if (!dragged && Math.abs(dx) < DRAG_THRESHOLD) return;
      if (!dragged) {
        dragged = true;
        el.setPointerCapture(event.pointerId);
        root.dataset.dragging = "true";
      }
      jumpTo(startTarget - dx);
    };
    const onUp = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      pointerId = null;
      if (el.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId);
      delete root.dataset.dragging;
    };
    // Sürükleme sonundaki tıklama link'i açmasın (capture: link'ten önce).
    const onClick = (event: MouseEvent) => {
      if (dragged) {
        event.preventDefault();
        event.stopPropagation();
        dragged = false;
      }
    };
    const onDragStart = (event: DragEvent) => event.preventDefault();
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("click", onClick, true);
    el.addEventListener("dragstart", onDragStart);

    // ---- native scroll + yeniden boyutlandırma -----------------------------
    const onScroll = () => {
      if (!raf && pointerId === null) target = current = el.scrollLeft;
      queueUi();
    };
    const onResize = () => {
      jumpTo(el.scrollLeft);
      queueUi();
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    syncUi();

    return () => {
      cancelAnimationFrame(raf);
      prev?.removeEventListener("click", onPrev);
      next?.removeEventListener("click", onNext);
      el.removeEventListener("keydown", onKey);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("click", onClick, true);
      el.removeEventListener("dragstart", onDragStart);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [center]);

  return (
    <div ref={rootRef} className={`drag-gallery${className ? ` ${className}` : ""}`}>
      <div className="drag-gallery__controls">
        {head ? <div className="drag-gallery__head">{head}</div> : null}
        <span className="drag-gallery__progress" aria-hidden="true">
          <span data-gallery-progress />
        </span>
        <button type="button" className="drag-gallery__btn" data-gallery-prev aria-label="Önceki iş">
          ←
        </button>
        <button type="button" className="drag-gallery__btn" data-gallery-next aria-label="Sonraki iş">
          →
        </button>
      </div>
      <div
        ref={viewportRef}
        className="drag-gallery__viewport"
        role="region"
        aria-label={label}
        tabIndex={0}
        data-cursor="drag"
      >
        <div className="drag-gallery__track">{children}</div>
      </div>
    </div>
  );
}
