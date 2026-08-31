import type { Metadata } from "next";

import { CONTACT } from "@/app/content/contact";
import { SOCIAL_LINKS } from "@/app/content/socialLinks";

import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "İletişim — Tan Yasan Reklam ve Tasarım Ajansı",
  description:
    "Dijitalde Fark Yaratın. Antalya Konyaaltı'ndan Türkiye geneline tasarım, dijital pazarlama ve yazılım geliştirme. Formu doldurun ya da doğrudan arayın.",
};

/**
 * /iletisim — sitenin tek dönüşüm noktası: nav'daki "Teklif Al" CTA'sı,
 * /hizmetler ve /hakkimda kapanış bantları hep buraya gönderiyor.
 *
 * ÜÇ BANT: /hizmetler ve /hakkimda ile birebir aynı kalıp (koyu başlık →
 * açık gövde → koyu kapanış). Gövde, hizmet sayfasının .service-grid /
 * .service-head düzenini olduğu gibi kullanıyor — sol yapışkan sütunda
 * bilgiler, sağda form. Uzun bir form doldurulurken telefon/adres ekranda
 * kalıyor. Gerekçe: docs/design-system.md §11.
 *
 * MEDYA YOK: §9'un kararı burada da geçerli. Gömülü harita da yok — adres
 * metin, yanında Maps'i dışarıda açan tek bir bağlantı.
 *
 * layout.tsx zaten <main id="icerik"> sağlıyor — burada ikinci bir <main>
 * AÇILMAZ.
 */
export default function IletisimPage() {
  return (
    <>
      {/* Başlık bandı. Nav bu sayfada baştan solid ve position: fixed, yani
          akışta yer kaplamıyor — üst boşluğa nav yüksekliği elle eklenir. */}
      <section className="surface-ink surface-ink-deep px-(--spacing-gutter) pb-(--spacing-section-tight) pt-[calc(var(--nav-h)+var(--spacing-section))]">
        <div className="mx-auto max-w-(--container-site)">
          <p className="eyebrow text-accent-auto mb-6">İletişim</p>
          <h1
            className="font-display text-strong"
            style={{
              fontSize: "var(--text-display-2xl)",
              lineHeight: "var(--text-display-2xl--line-height)",
              letterSpacing: "var(--text-display-2xl--letter-spacing)",
              fontWeight: "var(--text-display-2xl--font-weight)",
            }}
          >
            NE YAPMAK İSTEDİĞİNİZİ
            <br />
            ANLATIN
          </h1>
          <p className="text-lead text-muted mt-8 max-w-(--container-prose)">
            Bir logo mu, bir kampanya mı, yoksa işinizi yürüten bir sistem mi —
            hangisi olduğuna birlikte karar verebiliriz. Antalya&apos;da
            çalışıyoruz, Türkiye&apos;nin her yerinden proje alıyoruz.
          </p>
        </div>
      </section>

      {/* Gövde. Sol sütun = bilgiler (yapışkan), sağ sütun = form.
          ≤860px'te globals.css'teki mevcut kural tek sütuna düşürüyor ve
          yapışmayı kapatıyor; bilgiler formun üstünde kalıyor. */}
      <section className="surface-paper px-(--spacing-gutter) py-(--spacing-section)">
        <div className="service-grid mx-auto max-w-(--container-site)">
          <div className="service-head">
            <p className="eyebrow text-accent-auto">Doğrudan</p>
            <h2 className="service-title font-display text-strong">BİZE ULAŞIN</h2>

            <div className="contact-details">
              <div>
                <p className="eyebrow text-muted">E-posta</p>
                <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
              </div>

              <div>
                <p className="eyebrow text-muted">Telefon</p>
                <a href={CONTACT.phone.href}>{CONTACT.phone.display}</a>
              </div>

              <div>
                <p className="eyebrow text-muted">Adres</p>
                <address className="not-italic">
                  {CONTACT.address.lines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
                {/* Gömülü harita yerine tek bağlantı — gerekçe §11. */}
                <a
                  href={CONTACT.address.directionsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-auto eyebrow mt-2 inline-block"
                >
                  Yol tarifi al →
                </a>
              </div>

              {/* Adresler content/socialLinks.ts'ten. Dizi boşken bölüm hiç
                  render edilmiyor — yer tutucu/kırık link yazılmaz. */}
              {SOCIAL_LINKS.length > 0 ? (
                <div>
                  <p className="eyebrow text-muted">Sosyal medya</p>
                  <ul>
                    {SOCIAL_LINKS.map((social) => (
                      <li key={social.href}>
                        <a href={social.href} target="_blank" rel="noopener noreferrer">
                          {social.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <p className="text-lead max-w-(--container-prose)">
              Formu doldurun; ne kadar çok şey yazarsanız dönüşümüz o kadar
              işinize yarar. Acele bir işse telefon daha hızlı.
            </p>
            <div className="mt-(--spacing-section-tight)">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Kapanış. /hizmetler ve /hakkimda ile aynı kalıp; CTA burada NAV_CTA
          OLAMAZ (zaten o sayfadayız) — yerine telefon. */}
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
            YAZMAK YERİNE KONUŞMAYI TERCİH EDERSENİZ.
          </p>
          <a href={CONTACT.phone.href} className="btn btn-accent eyebrow">
            {CONTACT.phone.display}
          </a>
        </div>
      </section>
    </>
  );
}
