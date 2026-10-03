"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useRef, useState, type CSSProperties } from "react";
import { Menu } from "lucide-react";
import MobileDrawer from "./MobileDrawer";
import { NAV_CTA, NAV_LINKS, isActive } from "./navLinks";
import { useHeaderTone } from "./useHeaderTone";

/**
 * Sayfa boyunca sabit duran header — Hayler referansı (Ekim 2026).
 *
 * Header HİÇBİR ZAMAN solid zemine geçmiyor. Altından geçen bölüme göre
 * (bkz. `useHeaderTone`) iki şey değişiyor:
 *   - TON: koyu bölümde beyaz logo (`/Logo_Beyaz.svg`) + açık metin, açık
 *     bölümde koyu logo (`/Logo.svg`) + koyu metin. İki logo üst üste durur,
 *     yalnızca opaklıkları çapraz geçer — kaynak değişimi yok, flaş yok.
 *   - GRADYAN: arkadaki bölümün zemin renginden şeffafa inen bir katman;
 *     içerik header'ın altından kayarken okunurluk veriyor. Hero'nun koyu
 *     (videolu) fazlarında kapalı, orada eski scrim çalışıyor.
 *
 * Linkler ortada, yarı saydam/blur'lu bir kutuda (Hayler'in kutusu); aktif
 * sayfa ters renkli bir "chip", hover'da chip alttan yuvarlanarak gelir.
 *
 * Konumlandırma `fixed`: .hero-stage'in `overflow: clip`i içeriye konan bir
 * header'ı kırpardı, ayrıca fixed olduğu için doküman akışını değiştirmiyor
 * ve useHeroScroll'un cache'lediği ölçümleri geçersizleştirmiyor.
 */
export default function SiteHeader() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const { tone, gradient, accent } = useHeaderTone(headerRef, pathname);

  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <header
        ref={headerRef}
        className="site-header"
        data-tone={tone}
        data-gradient={gradient ? "on" : "off"}
        data-accent={accent ? "" : undefined}
        style={gradient ? ({ "--header-grad": gradient } as CSSProperties) : undefined}
      >
        <div className="site-header-gradient" aria-hidden="true" />

        <div className="site-header-inner">
          <Link
            href="/"
            className="site-header-logo"
            aria-label="Tan Yasan — anasayfa"
          >
            {/* Düz <img>: iki SVG'nin kendi renkleri var (beyaz / koyu
                gri wordmark + amber), next/image'in optimizer'ı SVG'yi
                zaten geçiriyor — kazancı yok. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Logo_Beyaz.svg"
              alt=""
              className="site-header-logo__img site-header-logo__img--on-dark"
              width={1080}
              height={335}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Logo.svg"
              alt=""
              className="site-header-logo__img site-header-logo__img--on-light"
              width={1080}
              height={335}
            />
          </Link>

          <nav aria-label="Ana menü" className="nav-pill">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-pill__link eyebrow"
                aria-current={isActive(pathname, link.href) ? "page" : undefined}
              >
                {/* Yuvarlanan katman: metin yukarı çıkarken aynı metnin
                    chip'li kopyası (::after, data-label) alttan gelir. */}
                <span className="nav-pill__roll" data-label={link.label}>
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="site-header-end">
            <Link href={NAV_CTA.href} className="btn btn-accent eyebrow">
              {NAV_CTA.label}
            </Link>

            <button
              ref={toggleRef}
              type="button"
              className="nav-toggle"
              aria-label="Menüyü aç"
              aria-expanded={open}
              aria-controls="mobil-menu"
              onClick={() => setOpen(true)}
            >
              <Menu strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <MobileDrawer open={open} onClose={close} returnFocusRef={toggleRef} />
    </>
  );
}
