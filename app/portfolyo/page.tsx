import type { Metadata } from "next";
import { PORTFOLIO_CATEGORIES } from "@/app/content/portfolioCategories";

import PortfolioStack from "./PortfolioStack";

export const metadata: Metadata = {
  title: "Portfolyo — Tan Yasan Reklam ve Tasarım Ajansı",
  description:
    "Kurumsal kimlikten kampanyaya, tasarımdan yazılıma: logo, kurumsal kimlik, sosyal medya ve web tasarım çalışmaları ile sıfırdan kodlanan Emlak CRM Pro.",
};

/**
 * /portfolyo — Ekim 2026 yeniden kurgusu (gertix.studio/portfolio
 * referansı). Kategori filtresi + ızgara ve "Yazılım · Vaka Çalışması"
 * satırı KALDIRILDI; yerine her kategori için bir kart, kartlar scroll'la
 * üst üste biniyor (PortfolioStack). Son kart "YAZILIM & UYGULAMA" — vaka
 * sayfasına giden tek kart. Bkz. docs/design-system.md §13.
 *
 * YÜZEY SIRASI: ink-deep (başlık) → kartların kendi tonları (açıktan koyuya)
 * → site footer'ı (accent; eski sayfa-yerel kapanış bandı footer'a taşındı).
 *
 * layout.tsx zaten <main id="icerik"> sağlıyor — ikinci bir <main> açılmaz.
 */
export default function PortfolyoPage() {
  return (
    <>
      {/* Başlık bandı. Nav fixed — üst boşluğa nav yüksekliği elle eklenir. */}
      <section className="surface-ink surface-ink-deep px-(--spacing-gutter) pb-(--spacing-section) pt-[calc(var(--nav-h)+var(--spacing-section))]">
        <div className="mx-auto max-w-(--container-page)">
          <p className="eyebrow text-accent-auto mb-6">Portfolyo</p>
          <h1
            className="font-display text-strong"
            data-enter="mask"
            style={{
              fontSize: "var(--text-display-2xl)",
              lineHeight: "var(--text-display-2xl--line-height)",
              letterSpacing: "var(--text-display-2xl--letter-spacing)",
              fontWeight: "var(--text-display-2xl--font-weight)",
            }}
          >
            KURUMSAL KİMLİKTEN KAMPANYAYA
            <br />
            TASARIMDAN YAZILIMA
          </h1>
          <p className="text-lead text-muted mt-8 max-w-(--container-prose)">
            Farklı sektörlerden seçilmiş işler — logo ve kurumsal kimlikten
            sosyal medya kampanyalarına, web tasarımdan sıfırdan kodlanan
            yazılımlara. Bir kategoriye dokunun, işleri açılsın.
          </p>
        </div>
      </section>

      <PortfolioStack categories={PORTFOLIO_CATEGORIES} />

    </>
  );
}
