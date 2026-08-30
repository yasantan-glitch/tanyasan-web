import type { Metadata } from "next";
import Link from "next/link";

import { NAV_CTA } from "@/app/components/nav/navLinks";
import { SERVICES } from "@/app/content/services";

export const metadata: Metadata = {
  title: "Hizmetler — Tan Yasan Reklam ve Tasarım Ajansı",
  description:
    "Dijitalde Fark Yaratın. Grafik tasarım, dijital pazarlama, web tasarımı, yazılım geliştirme, fotoğraf & video ve danışmanlık — altı hizmet, tek ekip.",
};

/**
 * /hizmetler — brief §5'in altı hizmet metninin evi.
 *
 * MEDYA YOK: public/hero-videos/*.mp4 hero'nun imzası olarak kalıyor. Altı
 * klibi buraya da taşımak sayfayı ağırlaştırır ve hero'nun etkisini
 * sulandırırdı; sayfa tipografi + hairline ile kuruluyor (design-system §4:
 * kart grid'i yok).
 *
 * layout.tsx zaten <main id="icerik"> sağlıyor — burada ikinci bir <main>
 * AÇILMAZ (/design-system'deki iç içe main bir hata, tekrarlanmıyor).
 */
export default function HizmetlerPage() {
  return (
    <>
      {/* Başlık bandı. Nav bu sayfada baştan solid ve position: fixed, yani
          akışta yer kaplamıyor — üst boşluğa nav yüksekliği elle eklenir. */}
      <section className="surface-ink surface-ink-deep px-(--spacing-gutter) pb-(--spacing-section-tight) pt-[calc(var(--nav-h)+var(--spacing-section))]">
        <div className="mx-auto max-w-(--container-site)">
          <p className="eyebrow text-accent-auto mb-6">Hizmetler</p>
          <h1
            className="font-display text-strong"
            style={{
              fontSize: "var(--text-display-2xl)",
              lineHeight: "var(--text-display-2xl--line-height)",
              letterSpacing: "var(--text-display-2xl--letter-spacing)",
              fontWeight: "var(--text-display-2xl--font-weight)",
            }}
          >
            GÖRÜNEN YÜZ VE
            <br />
            ARKADA ÇALIŞAN SİSTEM
          </h1>
          <p className="text-lead text-muted mt-8 max-w-(--container-prose)">
            Bir markanın tasarımını yapan ekiple, o markanın işini yürüten
            yazılımı kuran ekip aynı olduğunda ikisi birbirini bozmuyor. Altı
            hizmet çizgisi, tek ekip.
          </p>

          {/* Çapa rayı. html { scroll-padding-top: var(--nav-h) } globals.css'te
              zaten var, hedef başlık fixed nav'ın altına düşmüyor. */}
          <nav aria-label="Hizmetler listesi" className="service-index">
            {SERVICES.map((service) => (
              <a key={service.id} href={`#${service.id}`} className="eyebrow">
                {service.title}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* Altı hizmet, tam genişlik ve dönüşümlü yüzeyde. Renkler/hairline
          yüzeyden geliyor (surface-ink / surface-paper), bölüm içinde tek bir
          sabit renk yok. */}
      {SERVICES.map((service, index) => (
        <section
          key={service.id}
          id={service.id}
          className={`service-section px-(--spacing-gutter) py-(--spacing-section) ${
            index % 2 === 0 ? "surface-paper" : "surface-ink"
          }`}
        >
          <div className="service-grid mx-auto max-w-(--container-site)">
            <div className="service-head">
              <p className="eyebrow text-accent-auto">
                {String(index + 1).padStart(2, "0")} / {String(SERVICES.length).padStart(2, "0")}
              </p>
              <div className="service-icon" aria-hidden="true">
                <service.icon strokeWidth={1.5} />
              </div>
              <h2 className="service-title font-display text-strong">{service.title}</h2>
            </div>

            <div>
              <p className="text-lead max-w-(--container-prose)">{service.lead}</p>
              {service.body.map((paragraph) => (
                <p key={paragraph} className="text-muted mt-6 max-w-(--container-prose)">
                  {paragraph}
                </p>
              ))}

              <ul className="service-items">
                {service.items.map((item) => (
                  <li key={item} className="border-hairline">
                    {item}
                  </li>
                ))}
              </ul>

              {/* Yalnızca yazılım kaleminde. Brief §5.2: emlakcrmpro.com
                  bağlantısı SADECE vaka çalışması sayfasının sonunda yer
                  alacak — buradaki hedef iç rota. */}
              {service.cta ? (
                <Link
                  href={service.cta.href}
                  className="btn btn-ghost eyebrow mt-10 inline-flex"
                >
                  {service.cta.label} →
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      ))}

      {/* Kapanış. Son hizmet bölümü koyu (index 5) — bu bant ondan
          ink-deep ile ayrılıyor. */}
      <section className="surface-ink surface-ink-deep px-(--spacing-gutter) py-(--spacing-section)">
        <div className="mx-auto flex max-w-(--container-site) flex-wrap items-end justify-between gap-8">
          <p
            className="font-display text-strong max-w-[18ch]"
            style={{
              fontSize: "var(--text-display-xl)",
              lineHeight: "var(--text-display-xl--line-height)",
              letterSpacing: "var(--text-display-xl--letter-spacing)",
              fontWeight: "var(--text-display-xl--font-weight)",
            }}
          >
            HANGİSİNE İHTİYACINIZ OLDUĞUNU BİRLİKTE BULALIM.
          </p>
          <Link href={NAV_CTA.href} className="btn btn-accent eyebrow">
            {NAV_CTA.label}
          </Link>
        </div>
      </section>
    </>
  );
}
