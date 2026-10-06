"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import type { PortfolioItem } from "@/app/content/portfolio";

/**
 * Kategori detayındaki işler için tam ekran görünüm. ShotZoom'un (vaka
 * sayfası) aynı iskeleti: yerel `<dialog>` + `showModal()` (odak tuzağı,
 * inert arka plan, Esc → `close`), `html` overflow kilidi, görselin dışına
 * tıklayınca kapanma. Üstüne: galerideki sırayla önceki/sonraki.
 *
 * UÇLARDA DÖNER (sonuncudan sonra ilk): galeri kısa ve sıralı, ucu ölü
 * düğmeyle bitirmek yerine akış sürsün diye.
 *
 * Girişler: ←/→ tuşları, ok düğmeleri, yatay kaydırma (dokunma/kalem; fare
 * sürüklemesi sayılmaz — fareyle bu görünümde sürüklenecek bir şey yok).
 * 48px'ten uzun, ağırlıklı yatay bir hareket geçiş sayılır; dikey hareket
 * ve kısa dokunuşlar (arka plan tıklaması) etkilenmez.
 *
 * Açık durum (`index`) üstte tutuluyor; gezinme `onIndex` ile yukarı gider.
 * Odak, kapanınca o an gösterilen işin galerideki düğmesine döner — açan
 * düğmeye değil: gezinmişse galeri de oraya hizalanıyor, odak ve görünüm
 * aynı kareyi göstersin.
 */
interface Props {
  items: readonly PortfolioItem[];
  index: number;
  onIndex: (index: number) => void;
  onClose: (index: number) => void;
}

const SWIPE_PX = 48;

export default function WorkLightbox({ items, index, onIndex, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const item = items[index];
  const many = items.length > 1;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  // Scroll kilidi — ShotZoom ile aynı (önceki değer geri yazılıyor; kart
  // açıkken sayfa zaten kilitli, o kilit bozulmaz).
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, []);

  const go = (dir: 1 | -1) => onIndex((index + dir + items.length) % items.length);

  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    // Kartın Escape'i detayı kapatıyor (PortfolioStack). Lightbox o ağaçta
    // oturuyor, olay yukarı çıkmasın — Esc yalnızca lightbox'ı kapatsın.
    event.stopPropagation();
    if (!many) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    }
  };

  const onPointerDown = (event: ReactPointerEvent) => {
    swipe.current =
      event.pointerType === "mouse" ? null : { x: event.clientX, y: event.clientY };
  };
  const onPointerUp = (event: ReactPointerEvent) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start || !many) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) >= SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
  };

  return (
    <dialog
      ref={dialogRef}
      className="lightbox"
      aria-label={`${item.brand} — ${index + 1} / ${items.length}`}
      onClose={() => onClose(index)}
      onKeyDown={onKeyDown}
      onClick={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest(".lightbox__close, .lightbox__nav, .lightbox__caption a")) return;
        // Görsel hücreyi dolduruyor (`object-fit: contain`): kutu içindeki boş
        // şerit görsel sayılmaz. Tıklama gerçekten çizilen piksellerin
        // üstündeyse kapatma, dışındaysa (arka plan) kapat.
        if (target instanceof HTMLImageElement && target.naturalWidth) {
          const box = target.getBoundingClientRect();
          const scale = Math.min(box.width / target.naturalWidth, box.height / target.naturalHeight);
          const w = target.naturalWidth * scale;
          const h = target.naturalHeight * scale;
          const x = event.clientX - (box.left + (box.width - w) / 2);
          const y = event.clientY - (box.top + (box.height - h) / 2);
          if (x >= 0 && x <= w && y >= 0 && y <= h) return;
        }
        dialogRef.current?.close();
      }}
    >
      <button
        type="button"
        className="lightbox__close eyebrow"
        onClick={() => dialogRef.current?.close()}
      >
        Kapat
        <span aria-hidden="true"> ✕</span>
      </button>

      <p className="lightbox__caption eyebrow" aria-live="polite">
        <span className="lightbox__count">
          {index + 1} / {items.length}
        </span>
        <span className="lightbox__title">{item.brand}</span>
        <span className="lightbox__meta">{item.event ?? item.category}</span>
        {item.href ? (
          <Link href={item.href} className="lightbox__more">
            Vaka çalışmasını gör →
          </Link>
        ) : null}
      </p>

      <div
        className="lightbox__stage lightbox__stage--work"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (swipe.current = null)}
      >
        <Image
          key={item.src}
          src={item.src}
          alt={item.alt}
          width={item.width ?? 1600}
          height={item.height ?? 1200}
          sizes="100vw"
          priority
          className="lightbox__img lightbox__img--work"
          draggable={false}
        />
      </div>

      {many ? (
        <>
          <button
            type="button"
            className="lightbox__nav lightbox__nav--prev"
            aria-label="Önceki iş"
            onClick={() => go(-1)}
          >
            ←
          </button>
          <button
            type="button"
            className="lightbox__nav lightbox__nav--next"
            aria-label="Sonraki iş"
            onClick={() => go(1)}
          >
            →
          </button>
        </>
      ) : null}
    </dialog>
  );
}
