import Image from "next/image";
import Link from "next/link";

import Hero from "./components/hero/Hero";
import HomeRailPanel from "./components/home/HomeRailPanel";
import SplitWords from "./components/motion/SplitWords";
import { NAV_CTA } from "./components/nav/navLinks";
import ServiceRail from "./components/services/ServiceRail";
import { CASE_LEAD_SHOT, CASE_SUPPORT_SHOTS } from "./content/emlakCrmPro";
import { PARTNERS } from "./content/partners";
import { PORTFOLIO_ITEMS } from "./content/portfolio";
import { SERVICE_MEDIA } from "./content/serviceMedia";
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

export default function Home() {
  return (
    <>
      <Hero />

      {/* 1 — Kısa tanıtım. Yeni CSS yok: .service-grid + .service-head
          /hakkimda ve /iletisim'deki gibi olduğu gibi kullanılıyor (≤860px'te
          tek sütuna düşüyor). Zemin #FFFFFF, yani hero'nun son karesiyle aynı
          — iki bant arasında renk sıçraması olmuyor. */}
      <section className="surface-paper surface-paper-raised px-(--spacing-gutter) pt-(--spacing-section-snug) pb-(--spacing-section-loose)">
        <div className="mx-auto max-w-(--container-site)">
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
          dikey kalıyor. Ray, max-w-(--container-site) sarmalayıcısının
          DIŞINDA: track'in tam genişliği kısıtlanmamalı. */}
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
              bugünkü hizasında akar — `mx-auto max-w-(--container-site)`
              iç sarmalayıcı o hizayı koruyor. */}
          <div className="home-rail-viewport">
            <div className="home-rail-lede">
              <div className="mx-auto max-w-(--container-site)">
                <SectionMarker index={2} label="Hizmetler" flip />
                {/* Punto artık inline değil CSS'te (.home-rail-lede__title):
                    dikey hâlde display-2xl, pin'li dar sütunda display-xl.
                    Inline style ikisini birden ifade edemezdi. */}
                <h2
                  className="home-rail-lede__title font-display text-strong"
                  data-enter="mask"
                >
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

        <div className="mx-auto max-w-(--container-site)">
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
      <section className="surface-ink surface-ink-deep seam px-(--spacing-gutter) py-(--spacing-section-loose)">
        <div className="mx-auto max-w-(--container-wide)">
          <SectionMarker index={3} label="Öne Çıkan İş" />
          <h2
            className="font-display text-strong max-w-[20ch]"
            data-enter="mask"
            style={{
              fontSize: "var(--text-display-2xl)",
              lineHeight: "var(--text-display-2xl--line-height)",
              letterSpacing: "var(--text-display-2xl--letter-spacing)",
              fontWeight: "var(--text-display-2xl--font-weight)",
            }}
          >
            SADECE ANLATMIYORUZ, YAPIYORUZ.
          </h2>

          {/* Bandın tepe noktası olma biçimi: açılış karesi solda SABİTLENİYOR,
              metin ve üç destek karesi sağdan yanından akıyor. Böylece ürünün
              kendisi ekranda kalırken anlatı ilerliyor.

              ≤860px'te ve sticky yokken tek sütuna düşer; sıralama bugünküyle
              aynı (medya → metin → destek kareleri). */}
          <div className="home-case-split mt-(--spacing-section-tight)">
            {/* Açılış karesi. `preload` VERİLMİYOR (Next 16'da `priority`nin
                yerini aldı) — bant katlanın çok altında, hero'nun ilk boyaması
                bloklanmamalı. Kaynak PNG ~3330×1852; next/image onu build'de
                AVIF/WebP'ye ve gerçek görüntü ölçüsüne indiriyor. */}
            <figure className="home-case-split__media">
              <div className="home-case-frame">
                <Image
                  src={CASE_LEAD_SHOT.src}
                  alt={CASE_LEAD_SHOT.alt}
                  fill
                  sizes="(max-width: 860px) 100vw, 48vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <figcaption className="home-case-caption eyebrow text-muted">
                {CASE_LEAD_SHOT.caption}
              </figcaption>
            </figure>

            <div className="home-case-split__flow">
              {/* `data-enter` YOK — bandın imza hareketi diyafram (bkz.
                  globals.css `case-aperture`), yalnızca ekranlar hareket
                  ediyor. Metin ilk karede zaten okunur durumda: sakin
                  kalması bandın hareketini iki yere bölmüyor, tek bir
                  odak noktası bırakıyor (frontend-design'ın "spend your
                  boldness in one place" ilkesi). */}
              {CASE_PARAGRAPHS.map((paragraph, index) => (
                <p
                  key={paragraph}
                  className={`max-w-(--container-prose) ${
                    index === 0 ? "text-lead" : "text-muted mt-6"
                  }`}
                >
                  {paragraph}
                </p>
              ))}

              {/* Üç destek karesi. Sıra §5.2'nin cümlesini takip ediyor:
                  portföy yönetimi → harita üzerinde analiz → raporlama.
                  `data-enter` de YOK (yukarıdaki notla aynı gerekçe) —
                  destek eklenseydi figürün kendisi enter-rise ile
                  yükselirken içindeki img aynı anda diyaframla açılırdı,
                  aynı görsel alanda iki çakışan hareket (§8). */}
              {CASE_SUPPORT_SHOTS.map((shot) => (
                <figure key={shot.src}>
                  <div className="home-case-frame">
                    <Image
                      src={shot.src}
                      alt={shot.alt}
                      fill
                      sizes="(max-width: 860px) 100vw, 42vw"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <figcaption className="home-case-caption eyebrow text-muted">
                    {shot.caption}
                  </figcaption>
                </figure>
              ))}

              {/* /portfolyo/emlak-crm-pro henüz KURULMADI — /hizmetler ve
                  /hakkimda'daki CTA'lar da aynı adrese gidiyor, tutarlı.
                  Bandın tek ve birincil eylemi olduğu için .btn-accent. */}
              <Link
                href="/portfolyo/emlak-crm-pro"
                className="btn btn-accent eyebrow mt-(--spacing-section-tight) inline-flex"
              >
                Projeyi İncele →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4 — Portfolyo öne çıkanlar. Yukarıdaki vitrinle birlikte sayfanın
          koyu bloğunu kuruyor: orası tek bir işin derinliği, burası işlerin
          genişliği. Koyu zemin (görseller ayrışıyor) ve --container-wide
          (metin bandı değil). Düzen gerekçesi .home-portfolio-grid'in
          yorumunda: statik 3 sütun + bir `span 2`, marquee yok.

          Tile'lar link DEĞİL — tek tek vaka sayfaları yok, tıklanabilirlik
          ima edilmiyor. Bölümün tek bağlantısı alttaki CTA. */}
      <section className="surface-ink seam px-(--spacing-gutter) py-(--spacing-section)">
        <div className="mx-auto max-w-(--container-wide)">
          <SectionMarker index={4} label="Portfolyo" flip />
          <h2
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
          </h2>
          <p
            className="text-lead text-muted mt-8 max-w-(--container-prose)"
            data-enter
          >
            Farklı sektörlerden seçilmiş sekiz iş — logo ve kurumsal kimlik
            çalışmalarından sosyal medya kampanyalarına.
          </p>

          {/* Kademeli giriş: --enter-i her karonun menzilini kaydırıyor,
              sıra sütun sütun akıyor. Gerekçe globals.css'te
              [data-enter-stagger] kuralında. */}
          <div
            className="home-portfolio-grid mt-(--spacing-section-tight)"
            data-enter-stagger
          >
            {PORTFOLIO_ITEMS.map((item, index) => (
              <figure
                key={item.src}
                className={item.wide ? "home-portfolio-item--wide" : undefined}
                style={{ "--enter-i": index % 3 } as React.CSSProperties}
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
      <section className="surface-paper seam px-(--spacing-gutter) py-(--spacing-section-snug)">
        <div className="mx-auto max-w-(--container-site)">
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
              20 YILA YAKIN TECRÜBEYLE DİJİTAL REKLAMLARDA FARK YARATIN
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
        </div>
      </section>

      {/* 6 — Kapanış. Cümle anasayfaya özel: hero'nun kapanış sloganını
          (FİKİRDEN SONUCA, TEK EKİPLE) ve diğer bantların cümlelerini
          tekrarlamıyor, portfolyo bandından sonra doğal okunuyor.

          YÜZEY: sayfanın tek doygun anı. Diğer sayfaların kapanış bandı
          ink-deep kalıyor — bu, anasayfanın VARIŞ noktası ve tekrarlanırsa
          varış olmaktan çıkar. Kontrast ve muted-ton kısıtı için
          globals.css `.surface-accent`. Buton .btn-ink: amber üstüne amber
          görünmez olurdu. */}
      <section className="surface-accent seam px-(--spacing-gutter) py-(--spacing-section-loose)">
        <div className="mx-auto max-w-(--container-site)">
          <SectionMarker index={6} label="İletişim" flip />
          <div className="flex flex-wrap items-end justify-between gap-8">
            <p
              className="font-display max-w-[16ch]"
              data-enter="mask"
              style={{
                fontSize: "var(--text-display-2xl)",
                lineHeight: "var(--text-display-2xl--line-height)",
                letterSpacing: "var(--text-display-2xl--letter-spacing)",
                fontWeight: "var(--text-display-2xl--font-weight)",
              }}
            >
              SIRADAKİ İŞ SİZİNKİ OLSUN.
            </p>
            <Link href={NAV_CTA.href} className="btn btn-ink eyebrow">
              {NAV_CTA.label}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
