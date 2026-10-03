import type { Metadata } from "next";
import Link from "next/link";

import { ServiceImage } from "@/app/components/services/ServiceImage";
import ServiceRail from "@/app/components/services/ServiceRail";
import { railTiming } from "@/app/components/services/railTiming";
import { SERVICES } from "@/app/content/services";
import { SERVICE_MEDIA } from "@/app/content/serviceMedia";

/** Rayın durak/geçiş haritası ve panel başına koreografi menzilleri. Render
 * anında, panel sayısından türüyor — gerekçesi railTiming.ts'te. */
const RAIL = railTiming(SERVICES.length);

export const metadata: Metadata = {
  title: "Hizmetler — Tan Yasan Reklam ve Tasarım Ajansı",
  description:
    "Dijitalde Fark Yaratın. Grafik tasarım, dijital pazarlama, web tasarımı, yazılım geliştirme, fotoğraf & video ve danışmanlık — altı hizmet, tek ekip.",
};

/**
 * /hizmetler — brief §5'in altı hizmet metninin evi.
 *
 * VİDEO YOK, GÖRSEL VAR: public/hero-videos/*.mp4 hero'nun imzası olarak
 * kalıyor — altı klibi buraya taşımak hâlâ MB'larca indirme ve sulanmış bir
 * imza demek. Sayfa medyasız değil: altı bölümün altısında da statik, optimize
 * edilmiş birer görsel var (bkz. app/content/serviceMedia.ts) — ikisi
 * portfolyodan gerçek iş, üçü temsili, biri (yazılım) sembolik bir kod editörü
 * karesi. Kart grid'i yok, çerçeve hairline (design-system §4, §9).
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
        <div className="mx-auto max-w-(--container-page)">
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

      {/* Altı hizmet, YATAY RAY. Dikey scroll panelleri yana kaydırır;
          başlık bandı ve kapanış CTA'sı dikey kalır, ray ikisinin arasında
          bir ada. Hareketin tamamı CSS'te (globals.css `rail-enter` /
          `rail-*-leave` + `view-timeline`) — JS yalnızca klavye köprüsü için, gerekçesi
          ServiceRail.tsx'te.

          --rail-panels İÇERİKTEN geliyor: hizmet eklenince hem ray genişliği
          hem scroll bütçesi kendiliğinden büyür, senkronlanacak ikinci bir
          sayı yok. Aynı sayıdan türeyen panel başına geliş/çıkış
          menzilleri de öyle — bkz. railTiming.ts.

          Yüzey artık panel başına DÖNÜŞMÜYOR. Yatayda dönüşümlü zemin, her
          panel geçişinde tam ekran bir renk çakması demek — dikeyde ritim
          olan şey yatayda göz yoruyor. Ray tek yüzeyde (ink) duruyor;
          panelleri birbirinden ayıran şey sayaç ve hairline. */}
      <ServiceRail
        panelCount={SERVICES.length}
        className="rail surface-ink"
        style={
          {
            "--rail-panels": SERVICES.length,
            // Durak/geçiş haritasının sayıları: CSS'in değil, ServiceRail.tsx'in
            // klavye köprüsünün okuduğu iki değer (panel i'nin durağı
            // nerede başlıyor hesabı orada tekrar yazılmasın diye).
            "--rail-hold": RAIL.hold,
            "--rail-move": RAIL.move,
          } as React.CSSProperties
        }
      >
        <div className="rail-viewport">
          <div className="rail-track">
            {SERVICES.map((service, index) => {
              // Altı kalemin altısında da bir görsel var (serviceMedia.ts).
              const media = SERVICE_MEDIA[service.id];

              const panelWindow = RAIL.windows[index];

              return (
                <article
                  key={service.id}
                  id={service.id}
                  className="rail-panel service-section"
                  // Panelin KENDİ geçiş menzilleri. Dört sayı da aynı
                  // zaman çizgisine (`--rail`) ait: geliş = bir önceki
                  // geçiş, çıkış = kendi geçişi. CSS bunları
                  // `animation-range`e koyuyor; başka hiçbir yerde panel
                  // indeksi hesaplanmıyor.
                  style={
                    {
                      "--panel-in-from": panelWindow.inFrom,
                      "--panel-in-to": panelWindow.inTo,
                      "--panel-out-from": panelWindow.outFrom,
                      "--panel-out-to": panelWindow.outTo,
                    } as React.CSSProperties
                  }
                >
                  <div className="rail-panel__grid">
                    <div className="service-head">
                      <p className="eyebrow text-accent-auto">
                        {String(index + 1).padStart(2, "0")} /{" "}
                        {String(SERVICES.length).padStart(2, "0")}
                      </p>
                      <div className="service-icon" aria-hidden="true">
                        <service.icon strokeWidth={1.5} />
                      </div>
                      <h2 className="service-title font-display text-strong">
                        {service.title}
                      </h2>
                    </div>

                    {/* `rail-panel__body` sınıfı YATAY RAY İÇİN: başlık
                        sütunu geçişte çakılı kalırken açıklama + liste bu
                        sarmalayıcıyla birlikte sola sıyrılıp başlığın
                        altında kayboluyor (globals.css, `rail-body-*`).
                        Dikey fallback'te sınıfın hiçbir kuralı yok. */}
                    <div className="rail-panel__body">
                      <p className="text-lead max-w-(--container-prose)">
                        {service.lead}
                      </p>
                      {service.body.map((paragraph) => (
                        <p
                          key={paragraph}
                          className="text-muted mt-6 max-w-(--container-prose)"
                        >
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

                      {/* Yalnızca yazılım kaleminde. Brief §5.2:
                          emlakcrmpro.com bağlantısı SADECE vaka çalışması
                          sayfasının sonunda — buradaki hedef iç rota. */}
                      {service.cta ? (
                        <Link
                          href={service.cta.href}
                          className="btn btn-ghost eyebrow mt-10 inline-flex"
                        >
                          {service.cta.label} →
                        </Link>
                      ) : null}

                    </div>

                    {/* Üçüncü sütun. Yatayda panelin yüksekliği bir ekranla
                        sınırlı; görseli metnin ALTINA koymak paneli
                        taşırıyordu, YANINA koymak hem sığdırıyor hem geniş
                        ekranda boş kalan sağ yarıyı kullanıyor.

                        "Parçadan bütüne" efekti korunuyor: panel görünür
                        olunca tetikleniyor. Yatayda da çalışır çünkü
                        .rail-viewport ekran dışı panelleri kırpıyor ve
                        IntersectionObserver onları "kesişmiyor" görüyor.

                        `media ? … : null` ve `:empty` kuralı KALIYOR: altı
                        kalemin altısında da bugün görsel var ama tablo
                        içerikten okunuyor (serviceMedia.ts) — ileride bir
                        anahtar eksilirse panel sessizce iki sütuna dönsün,
                        boş bir çerçeve göstermesin. */}
                    <div className="rail-panel__media">
                      {media ? <ServiceImage {...media} /> : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Yalnızca mobilde görünür: yatay kaydırılabilirliğin görsel
              ipucu. Masaüstünde ray zaten scroll'la sürülüyor. */}
          <div className="rail-dots" aria-hidden="true">
            {SERVICES.map((service) => (
              <span key={service.id} />
            ))}
          </div>
        </div>
      </ServiceRail>
    </>
  );
}
