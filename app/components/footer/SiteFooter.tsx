import Link from "next/link";
import { Share2 } from "lucide-react";

import { NAV_CTA, NAV_LINKS } from "@/app/components/nav/navLinks";
import { SOCIAL_LINKS } from "@/app/content/socialLinks";

import BackToTop from "./BackToTop";
import FooterClock from "./FooterClock";
import SocialIcon from "./SocialIcon";

/**
 * Site footer'ı — Ekim 2026, Hayler referansı. Tüm sayfalarda (layout.tsx).
 *
 * KORUNANLAR (kullanıcı isteği): sloganımız ("SIRADAKİ İŞ SİZİNKİ OLSUN.")
 * eski kapanış bandındaki yerinde — sol üstte, büyük — ve rengimiz
 * (`surface-accent`, amber). Geri kalan her şey Hayler'den:
 *   - sağda saat widget'ı (İstanbul),
 *   - kendini çizen ayraç çizgisi,
 *   - iki sütun: "Birlikte Çalışalım" (Hayler'in "Work with Us"u — adres ve
 *     iletişim bilgisi BİLEREK YOK, yalnızca teklif butonu) ve
 *     "Site Haritası" (üç satırlık sütunlara akan, ok kayan linkler),
 *   - alt satır: Başa Dön · telif · "Bizi Takip Edin" (hover'da ikonlar
 *     sırayla yükselir),
 *   - parallax: içerik footer girerken yukarıdan süzülür, slogan harfleri
 *     scroll'la yuvarlanır.
 * Hareketlerin hepsi gated (globals.css `.site-footer`); taban hâl durağan
 * ve eksiksiz.
 */
const SLOGAN = "SIRADAKİ İŞ SİZİNKİ OLSUN.";

const SITEMAP = [
  ...NAV_LINKS.slice(0, 3),
  { href: "/portfolyo/emlak-crm-pro", label: "Emlak CRM Pro" },
  ...NAV_LINKS.slice(3),
];

/** Harf harf yuvarlanan slogan — her harf iki kopya, scroll'la bir satır
 * yukarı kayıyor (Hayler `has-slide`). Kelimeler kırılmasın diye harfler
 * kelime span'ı içinde. Ekran okuyucu yalnızca `aria-label`ı okur. */
function RollingSlogan() {
  let index = 0;
  return (
    <p className="site-footer__slogan font-display" aria-label={SLOGAN}>
      {SLOGAN.split(" ").map((word, wordIndex) => (
        <span key={wordIndex} className="roll-word" aria-hidden="true">
          {Array.from(word).map((char) => {
            const i = index++;
            return (
              <span key={i} className="roll-char" style={{ "--c": i } as React.CSSProperties}>
                <span className="roll-char__inner">
                  <span>{char}</span>
                  <span>{char}</span>
                </span>
              </span>
            );
          })}
        </span>
      ))}
    </p>
  );
}

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer surface-accent seam">
      <div className="site-footer__clip">
        <div className="site-footer__inner">
          <div className="site-footer__top">
            <RollingSlogan />
            <FooterClock />
          </div>

          <hr className="site-footer__line" />

          <div className="site-footer__cols">
            <div className="site-footer__col">
              <hr />
              <p className="site-footer__label">Birlikte Çalışalım</p>
              <hr />
              <Link href={NAV_CTA.href} className="btn btn-ink eyebrow">
                {NAV_CTA.label} →
              </Link>
            </div>

            <nav className="site-footer__col" aria-label="Site haritası">
              <hr />
              <p className="site-footer__label">Site Haritası</p>
              <hr />
              <ul className="footer-nav">
                {SITEMAP.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="footer-nav__link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="site-footer__credits">
            <BackToTop />
            <p className="site-footer__copy">
              {year} © Tan Yasan. Tüm hakları saklıdır.
            </p>
            <div className="footer-socials">
              <span className="footer-socials__text" aria-hidden="true">
                Bizi Takip Edin
                <Share2 strokeWidth={1.5} />
              </span>
              <ul className="footer-socials__list" aria-label="Sosyal medya">
                {SOCIAL_LINKS.map((social) => (
                  <li key={social.href}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${social.label} — yeni sekmede açılır`}
                    >
                      <SocialIcon name={social.icon} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
