import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import JsonLd from "@/app/components/seo/JsonLd";
import { SOCIAL_LINKS } from "@/app/content/socialLinks";


export const metadata: Metadata = {
  title: "Tan Yasan: Antalya Grafik Tasarımcı ve Dijital Pazarlama Uzmanı",
  description:
    "Antalya'dan yaklaşık 20 yıllık grafik tasarım ve dijital pazarlama deneyimiyle markalara stratejik çözümler geliştiriyor, web tasarım ve yazılımı da hizmetlerime kattım.",
};

/**
 * /hakkimda — içerik eski tanyasan.com/hakkimda sayfasından (kullanıcı
 * onayladı, bkz. design-system §10). h1 tekil bir isim kartı ("TAN YASAN"),
 * anlatı gövdesi ve kapanış "biz" dilinde — bilinçli bir ses karışımı.
 *
 * ÜÇ YÜZEY: ink → paper → ink. /hizmetler'deki altı kez yüzey dönüşümü orada
 * altı EŞDEĞER kalemi birbirinden ayırmak içindi; burada tek bir ses kesintisiz
 * bir hikâye anlatıyor, her bölümde zemin çevirmek anlatıyı parçalardı. Yüzey
 * dili (surface-ink/paper, hairline, eyebrow) aynı, ritim daha sakin.
 *
 * MEDYA: video yok kararı (design-system §9) burada da geçerli — hero-videos/
 * hero'nun imzası olarak kalıyor. Tek statik görsel portre.
 *
 * layout.tsx zaten <main id="icerik"> sağlıyor — burada ikinci bir <main>
 * AÇILMAZ.
 */

/**
 * Anlatı gövdesi. Paragraflar eski tanyasan.com/hakkimda sayfasından, "biz"
 * dilinde (kullanıcı onayladı — bkz. design-system §10). Yıl/kurum/ekip
 * verisi bu metinde de YOK, tarihli bir kilometre taşı rayı bu yüzden
 * kurulmadı — bölümler 01/02/03 ile numaralanıyor.
 */
const CHAPTERS = [
  {
    id: "yol",
    title: "YOL",
    paragraphs: [
      "Grafik tasarım ve pazarlamayı bütüncül bir yaklaşımla ele alıyoruz. Her marka için özgün, yaratıcı ve sonuç odaklı stratejiler oluşturarak hem dijital hem de fiziksel pazarda sürdürülebilir bir marka değeri inşa etmelerine yardımcı oluyoruz.",
    ],
  },
  {
    id: "yazilima-gecis",
    title: "YAZILIMA GEÇİŞ",
    paragraphs: [
      "Kurumsal kimlik tasarımından baskı yönetimine, outdoor ve indoor reklam çalışmalarından Google ve Meta platformlarında stratejik kampanya yönetimine kadar kapsamlı pazarlama hizmetleri sunuyoruz. Zamanla bu hizmetlere yazılım geliştirmeyi de kattık — markaların süreçlerini dijitalleştiren, ölçeklenebilir sistemler kuruyoruz.",
    ],
    // Brief §5.2: emlakcrmpro.com bağlantısı SADECE vaka çalışması sayfasının
    // sonunda yer alacak — buradaki hedef iç rota (/hizmetler ile aynı kural).
    cta: { href: "/portfolyo/emlak-crm-pro", label: "Emlak CRM Pro'yu İncele" },
  },
  {
    id: "bugun",
    title: "BUGÜN",
    paragraphs: [
      "Amacımız, markanın bilinirliğini artırmak, hedef kitleye doğru temas noktaları üzerinden ulaşmak ve uzun vadeli marka değeri oluşturmaktır.",
    ],
  },
] as const;

const PERSON_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Tan Yasan",
  jobTitle: "Grafik Tasarımcı ve Dijital Pazarlama Uzmanı",
  url: "https://tanyasan.com/hakkimda",
  image: "https://tanyasan.com/images/tan-yasan-portre.jpg",
  email: "tan@tanyasan.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Konyaaltı",
    addressRegion: "Antalya",
    addressCountry: "TR",
  },
  worksFor: { "@id": "https://tanyasan.com/#business" },
  sameAs: SOCIAL_LINKS.map((link) => link.href),
};

export default function HakkimdaPage() {
  return (
    <>
      <JsonLd data={PERSON_JSON_LD} />
      {/* Başlık bandı. Nav bu sayfada baştan solid ve position: fixed, yani
          akışta yer kaplamıyor — üst boşluğa nav yüksekliği elle eklenir. */}
      <section className="surface-ink surface-ink-deep px-(--spacing-gutter) pb-(--spacing-section-tight) pt-[calc(var(--nav-h)+var(--spacing-section))]">
        <div className="about-hero mx-auto max-w-(--container-page)">
          <div>
            <p className="eyebrow text-accent-auto mb-6">Hakkımda</p>
            <h1
              className="font-display text-strong"
              style={{
                fontSize: "var(--text-display-2xl)",
                lineHeight: "var(--text-display-2xl--line-height)",
                letterSpacing: "var(--text-display-2xl--letter-spacing)",
                fontWeight: "var(--text-display-2xl--font-weight)",
              }}
            >
              TAN YASAN
            </h1>
            <p className="text-lead text-muted mt-8 max-w-(--container-prose)">
              Yaklaşık 20 yıllık grafik tasarım ve dijital pazarlama
              deneyimiyle markalara stratejik iletişim çözümleri geliştiren
              bir tasarım ve marka yönetimi uzmanıyım. Farklı sektörlerde
              Google Ads ve Meta reklam yönetimi, sosyal medya stratejileri
              ve kurumsal iletişim projeleri tasarlayarak markaların büyüme
              hedeflerine katkı sağladım.
            </p>
          </div>

          {/* Portre — brief §5.8'in notu: kişisel ajanslarda güven kurmanın en
              hızlı yolu. Statik src olduğu için width/height açıkça veriliyor
              (4:5); dosya public/images/'a elle konur. */}
          <Image
            src="/images/tan-yasan-portre.jpg"
            alt="Tan Yasan"
            width={1200}
            height={1500}
            sizes="(max-width: 860px) 100vw, 24rem"
            className="about-portrait"
          />
        </div>
      </section>

      {/* Anlatı gövdesi — tek açık yüzey, üç bölüm hairline ile ayrılıyor.
          Sol sütun /hizmetler'in .service-grid/.service-head düzenini yeniden
          kullanıyor: uzun metin okunurken hangi bölümde olunduğu kaybolmuyor. */}
      <section className="surface-paper px-(--spacing-gutter) py-(--spacing-section)">
        <div className="mx-auto max-w-(--container-page)">
          {CHAPTERS.map((chapter, index) => (
            <article key={chapter.id} id={chapter.id} className="about-section service-grid">
              <div className="service-head">
                <p className="eyebrow text-accent-auto">
                  {String(index + 1).padStart(2, "0")} /{" "}
                  {String(CHAPTERS.length).padStart(2, "0")}
                </p>
                <h2 className="service-title font-display text-strong">{chapter.title}</h2>
              </div>

              <div>
                {chapter.paragraphs.map((paragraph, paragraphIndex) => (
                  <p
                    key={paragraph}
                    className={`max-w-(--container-prose) ${
                      paragraphIndex === 0 ? "text-lead" : "text-muted mt-6"
                    }`}
                  >
                    {paragraph}
                  </p>
                ))}

                {"cta" in chapter && chapter.cta ? (
                  <Link
                    href={chapter.cta.href}
                    className="btn btn-ink eyebrow mt-10 inline-flex"
                  >
                    {chapter.cta.label} →
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
