"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { Menu } from "lucide-react";
import { HeroLogoSolid } from "../hero/HeroLogo";
import MobileDrawer from "./MobileDrawer";
import { NAV_CTA, NAV_LINKS, isActive } from "./navLinks";
import { useScrolledPastSentinel } from "./useScrolledPastSentinel";

/**
 * Sayfa boyunca sabit duran header.
 *
 * Anasayfada hero'nun ilk ekranı boyunca şeffaf kalır (video ve hero'nun
 * kendi logo animasyonu görünür), intro fazı bittikten sonra koyu/blur'lu
 * zemine geçer. Hero'suz sayfalarda baştan solid.
 *
 * Konumlandırma `fixed`: .hero-stage'in `overflow: clip`i içeriye konan bir
 * header'ı kırpardı, ayrıca fixed olduğu için doküman akışını değiştirmiyor
 * ve useHeroScroll'un cache'lediği ölçümleri geçersizleştirmiyor.
 */
export default function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { sentinelRef, solid } = useScrolledPastSentinel(isHome);

  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      {isHome ? <div ref={sentinelRef} className="nav-sentinel" aria-hidden="true" /> : null}

      <header className="site-header surface-ink" data-solid={solid}>
        <div className="site-header-inner">
          <Link href="/" className="site-header-logo" aria-label="Tan Yasan — anasayfa">
            <HeroLogoSolid />
          </Link>

          <nav aria-label="Ana menü" className="nav-links ms-auto">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link eyebrow"
                aria-current={isActive(pathname, link.href) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link href={NAV_CTA.href} className="btn btn-accent eyebrow">
            {NAV_CTA.label}
          </Link>

          <button
            ref={toggleRef}
            type="button"
            className="nav-toggle ms-auto"
            aria-label="Menüyü aç"
            aria-expanded={open}
            aria-controls="mobil-menu"
            onClick={() => setOpen(true)}
          >
            <Menu strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      </header>

      <MobileDrawer open={open} onClose={close} returnFocusRef={toggleRef} />
    </>
  );
}
