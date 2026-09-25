import Image from "next/image";
import Link from "next/link";

import Hero from "./components/hero/Hero";
import HomeRailPanel from "./components/home/HomeRailPanel";
import SplitWords from "./components/motion/SplitWords";
import { NAV_CTA } from "./components/nav/navLinks";
import ServiceRail from "./components/services/ServiceRail";
import {
  CASE_LEAD_SHOT,
  CASE_PARAGRAPHS,
  CASE_SUPPORT_SHOTS,
  CASE_TITLE,
} from "./content/emlakCrmPro";
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
 * Bandın dört karesi, gösterim SIRASINDA: açılış (yönetim paneli) artık sol
 * bloğun İÇİNDE değil, üçünün BAŞINDA sağ şeritte akıyor (bkz. aşağıdaki
 * "Sabit anlatı + yetenek indeksi" notu). Eskiden `.home-case-split__media`
 * sabit sol blokta duran ayrı bir kare, üçü de akan şeritteydi; artık dördü
 * de aynı jesti (case-focus) paylaşan tek bir akan şerit.
 */
const CASE_SHOTS = [CASE_LEAD_SHOT, ...CASE_SUPPORT_SHOTS];

/**
 * Sol bloğun "yetenek indeksi" — Eylül 2026'da açılış karesinin yerine
 * geçti (bkz. docs/design-system.md §12). YENİ METİN YOK: numaralar sıradan,
 * etiketler `CASE_SHOTS`'un kendi `caption`'ından türüyor. Açılış karesinin
 * künyesi "EMLAK CRM PRO — YÖNETİM PANELİ" biçiminde ("—"den sonrası panel
 * adı); ajans/ürün adı bant başlığında zaten söylenmiş olduğu için indekste
 * yalnızca panel adı kalıyor, öneki tekrar etmiyor.
 */
const CASE_INDEX = CASE_SHOTS.map((shot, index) => ({
  number: String(index + 1).padStart(2, "0"),
  label: shot.caption.includes("—")
    ? shot.caption.split("—")[1].trim()
    : shot.caption,
}));

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
              bugünkü hizasında akar — `mx-auto max-w-(--container-site)`
              iç sarmalayıcı o hizayı koruyor. */}
          <div className="home-rail-viewport">
            <div className="home-rail-lede">
              {/* `.home-rail-lede__inner` gelişi taşıyan katman (globals.css
                  `home-rail-lede-arrive`) — dikey fallback'te animasyon hiç
                  tanımlı değil, bu yüzden `mx-auto max-w-(--container-site)`
                  bugünkü hizasını aynen koruyor. `data-enter="mask"` YOK
                  artık: geliş fazının kendisi başlığın girişi, ikinci bir
                  reveal jesti aynı scroll aralığında üst üste binmesin. */}
              <div className="home-rail-lede__inner mx-auto max-w-(--container-site)">
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
          {/* SABİT ANLATI + YETENEK İNDEKSİ (Eylül 2026, kullanıcı geri
              bildirimi ile revize). Eskiden sol blok işaret + başlık +
              AÇILIŞ KARESİ + açıklama + CTA idi ve tarayıcıda 857–863px
              ölçülüyordu — sticky için `min-height: 950px` kapısı gerekti,
              yani 1440×900/1366×768 gibi yaygın laptoplarda sticky HİÇ
              devreye girmiyordu. Açılış karesi de kendi tavanıyla (28rem)
              sınırlı olduğu için sağdaki destek karelerinden küçük kalıyor,
              hiyerarşi tersine dönüyordu.

              Çözüm mekanizmayı korudu (sol sabit anlatı + sağda akan kanıt),
              yalnızca sol bloğun İÇERİĞİNİ hafifletti: açılış karesi sağ
              şeride taşındı (dördüncü destek karesi değil, ŞERİDİN BAŞI —
              bkz. `CASE_SHOTS`), yerine `CASE_INDEX` (dört satırlık numaralı
              yetenek listesi, YENİ METİN YOK — `CASE_SHOTS`'un caption'larından
              türüyor) geldi. Blok kısalınca sticky kapısı da düştü (bkz.
              aşağıdaki `@media` notu, globals.css). */}
          <div className="home-case-split">
            <div className="home-case-split__anchor">
              <SectionMarker index={3} label="Öne Çıkan İş" />
              {/* Punto artık inline DEĞİL CSS'te
                  (.home-case-split__title): başlık dar bir sütunda
                  durduğu için >860px'te display-xl'e iniyor, tek sütuna
                  düşünce display-2xl'e dönüyor. Inline style ikisini
                  birden ifade edemezdi (.home-rail-lede__title'daki aynı
                  gerekçe). */}
              <h2
                className="home-case-split__title font-display text-strong"
                data-enter="mask"
              >
                {CASE_TITLE}
              </h2>

              {/* `mt-*` YOK: bloğun dikey ritmi tamamen
                  `.home-case-split__anchor > * + *`ta (globals.css). */}
              {CASE_PARAGRAPHS.map((paragraph, index) => (
                <p
                  key={paragraph}
                  className={`max-w-(--container-prose) ${
                    index === 0 ? "text-lead" : "text-muted"
                  }`}
                >
                  {paragraph}
                </p>
              ))}

              {/* Yetenek indeksi — sağdaki dört karenin sözel özeti. Her satır
                  kendi `--case-shot-N` view-timeline'ına bağlı (globals.css):
                  karşılığı gelen ekran okuma bölgesinden geçerken satır
                  soluktan tam opaklığa, numarası soluk amberden tam amber'e
                  dönüyor — saf CSS scroll-spy, JS yok. `aria-hidden`: aynı
                  bilgi zaten her karenin görünür `figcaption`'ında var,
                  burada ekran okuyucuya tekrar okutmuyoruz. */}
              <ul className="home-case-index" aria-hidden="true">
                {CASE_INDEX.map((entry) => (
                  <li key={entry.number}>
                    <span className="home-case-index__num eyebrow">
                      {entry.number}
                    </span>
                    <span className="eyebrow">{entry.label}</span>
                  </li>
                ))}
              </ul>

              {/* Vaka çalışması sayfasına gider (/hizmetler ve /hakkimda'daki
                  CTA'larla aynı adres). Bandın tek ve birincil eylemi olduğu
                  için .btn-accent.
                  Sabit blokta duruyor: bant boyunca ekranda kalıyor. */}
              <Link
                href="/portfolyo/emlak-crm-pro"
                className="btn btn-accent eyebrow inline-flex"
              >
                Projeyi İncele →
              </Link>
            </div>

            {/* Dört kare, açılış dahil — sıra §5.2'nin cümlesini takip
                ediyor: yönetim paneli → portföy yönetimi → harita üzerinde
                analiz → raporlama. `data-enter` YOK: bandın hareketi
                `case-focus`'un kendisi (globals.css), eklenseydi figür
                `enter-rise` ile yükselirken içindeki img aynı anda odak
                jestiyle açılırdı — aynı görsel alanda iki çakışan hareket
                (§8). Künyeye `CASE_INDEX`'in numarası ekleniyor: sol
                bloktaki indeksle aynı numaralandırma, iki liste birbirini
                doğruluyor. */}
            <div className="home-case-split__stream">
              {CASE_SHOTS.map((shot, index) => (
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
                    <span className="home-case-caption__num">
                      {CASE_INDEX[index].number}
                    </span>{" "}
                    {shot.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4 — Portfolyo öne çıkanlar. Yukarıdaki vitrinle birlikte sayfanın
          koyu bloğunu kuruyor: orası tek bir işin derinliği, burası işlerin
          genişliği. Koyu zemin (görseller ayrışıyor) ve --container-wide
          (metin bandı değil). Düzen artık statik grid DEĞİL, YATAY PİNLİ
          RAY: bölüm pin'lenirken ilk sıra kareler eşit üst hizada ve TAM
          kadrajda bir an DURUYOR, ardından track sağdan sola akıyor.
          Gerekçe ve kimlik ayrımı (.home-rail'in KOPYASI değil, kardeşi)
          .home-portfolio-rail'in yorumunda, globals.css.

          Tile'lar link DEĞİL — bu işlerin vaka sayfası yok (tek vaka sayfası
          Emlak CRM Pro'nunki, o bant 3'ten bağlanıyor), tıklanabilirlik ima
          edilmiyor. Bölümün tek bağlantısı alttaki CTA. */}
      <section className="surface-ink seam px-(--spacing-gutter) py-(--spacing-section)">
        {/* Başlık bloğu artık bölümün doğrudan çocuğu DEĞİL, rayın İÇİNDE:
            `.home-portfolio-stage` ile aynı sabit sahneyi paylaşıyorlar, yani
            ray akarken başlık ekranda kalıyor. Eskiden başlık rayın kardeşi
            ve normal akıştaydı, ilk kaydırmada yukarı kaçıyordu — bandın
            neyi gösterdiğini söyleyen cümle, gösterme başlar başlamaz
            kayboluyordu. Mekanizma bant 3'ün `.home-case-split__anchor`ının
            aynısı (tek sticky kutu, ölçüm yok, JS yok); gerekçe ve kapı
            koşulu globals.css'te `.home-portfolio-stage`in yorumunda.

            `--home-portfolio-units`, geniş işin kapladığı iki birim dahil
            toplam yatay birim sayısı (bugün 8 iş + 1 geniş iş = 9) —
            `--home-rail-panels` ile aynı disiplin, sayı içerikten türüyor,
            ikinci bir yerde senkronlanmıyor. */}
        <div
          className="home-portfolio-rail"
          style={
            {
              // Yatay rayda `wide` iş (Wellness) GİZLİ (globals.css gated
              // blok, Eylül 2026 kullanıcı kararı) — birim sayısı yalnızca
              // raydaki kareleri sayar. Taban ızgara bu değişkeni okumuyor.
              "--home-portfolio-units": PORTFOLIO_ITEMS.filter(
                (item) => !item.wide
              ).length,
            } as React.CSSProperties
          }
        >
          <div className="home-portfolio-stage">
            {/* İşaret+başlık ve lede artık İKİ AYRI ÇOCUK
                (`.home-portfolio-head__title` / `__lede`), dikey yığından
                çıkarıldı: sabit sahnede (`@media (min-height: 800px)`,
                globals.css) ikisi TEK SATIRA yatıyor — sol işaret+başlık,
                sağda alta hizalı lede. Kazanılan dikey pay doğrudan
                karelere gidiyor (`--portfolio-tile-w` büyüyor, aynı yerde).
                Taban hâlde (dikey liste/mobil/reduced-motion) `flex-wrap`
                sayesinde bugünkü gibi alt alta kalıyor, JSX'te iki dal
                yok. */}
            <div className="home-portfolio-head mx-auto max-w-(--container-wide)">
              <div className="home-portfolio-head__title">
                <SectionMarker index={4} label="Portfolyo" flip />
                {/* Punto inline style'da DEĞİL CSS'te
                    (.home-portfolio-head h2): başlık sabit sahnede sınırlı bir
                    dikey bütçe paylaştığı için yeterince uzun ekranda bir
                    kademe iniyor, taban hâlde display-2xl kalıyor. Inline
                    style ikisini birden ifade edemezdi — bant 3'ün
                    `.home-case-split__title`'ındaki aynı gerekçe. */}
                <h2
                  className="home-portfolio-title font-display text-strong"
                  data-enter="mask"
                >
                  KURUMSAL KİMLİKTEN KAMPANYAYA
                </h2>
              </div>
              {/* `mt-8` YOK: bloğun dikey ritmi .home-portfolio-head'te. */}
              <p
                className="home-portfolio-head__lede text-lead text-muted max-w-(--container-prose)"
                data-enter
              >
                Farklı sektörlerden seçilmiş sekiz iş — logo ve kurumsal kimlik
                çalışmalarından sosyal medya kampanyalarına.
              </p>
            </div>

            {/* Ray penceresi max-w-(--container-wide) sarmalayıcının DIŞINDA
                — .home-rail'deki gerekçenin aynısı: track'in tam genişliği
                kısıtlanmamalı. Başlık kendi sarmalayıcısını yukarıda
                taşıyor, bu yüzden sahne ikisini de kapsayabiliyor. */}
            <div className="home-portfolio-viewport">
              {/* Kademeli giriş SADECE taban (dikey grid) düzende geçerli —
                  globals.css [data-enter-stagger]'ın gerekçesi. Yatay ray
                  canlıyken track'in KENDİ akışı bandın tek hareketi, tile
                  başına ayrı bir reveal jesti gated blokta kapatılıyor. */}
              <div className="home-portfolio-track" data-enter-stagger>
                {PORTFOLIO_ITEMS.map((item, index) => (
                  <figure
                    key={item.src}
                    className={
                      item.wide ? "home-portfolio-item--wide" : undefined
                    }
                    style={{ "--enter-i": index % 3 } as React.CSSProperties}
                  >
                    {/* fill + sizes: çerçevenin oranı CSS'te (1/1, geniş olan 2/1),
                        görsel onu cover ediyor. `preload` VERİLMİYOR (Next 16'da
                        `priority`nin yerini aldı) — bu görseller katlanın çok
                        altında, hero'nun ilk boyaması bloklanmamalı.

                        `--pan-scale`: gated bloktaki pencere parallax'ının
                        ölçeği (globals.css). `wide` (Wellness) için TABANDAN
                        BÜYÜK: içeriği zaten `.home-portfolio-media--boost`
                        ile büyütülmüş, parallax'ın kendisi bunun üstüne
                        biniyor — küçük tutulsaydı iş yeniden küçük dururdu. */}
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
                        className={
                          item.wide ? "home-portfolio-media--boost" : undefined
                        }
                        style={
                          {
                            objectFit: "cover",
                            "--pan-scale": item.wide ? 1.22 : 1.08,
                          } as React.CSSProperties
                        }
                      />
                    </div>
                    <figcaption className="home-portfolio-caption">
                      <span className="eyebrow text-strong">{item.brand}</span>
                      {/* İkinci satır `KATEGORİ · ETKİNLİK`. `event` yalnızca
                          aynı marka + kategori çifti dizide tekrar ettiğinde
                          dolu (bkz. portfolio.ts): Rixos Premium Bodrum'un iki
                          etkinlik kampanyası aksi halde iki ÖZDEŞ künyeyle yan
                          yana akıyor ve iş kopyalanmış gibi okunuyordu.
                          Ayraç ince nokta — künye tek satır kalıyor, üçüncü
                          bir tipografik katman açılmıyor. */}
                      <span className="eyebrow text-muted mt-1">
                        {item.event
                          ? `${item.category} · ${item.event}`
                          : item.category}
                      </span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-(--container-wide)">
          {/* Tam liste /portfolyo'da (kategori filtreli). */}
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
