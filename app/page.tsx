import Image from "next/image";
import Link from "next/link";

import Hero from "./components/hero/Hero";
import { NAV_CTA } from "./components/nav/navLinks";
import { CASE_LEAD_SHOT, CASE_SUPPORT_SHOTS } from "./content/emlakCrmPro";
import { PARTNERS } from "./content/partners";
import { PORTFOLIO_ITEMS } from "./content/portfolio";
import { SERVICES } from "./content/services";

/**
 * Anasayfa — hero + altı bant. Brief §4'ün anasayfa sırasının tamamı:
 * (2) kısa tanıtım, (3) hizmetler özeti, (4) Emlak CRM Pro vitrini,
 * (5) portfolyo teaser, (6) partner rozetleri, (7) iletişim CTA'sı.
 *
 * YÜZEY RİTMİ — hero'nun her iki dalı da BEYAZ bitiyor (hareketli dalda
 * .hero-bg-wash = --color-paper-0, reduced-motion dalında
 * `surface-paper surface-paper-raised` section'ı). İlk bant o kareyi birebir
 * devralıyor, sonra sayfa aşağı doğru koyulaşıyor:
 *   paper-raised (#FFF) → paper (#FAFAFA) → ink-deep → ink → paper → ink-deep
 * Emlak CRM Pro ile portfolyo bandı arasındaki ink-deep → ink, sayfanın
 * tepesindeki #FFF → #FAFAFA kademesinin karşılığı: renk değişimi değil ton
 * kademesi. İkisi birlikte sayfanın "vitrin bloğu"nu kuruyor.
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

/**
 * Emlak CRM Pro bandının metni — brief §5.2'den birebir. Sayfa-yerel const
 * (INTRO_PARAGRAPHS ile aynı gerekçe: tek tüketici). /portfolyo/emlak-crm-pro
 * vaka sayfası kurulduğunda oranın metni çok daha uzun ve farklı olacak,
 * ortak kaynağa çıkarılacak bir şey yok — paylaşılan tek şey ekran
 * görüntüleri, onlar zaten content/emlakCrmPro.ts'te.
 *
 * §5.2'nin konumlandırma notu: bu bölüm ÜRÜN SATMIYOR, yazılım yeteneğini
 * kanıtlıyor. Bu yüzden emlakcrmpro.com bağlantısı burada GEÇMİYOR — dış
 * domain yalnızca vaka çalışması sayfasının sonunda, küçük bir bağlantı
 * olarak yer alacak (/hizmetler ve /hakkimda'daki kuralın aynısı).
 */
const CASE_PARAGRAPHS = [
  "Bir emlak ofisinin portföyünü, müşterilerini, danışman performansını ve muhasebesini tek sistemde topladık. Bugün gerçek bir ofis bu sistemle çalışıyor.",
  "Harita üzerinde portföy yönetimi, otomatik müşteri-ilan eşleştirme, danışman hakediş takibi, çok para birimli muhasebe — hepsi sıfırdan tasarlandı ve kodlandı.",
];

export default function Home() {
  return (
    <>
      <Hero />

      {/* 1 — Kısa tanıtım. Yeni CSS yok: .service-grid + .service-head
          /hakkimda ve /iletisim'deki gibi olduğu gibi kullanılıyor (≤860px'te
          tek sütuna düşüyor). Zemin #FFFFFF, yani hero'nun son karesiyle aynı
          — iki bant arasında renk sıçraması olmuyor. */}
      <section className="surface-paper surface-paper-raised px-(--spacing-gutter) py-(--spacing-section)">
        <div className="service-grid mx-auto max-w-(--container-site)">
          <div className="service-head">
            <p className="eyebrow text-accent-auto">Kimiz</p>
            <h2 className="service-title font-display text-strong">
              TASARIM VE
              <br />
              YAZILIM, TEK ELDEN
            </h2>
          </div>

          <div>
            {INTRO_PARAGRAPHS.map((paragraph, index) => (
              <p
                key={paragraph}
                className={`max-w-(--container-prose) ${
                  index === 0 ? "text-lead" : "text-muted mt-6"
                }`}
              >
                {paragraph}
              </p>
            ))}

            <Link href="/hakkimda" className="btn btn-ghost eyebrow mt-10 inline-flex">
              Hakkımızda →
            </Link>
          </div>
        </div>
      </section>

      {/* 2 — Hizmetler özeti. Brief §4 "6 kart" diyor ama design-system §4
          kart grid'ini açıkça atıyor; /hizmetler de altı kalemi hairline
          ayraçlı satırlarla kurdu. Aynı dil burada özet ölçüsünde: sayaç,
          ikon, başlık ve kalemler tek mono satırda.

          Her satır /hizmetler#<id>'ye giden bir link — o çapalar sayfada
          zaten var (.service-index aynı hedefleri kullanıyor). */}
      <section className="surface-paper px-(--spacing-gutter) py-(--spacing-section)">
        <div className="mx-auto max-w-(--container-site)">
          <p className="eyebrow text-accent-auto mb-6">Hizmetler</p>
          <h2
            className="font-display text-strong max-w-[22ch]"
            style={{
              fontSize: "var(--text-display-2xl)",
              lineHeight: "var(--text-display-2xl--line-height)",
              letterSpacing: "var(--text-display-2xl--letter-spacing)",
              fontWeight: "var(--text-display-2xl--font-weight)",
            }}
          >
            ALTI HİZMET ÇİZGİSİ, TEK EKİP
          </h2>

          <div className="mt-(--spacing-section-tight)">
            {SERVICES.map((service, index) => (
              <Link
                key={service.id}
                href={`/hizmetler#${service.id}`}
                className="home-service-row border-hairline"
              >
                <div className="service-icon" aria-hidden="true">
                  <service.icon strokeWidth={1.5} />
                </div>

                <div>
                  <p className="eyebrow text-accent-auto">
                    {String(index + 1).padStart(2, "0")} /{" "}
                    {String(SERVICES.length).padStart(2, "0")}
                  </p>
                  <h3 className="home-service-title service-title font-display mt-2">
                    {service.title}
                  </h3>
                  <p className="eyebrow text-muted mt-4">
                    {service.items.join(" · ")}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <Link
            href="/hizmetler"
            className="btn btn-ghost eyebrow mt-(--spacing-section-tight) inline-flex"
          >
            Tüm Hizmetler →
          </Link>
        </div>
      </section>

      {/* 3 — Öne çıkan iş: Emlak CRM Pro. Brief §4'ün 4. sırası, §5.2'nin
          metni. Sitenin ana konumlandırma iddiasını (yazılım da bir hizmet
          çizgisi) kanıtlayan bant — ajansın kendi geliştirdiği ürün, bu
          yüzden portfolyo işlerinden daha ağırlıklı bir sunum alıyor.

          YÜZEY ink-deep (#141414), iki gerekçeyle: (1) dört karenin üçü AÇIK
          temalı, zemini kremimsi beyaz — açık bir bantta zemine akarlardı
          (partners.ts'teki alfasız Meta logosu sorununun aynısı), koyu zeminde
          ışıyan yüzeyler olarak ayrışıyorlar; (2) sayfanın en derin tonu bu
          banda istenen ağırlığı veriyor. Alttaki portfolyo bandı `ink`, yani
          ink-deep → ink bir TON KADEMESİ (renk değişimi değil).

          Kareler LİNK DEĞİL — portfolyo bandındaki kararın aynısı, bandın tek
          bağlantısı alttaki CTA ve o iç rotaya gidiyor. */}
      <section className="surface-ink surface-ink-deep px-(--spacing-gutter) py-(--spacing-section)">
        <div className="mx-auto max-w-(--container-wide)">
          <p className="eyebrow text-accent-auto mb-6">Öne Çıkan İş</p>
          <h2
            className="font-display text-strong max-w-[20ch]"
            style={{
              fontSize: "var(--text-display-2xl)",
              lineHeight: "var(--text-display-2xl--line-height)",
              letterSpacing: "var(--text-display-2xl--letter-spacing)",
              fontWeight: "var(--text-display-2xl--font-weight)",
            }}
          >
            SADECE ANLATMIYORUZ, YAPIYORUZ.
          </h2>
          {CASE_PARAGRAPHS.map((paragraph, index) => (
            <p
              key={paragraph}
              className={`max-w-(--container-prose) ${
                index === 0 ? "text-lead mt-8" : "text-muted mt-6"
              }`}
            >
              {paragraph}
            </p>
          ))}

          {/* Açılış karesi bant genişliğinde. `preload` VERİLMİYOR (Next 16'da
              `priority`nin yerini aldı) — bant katlanın çok altında, hero'nun
              ilk boyaması bloklanmamalı. Kaynak PNG ~3330×1852; next/image
              onu build'de AVIF/WebP'ye ve gerçek görüntü ölçüsüne indiriyor,
              5.7MB'lık kaynak seti tarayıcıya hiç gitmiyor. */}
          <figure className="mt-(--spacing-section-tight)">
            <div className="home-case-frame">
              <Image
                src={CASE_LEAD_SHOT.src}
                alt={CASE_LEAD_SHOT.alt}
                fill
                sizes="(max-width: 860px) 100vw, 1440px"
                style={{ objectFit: "cover" }}
              />
            </div>
            <figcaption className="home-case-caption eyebrow text-muted">
              {CASE_LEAD_SHOT.caption}
            </figcaption>
          </figure>

          {/* Üç destek karesi. Sıra §5.2'nin cümlesini takip ediyor: portföy
              yönetimi → harita üzerinde analiz → raporlama. */}
          <div className="home-case-grid mt-6">
            {CASE_SUPPORT_SHOTS.map((shot) => (
              <figure key={shot.src}>
                <div className="home-case-frame">
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    fill
                    sizes="(max-width: 860px) 100vw, 31vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <figcaption className="home-case-caption eyebrow text-muted">
                  {shot.caption}
                </figcaption>
              </figure>
            ))}
          </div>

          {/* /portfolyo/emlak-crm-pro henüz KURULMADI — /hizmetler ve
              /hakkimda'daki CTA'lar da aynı adrese gidiyor, tutarlı. Bandın
              tek ve birincil eylemi olduğu için .btn-accent (ghost bu
              ağırlıktaki bir bantta zayıf kalıyordu). */}
          <Link
            href="/portfolyo/emlak-crm-pro"
            className="btn btn-accent eyebrow mt-(--spacing-section-tight) inline-flex"
          >
            Projeyi İncele →
          </Link>
        </div>
      </section>

      {/* 4 — Portfolyo öne çıkanlar. Yukarıdaki vitrinle birlikte sayfanın
          koyu bloğunu kuruyor: orası tek bir işin derinliği, burası işlerin
          genişliği. Koyu zemin (görseller ayrışıyor) ve --container-wide
          (metin bandı değil). Düzen gerekçesi .home-portfolio-grid'in
          yorumunda: statik 3 sütun + bir `span 2`, marquee yok.

          Tile'lar link DEĞİL — tek tek vaka sayfaları yok, tıklanabilirlik
          ima edilmiyor. Bölümün tek bağlantısı alttaki CTA. */}
      <section className="surface-ink px-(--spacing-gutter) py-(--spacing-section)">
        <div className="mx-auto max-w-(--container-wide)">
          <p className="eyebrow text-accent-auto mb-6">Portfolyo</p>
          <h2
            className="font-display text-strong max-w-[20ch]"
            style={{
              fontSize: "var(--text-display-2xl)",
              lineHeight: "var(--text-display-2xl--line-height)",
              letterSpacing: "var(--text-display-2xl--letter-spacing)",
              fontWeight: "var(--text-display-2xl--font-weight)",
            }}
          >
            KURUMSAL KİMLİKTEN KAMPANYAYA
          </h2>
          <p className="text-lead text-muted mt-8 max-w-(--container-prose)">
            Farklı sektörlerden seçilmiş sekiz iş — logo ve kurumsal kimlik
            çalışmalarından sosyal medya kampanyalarına.
          </p>

          <div className="home-portfolio-grid mt-(--spacing-section-tight)">
            {PORTFOLIO_ITEMS.map((item) => (
              <figure
                key={item.src}
                className={item.wide ? "home-portfolio-item--wide" : undefined}
              >
                {/* fill + sizes: çerçevenin oranı CSS'te (1/1, geniş olan 2/1),
                    görsel onu cover ediyor. `preload` VERİLMİYOR (Next 16'da
                    `priority`nin yerini aldı) — bu görseller katlanın çok
                    altında, hero'nun ilk boyaması bloklanmamalı. */}
                <div className="home-portfolio-frame">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes={
                      item.wide
                        ? "(max-width: 860px) 100vw, 62vw"
                        : "(max-width: 860px) 50vw, 31vw"
                    }
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <figcaption className="home-portfolio-caption">
                  <span className="eyebrow text-strong">{item.brand}</span>
                  <span className="eyebrow text-muted mt-1">{item.category}</span>
                </figcaption>
              </figure>
            ))}
          </div>

          {/* /portfolyo henüz KURULMADI — nav'da da aynı adres var ve o da
              404 veriyor. Bağlantı bilinçli olarak şimdiden konuluyor
              (kullanıcı kararı); sayfa kurulunca burada değişecek bir şey
              yok. */}
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
      <section className="surface-paper px-(--spacing-gutter) py-(--spacing-section)">
        <div className="service-grid mx-auto max-w-(--container-site)">
          <div className="service-head">
            <p className="eyebrow text-accent-auto">İş Ortaklıkları</p>
            {/* Eski sitedeki başlık, brief §7'nin istediği yazım düzeltmesiyle
                ("tecbrübeyle" → "tecrübeyle"). */}
            <h2
              className="font-display text-strong mt-4 max-w-[18ch]"
              style={{
                fontSize: "var(--text-display-xl)",
                lineHeight: "var(--text-display-xl--line-height)",
                letterSpacing: "var(--text-display-xl--letter-spacing)",
                fontWeight: "var(--text-display-xl--font-weight)",
              }}
            >
              20 YILA YAKIN TECRÜBEYLE DİJİTAL REKLAMLARDA FARK YARATIN
            </h2>
          </div>

          <div>
            <p className="text-lead max-w-(--container-prose)">
              Meta ve Google Ads tarafında sertifikalı iş ortağıyız; Yandex
              Direct kampanyalarını da aynı ekip yürütüyor. Reklam bütçesi
              ölçülebilir hedeflerle harcanır.
            </p>

            <ul className="home-partners mt-(--spacing-section-tight)">
              {PARTNERS.map((partner) => (
                <li key={partner.src}>
                  <figure className="home-partner-tile border-hairline">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={partner.src}
                      alt={partner.alt}
                      width={partner.width}
                      height={partner.height}
                      loading="lazy"
                      decoding="async"
                    />
                    <figcaption className="eyebrow">{partner.label}</figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 6 — Kapanış. /hizmetler, /hakkimda ve /iletisim'in kapanış bandıyla
          birebir aynı kalıp. Cümle anasayfaya özel: hero'nun kapanış sloganını
          (FİKİRDEN SONUCA, TEK EKİPLE) ve diğer üç bandın cümlelerini
          tekrarlamıyor, portfolyo bandından sonra doğal okunuyor. */}
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
            SIRADAKİ İŞ SİZİNKİ OLSUN.
          </p>
          <Link href={NAV_CTA.href} className="btn btn-accent eyebrow">
            {NAV_CTA.label}
          </Link>
        </div>
      </section>
    </>
  );
}
