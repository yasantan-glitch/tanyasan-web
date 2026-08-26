# tanyasan.com — Tasarım Sistemi

Bu doküman `docs/tanyasan-com-yeniden-tasarim-brief.md`'nin yanında durur ve
`app/globals.css` / `app/layout.tsx` içindeki tasarım kararlarının
gerekçesini taşır. Uygulama kodu ve canlı örnekler için `/design-system`
sayfasına bakın.

## 1. Aksan rengi

`public/Logo.svg` (`.st0{fill:#E8AE30;}`) ve `public/Logo_Beyaz.svg`
(`.st1{fill:#e8ae30;}`) aynı değeri veriyor:

**Aksan = `#E8AE30`**

Logo iki nötr gri de taşıyor, bunlar keyfi seçilmek yerine paletin muted
tonları yapıldı:
- `#A4A5A8` (Logo.svg `.st1`) — koyu zeminde ikincil metin
- `#676767` (Logo.svg `.st2`) — açık zeminde ikincil metin

### Kontrast bulgusu ve `accent` / `accent-ink` ayrımı

`#E8AE30`'un bağıl parlaklığı yüksek (açık bir sarı-amber). Ölçülen oranlar:

| Kombinasyon | Oran | Sonuç |
|---|---|---|
| `#E8AE30` / `#1C1C1C` | 8.5:1 | AAA — koyu zeminde metin serbest |
| `#E8AE30` / `#FAFAFA` | 1.9:1 | Başarısız — açık zeminde metin/ikon olamaz |
| `#7A5200` / `#FAFAFA` | 6.6:1 | AA — açık zeminde amber metin/link |
| `#A4A5A8` / `#1C1C1C` | 6.9:1 | AA |
| `#676767` / `#FAFAFA` | 5.4:1 | AA |

Tek bir `accent` tokenı yeterli değil: `--color-accent` (`#E8AE30`) yalnızca
dolgu, koyu zemin metni ve hero ağ çizgileri için; `--color-accent-ink`
(`#7A5200`) açık zeminde metin, link ve focus halkası için. Bu ayrım
yapılmazsa açık bölümlerdeki her amber link bir erişilebilirlik hatası olur.

## 2. Tema stratejisi — yüzeyler

Site genelinde `prefers-color-scheme` ile tema değişimi yok. Brief, koyu
(hero/header/footer) ve açık (`#FAFAFA` içerik) bölümlerin aynı sayfada yan
yana durmasını istiyor; bu yüzden renk kaynağı `dark:` varyantı değil, bir
bölümün beyan ettiği **yüzey**:

- `.surface-ink` — zemin `#1C1C1C`, `--hairline`/`--focus`/`--accent-text`
  değişkenlerini koyu zemine göre yeniden bağlar.
- `.surface-paper` — zemin `#FAFAFA`, aynı değişkenleri açık zemine göre
  bağlar (`--accent-text` burada `#7A5200` olur).

Bir bileşen `text-accent-auto` veya `border-hairline` kullandığında hangi
yüzeyde olduğuna bakmaksızın doğru tonu ve kontrastı otomatik alır.

## 3. Font çifti — Archivo + Instrument Sans + JetBrains Mono

- **Archivo** (display) — 100–900 ağırlık *ve* 62–125 genişlik ekseni olan
  endüstriyel/editoryal bir grotesk. Hero'da çok büyük boyutta (`wdth:112,
  wght:800`) sıkışık apertürler ve düz terminaller logonun sert
  diyagonalleriyle örtüşüyor. Poppins/Montserrat gibi yumuşak-geometrik
  değil — brief'in "karakterli, geniş ağırlık aralığı olan bir sans" tarifini
  birebir karşılıyor.
- **Instrument Sans** (gövde) — 17px'te nötr ve yorucu değil, karakterini
  display katmanına bırakıyor. Inter/Geist gibi her Next.js projesinde
  görülen bir yüz değil, yani şablon sinyali vermiyor.
- **JetBrains Mono** (utility) — bölüm etiketleri (`01 — HİZMETLER`),
  teknoloji rozetleri (`NEXT.JS · POSTGRESQL`) ve rakamlar için. Ajansın
  yazılım hizmeti verdiği konumlandırmasını tipografiyle de söylüyor.

Üçü de Google Fonts, `next/font/google` ile self-host ediliyor (dış istek
yok, layout shift yok). Üçünde de `subsets: ["latin", "latin-ext"]` —
`latin-ext` Türkçe karakterler için şart (`ğ ş ı İ ç ö ü`). Archivo'ya ayrıca
`axes: ["wdth"]` verildi; bu olmadan genişlik ekseni yalnızca `wght`
varsayılanıyla yüklenir ve hero'daki sıkışık görünüm kaybolur.

## 4. Şekil dili

Keskin: yarıçap `0 / 2px / 4px / 6px`, pill buton yok. Kart gölgesi yerine
1px hairline kenarlık, hover'da amber'a dönüyor. Brief'in "şablon hissi veren
kart grid'leri atılacak" maddesiyle uyumlu; hairline ayraçlı liste düzeni
kart grid'ine tercih edilebilir.

## 5. Tip ölçeği

Display kademeleri akışkan (`clamp`, 360px→1440px arası hesaplandı), gövde
kademeleri sabit — gövde metninin viewport ile büyümesi okumayı bozar, yalnızca
başlıklar ölçeklenir. Gövde 17px seçildi çünkü Hakkımda ve hizmet metinleri
uzun paragraflar taşıyor; 16px bu uzunlukta yorucu.

| Token | Boyut | Line-height | Tracking |
|---|---|---|---|
| `--text-display-hero` | 52→136px | 0.92 | -0.03em |
| `--text-display-2xl` | 36→64px | 1.02 | -0.025em |
| `--text-display-xl` | 28→44px | 1.1 | -0.02em |
| `--text-display-lg` | 24→32px | 1.15 | -0.015em |
| `--text-lead` | 20px | 1.55 | -0.005em |
| `--text-body` | 17px | 1.65 | 0 |
| `--text-body-sm` | 15px | 1.6 | 0 |
| `--text-caption` | 13px | 1.5 | 0.01em |
| `--text-label` | 12px | 1.4 | 0.08em |

## 6. Boşluk ölçeği

Tailwind v4'ün 4px tabanlı `--spacing` skalası (`p-4`, `gap-6`…) korunur;
üstüne düzen ritmi için semantik tokenlar eklendi:

- `--spacing-section` — 72→144px, bölümler arası dikey nefes
- `--spacing-section-tight` — 48→88px, alt bölümler
- `--spacing-gutter` — 20→48px, sayfa yan boşluğu
- `--container-site` — 1280px, ana içerik genişliği
- `--container-wide` — 1440px, tam genişlik vitrin (Emlak CRM Pro)
- `--container-prose` — ~576px (~68ch), uzun metin sütunu

## 7. Erişilebilirlik ve hareket

- `:focus-visible` halkası `--focus` değişkeninden gelir — koyu zeminde
  `#E8AE30`, açık zeminde `#7A5200`; her iki yüzeyde de görünür kalır.
- `@media (prefers-reduced-motion: reduce)` tüm animasyon/geçiş sürelerini
  `0.01ms`'e indirir, `scroll-behavior: auto` yapar — brief'in hero scroll
  animasyonu için gerekli statik geri dönüş altyapısı.

## 8. Hero — scroll-scrubbing

`app/components/hero/` altında kuruldu (`Hero.tsx`, `useHeroScroll.ts`,
`HeroLogo.tsx`, `logoData.ts`). Mekanizma scrollcraft eklentisinin
(`nateherk-design@nateherk`) tekniklerinin React'e portu: sticky-pin +
normalize progress, cue pencereleri, lerp'lenmiş/deadband'li video playhead,
blob-preload, iOS priming.

Tek runtime bağımlılığı `lucide-react` (hizmet fazlarının ikonları — 6 ikon,
tree-shake ediliyor). Hareket kütüphanesi hâlâ yok; scrub tamamen kendi
motorumuz.

### Faz modeli

Hero 8 fazlı bir anlatı: faz 1 slogan, fazlar 2-7 altı hizmet ailesi, faz 8
toparlanma + CTA. Faz sırası, ağırlığı ve içeriği `heroPhases.ts`'te tek
kaynakta durur; `[start, end]` aralıkları ağırlıklardan **türetilir**
(`PHASE_RANGES`) — `useHeroScroll`'un `read()` döngüsünde faz sınırı sabiti
yok. Bir ağırlık değişince tüm zamanlama kendiliğinden yeniden dağılır.

| # | id | ağırlık | pay | ~travel (800vh) |
|---|---|---|---|---|
| 1 | `intro` | 1.30 | 0.000–0.155 | 124vh |
| 2 | `grafik` | 1.15 | 0.155–0.292 | 110vh |
| 3 | `dijital` | 1.05 | 0.292–0.417 | 100vh |
| 4 | `web` | 0.85 | 0.417–0.518 | 81vh |
| 5 | `yazilim` | 0.95 | 0.518–0.631 | 90vh |
| 6 | `foto` | 0.85 | 0.631–0.732 | 81vh |
| 7 | `danismanlik` | 0.85 | 0.732–0.833 | 81vh |
| 8 | `resolve` | 1.40 | 0.833–1.000 | 133vh |

Ağırlık = temel süre + kalem sayısı payı; faz 1 ve 8 en uzun nefesi alır.
Bütçe `--hero-travel: 800vh` + sticky sahne = `--hero-span ≈ 900vh`
(8 ekran). Toplam ağırlık 8.40, faz başına ~95vh.

**Faz içi koreografi** (yerel `q`): ikon `q=0.10`'da ağdan doğar (ölçek +
blur çözülür), ayraç çubuğu `0.18`'de yukarıdan aşağı çizilir, başlık
`0.28`, kalemler `0.30–0.46` arasında `staggerDraw()` ile — logo çizimiyle
**aynı** stagger formülü, iki hareket aynı ritmi paylaşsın diye.

`ITEMS_TO = 0.46` keyfi değil: giriş ne kadar geç biterse "her şey görünür"
platosu o kadar kısalır. Bu değerle plato faz süresinin **%43'ü**
(q 0.445→0.871). Kullanıcı seçimi gereği scroll-snap yok; hızlı scroll'a
karşı tek koruma bütçe + bu plato.

Faz zarfı `cue(q, 0.06, 0.98, 0.14, 0.12)`: çıkış faz aralığının **içinde**
biter, sonraki fazın girişi kendi aralığının %10'unda başlar — bu yüzden iki
faz asla üst üste binmez (7 sınırın tamamında ölçüldü, ortak opaklık 0).

**Performans:** 8 faz × ~9 node'a her frame yazmamak için yalnızca aktif faz
sürülür; görünmez faz bir kez `opacity: 0`'a set edilip atlanır (`zeroed[]`).

- **Video renk düzeltmesi:** `public/hero-network.mp4` ölçüldü — amber tonu
  hedeften (`#E8AE30`, H≈41°) daha turuncu ve soluk (H≈30-36°, S/L farklı)
  çıktı. `--hero-video-filter: saturate(1.35) hue-rotate(10deg)
  brightness(0.94) contrast(1.05)` ile düzeltiliyor (`app/globals.css`).
- **Logo:** Yalnızca "TANYASAN" logotype'ı (monogram + wordmark, ilk 4
  eleman) animasyona alınıyor — `Logo_Beyaz.svg`'nin geri kalanı ("Design &
  Digital Agency" etiketi, 20 ayrı path) hero boyutunda okunaksız kaldığı ve
  ana başlık zaten aynı mesajı verdiği için dahil edilmedi.
- **Mobil:** Anlatı bölünmüyor — aynı 8 faz, sıkıştırılmış bütçe. `≤860px`'te
  `--hero-travel: 520vh` (~5 ekran), faz başlığı `display-2xl → display-xl`,
  kalemler `body → body-sm`, ikon/ayraç bir kademe küçülür, faz göstergesi
  gizlenir. Eşik `useHeroScroll`'daki `isMobile()` ile aynı (860px). Override
  `:root` üzerinde — Tailwind v4'te `@theme` media query kabul etmiyor.
  Seek deadband mobilde hâlâ daha geniş (`0.02` vs `0.008`). Tek video dosyası
  (`hero-network.mp4`, 720p) her iki ortamda kullanılıyor; bu ortamda ffmpeg
  olmadığı için ayrı mobil varyant üretilemedi — ileride eklenirse
  `useHeroScroll`'daki tek `videoSrc` parametresi genişletilebilir.
- **Reduced-motion:** Video, scrub ve rAF döngüsü hiç mount edilmez. Yerine
  durağan poster hero + altında `.surface-ink` bir bölümde 6 hizmet ailesi
  hairline ayraçlı satırlar olarak (kart grid'i değil — bkz. §4). İçerik
  `heroPhases.ts`'ten map'leniyor, iki dalda kopyalanmıyor; yani 8 fazın
  taşıdığı bilginin tamamı hareketsiz olarak da veriliyor.

  `useHeroScroll`'daki blob-preload `fetch`'i **AbortController ile iptal
  edilebilir olmak zorunda**: server snapshot `false` olduğu için SSR önce
  interaktif dalı basıyor, reduced-motion kullanıcısında hydration'da
  `HeroReduced`'a geçiliyor. Abort olmasa o birkaç ms'de başlayan 7.4 MB'lık
  indirme hook unmount olduktan sonra da arka planda sürüyordu (ölçüldü:
  abort'tan önce indirme tamamlanıyordu, sonra 0 bayt).
- **Erişilebilirlik:** Faz yığınına `aria-hidden` **verilmiyor**. `opacity: 0`
  ekran okuyucudan gizlemez; böylece AT kullanıcısı 6 hizmet ailesini sırayla,
  doğru `h1 → h2` hiyerarşisiyle okuyabiliyor. Faz içeriğinde odaklanabilir
  öğe yok, dolayısıyla görünmez focus tuzağı oluşmuyor. Faz göstergesi
  dekoratif, `aria-hidden="true"`.
- **`public/hero-poster.jpg`:** Videodan `t=8s` karesi (tarayıcı+canvas ile)
  üretildi — reduced-motion fallback'i ve `<video>` ilk kare tutucusu için.

## Kapsam dışı

Bu doküman ve `app/globals.css` yalnızca tasarım sistemini kurar. Sayfa
içerikleri (hero dışındaki bölümler), GSAP/dense-GOP re-encode ve
`next.config.ts` yönlendirmeleri ayrı işler olarak ele alınacak.
