import Link from "next/link";

import Hero from "./components/hero/Hero";
import HeroClipPrefetch from "./components/hero/HeroClipPrefetch";
import JsonLd from "./components/seo/JsonLd";
import { CONTACT } from "./content/contact";
import { SOCIAL_LINKS } from "./content/socialLinks";
import HomeRailPanel from "./components/home/HomeRailPanel";
import SplitWords from "./components/motion/SplitWords";
import ServiceRail from "./components/services/ServiceRail";
import DragGallery from "./components/gallery/DragGallery";
import GalleryCard from "./components/gallery/GalleryCard";
import { CLIENTS } from "./content/clients";
import { PARTNERS } from "./content/partners";
import { PORTFOLIO_ITEMS } from "./content/portfolio";
import { PORTFOLIO_CATEGORIES } from "./content/portfolioCategories";
import { SERVICE_MEDIA } from "./content/serviceMedia";
import { SERVICES } from "./content/services";

/**
 * Anasayfa — hero + beş bant: (1) kısa tanıtım, (2) hizmetler özeti,
 * (3) çalıştığım firmalar, (4) portfolyo galerisi, (5) partner rozetleri.
 * Eski (6) amber kapanış bandı Ekim 2026'da site footer'ına dönüştü
 * (components/footer/SiteFooter — slogan ve renk orada, tüm sayfalarda). Ekim 2026: brief §4'ün "Emlak CRM Pro vitrini"
 * bandı kaldırıldı (vaka /portfolyo'nun "Yazılım & Uygulama" kartından
 * açılıyor), yerine müşteri logoları geldi.
 *
 * YÜZEY RİTMİ — hero'nun her iki dalı da BEYAZ bitiyor (hareketli dalda
 * .hero-bg-wash = --color-paper-0, reduced-motion dalında
 * `surface-paper surface-paper-raised` section'ı). İlk bant o kareyi birebir
 * devralıyor, sonra sayfa aşağı doğru koyulaşıyor:
 *   paper-raised (#FFF) → paper (#FAFAFA) → paper-raised → ink → paper → (footer: accent)
 * Partner bandının açık zeminde olması bir tercih değil zorunluluk:
 * meta-ads-digital.png alfasız, zemini pişmiş beyaz (bkz. content/partners.ts).
 *
 * layout.tsx zaten <main id="icerik"> sağlıyor — burada ikinci bir <main>
 * AÇILMAZ (/hizmetler, /hakkimda, /iletisim'de de aynı not var).
 *
 * metadata TANIMLANMADI: layout.tsx'in kök title/description'ı zaten "/" için
 * yazılmış ("Dijitalde Fark Yaratın…"), burada tekrarlamak iki kaynak olurdu.
 */

/**
 * Kısa tanıtım metni. Brief §7'nin korunacak iki vurgusunu taşıyor:
 * "20 yıla yakın tecrübe" ve "Dijitalde Fark Yaratın" (§7 ayrıca eski
 * sitedeki "tecbrübeyle" yazım hatasının düzeltilmesini istiyor).
 * /hakkimda'nın lead paragrafı birebir kopyalanmadı — orası bir portre
 * sayfası, burası bir giriş; tek tüketicisi olduğu için sayfa-yerel const
 * (CHAPTERS'ın hakkimda/page.tsx'te durmasıyla aynı gerekçe).
 */
const INTRO_PARAGRAPHS = [
  "20 yıla yakın tecrübeyle markaların görünen yüzünü tasarlıyor, arkada çalışan sistemini kuruyoruz. Kurumsal kimlikten reklam kampanyasına, web sitesinden işinizi yürüten yazılıma kadar hepsi tek ekipten çıkıyor.",
  "Antalya'da çalışıyoruz, Türkiye'nin her yerinden proje alıyoruz. İşimizin özeti üç kelime: dijitalde fark yaratın.",
];

/** Galeride yalnızca dikey kareye sığan işler — `wide` (16:9) işler
 * /portfolyo'da. */
const GALLERY_ITEMS = PORTFOLIO_ITEMS.filter((item) => !item.wide);

/** Kategori adı → /portfolyo kartının çapası. */
const categoryIdOf = (category: string) =>
  PORTFOLIO_CATEGORIES.find((entry) => entry.title === category)?.id ?? "";

/** gertix'in ayıracı: iki uçta artı işareti, arada kesik çizgi. */
/**
 * Logo bandı optik ağırlık çarpanı (CSS `--k`). Her logo aynı kutuya sığar
 * ve oranına göre eşit kutu alanı alır; ama dolgu yoğunluğu (mürekkep /
 * kutu) logodan logoya 3 kata kadar değişir. Çarpan, mürekkep alanını
 * eşitler: k = sqrt(hedef / yoğunluk). Yeni logo = 1 (varsayılan); ölçüm
 * için logoyu bantta render edip alfa toplamına bakın.
 */
const LOGO_WEIGHT: Readonly<Record<string, number>> = {
  "POYRAZ GAYRİMENKUL": 0.9,
  "MAVİ AKDENİZ": 0.86,
  EMOR: 0.76,
  "NUR PASTANELERİ": 1.07,
  "HOOP VİZE": 0.67,
  "RIXOS PREMIUM BODRUM": 1.16,
  "TERRA CITY": 1.02,
  "EVİM DOOR": 0.86,
  AGGİK: 0.68,
  "EMLAK CRM PRO": 0.85,
  SUUFLE: 0.74,
  "GOLDEN ROSE": 1.12,
  "WELLNESS ANTALYA": 1.14,
  "POYRAZ GLOBAL": 0.89,
  "YÜNER HALI": 0.87,
};

function ClientsSeparator() {
  return (
    <div className="clients__separator" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="24" height="24">
        <path d="M12 0v24M24 12H0" />
      </svg>
      <hr />
      <svg viewBox="0 0 24 24" width="24" height="24">
        <path d="M12 0v24M24 12H0" />
      </svg>
    </div>
  );
}

/**
 * Bandın başındaki hairline + numaralı işaret. Sayfa-yerel: yalnızca anasayfa
 * kullanıyor ve altı bandın sırası bu sayfanın kendi anlatısı — /hizmetler'in
 * `NN / 06` sayacı hizmetlerin sırasını sayıyor, bu ise bölümleri. İkisini
 * ortak bir bileşene bağlamak iki farklı anlamı tek yere bağlamak olurdu.
 *
 * `flip` bandın hizasını ters çevirir; alternasyonun gerekçesi
 * globals.css `.section-marker` yorumunda.
 */
function SectionMarker({
  index,
  label,
  flip,
}: {
  index: number;
  label: string;
  flip?: boolean;
}) {
  return (
    <div className={`section-marker${flip ? " section-marker--flip" : ""}`}>
      <span className="eyebrow section-marker__index">
        {String(index).padStart(2, "0")}
      </span>
      <span className="eyebrow section-marker__label">{label}</span>
    </div>
  );
}

const BUSINESS_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": "https://tanyasan.com/#business",
  name: "Tan Yasan Reklam ve Tasarım Ajansı",
  url: "https://tanyasan.com",
  logo: "https://tanyasan.com/Logo.svg",
  image: "https://tanyasan.com/opengraph-image",
  description:
    "Antalya'da web tasarım, yazılım geliştirme, dijital pazarlama ve grafik tasarım hizmetleri.",
  telephone: CONTACT.phone.display,
  email: CONTACT.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: CONTACT.address.lines[0],
    postalCode: "07130",
    addressLocality: "Konyaaltı",
    addressRegion: "Antalya",
    addressCountry: "TR",
  },
  areaServed: { "@type": "Country", name: "Türkiye" },
  sameAs: SOCIAL_LINKS.map((link) => link.href),
};

export default function Home() {
  return (
    <>
      <JsonLd data={BUSINESS_JSON_LD} />
      {/* Klip indirmesi hydration'ı beklemesin — bkz. heroClipScript.ts. */}
      <HeroClipPrefetch />
      <Hero />

      {/* 1 — Kısa tanıtım. Yeni CSS yok: .service-grid + .service-head
          /hakkimda ve /iletisim'deki gibi olduğu gibi kullanılıyor (≤860px'te
          tek sütuna düşüyor). Zemin #FFFFFF, yani hero'nun son karesiyle aynı
          — iki bant arasında renk sıçraması olmuyor. */}
      <section className="surface-paper surface-paper-raised px-(--spacing-gutter) pt-(--spacing-section-snug) pb-(--spacing-section-loose)">
        <div className="mx-auto max-w-(--container-page)">
          <SectionMarker index={1} label="Kimiz" />

          <div className="service-grid">
            <div className="service-head">
              <h2 className="service-title font-display text-strong" data-enter="mask">
                TASARIM VE
                <br />
                YAZILIM, TEK ELDEN
              </h2>
            </div>

            <div>
              {/* Sayfanın imza hareketi: ilk paragraf kelime kelime koyulaşır.
                  Diğerleri normal akış — jest tekrar edilirse jest olmaktan
                  çıkar, süs olur. */}
              <p className="home-statement">
                <SplitWords text={INTRO_PARAGRAPHS[0]} />
              </p>

              {INTRO_PARAGRAPHS.slice(1).map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-muted mt-8 max-w-(--container-prose)"
                  data-enter
                >
                  {paragraph}
                </p>
              ))}

              <Link href="/hakkimda" className="btn btn-ghost eyebrow mt-10 inline-flex">
                Hakkımızda →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2 — Hizmetler özeti, YATAY RAY. Brief §4 "6 kart" diyor ama
          design-system §4 kart grid'ini açıkça atıyor; panel yine hairline
          çerçeveli bir satır, yalnızca yatayda kayıyor.

          /hizmetler'in tam-ekran ray'inden (ServiceRail + .rail-*) KASITLI
          OLARAK FARKLI ÖLÇEKTE: orada tek panel TÜM ekranı kaplar (bir
          bölüm, "adım adım okuma"), burada panel tam YÜKSEKLİKTE ama dar
          bir şerit ve aynı anda 2-3 tanesi görünür (bir raf, "yanından
          geçiş"). İkisi aynı jesti iki kez kullanmasın diye böyle ayrıldı.
          Gerekçe: docs/design-system.md §16.

          BANDIN BAŞLIĞI ARTIK RAY'İN İÇİNDE ve pin'li: sol üst köşede
          sabit durup panellerin geçtiği "başlangıç çizgisi"ni kuruyor
          (mekanik globals.css `.home-rail-lede` yorumunda). Kapanış CTA'sı
          dikey kalıyor. Ray, max-w-(--container-page) sarmalayıcısının
          DIŞINDA: track'in tam genişliği kısıtlanmamalı.

          BAŞLIĞIN KENDİ GİRİŞİ VAR: bant açılır açılmaz köşede hazır
          durmuyor, ilk "geliş" payında (bkz. `--home-rail-arrive-share`,
          `.home-rail-lede__inner` — globals.css) sayfanın dikey ortasında
          belirip yukarı çıkıyor, sonra sola kayıp bu köşeye oturuyor.
          Paneller de AYNI geliş payında ekranın sağ dışından sola süzülerek
          geliyor (`.home-rail-panel`in `home-rail-panels-enter`i) — başlık
          sola kaymaya başladığı anda raf içeri girer, ikisi çakışmadan
          birlikte yerine oturur; ancak ondan sonra bugünkü yatay ray akışı
          devralır. */}
      <section className="surface-paper seam px-(--spacing-gutter) py-(--spacing-section-loose)">
        <ServiceRail
          panelCount={SERVICES.length}
          panelSelector=".home-rail-panel"
          className="home-rail"
          style={{ "--home-rail-panels": SERVICES.length } as React.CSSProperties}
        >
          {/* Başlık ray'in DIŞINDA değil, pin'lenen pencerenin İÇİNDE.
              Sabit kalabilmesinin tek yolu bu: sticky, ancak kendi uzun
              scroll bağlamının içinde bir işe yarar. Dikey fallback'te
              (viewport düz bir div) sıradan bir başlık bloğu olarak,
              bugünkü hizasında akar — `mx-auto max-w-(--container-page)`
              iç sarmalayıcı o hizayı koruyor. */}
          <div className="home-rail-viewport">
            <div className="home-rail-lede">
              {/* `.home-rail-lede__inner` gelişi taşıyan katman (globals.css
                  `home-rail-lede-arrive`) — dikey fallback'te animasyon hiç
                  tanımlı değil, bu yüzden `mx-auto max-w-(--container-page)`
                  bugünkü hizasını aynen koruyor. `data-enter="mask"` YOK
                  artık: geliş fazının kendisi başlığın girişi, ikinci bir
                  reveal jesti aynı scroll aralığında üst üste binmesin. */}
              <div className="home-rail-lede__inner mx-auto max-w-(--container-page)">
                <SectionMarker index={2} label="Hizmetler" flip />
                {/* Punto artık inline değil CSS'te (.home-rail-lede__title):
                    dikey hâlde display-2xl, pin'li dar sütunda display-xl.
                    Inline style ikisini birden ifade edemezdi. */}
                <h2 className="home-rail-lede__title font-display text-strong">
                  ALTI HİZMET ÇİZGİSİ, TEK EKİP
                </h2>
              </div>
            </div>

            <div className="home-rail-track">
              {SERVICES.map((service, index) => (
                <HomeRailPanel
                  key={service.id}
                  id={service.id}
                  // İkon burada (server component) render ediliyor ve hazır
                  // JSX olarak geçiyor — `service.icon` bir bileşen
                  // fonksiyonu, ham hâliyle client component'e prop
                  // olamıyor.
                  icon={<service.icon strokeWidth={1.5} />}
                  title={service.title}
                  items={service.items}
                  index={index}
                  total={SERVICES.length}
                  media={SERVICE_MEDIA[service.id]}
                />
              ))}
            </div>
          </div>
        </ServiceRail>

        <div className="mx-auto max-w-(--container-page)">
          <Link
            href="/hizmetler"
            className="btn btn-ghost eyebrow mt-(--spacing-section-tight) inline-flex"
          >
            Tüm Hizmetler →
          </Link>
        </div>
      </section>

      {/* 3 — Birlikte çalıştığım firmalar (Ekim 2026, eski "Öne Çıkan İş" bandının
          yerine). gertix.studio'nun "OUR CLIENTS" ızgarası: ortada başlık,
          artı işaretli kesik çizgiler arasında tek renkli koyu siluet logolar
          (CSS mask); hover'da logo büyür. Yalnızca public/images/clients
          klasöründeki logolar (bkz. content/clients.ts).

          YÜZEY paper-raised (#FFF): bant 2 `paper` (#FAFAFA), alttaki
          portfolyo `ink` — iki açık bant arasındaki adım renk değil ton
          kademesi (sayfanın tepesindeki #FFF → #FAFAFA'nın tersi). */}
      <section className="surface-paper surface-paper-raised seam px-(--spacing-gutter) py-(--spacing-section)">
        <div className="mx-auto max-w-(--container-page)">
          <SectionMarker index={3} label="Referanslar" />
          <div className="clients">
            <h2 className="clients__title gx-heading text-strong" data-enter="mask">
              BİRLİKTE ÇALIŞTIKLARIM
            </h2>
            <ClientsSeparator />
            <ul className="clients__grid" data-enter-stagger>
              {CLIENTS.map((client, index) => {
                const mark = (
                  <span
                    className="clients__logo"
                    role="img"
                    aria-label={`${client.name} logo`}
                    style={
                      {
                        "--logo": `url("${client.logo}")`,
                        "--ar": client.width / client.height,
                        "--k": LOGO_WEIGHT[client.name] ?? 1,
                      } as React.CSSProperties
                    }
                  />
                );
                return (
                  <li
                    key={client.name}
                    className="clients__item"
                    style={{ "--enter-i": index % 6 } as React.CSSProperties}
                  >
                    {client.href ? (
                      <a href={client.href} target="_blank" rel="noopener">
                        {mark}
                      </a>
                    ) : (
                      mark
                    )}
                  </li>
                );
              })}
            </ul>
            <ClientsSeparator />
          </div>
        </div>
      </section>

      {/* 4 — Portfolyo galerisi (Ekim 2026, gertix.studio "Beitragsgalerie"
          referansı). Pinli dikey→yatay ray KALDIRILDI; yerine sürüklenen,
          tekerlek/trackpad ve ←/→ ile gezilen tam genişlikte bir şerit
          (DragGallery). Kareler dikey (gertix'in 400/670 oranına yakın),
          kesik çizgilerle ayrılıyor; hover'da görsel içeri çekilip altından
          açıklama paneli açılıyor (GalleryCard).

          `wide` işler (16:9 web ekranları, Wellness mockup'ı) burada YOK —
          dikey bir karede ekranın üçte ikisi kırpılırdı. Hepsi /portfolyo'da.
          Her kare kendi kategorisinin /portfolyo kartına gidiyor. */}
      <section className="surface-ink seam py-(--spacing-section)">
        <div className="mx-auto max-w-(--container-page) px-(--spacing-gutter)">
          <SectionMarker index={4} label="Portfolyo" flip />
        </div>

        {/* gertix'in başlığı: ince, büyük harf, şeridin hemen üstünde — lede
            yok. ←/→ aynı satırın sağında (hızlı ileri/geri gezinme). */}
        <DragGallery
          label="Portfolyo galerisi"
          className="home-gallery"
          center
          head={
            <h2 className="gx-heading text-strong" data-enter="mask">
              KURUMSAL KİMLİKTEN KAMPANYAYA
            </h2>
          }
        >
          {GALLERY_ITEMS.map((item) => (
            <GalleryCard
              key={item.src}
              src={item.src}
              alt={item.alt}
              brand={item.brand}
              meta={item.event ?? item.category}
              description={item.alt}
              href={`/portfolyo#${categoryIdOf(item.category)}`}
              more="Kategoriyi gör"
              sizes="(max-width: 767px) 70vw, 19rem"
            />
          ))}
        </DragGallery>

        <div className="mx-auto max-w-(--container-page) px-(--spacing-gutter)">
          {/* Tam liste /portfolyo'da (kategori kartları). */}
          <Link
            href="/portfolyo"
            className="btn btn-ghost eyebrow mt-(--spacing-section-tight) inline-flex"
          >
            Tüm İşleri Gör →
          </Link>
        </div>
      </section>

      {/* 5 — Partner rozetleri. Eski sitede koyu zeminde dairesel rozetlerdi;
          §4'te daire ve pill olmadığı için sunum yeniden kuruldu: solda
          başlık, sağda üç hairline kare. Logolar düz <img> — gerekçe
          content/partners.ts'te (SVG + next/image). */}
      {/* Alt pay + 4rem: footer'ın dikiş şeridi (--seam-h) bu bandın dibini
          örtüyor, rozetler şeridin altında kalmasın. */}
      <section className="surface-paper seam px-(--spacing-gutter) pt-(--spacing-section-snug) pb-[calc(var(--spacing-section-snug)+4rem)] max-[860px]:pb-[calc(var(--spacing-section-snug)+2rem)]">
        <div className="mx-auto max-w-(--container-page)">
          <SectionMarker index={5} label="İş Ortaklıkları" />
          <div className="service-grid">
          <div className="service-head">
            {/* Eski sitedeki başlık, brief §7'nin istediği yazım düzeltmesiyle
                ("tecbrübeyle" → "tecrübeyle"). */}
            <h2
              className="font-display text-strong max-w-[18ch]"
              data-enter="mask"
              style={{
                fontSize: "var(--text-display-xl)",
                lineHeight: "var(--text-display-xl--line-height)",
                letterSpacing: "var(--text-display-xl--letter-spacing)",
                fontWeight: "var(--text-display-xl--font-weight)",
              }}
            >
              DİJİTAL REKLAMLARDA FARK YARATIN
            </h2>
          </div>

          <div>
            <p className="text-lead max-w-(--container-prose)" data-enter>
              Meta ve Google Ads tarafında sertifikalı iş ortağıyız; Yandex
              Direct kampanyalarını da aynı ekip yürütüyor. Reklam bütçesi
              ölçülebilir hedeflerle harcanır.
            </p>

            <ul
              className="home-partners mt-(--spacing-section-tight)"
              data-enter-stagger
            >
              {PARTNERS.map((partner, index) => (
                <li
                  key={partner.src}
                  style={{ "--enter-i": index } as React.CSSProperties}
                >
                  {/* Rozet bir buton gibi davranıyor (Ekim 2026): dijital
                      pazarlama hizmetine gidiyor, hover'da içeri "basılıyor". */}
                  <Link href="/hizmetler#dijital" className="home-partner-tile">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={partner.src}
                      alt={partner.alt}
                      width={partner.width}
                      height={partner.height}
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="eyebrow">{partner.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          </div>
        </div>
      </section>

    </>
  );
}
