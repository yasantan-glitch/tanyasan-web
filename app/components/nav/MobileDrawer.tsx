"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { NAV_CTA, NAV_LINKS, isActive } from "./navLinks";

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Kapanışta odağın döneceği hamburger butonu. */
  returnFocusRef: React.RefObject<HTMLButtonElement | null>;
}

/**
 * Sağdan kayan mobil menü.
 *
 * Panel sürekli DOM'da durur ve `data-open` ile sürülür (CSS'te). Böylece
 * açılış/kapanış geçişi için zamanlayıcıya veya `transitionend`'e ihtiyaç
 * kalmıyor — prefers-reduced-motion geçiş sürelerini 0.01ms'ye indirdiğinde
 * JS tarafında hiçbir şey bozulmuyor. Kapalıyken `inert`, panelin klavye ve
 * ekran okuyucu erişimini kapatır.
 */
export default function MobileDrawer({ open, onClose, returnFocusRef }: MobileDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Rota değişince kapan — link tıklamasının yakalanmadığı durumlar
  // (klavye ile aktivasyon, prefetch'li geçiş) için de güvence.
  useEffect(() => {
    onClose();
    // pathname dışındaki bağımlılıklar kasten yok: bu efekt yalnızca
    // rota değişiminde çalışmalı.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Masaüstüne genişleyince açık drawer anlamsız kalır.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 861px)");
    const onChange = () => {
      if (mq.matches) onClose();
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [onClose]);

  // Arka plan scroll kilidi. html'de kalıcı `scrollbar-gutter: stable`
  // olduğu için kilit anında sayfa genişliği değişmiyor — hero'nun
  // cache'lediği ölçümler bozulmuyor.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  // Odak yönetimi: açılışta panele gir, ESC ile çık, Tab panelde döner,
  // kapanışta odak hamburger'a geri döner.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    // Cleanup'ta okunmak üzere kopyalanıyor (ref o an değişmiş olabilir).
    const returnFocusTo = returnFocusRef.current;

    // Panel açıkken içindeki her şey görünür — ek görünürlük filtresine
    // gerek yok.
    const focusables = () => Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));

    focusables()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const items = focusables();
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      returnFocusTo?.focus();
    };
  }, [open, onClose, returnFocusRef]);

  return (
    <>
      <div className="nav-overlay" data-open={open} onClick={onClose} aria-hidden="true" />

      <div
        ref={panelRef}
        id="mobil-menu"
        className="nav-drawer surface-ink surface-ink-deep"
        data-open={open}
        role="dialog"
        aria-modal="true"
        aria-label="Menü"
        inert={!open}
      >
        <div className="nav-drawer-head">
          <span className="eyebrow" style={{ color: "var(--color-fg-on-ink-muted)" }}>
            Menü
          </span>
          <button type="button" onClick={onClose} aria-label="Menüyü kapat" className="nav-toggle">
            <X strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Mobil menü" className="nav-drawer-links">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link eyebrow border-hairline"
              aria-current={isActive(pathname, link.href) ? "page" : undefined}
              onClick={onClose}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link href={NAV_CTA.href} className="btn btn-accent eyebrow" onClick={onClose}>
          {NAV_CTA.label}
        </Link>
      </div>
    </>
  );
}
