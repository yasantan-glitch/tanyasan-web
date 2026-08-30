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
- `.on-paper` — açık zemin bir **renkten değil sürülen bir katmandan**
  geldiğinde (hero faz 8'in koyudan beyaza dönen zemini): `.surface-paper` ile
  aynı
  token'ları bağlar ama `background-color` **vermez**, altındaki medya görünür
  kalır. `.btn-ghost` kenarlığı/metni ve focus halkası böylece beyaz zeminde
  de doğru tonu alıyor (`#1C1C1C` metin ≈ 15:1, hover kenarlığı `#7A5200`).

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
| `--text-hero-statement` | 44→136px | 0.95 | -0.035em |
| `--text-display-hero` | 52→136px | 0.92 | -0.03em |
| `--text-display-2xl` | 36→64px | 1.02 | -0.025em |
| `--text-display-xl` | 28→44px | 1.1 | -0.02em |
| `--text-display-lg` | 24→32px | 1.15 | -0.015em |
| `--text-lead` | 20px | 1.55 | -0.005em |
| `--text-body` | 17px | 1.65 | 0 |
| `--text-body-sm` | 15px | 1.6 | 0 |
| `--text-caption` | 13px | 1.5 | 0.01em |
| `--text-label` | 12px | 1.4 | 0.08em |

`--text-hero-statement` yalnızca hero'nun faz 1 statement'ı için: faz 1'in
tek görsel öğesi o metin olduğu için `display-hero`'dan bir kademe büyük ve
ekrana hakim. Ayrı token olarak eklendi — `--text-display-hero` `/design-system`
sayfasında ve başka başlıklarda kullanılıyor, oranı bozulmasın diye
büyütülmedi. Line-height 0.95: 0.88'de Türkçe'de `İ`'nin noktası bir üst
satırın virgülüne giriyordu.

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
`heroPhases.ts`). Mekanizma scrollcraft eklentisinin
(`nateherk-design@nateherk`) tekniklerinin React'e portu: sticky-pin +
normalize progress, cue pencereleri, lerp'lenmiş/deadband'li video playhead,
blob-preload, iOS priming.

Tek runtime bağımlılığı `lucide-react` (hizmet fazlarının ikonları — 6 ikon,
tree-shake ediliyor). Hareket kütüphanesi hâlâ yok; scrub tamamen kendi
motorumuz.

**Eklenti motoru projeye alınmıyor, teknikleri alınıyor.** scrollcraft'ın
kendi motoru vanilla JS + DOM attribute'larıyla çalışıyor (`data-sc-act`,
`data-sc-kinetic`); onu da mount etmek aynı sayfada ikinci bir rAF döngüsü ve
`PHASE_RANGES` ile çakışan ikinci bir zaman remap'i demek olurdu. Bu yüzden
buradan alınanlar tekniklerdir: `splitText()`'in kelime bazlı kinetik metin
ideomu (bizde JSX'te statik, runtime DOM manipülasyonu yok — SSR/hydration
güvenli), `sc-split`'in "maske girişler içindir" disiplini,
`data-sc-tilt`'in `perspective(1100px) → rotateX → rotateY` formülü (bizde
pointer yerine scroll'dan sürülüyor) ve reduced-motion yasası ("fewer and
gentler, not zero"). `dwell`/`lingerEase` remap'i bilinçli olarak
kullanılmıyor.

### Faz modeli

Hero 8 fazlı bir anlatı: faz 1 tipografik statement, fazlar 2-7 altı hizmet
ailesi, faz 8 kapanış (beyaz zemin + dikey ray/nokta + kapanış sloganı + CTA +
nokta bulutu küresi).
Faz sırası, ağırlığı ve içeriği `heroPhases.ts`'te tek
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

**Faz 1 (statement).** Ortadaki TANYASAN logo grafiği kaldırıldı — logonun
tek yeri nav (`.site-header-logo` artık şeffaf nav'da da görünüyor). Yerine
mevcut slogan `--text-hero-statement` ile ekrana hakim tek blok olarak duruyor.
Kopyanın **girişi scroll'a bağlı değil**: hero'nun ilk karesinde başka öğe
olmadığı için metin sayfa açılır açılmaz ekranda olmalı — giriş tek seferlik
bir CSS load animasyonu (`.hero-intro-rise`, satır başına 0/0.12/0.26s
gecikme), scroll yalnızca **çıkışı** sürüyor. Sağ altta düşük opaklıklı bir
scroll ipucu (nokta + "SCROLL") var; intro'nun ilk %25'inde sönüyor.

**Faz 1'in çıkışı — dağılma.** Statement blok hâlinde sönmüyor: her kelime
ayrı bir `span` (`HERO_STATEMENT_LINES`, `.hero-statement-word`) ve kendi
yönüne savruluyor — bazıları sola, bazıları sağa, aynı anda yukarı kayıp
bulanıklaşarak. Cümle "çözülüyor". Eğri `scatterU`, handoff'tan
`SCATTER_LEAD = 0.05` kadar önce başlar ve handoff ile **aynı anda** biter;
böylece sınırda ne ani kesim ne de geride kalan kelime olur.

Yön/mesafe/gecikme **deterministik**: `hash01(n) = frac(sin(n·127.1)·43758.5453)`
(klasik GLSL ideomu), `n = satır·31 + kelime`. `Math.random` bilinçli olarak
kullanılmıyor — aynı sayfa her ziyarette aynı dağılmalı, yoksa hareket
tasarlanmış değil kazara görünür. Üç bağımsız kanal türetiliyor: yön+mesafe
(8–30vw), yükselme (6–16vh), stagger sırası. Yön kanalı indeks paritesiyle
harmanlanıyor: parite tek başına fazla düzenli (sağ-sol-sağ), hash tek başına
bir satırın tamamını aynı yöne düşürebiliyor; XOR'u her satırda iki yönü de
garanti edip ritmi düzensiz tutuyor. Blok sarmalayıcısı (`introBlockRef`)
yükselme + ölçeği taşımaya devam ediyor ama **opaklık yazmıyor** — o artık
kelimelerde, ikisi birden yazılsa çift sönme olurdu.

Alt başlık aynı dili daha sakin konuşuyor (tek yön, rotasyon yok, kelimelerden
biraz önce). `SCATTER_SUB_LEAD` küçük tutulmalı: pencere
`introEnd − SCATTER_LEAD − LEAD` noktasında **açılıyor**, 0.12'de alt başlık
sayfanın tepesinden itibaren soluyordu (ölçüldü, 0.02'ye çekildi). Faz 1'de
görünür CTA yok — CTA satırı yalnızca faz 8'de beliriyor.

> **Kural: giriş animasyonu ile scroll sürüşü AYNI elementte olamaz.**
> CSS animasyonunun çıktısı kaskadda inline stilin üstündedir; `.hero-intro-rise`
> `fill-mode: both` ile animasyon bittikten sonra da son karesini
> (`opacity: 1; transform: none`) tutar ve motorun her frame yazdığı inline
> değerleri ezer. Alt başlık bir süre böyle kırıktı: faz 1'den sonra hizmet
> fazlarında ve faz 8'de ekranda kalıyordu. Çözüm, statement'ta zaten var olan
> ayrımı ona da uygulamak — **giriş sarmalayıcıda, çıkış içteki elementte**
> (statement'ta animasyon satır span'ında, scroll kelime span'ında; alt
> başlıkta animasyon `.hero-intro-sub` div'inde, scroll içteki `<p>`'de).
> Bu sınıf hatalar `element.style.opacity` okunarak **görülemez** — inline
> değer doğru görünür, ekrana giden hesaplanmış değer yanlıştır; doğrulamada
> `getComputedStyle` kullanın.

**Faz 1 → Faz 2 devri.** Sınırda crossfade (biri kapanır, diğeri açılır)
yerine tek bir devam eden hareket: faz sınırının iki yanına yayılan
`handoff = smooth((p - (introEnd - 0.028)) / 0.056)`. Faz 1 kopyası
`translateY(-11vh) + scale(0.93)`'e doğru kaymaya devam ederek çıkarken faz 2
bloğu aynı eğri üzerinde 9vh aşağıdan yükseliyor. Kök opaklığını açmak yetmiyor
— faz 2'nin **içerik zaman çizgisi** de `leadingPhaseProgress()` ile
`HANDOFF_SPAN` kadar erkene alınıyor, yoksa ikon `q=0`'da görünmez kalır ve
sınırda ölü an oluşur. Bu yalnızca ilk hizmet fazına uygulanıyor; diğer 6 sınır
ve fazların kendi koreografisi dokunulmadan kalıyor. Klip playhead'i gerçek
faz aralığında sürülüyor (pre-roll'ü kullanmıyor).

**Faz 8 (kapanış).** Fazın **hiç medyası yok** — ne klip ne fotoğraf.
Kapanış tamamen kod tabanlı bir sahne: beyaza dönen zemin, sayfanın 2/3
hattında bir dikey ray, rayı çizerek inen bir nokta, raydan sökülen slogan ve
CTA, sağda nefes alan bir nokta bulutu küresi. Motorda resolve'a ait video
katmanı, `RESOLVE_VIDEO_FADE` ve blob-preload dalı yok; fazlar 2-7'nin video
mimarisi dokunulmadan duruyor. Önceki monitör fotoğrafı ve onun 3D yerleşme
koreografisi (`.hero-outro-monitor`, `rotateX/rotateY`, `mix-blend-mode:
multiply`, `ensureOutroImage`) **kaldırıldı**; sahnenin bugünkü hâli her
ölçekte keskin, ilk yükte ağırlıksız ve renklerinin tamamı token'lardan
geliyor.

Zemin faz 8'in başında koyudan beyaza dönüyor: `.hero-bg-wash` (düz beyaz
katman) opaklığı `smooth(q / 0.12)` ile sürülüyor. Faz 7'nin içeriği kendi
zarfıyla sınırda zaten 0'a indiği için beyaz, okunmakta olan bir metnin altını
yıkamıyor. Wash ile birlikte koyu katmanlar sönüyor: `.hero-scrim` `1-wash`'a
iniyor, faz göstergesi `(1-wash)` ile kapanıyor, eski `.hero-resolve-glow` ve
`.hero-vignette` kaldırıldı (ikisi de beyaz sahnede ters etki yapıyordu;
push-in `stageInner`'ın ölçeğinde kalıyor). Yerine `.hero-light-scrim` var —
koyu sahnedeki scrim disiplininin açık zemin karşılığı, **alttan yukarı**
beyazdan şeffafa (`0deg`): okunması gereken metin rayın iki yanında birden
(solda slogan, sağda CTA), yatay bir gradyan biri lehine çalışırdı.

### Faz 8'in koreografisi

Sahnenin tamamı scroll'a bağlı — CSS transition yok. Tek istisna kürenin nefes
döngüsü (aşağıda). Pencereler faz-yerel `q`:

| q | olay |
|---|---|
| 0.00–0.12 | zemin beyaza döner (`wash`) |
| 0.06–0.14 | nokta belirir |
| 0.10–0.55 | nokta iner, ray arkasında uzar; bitişte CTA hizasında **durur** |
| 0.20–0.64 | slogan satırları raydan **sola** çıkar (`staggerDraw`, spread 0.55) |
| 0.58–0.80 | CTA'lar aynı raydan **sağa** çıkar (`staggerDraw`, spread 0.40) |
| 0.66–0.90 | küre belirir (opaklık + `scale 0.86 → 1`), faz sonuna kadar kalır |

Sıra bilinçli: her öğenin sahneye girişinin bir **nedeni** var. Nokta rayı
çizer, ray sloganı doğurur, nokta buton hizasında durduğu an butonlar çıkar.
Slogan ve CTA'nın ters yönlere gitmesi rayı bir eksen gibi okutuyor.

**Ray ve nokta (SVG).** İkisi ayrı SVG. Rayın kutu genişliği (24px) viewBox
genişliğine **eşit**: bu yüzden `preserveAspectRatio: none` yalnızca dikeyde
geriyor, x ölçeği tam 1 kalıyor ve çizgi kalınlığı hiç bozulmuyor
(`vector-effect: non-scaling-stroke` ikinci güvence). Uzunluk `pathLength="1"`
+ `stroke-dashoffset` ile sürülüyor, yani dashoffset doğrudan "çizilmemiş
oran". Nokta kendi 28×28 kutusunda, viewBox'ı da 28: dikey kaydırma dışında
hiçbir ölçek uygulanmıyor, daire her ekranda daire.

Rayın yatay konumu tek bir değişkende: `--hero-outro-rail-x: 66%` (`.hero-stage`
üzerinde, mobilde `68%`). Ray, slogan bloğunun sağ kenarı, CTA kutusunun sol
kenarı ve kürenin dayandığı hat hep buradan okunuyor — dört yerde ayrı sabit
tutulmuyor.

Noktanın **durma yüksekliği** hardcode değil: CTA kutusunun layout kutusundan
ölçülüyor (`cta.offsetTop + offsetHeight/2`, `outroLayout()`), rayın tepesi de
sahne yüksekliğinin %8'i. Ölçüm `getBoundingClientRect` ile **değil**
`offsetTop` ile yapılıyor — rect transform'u içerir ve CTA'nın çocukları her
frame kaydırılıyor. Aynı nedenle CTA sarmalayıcısına transform yazılmıyor,
kaydırma butonların kendisinde. Ölçüm yalnızca `layout()`'ta (mount + resize),
frame içinde hiç layout okuması yok.

**Yaylanma (`springOut`).** Satırlar ve butonlar yerine otururken sert
durmuyor: `1 - e^(-5.2t)·cos(6.6t)` sönümlü kosinüsü hedefi bir miktar aşıp
geri salınıyor. **Yalnızca konuma** uygulanıyor — opaklığa uygulansaydı
overshoot 1'i aşıp geri döndüğü için gözle görülür bir titreme olurdu; opaklık
monotonik `smooth` ile sürülüyor. Eğri `t=0`'da tam 0, `t=1`'de artık ~0.005
(en büyük mesafede bile pikselin altında) ve uçta sert olarak 1'e kilitleniyor,
böylece scroll geri geldiğinde tam kapanıyor.

**Slogan.** Faza özel **yeni** bir mesaj — faz 1'inki kapanışta geri gelmiyor.
Tamamı büyük harf ve **satır satır**: FİKİRDEN / SONUCA, / TEK / EKİPLE
(`RESOLVE_SLOGAN_LINES`); "TEK" accent renginde (`RESOLVE_SLOGAN_ACCENT_LINE`,
`--color-accent`), diğerleri `--color-fg-on-paper`. Blok **sağ kenarından raya
yaslı** (`inset-inline-end: calc(100% - var(--hero-outro-rail-x))`,
`text-align: end`) ve satırlar `+14vw`'den 0'a, yani raydan sola akıyor.

Her satırın kutusu (`.hero-outro-slogan-line`) **maske taşıyor**: sağ kenarı
rayın üstünde olduğu için satır, rayı geçene kadar görünmüyor — "hattan
sökülme" okuması buradan geliyor. Bu, statement'taki maske yasağının bilinçli
istisnası: orada mesafe kelime kutusundan büyüktü ve maske kelimeyi kendi
kutusunda kırpıyordu, burada kutu satırdan geniş ve kırpma kenarı **anlamlı**.
`overflow-x: clip` + `overflow-y: visible` kullanılıyor — iki eksende birden
kırpsak büyük harflerin (İ) noktası kesilirdi; `clip`, `visible` ile
eşleşebilen tek değer (`hidden` olsaydı tarayıcı y eksenini de `auto`ya
çevirirdi). `padding-inline-end: 0.9rem` metnin dururken raya yapışmasını
önlüyor, kırpma kenarı yine rayın üstünde kalıyor.

Ölçü, faz 1'in statement'ıyla **aynı** token: `--text-hero-statement`
(1680px'te 124px). Hero'nun iki hakim tipografik bloğu — açılış ve kapanış —
bilinçli olarak tek ölçekte kilitli; biri değişince diğeri de değişiyor.
`--text-display-hero` burada yetersiz kalıyordu (aynı ekranda 95px, sütunun
ancak yarısı) ama o token `/design-system`'de de kullanıldığı için
büyütülemezdi — bu yüzden yeni token da eklenmedi, var olanı paylaşmak
doğru cevaptı.

`font-size: min(var(--text-hero-statement), 15svh)`: 4 satır × 0.95 =
3.8em'lik blok dikeyde ortalı duruyor ve kısa masaüstü pencerelerinde
(≤800px) CTA bandına iniyordu; guard onu sınırlıyor. 918px'lik tipik sahnede
15svh = 138px, token tavanı 136px — yani normal masaüstünde **etkisiz**.
Mobilde `--text-display-2xl` (değişmedi).

Ölçüldü (1680px, sütun 1054px): "FİKİRDEN" 592px → %56 dolu, satır kutularında
`scrollWidth == clientWidth` (yatay taşma yok), satır kutusuyla metin kutusu
aynı yükseklikte (dikeyde kırpma yok, "İ" güvende), slogan bloğunun altı ile
CTA arasında 47px pay var.

**CTA.** Faz 1'in alt bandından **çıkarıldı**, kendi mutlak kutusuna alındı
(`.hero-outro-cta`): sol kenarı raya yaslı, butonlar `-10vw`'den 0'a, yani
raydan sağa yürüyor. Mobilde rayın sağında iki butona yer yok — kutu gutter'a
düşüyor ve kayma genliği JS'te `OUTRO_MOBILE_SHIFT_DAMP = 0.34` ile kısılıyor.
Butonlarda maske **yok**: kırpma kenarı focus halkasını da keserdi.

Slogan ve CTA **açık zemine göre** stilleniyor (`.on-paper`, bkz. §2) ve renk
geçişi gerekmiyor: wash `q=0.12`'de tamamlanıyor, slogan `0.20`'de, CTA
`0.58`'de belirmeye başlıyor — ikisi de koyu zeminde hiç görünmüyor.

**Küre.** Sağda, butonların üstünde duran bir nokta bulutu. **280 nokta**
(140 seyrek kalıyordu). Koordinatlar VE her noktanın nefes parametreleri
`outroOrb.ts`'te **deterministik** üretiliyor — `Math.random` yok (faz 1'in
kelime saçılmasıyla aynı `hash01`, artık ortak `heroMath.ts`'te), modül
seviyesinde bir kez hesaplanıyor. Burada determinizm ayrıca **zorunlu**:
değerler SSR HTML'ine inline custom property olarak yazılıyor, sunucu ile
istemci birebir aynı diziyi üretmezse hydration patlar (doğrulandı: iki ardışık
yüklemede ilk 20 noktanın `style` metni birebir aynı, konsolda hydration
uyarısı yok).

Dağılım **Fibonacci (altın açı) kafesi**: kutuplarda yığılan enlem/boylam
ızgarasının aksine noktaları yüzeye eşit aralıklı serer. İzdüşüm ortografik; z
noktanın **yarıçapını** ve **opaklığını** belirliyor — arka yarıküre küçük ve
soluk kaldığı için düz bir daire değil hacimli bir küre okunuyor. Sabit bir
eğim (`ORB_TILT`) var: kafes ekseni tam dikeyken kutuplardaki düzenli sarmal
tepede ve dipte simetrik bir "kapak" gibi okunuyordu.

**Boyut çeşitliliği** iki katmanlı: derinliğe bağlı taban yarıçap (0.8→3.9,
üs **1.7** ile — ön yüzeydeki birkaç nokta öne çıkarken arka yarıküre topluca
küçük kalıyor) × per-nokta çarpan `0.45 + hash01(n+911)² × 1.25`. Hash'in
**karesi** alınıyor: çoğunluk küçük kalır, azınlık belirgin şekilde büyür.
Ölçüldü: 0.38–5.60 birim, noktaların %39'u 1.2'nin altında, %9'u 3.5'in
üstünde — istenen "büyük noktalar arasında çok daha küçükler" dokusu düz bir
dağılımdan değil bu eğrilikten geliyor.

### Kürenin nefesi: per-nokta CSS animasyonu

Tek bir `<g>` keyframe'i **kaldırıldı**. O kurulumda bütün bulut aynı anda
şişip aynı anda renk değiştiriyordu: mükemmel küresel ve mekanik. Artık her
nokta, kendi süresi/gecikmesi/genliğiyle **tek bir paylaşılan** `@keyframes
hero-orb-dot` kuralını sürüyor:

- **Silüet asimetrisi:** nokta 3B radyal yönünde dışa çıkıyor
  (`--odx`/`--ody`, viewBox birimi → CSS'te `px`; `transform-box: fill-box`
  sayesinde 1px = 1 kullanıcı birimi). Genlik, yöne bağlı bir **lob alanından**
  geliyor: düşük frekanslı iki harmoniğin çarpımı (`sin(2.1·ux + 1.7·uz) ·
  cos(1.6·uy)`) + ±%10 hash jitter. Frekanslar bilinçli olarak düşük — yüksek
  frekansta komşu noktalar zıt yönlere gider ve bulut kaynayan bir gürültüye
  döner; istenen birkaç geniş şişkinlik. Ölçüldü: genlik 0.10–7.12 birim
  (ortalama 3.02), yani dış hat yönlere göre gerçekten farklı miktarda şişiyor.
- **Faz ve süre KONUMA BAĞLI DÜZGÜN ALANLARDAN** geliyor, saf hash'ten değil.
  Bu, sahnenin en kritik tasarım kararı: saf hash olsaydı komşu noktalar
  bağımsız titrer ve bulut TV karıncasına dönerdi. Düzgün alan sayesinde
  komşular **neredeyse** aynı fazda olur → bulutun etrafında dolaşan tutarlı
  bir şişme dalgası, ama hiçbir yerde tam simetri yok. Hash yalnızca ince bir
  kırılma olarak ekleniyor ki alan matematiksel bir desen gibi okunmasın.
  Ölçüldü: 168 farklı süre (4.23–7.46s), 225 farklı gecikme. Farklı süreler
  vuru (beat) yaratıyor — desen gözle görülür biçimde asla tekrarlamıyor.
- **Gecikmeler NEGATİF:** her nokta döngünün ortasından başlıyor, yani ilk
  karede bulut zaten asimetrik. Pozitif gecikmeyle hepsi bir süre kıpırdamadan
  bekler ve sahneye "sıra sıra" girerdi.
- **Renk** aynı keyframe'de `color` üzerinden dönüyor
  (`--color-fg-on-paper-muted ↔ --color-accent`), daireler
  `fill: currentColor`. Gecikme ve süreler farklı olduğu için amber bulutta
  aynı anda parlamak yerine **içinde dolaşıyor**.

**Neden CSS, neden JS rAF değil.** Bu döngü scroll'dan bağımsız ve sonsuz.
rAF'ta olsaydı 280 elemana kare başına iki özellik yazmak gerekirdi (~34k stil
yazımı/sn) ve bu dekoratif iş, video playhead'ini süren mevcut `tick()` ile
**aynı kare bütçesine** binerdi. CSS'te JS işi sıfır; tarayıcı ekran dışında ve
arka plan sekmesinde animasyonu kendiliğinden kısıyor; `prefers-reduced-motion`
motorda dal açmadan çözülüyor. Determinizm de kaybolmuyor, çünkü değerler
runtime'da değil modül seviyesinde üretiliyor.

Bedeli saklamıyoruz: 280 animasyonlu eleman = kare başına 280 stil recalc +
~250×250 CSS px'lik boyama. İki kural bunu sınırlıyor: noktalara `will-change`
**verilmiyor** (280 ayrı katman oluşurdu) ve boyama alanı küçük tutuluyor.
Ölçüm kötü çıkarsa geri çekilme yolu hazır: noktaları ~12 loba gruplayıp
animasyonu `<g>` seviyesine taşımak (280 → 12 animasyon; silüet asimetrisi
korunur, faz çözünürlüğü düşer). SSR yükü ~20 KB ham (280 × ~72 bayt), tekrar
eden bir blok olduğu için gzip'te önemsiz.

Üç ayrı eleman zorunlu — sarmalayıcı yerleşimi, içteki div scroll'a bağlı
görünürlüğü, daireler nefesi: görünürlük ve nefes aynı elemanda olsaydı her
frame yazılan transform animasyonun karesini ezerdi.

**Mobilde** küre küçülüp (34vw) sahnenin **sağ üstüne**, sloganın üstündeki boş
alana geçiyor; masaüstündeki "butonların üstünde" konumu dar ekranda alt bandı
kalabalıklaştırıyordu.

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
- **Logo:** Hero'nun kendi logo katmanı (stroke→solid çizim) kaldırıldı; faz 1
  artık tipografik bir statement. `HeroLogoSolid` yalnızca nav'da kullanılıyor
  (`logoData.ts`'teki "TANYASAN" logotype'ı — `Logo_Beyaz.svg`'nin "Design &
  Digital Agency" etiketi küçük boyutta okunaksız kaldığı için dahil değil).
- **Faz 8 medyası: yok.** Kapanış sahnesi tamamen CSS/SVG — ne klip ne
  fotoğraf indiriliyor. Önceki üç varyant (alfa kanallı webm, beyaz zeminli
  mp4, ardından 859 KB'lık monitör PNG'si) kullanımdan kaldırıldı ve
  `public/images/outro/` silindi.
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
  durağan poster hero + `.surface-ink` bir bölümde 6 hizmet ailesi hairline
  ayraçlı satırlar olarak (kart grid'i değil — bkz. §4) + faz 8'in kapanışı:
  kapanış mesajı ve CTA, kendi **açık** yüzeyinde
  (`.surface-paper .surface-paper-raised`) — hareketli dalın beyaz kapanışıyla
  paritesi oluyor. Ray, nokta ve küre bu dalda **hiç render edilmiyor**:
  üçü de yalnızca hareketten ibaret, durağan hâlde anlam taşımıyorlar. Kürenin
  nefesi ayrıca CSS'te de `prefers-reduced-motion` altında kapatılıyor —
  hareketli dal bir şekilde mount olursa diye ikinci güvence.
  İçerik `heroPhases.ts`'ten map'leniyor, iki dalda kopyalanmıyor; yani 8 fazın
  taşıdığı bilginin tamamı hareketsiz olarak da veriliyor. Video hâlâ hiç
  yüklenmiyor (faz 8'de artık hiçbir dalda video yok).

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

## 9. Hizmetler sayfası (`/hizmetler`)

Brief §5'in altı hizmet metninin evi. Üç karar taşıyor:

**Medya yok.** `public/hero-videos/*.mp4` yalnızca hero'da kalıyor. Altı klibi
bu sayfaya da taşımak (viewport'a girince yüklenen sessiz döngüler olarak bile)
hem MB'larca indirme hem altı ayrı poster karesi üretmek demekti; daha önemlisi
hero'nun tek görsel imzasını sulandırırdı. Sayfa tamamen tipografi + hairline:
ilk yükte ağırlıksız, `prefers-reduced-motion` için ayrı dal gerekmiyor.

**Tam genişlik, dönüşümlü yüzey — kart grid'i değil.** Her hizmet kendi
section'ı, `surface-paper` ↔ `surface-ink` dönüşümlü (§2, §4). Sol sütun
yapışkan (`.service-head`, `inset-block-start: calc(var(--nav-h) + 2rem)`):
uzun metin okunurken hangi hizmette olunduğu kaybolmuyor. Sağ sütunda brief
metni (`--container-prose`) ve hairline ayraçlı kalem listesi. `≤860px`'te tek
sütuna düşer ve başlık yapışmayı bırakır — dar ekranda sticky bir başlık okuma
alanının yarısını yerdi.

Renklerin hiçbiri sabit yazılmıyor: bölüm iki yüzey arasında dönüştüğü için
metin/hairline/accent tonu yüzeyin bağladığı değişkenlerden gelmek zorunda.
Hero'nun `.hero-phase-icon`'u bu yüzden yeniden kullanılamadı — o `--color-accent`'i
sabit yazıyor (yalnızca koyu zeminde duruyor); `.service-icon` aynı ölçüyü
(`--hero-phase-icon`) alır ama rengi `--accent-text`'ten okur, böylece açık
zeminde `#7A5200` olur (§1'deki kontrast ayrımı).

**Emlak CRM Pro bağlantısı iç rotaya gider.** Brief §5.2 net: emlakcrmpro.com
bağlantısı *yalnızca* vaka çalışması sayfasının sonunda, küçük bir bağlantı
olarak yer alacak. Bu yüzden Yazılım kaleminin CTA'sı
`/portfolyo/emlak-crm-pro`; dış domain bu sayfada hiç geçmiyor. Bölüm ürün
satmıyor, yazılım yeteneğini kanıtlıyor.

### İçerik `app/content/services.ts`'e çıkarıldı

Altı hizmetin ikonu, başlığı, kalemleri ve brief §5 metinleri artık ortak bir
kaynakta. `heroPhases.ts` bu diziyi map'liyor ve yalnızca kendi işini —
scroll bütçesi payı (`SERVICE_WEIGHTS`) ve faz klibi (`SERVICE_VIDEOS`) —
tutuyor; `PHASE_RANGES`, `SERVICE_PHASES`, `HERO_PHASE_COUNT` imzaları
değişmedi, `Hero.tsx` ve `useHeroScroll.ts`'e dokunulmadı. Yani hero hâlâ
sıranın ve zamanlamanın tek kaynağı, içerik bir katman aşağı indi. Alternatif
(sayfanın kendi kopyasını taşıması) altı kalemlik listeyi iki yerde
tutmak demekti — footer ve /portfolyo da aynı listeyi isteyecek.

## 10. Hakkımda sayfası (`/hakkimda`)

İlk sürümü brief §5.8'in birinci-tekil metniyle kuruldu; içerik sonradan eski
tanyasan.com/hakkimda sayfasından gelen metinle **değiştirildi** (kullanıcı
onayladı). Sonuç bilinçli bir ses karışımı: h1 tekil bir isim kartı
(`TAN YASAN`), lead paragrafı ve üç anlatı bölümü (`YOL` / `YAZILIMA GEÇİŞ` /
`BUGÜN`) "biz" dilinde. Nav etiketi yine `Hakkımda` (`navLinks.ts`), site
haritası (§4) da bu adresi veriyor, ikisine de dokunulmadı.

**Üç yüzey: ink → paper → ink — Hizmetler'in dönüşümlü ritmi tekrarlanmadı.**
§9'daki altı kez yüzey değişimi orada altı **eşdeğer** kalemi birbirinden
ayırıyordu; burada tek bir ses kesintisiz bir hikâye anlatıyor ve her bölümde
zemin çevirmek anlatıyı parçalardı. Yüzey *dili* aynı kalıyor (`surface-ink`
başlık ve kapanış bandı, `surface-paper` gövde, hairline ayraçlar, `eyebrow`,
`text-accent-auto`), yalnızca ritim sakinleşiyor. Başlık ve kapanış bantları
`/hizmetler` ile birebir aynı kalıp — iki sayfa yan yana açıldığında aynı
sistemden çıktıkları okunuyor.

**Düzen yeniden kullanıldı, kopyalanmadı.** Anlatı bölümleri `.service-grid` +
`.service-head`'i (`globals.css`) olduğu gibi kullanıyor: soldaki numara+başlık
sütunu yapışkan, sağda `--container-prose` metin, `≤860px`'te tek sütun ve
yapışma kapalı. Sayfaya özel yalnızca üç kural eklendi — `.about-hero`
(metin | portre grid'i), `.about-portrait` (4:5 oran + hairline çerçeve) ve
`.about-section + .about-section` (bölüm ayracı). `.about-*` adıyla
`.service-*` ikizleri yazılmadı.

**Medya: video yok, tek statik portre.** §9'un gerekçesi aynen geçerli —
`public/hero-videos/*.mp4` hero'nun imzası olarak kalıyor. Brief §5.8'in notu
portreyi açıkça öneriyor (kişisel ajanslarda güven kurmanın en hızlı yolu):
beklenen dosya **`public/images/tan-yasan-portre.jpg`**, önerilen en az
1200×1500 (4:5 dikey). `next/image` statik `src` ile çağrıldığı için
`width`/`height` bileşende açıkça veriliyor; dosya yerine konana kadar sayfa
düzeni doğru, yalnızca görsel kırık görünür.

**Emlak CRM Pro bağlantısı yine iç rotaya gidiyor** (`/portfolyo/emlak-crm-pro`)
— brief §5.2 dış domaini yalnızca vaka çalışması sayfasının sonuna koyuyor,
§9'daki kuralın aynısı. Bu CTA'nın rengi **siyah** (`.btn-ink`, bkz. §buton
envanteri altında) — sayfanın diğer bağlantıları amber/hairline aksanlı
kalırken bu tek CTA bilinçli olarak nötr bırakıldı.

**Buton envanterine üçüncü bir varyant eklendi: `.btn-ink`**
(`globals.css`, `.btn-accent`in yanında). `.btn-accent` (birincil, amber
dolgu) ve `.btn-ghost` (ikincil, yüzeye uyan hairline kenarlık) yanında nötr/
siyah bir üçüncü seçenek: dolgu `--color-ink-900` (`#1C1C1C`), metin
`--color-fg-on-ink` (`#FFFFFF`) — ikisi de paletin kendi renkleri, yeni hex
icat edilmedi. `.btn-accent` gibi sabit renk taşıyor, yüzeyden bağımsız;
bu yüzden hem `surface-ink` hem `surface-paper` üzerinde aynı kontrastı
koruyor (`#FFFFFF`/`#1C1C1C` ≈ 15.3:1, AAA). Hover'da `--color-ink-950`
(`#141414`) — `.surface-ink-deep`'in zaten kullandığı ton. Focus halkası
ayrıca tanımlanmadı: `:focus-visible` zaten yüzeyin `--focus`'undan geliyor
ve koyu dolgu üzerinde de görünür kalıyor.

### Eksik içerik — bilinçli boşluklar

Sayfa hâlâ yalnızca elimizdeki hazır metinle kuruldu — önce brief §5.8, şimdi
eski sitenin sayfası. Her iki kaynakta da olmayan ve uydurulmayan üç şey var: 

- **Yıllar ve kurum adları** — hangi Güzel Sanatlar, hangi şirkette pazarlama
  müdürlüğü, ajans hangi yıl kuruldu. Bu yüzden tarihli bir kilometre taşı
  çizelgesi kurulmadı; bölümler `01 / 03 · YOL`, `02 / 03 · YAZILIMA GEÇİŞ`,
  `03 / 03 · BUGÜN` diye numaralandı. Veri gelirse bu üçlü aynı düzende tarihli
  bir raya çevrilebilir.
- **Ekip** — metnin tamamı tekil, kaç kişi olunduğu bilinmiyor. Ekip bölümü yok.
- **Değerler** — yazılı bir değerler listesi yok. Metnin örtük tezi
  ("iyi görünen bir iş, işe yaramıyorsa iyi bir iş değildir") `01 / 03`
  bölümünün gövdesinde duruyor, ayrı bir değerler bloğuna çıkarılmadı.

## Kapsam dışı

Bu doküman ve `app/globals.css` yalnızca tasarım sistemini kurar. Sayfa
içerikleri (hero dışındaki bölümler), GSAP/dense-GOP re-encode ve
`next.config.ts` yönlendirmeleri ayrı işler olarak ele alınacak.
