"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";

/**
 * Vaka sayfası ekran görüntüleri için tam ekran büyütme (Ekim 2026).
 *
 * Çerçeve sunucuda basılıyor (`children`); bu bileşen üstüne şeffaf bir
 * düğme bindiriyor (div'i düğmenin içine koymak geçersiz HTML olurdu) ve
 * tıklanınca yerel `<dialog>`u `showModal()` ile açıyor. Dialog'un modal
 * hâli işi bizim yerimize yapıyor: odak içeride tutuluyor (arka plan inert),
 * Esc `cancel` → `close` olarak geliyor.
 * Elle yazılan tek şey: scroll kilidi (MobileDrawer'daki gibi `html`
 * overflow'u) ve arka plana tıklayarak kapatma.
 *
 * Görsel yalnızca açıkken basılıyor (iki PNG'yi sayfa açılışında indirmesin)
 * ve açıldığı andaki tema anahtarına (`data-shot-theme`) bakıyor.
 */
interface Props {
  light: string;
  dark: string;
  alt: string;
  children: ReactNode;
}

export default function ShotZoom({ light, dark, alt, children }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  const open = theme !== null;

  const show = () => {
    const current = wrapRef.current
      ?.closest("[data-shot-theme]")
      ?.getAttribute("data-shot-theme");
    setTheme(current === "dark" ? "dark" : "light");
  };

  // Dialog DOM'a girdikten sonra modal olarak aç.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog || dialog.open) return;
    dialog.showModal();
  }, [open]);

  // Scroll kilidi. html'deki kalıcı `scrollbar-gutter: stable` sayfa
  // genişliğini sabit tutuyor (MobileDrawer ile aynı gerekçe).
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  // Odağı açan düğmeye açıkça geri veriyoruz: tarayıcının kendi geri
  // yüklemesi, dialog'u state ile söktüğümüz ve Safari düğmeye tıklamada
  // odak vermediği için güvenilir değil.
  const close = useCallback(() => {
    setTheme(null);
    triggerRef.current?.focus();
  }, []);

  return (
    <div ref={wrapRef} className="case-shot__zoomwrap">
      {children}
      <button
        ref={triggerRef}
        type="button"
        className="case-shot__zoom"
        aria-haspopup="dialog"
        aria-label={`Büyüt: ${alt}`}
        onClick={show}
      />
      {open ? (
        <dialog
          ref={dialogRef}
          className="lightbox"
          aria-label={alt}
          onClose={close}
          onClick={(event) => {
            // Görselin ve düğmenin dışındaki her tıklama (arka plan dahil)
            // kapatır; dialog tüm viewport'u kapladığı için `::backdrop`
            // tıklaması hedef olarak dialog'un kendisini verir.
            const target = event.target as HTMLElement;
            if (!target.closest(".lightbox__img, .lightbox__close")) {
              dialogRef.current?.close();
            }
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
          <div className="lightbox__stage">
            <Image
              src={theme === "dark" ? dark : light}
              alt={alt}
              width={1910}
              height={990}
              sizes="100vw"
              className="lightbox__img"
            />
          </div>
        </dialog>
      ) : null}
    </div>
  );
}
