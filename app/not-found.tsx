import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sayfa bulunamadı",
  description: "Aradığınız sayfa taşınmış ya da kaldırılmış olabilir.",
  robots: { index: false, follow: true },
};

/**
 * 404 — layout.tsx header/footer'ı ve <main id="icerik">'i zaten sağlıyor,
 * burada ikinci bir <main> açılmaz. Koyu başlık bandının dilini (eyebrow +
 * display başlık + lead) /iletisim ile paylaşır; iki çıkış: ana sayfa ve
 * iletişim. Next bu dosyayı eşleşmeyen rotalarda 404 durum koduyla sunar.
 */
export default function NotFound() {
  return (
    <section className="surface-ink surface-ink-deep px-(--spacing-gutter) pb-(--spacing-section) pt-[calc(var(--nav-h)+var(--spacing-section))]">
      <div className="mx-auto max-w-(--container-page)">
        <p className="eyebrow text-accent-auto mb-6">404</p>
        <h1
          className="font-display text-strong"
          style={{
            fontSize: "var(--text-display-2xl)",
            lineHeight: "var(--text-display-2xl--line-height)",
            letterSpacing: "var(--text-display-2xl--letter-spacing)",
            fontWeight: "var(--text-display-2xl--font-weight)",
          }}
        >
          SAYFA
          <br />
          BULUNAMADI
        </h1>
        <p className="text-lead text-muted mt-8 max-w-(--container-prose)">
          Aradığınız sayfa taşınmış, kaldırılmış ya da adres yanlış yazılmış
          olabilir. Ana sayfadan devam edebilir ya da doğrudan bize yazabilirsiniz.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/" className="btn btn-accent eyebrow inline-flex">
            Ana sayfaya dön →
          </Link>
          <Link href="/iletisim" className="btn btn-ghost eyebrow inline-flex">
            İletişime geç →
          </Link>
        </div>
      </div>
    </section>
  );
}
