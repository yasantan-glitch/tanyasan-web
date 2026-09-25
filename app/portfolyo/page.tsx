import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { NAV_CTA } from "@/app/components/nav/navLinks";
import {
  CASE_LEAD_SHOT,
  CASE_PARAGRAPHS,
  CASE_TITLE,
} from "@/app/content/emlakCrmPro";
import { PORTFOLIO_ITEMS } from "@/app/content/portfolio";

import PortfolioFilter from "./PortfolioFilter";

export const metadata: Metadata = {
  title: "Portfolyo — Tan Yasan Reklam ve Tasarım Ajansı",
  description:
    "Kurumsal kimlikten kampanyaya: logo, kurumsal kimlik ve sosyal medya çalışmaları, ve sıfırdan kodlanan Emlak CRM Pro vaka çalışması.",
};

/**
 * /portfolyo — brief §4'ün "Portfolyo (kategorili)" sayfası. Anasayfa bant
 * 4'ün (yatay ray) kısaltılmış hali DEĞİL, tam liste: `PORTFOLIO_ITEMS`'ın
 * tamamı, kategori filtresiyle. Bkz. docs/design-system.md §13.
 *
 * YENİ METİN YOK: başlık ve lede anasayfa bant 4'ün cümleleri, öne çıkan
 * satırın metni bant 3'ün (content/emlakCrmPro.ts). Sayfa-yerel sabit
 * bırakıldı, çünkü bant 4'ün metni hâlâ app/page.tsx'te satır içi — iki
 * tüketiciye çıktığında ortak kaynağa alınabilir.
 *
 * YÜZEY SIRASI: ink-deep (başlık + öne çıkan iş) → ink (grid, seam) →
 * accent (kapanış, seam). Anasayfa bant 3→4→6'nın aynı ritmi: ekran
 * görüntüleri gri paspartayla en derin tonda, kampanya kareleri bir ton
 * açıkta (§12'nin gerekçesi).
 *
 * HAREKET: yalnızca mevcut substrat — başlıkta `data-enter="mask"`, öne
 * çıkan karede `case-focus` (anasayfa bant 3'ün imzası), grid'de
 * `data-enter-stagger`. Yatay ray, sticky sahne ya da named view-timeline
 * YOK.
 *
 * layout.tsx zaten <main id="icerik"> sağlıyor — ikinci bir <main> açılmaz.
 */
export default function PortfolyoPage() {
  return (
    <>
      {/* Başlık bandı + öne çıkan iş. Nav bu sayfada baştan solid ve fixed —
          üst boşluğa nav yüksekliği elle eklenir (/hizmetler ile aynı). */}
      <section className="surface-ink surface-ink-deep px-(--spacing-gutter) pb-(--spacing-section) pt-[calc(var(--nav-h)+var(--spacing-section))]">
        <div className="mx-auto max-w-(--container-wide)">
          <p className="eyebrow text-accent-auto mb-6">Portfolyo</p>
          <h1
            className="font-display text-strong max-w-[20ch]"
            data-enter="mask"
            style={{
              fontSize: "var(--text-display-2xl)",
              lineHeight: "var(--text-display-2xl--line-height)",
              letterSpacing: "var(--text-display-2xl--letter-spacing)",
              fontWeight: "var(--text-display-2xl--font-weight)",
            }}
          >
            KURUMSAL KİMLİKTEN KAMPANYAYA
          </h1>
          <p className="text-lead text-muted mt-8 max-w-(--container-prose)">
            Farklı sektörlerden seçilmiş işler — logo ve kurumsal kimlikten
            web tasarıma, sosyal medya kampanyalarına.
          </p>

          {/* ÖNE ÇIKAN İŞ — sayfadaki TEK tıklanabilir iş, çünkü vaka sayfası
              olan tek iş bu. Filtrenin DIŞINDA: kategori fasetine (brief §7)
              ait değil, grid'in dokuzuncu hücresi de değil. Tüm satır tek bir
              link (kare + başlık + CTA), ayrı ayrı iki link değil — klavyede
              tek durak. */}
          <Link
            href="/portfolyo/emlak-crm-pro"
            className="portfolio-feature mt-(--spacing-section)"
          >
            <div className="portfolio-feature__text">
              <p className="eyebrow text-accent-auto">
                Yazılım · Vaka Çalışması
              </p>
              <h2 className="portfolio-feature__title font-display text-strong">
                {CASE_TITLE}
              </h2>
              <p className="text-muted max-w-(--container-prose)">
                {CASE_PARAGRAPHS[0]}
              </p>
              <span className="btn btn-accent eyebrow inline-flex">
                Projeyi İncele →
              </span>
            </div>
            <figure className="portfolio-feature__media" data-enter>
              <div className="home-case-frame">
                <Image
                  src={CASE_LEAD_SHOT.src}
                  alt={CASE_LEAD_SHOT.alt}
                  fill
                  sizes="(max-width: 860px) 100vw, 55vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <figcaption className="home-case-caption eyebrow text-muted">
                {CASE_LEAD_SHOT.caption}
              </figcaption>
            </figure>
          </Link>
        </div>
      </section>

      {/* Tam liste. Koyu zemin — kampanya kareleri koyuda ayrışıyor
          (anasayfa bant 4 ile aynı gerekçe). */}
      <section className="surface-ink seam px-(--spacing-gutter) py-(--spacing-section)">
        <div className="mx-auto max-w-(--container-wide)">
          <PortfolioFilter items={PORTFOLIO_ITEMS} />
        </div>
      </section>

      {/* Kapanış — anasayfa bant 6'nın kalıbı (surface-accent + .btn-ink).
          Cümle yeni değil: anasayfanın kapanış cümlesi. */}
      <section className="surface-accent seam px-(--spacing-gutter) py-(--spacing-section)">
        <div className="mx-auto flex max-w-(--container-wide) flex-wrap items-end justify-between gap-8">
          <p
            className="font-display max-w-[16ch]"
            data-enter="mask"
            style={{
              fontSize: "var(--text-display-xl)",
              lineHeight: "var(--text-display-xl--line-height)",
              letterSpacing: "var(--text-display-xl--letter-spacing)",
              fontWeight: "var(--text-display-xl--font-weight)",
            }}
          >
            SIRADAKİ İŞ SİZİNKİ OLSUN.
          </p>
          <Link href={NAV_CTA.href} className="btn btn-ink eyebrow">
            {NAV_CTA.label}
          </Link>
        </div>
      </section>
    </>
  );
}
