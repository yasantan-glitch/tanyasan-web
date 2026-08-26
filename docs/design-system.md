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
blob-preload, iOS priming. Yeni npm bağımlılığı yok.

- **Video renk düzeltmesi:** `public/hero-network.mp4` ölçüldü — amber tonu
  hedeften (`#E8AE30`, H≈41°) daha turuncu ve soluk (H≈30-36°, S/L farklı)
  çıktı. `--hero-video-filter: saturate(1.35) hue-rotate(10deg)
  brightness(0.94) contrast(1.05)` ile düzeltiliyor (`app/globals.css`).
- **Logo:** Yalnızca "TANYASAN" logotype'ı (monogram + wordmark, ilk 4
  eleman) animasyona alınıyor — `Logo_Beyaz.svg`'nin geri kalanı ("Design &
  Digital Agency" etiketi, 20 ayrı path) hero boyutunda okunaksız kaldığı ve
  ana başlık zaten aynı mesajı verdiği için dahil edilmedi.
- **Mobil:** Ayrı/basitleştirilmiş bir deneyim yok — aynı mekanizma, yalnızca
  daha büyük seek deadband'i (`0.02` vs `0.008`). Şu an tek bir video dosyası
  (`hero-network.mp4`, 720p) hem masaüstünde hem mobilde kullanılıyor; bu
  ortamda ffmpeg olmadığı için düşük çözünürlüklü ayrı bir mobil varyant
  üretilemedi — ileride eklenirse `useHeroScroll`'daki tek `videoSrc`
  parametresi bir mobil kaynağı kabul edecek şekilde genişletilebilir.
- **`public/hero-poster.jpg`:** Videodan `t=8s` karesi (tarayıcı+canvas ile)
  üretildi — reduced-motion fallback'i ve `<video>` ilk kare tutucusu için.

## Kapsam dışı

Bu doküman ve `app/globals.css` yalnızca tasarım sistemini kurar. Sayfa
içerikleri (hero dışındaki bölümler), GSAP/dense-GOP re-encode ve
`next.config.ts` yönlendirmeleri ayrı işler olarak ele alınacak.
