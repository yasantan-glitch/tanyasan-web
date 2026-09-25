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

### Özel imleç (Eylül 2026)

Saf CSS, JS yok (yönlü ok istisnası aşağıda) — `cursor: url()` ile dört SVG
(`public/cursors/`). **Cursor lens'le ilgisi yok**: o (aynı ay bilinçli
olarak tamamen kaldırıldı, bkz. git tarihi `0311c8f`) native imleci
GİZLEYİP yerine bir büyüteç/glow motoru süren tamamen ayrı bir mekanizmaydı;
bu yalnızca native imlecin GÖRÜNÜMÜNÜ değiştiriyor, imleç native kalmaya
devam ediyor.

- **Dört varyant**: `arrow` (varsayılan), `pointer` (`a`, `button`,
  `[role="button"]`, `summary`, `label[for]`, `select`), `scroll-down` /
  `scroll-up` (yalnızca gerçek bir scroll mekanizmasının olduğu kaplar:
  `.hero-stage`, `.home-rail`, `.home-portfolio-rail`, `/hizmetler`'in
  `.rail`'i). `arrow`/`pointer` AYNI silüeti ve AYNI hotspot'ı (`3 2`)
  paylaşıyor — pointer'a yalnızca amber bir elmas ekleniyor (TANYASAN
  logotype'ındaki motifle aynı geometri). `scroll-*` farklı bir aile
  (Eylül 2026'da yeniden çizildi — kullanıcı geri bildirimi: eski tek
  `scroll.svg`, ok eklenmiş bir imleçti, istenen "ince amber bir çemberin
  İÇİNDE yöne göre değişen bir ok"tu): ince amber (#E8AE30) bir çember +
  içinde amber ok, hotspot çemberin merkezi (`16 16`). Hepsi çift ton (koyu
  dolgu / amber + beyaz kontur): hem `surface-paper` hem `surface-ink`
  üstünde görünür.
- **Yön, `ScrollDirection.tsx`in yazdığı `html[data-scroll-dir]`'den
  geliyor** (`app/components/ScrollDirection.tsx`, `app/layout.tsx`'e
  mount). Bileşen render etmez; pasif bir `scroll` dinleyicisi rAF'la
  kısılır, yalnızca YÖN DEĞİŞTİĞİNDE (bir ölü bölge payıyla, `DEADBAND = 4`
  px — trackpad'in geri tepmesi oku titretmesin diye) `dataset.scrollDir`
  yazar. Bu, "nav ikinci bir scroll listener eklemez" kuralının (bkz.
  `docs/CLAUDE.md`) BELGELENMİŞ tek istisnası — gerekçe orada. Bayrak
  yokken (ilk yükleme, JS kapalı) varsayılan `scroll-down` — sayfanın doğal
  yönü.
- **Kapı**: `(hover: hover) and (pointer: fine)` — yalnızca gerçek fare/
  trackpad; dokunmatikte kural hiç uygulanmıyor (doğrulandı). Scroll
  varyantı ayrıca `prefers-reduced-motion: no-preference` istiyor: o kaplar
  reduced-motion'da ya hiç render edilmiyor (`.hero-stage`) ya da pin/scrub'ı
  kaybedip düz belgeye düşüyor (`.home-rail` vb.) — mekanizma yoksa imleç de
  "burada özel bir kaydırma var" demiyor (doğrulandı: reduced-motion'da
  `.home-rail` `arrow`'a dönüyor).
- **Metin girişleri** (`input`, `textarea`, `[contenteditable]`) sistemin
  `text` imlecini koruyor; `:disabled` → `not-allowed`. `forced-colors:
  active` altında (Windows yüksek kontrast) tüm özel imleçler `auto`'ya
  döner — SVG orada OS'un kendi imleciyle çarpışabilir.
- **İç içe seçiciler elle yazılı**: `.hero-stage a` gibi kurallar CSS
  özgüllüğü gereği gerekiyor — `a` tek etiket seçici, `.hero-stage` tek sınıf
  seçici; sınıf etiketten daha özgül olduğu için `.hero-stage`'in temel
  kuralı `a`yı otomatik ezerdi, iç içe yazılmadıkça linkler de `scroll`
  imlecini alırdı.

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

| # | id | ağırlık | pay | ~travel (1200vh) |
|---|---|---|---|---|
| 1 | `intro` | 1.300 | 0.000–0.103 | 124vh |
| 2 | `grafik` | 1.990 | 0.103–0.262 | 190vh |
| 3 | `dijital` | 1.817 | 0.262–0.406 | 174vh |
| 4 | `web` | 1.471 | 0.406–0.524 | 140vh |
| 5 | `yazilim` | 1.644 | 0.524–0.654 | 157vh |
| 6 | `foto` | 1.471 | 0.654–0.771 | 140vh |
| 7 | `danismanlik` | 1.471 | 0.771–0.889 | 140vh |
| 8 | `resolve` | 1.400 | 0.889–1.000 | 134vh |

Ağırlık = temel süre + kalem sayısı payı. Bütçe `--hero-travel: 1200vh` +
sticky sahne = `--hero-span ≈ 1300vh`. Toplam ağırlık 12.564, ağırlık başına
~95.5vh.

**Hizmet fazları uzatıldı, İKİ AYRI GEÇİŞTE (Eylül 2026).**

*Birinci geçiş — fazlar çok kısaydı.* Kullanıcı geri bildirimi: hizmet
başlıkları okunamadan geçiyordu. Ölçüm: eski bütçede (ağırlıklar 1.15 / 1.05 /
0.85 / 0.95 / 0.85 / 0.85, `--hero-travel: 800vh`) "her şey görünür" platosu
GRAFİK'te ~47vh, 0.85'lik fazlarda ~35vh'ydi, yani tek bir tekerlek hamlesi.
İki kaldıraç birlikte kullanıldı: (1) hizmet ağırlıkları ×1.4, `--hero-travel`
aynı oranda 800 → 1020vh (mobil 520 → 660vh) — ağırlık başına düşen yol
(~95vh) sabit kaldı, intro/kapanış süresi değişmedi; (2) faz içi girişler
sıkıştırıldı (aşağıda "Faz içi koreografi"), kazanılan pay platoya gitti.

*İkinci geçiş — metin hâlâ çok çabuk beliriyordu.* Canlı testte yeni bir
geri bildirim: bu kez fazların kendisi değil, İÇİNDEKİ METNİN GELİŞİ çok
hızlıydı — istenen, ikon/başlık/kalemlerin ~1.5 saniye (≈30vh) daha geç
görünmesiydi. Bu FARKLI bir problem: birinci geçiş fazın TOPLAM süresini
uzatmıştı, bu ikincisi fazın İÇİNDEKİ metnin NE ZAMAN başladığını
geciktiriyor. Çözüm yine iki parçalı ve birbirine bağlı:

1. **Hizmet ağırlıkları İKİNCİ kez ×1.236, `--hero-travel` aynı oranda
   1020 → 1200vh** (mobil 660 → 780vh, aynı ~%65 sıkıştırma oranı
   korunarak). Yine ağırlık başına yol sabit kalıyor, intro/kapanış
   süresi değişmiyor (124vh / 134vh).
2. **İçerik pencereleri (`ICON_WINDOW`/`RULE_WINDOW`/`TITLE_WINDOW`/
   `ITEMS_FROM`/`ITEMS_TO`, `useHeroScroll.ts`) affine dönüşümle yeniden
   yazıldı**: `yeni = (eski + 0.236) / 1.236`. Bu, "fazı %23.6 uzat, eklenen
   payı EN BAŞA sabit bir gecikme olarak koy" işleminin yerel `q`
   karşılığı — türetim: fazın eski mutlak konumu `V`, eklenen gecikme `D`,
   yeni faz uzunluğu `eski×1.236` olduğunda `yeni_q = (V+D)/(eski×1.236)`;
   `D` her fazda kendi eski uzunluğunun SABİT `%23.6`'sı olacak şekilde
   seçildiğinde (`D = eski_vh × 0.236`) faz uzunluğu ne olursa olsun bu
   ifade `(eski_q + 0.236)/1.236`'ya sadeleşiyor — yani TEK bir formül
   altı fazın hepsinde geçerli. **`PHASE_ENVELOPE`'A BİLEREK
   DOKUNULMADI**: kökün (`.hero-phase` kutusu, opacity) kendi fade-in'i
   hâlâ q=0.06'da başlıyor. Dokunulsaydı faz 1→2 devrinde
   (`leadingPhaseProgress`, `HANDOFF_SPAN`) kök uzunca bir süre tamamen
   görünmez kalırdı — video zaten oynuyorken boş bir çerçeve asılı
   dururdu (canlı ekran görüntüsüyle doğrulandı: kök erken fade-in
   sayesinde bu boşluk hiç açılmıyor, geçiş sırasında her zaman video ya
   da metin görünür).

Ortalama gecikme ~30vh (kısa fazlarda ~27vh, GRAFİK gibi uzun fazlarda
~36vh — fazın kendi uzunluğuyla orantılı, tek bir sabit değil). Video
playhead'i (`VIDEO_FADE`, `driveVideoLayer`) HİÇ DEĞİŞMEDİ: hâlâ fazın tam
yerel `q ∈ [0,1]`'ini kendi süresine 0→1 eşliyor, fazın kaç vh sürdüğünden
bağımsız — bu yüzden video her zaman doğru fazla eşleşmeye devam ediyor,
yalnızca ikon/başlık/kalemler daha geç katılıyor.

Faz sınırını aşan köprüler (`HANDOFF_SPAN`, `SCATTER_LEAD`,
`SCATTER_SUB_LEAD`, göstergenin payı) ham `p` ile değil **ağırlık birimi**
(`1 / HERO_WEIGHT_TOTAL`, `heroPhases.ts`) cinsinden yazılı olduğu için bu
ikinci geçişte de HİÇ dokunulmadı — `HERO_WEIGHT_TOTAL` büyüyünce mutlak
vh'leri (handoff ±~22vh) otomatik korundu.

Headless Chrome ölçümü (tam opak plato, yani kök, başlık ve tüm kalemler
≥0.98), ikinci geçiş SONRASI: 1440×900 ve 1920×1080'de GRAFİK **90vh**,
DİJİTAL 74vh, YAZILIM 66vh, WEB/FOTO/DANIŞMANLIK 60vh. 390×844'te sırasıyla
56 / 46 / 44 / 38vh. Yedi sınırın hiçbirinde iki faz aynı anda görünür değil
(ölçüldü, `overlaps: 0`). Scroll-snap yine yok (kullanıcı kararı).

**Faz 1 (statement).** Ortadaki TANYASAN logo grafiği kaldırıldı — logonun
tek yeri nav (`.site-header-logo` artık şeffaf nav'da da görünüyor). Yerine
mevcut slogan `--text-hero-statement` ile ekrana hakim tek blok olarak duruyor.
Kopyanın **girişi scroll'a bağlı değil**: hero'nun ilk karesinde başka öğe
olmadığı için metin sayfa açılır açılmaz ekranda olmalı — giriş tek seferlik
bir CSS load animasyonu (`.hero-intro-rise`, satır başına 0/0.12/0.26s
gecikme), scroll yalnızca **çıkışı** sürüyor. Sağ altta bir scroll ipucu var
(hairline mouse SVG'si + "KAYDIR"); intro'nun ilk %25'inde sönüyor.

**Scroll ipucu — mouse ikonu.** Önceki nokta + "SCROLL" metni akıcıydı ama
sönüktü (opaklık 0.55, hareketsiz). Şimdi 18×28 inline SVG: 1px hairline
gövde (`rx=7` — kapsülden bir adım köşeli; şekil dilinin "pill yok" kuralı
butonlar içindir, ikonun mouse olarak okunması için bu yuvarlaklık şart) ve
gövde içinde inen bir tekerlek noktası. Nokta tek düz iniş yapmaz, **nefes
alır**: görünmezken belirip `scale 1.25`'e büyür ve amber'a döner
(`--color-accent`, koyu zeminde AAA), inerken `scale 1`'e iner, dipte küçülüp
solar (`@keyframes hero-scroll-wheel`, 2.4s, `--ease-in-out-soft`, sonsuz).
İlk ve son kare görünmez olduğu için döngü başa sararken sıçrama yok. Kürenin
diliminde de aynı idiom var (`hero-orb-wave`: renk tepe noktasında aksana
döner), yani sahnede ikinci bir hareket dili açılmadı.

Döngü **CSS'te**, JS söndürmesi sarmalayıcıda: `.hero-scroll-wheel`
keyframe'i taşır, `useHeroScroll` yalnızca `.hero-scroll-hint`'in
`opacity`/`transform`'unu yazar (`HINT_OPACITY = 0.85`; CSS'teki ilk kare
opaklığıyla aynı tutulur). Aynı elemente iki sürüş yazılmaz — aşağıdaki
kural. Reduced-motion dalı ipucunu render etmez; hareketli dal zorla
mount olursa `animation: none` savunması noktayı durağan bırakır.

**Faz 1'in çıkışı — dağılma.** Statement blok hâlinde sönmüyor: her kelime
ayrı bir `span` (`HERO_STATEMENT_LINES`, `.hero-statement-word`) ve kendi
yönüne savruluyor — bazıları sola, bazıları sağa, aynı anda yukarı kayıp
bulanıklaşarak. Cümle "çözülüyor". Eğri `scatterU`, handoff'tan
`SCATTER_LEAD` (0.42 ağırlık birimi ≈ 40vh) kadar önce başlar ve handoff ile **aynı anda** biter;
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
Mobilde de artık AYNI token, `min(..., 13svh)` ile (Eylül 2026, canlı test
düzeltmesi — bkz. aşağıdaki "Mobil kapanış düzeni" alt bölümü); eskiden
`--text-display-2xl` idi.

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

**Küre.** Sağda, butonların üstünde duran bir nokta küresi. **680 nokta.**
Koordinatlar ve nefes dilimleri `outroOrb.ts`'te **deterministik** üretiliyor.
`Math.random` yok (faz 1'in kelime saçılmasıyla aynı `hash01`, ortak
`heroMath.ts`'te) ve modül seviyesinde bir kez hesaplanıyor. Burada
determinizm ayrıca **zorunlu**: değerler SSR HTML'ine attribute olarak
yazılıyor, sunucu ile istemci aynı diziyi üretmezse hydration patlar.

**Karar değişti (Eylül 2026): düzensiz bulut → gerçekçi küre.** Önceki
sürüm 280 noktalı ve bilinçli olarak düzensiz bir buluttu: karesel hash'le
0.45–1.7× boyut jitter'ı, dış hattı 7 birime kadar şişiren bir lob alanı ve
her noktanın kendi yönüne gittiği per-nokta animasyon. Kullanıcı geri
bildirimi: seyrek ve düzensiz okunuyordu; istenen, noktaları küre yüzeyine
oturan, düzgün dağılmış ve daha sık bir küreydi. SVG korundu (Canvas
seçeneği değerlendirildi, kullanıcı SVG'de kaldı).

- **Dağılım** yine Fibonacci (altın açı) kafesi. Noktaları yüzeye eşit
  aralıklı serer; 680 noktada komşu aralığı ~12 viewBox birimi. Sabit bir
  eğim (`ORB_TILT`) kutuplardaki sarmalın simetrik bir "kapak" gibi
  okunmasını kırıyor. Küre yarıçapı 82'den 88'e çıktı: lob şişkinliği
  kalktığı için taşma payına daha az gerek var.
- **Boyut yalnızca derinlikten geliyor:** `0.7 → 2.3` birim (üs 1.4),
  üstüne yalnızca ±%6 hash payı. Jitter büyük kalsaydı yüzey kırılırdı.
- **Işık.** Opaklık = taban 0.10 + derinlik × 0.50 + Lambert × 0.40. Işık
  sol üst önden geliyor. Arka yarıküre küçük ve soluk, aydınlık taraf
  dolgun: perspektif matrisi gerekmeden hacimli okunuyor.
- **Boyama sırası:** dilim içinde yarıçapa, dilimler arasında ortalama
  derinliğe göre. Arkadaki bir dilim DOM'da öndekinin üstüne binmiyor.

### Kürenin nefesi: dilim seviyesinde dalga

Per-nokta animasyon **kaldırıldı**; eski dokümanın "geri çekilme yolu"
(noktaları gruplayıp animasyonu `<g>` seviyesine taşımak) uygulandı. Noktalar
**görünen dikey eksen etrafındaki boylamlarına** göre 10 dilime ayrılıyor
(`ORB_GROUP_COUNT`). Her dilim (`<g>`) tek bir paylaşılan `@keyframes
hero-orb-wave`'i sürüyor:

- Ölçek **viewBox merkezinden** (`transform-box: view-box`, orijin %50):
  dilim radyal yönde `scale(1.035)`'e kadar dışa çıkıyor, silüet küresel
  kalıyor. Daha büyük genlik, dilim sınırlarında noktalar arasında görünür
  bir yarık açıyordu.
- Gecikmeler dilim sırasına göre kaydırılmış ve **negatif**
  (`-g / 10 × 7.2s`). Yani ilk karede dalga zaten yolda; şişkinlik ve amber
  ton kürenin etrafında dolaşıyor ve yavaş bir dönüş gibi okunuyor.
- Tepe döngünün yalnızca **orta %40'ında** (keyframe 30% / 50% / 70%). Düz
  0→50→100 eğrisinde aynı anda kürenin yarısı amber görünüyordu (ekran
  görüntüsüyle ölçüldü); bu hâliyle dar bir bant.
- Renk dilimde `color` animasyonuyla dönüyor (`--color-fg-on-paper-muted ↔
  --color-accent`), daireler `fill: currentColor`.

**Maliyet:** 280 animasyonlu eleman yerine 10. Noktalar durağan, per-nokta
inline `style` (custom property) yazılmadığı için SSR yükü de nokta başına
küçüldü. `will-change` hâlâ verilmiyor: dilimler yüzlerce nokta taşıyor,
ayrı katman kazançtan çok bellek maliyeti. Döngü neden CSS'te: scroll'dan
bağımsız ve sonsuz; rAF'ta olsaydı video playhead'ini süren `tick()` ile aynı
kare bütçesine binerdi. Süre tek kaynakta (`ORB_WAVE_DURATION`), SVG köküne
`--odur` olarak yazılıyor.

Üç ayrı eleman zorunlu — sarmalayıcı yerleşimi, içteki div scroll'a bağlı
görünürlüğü, dilimler nefesi: görünürlük ve nefes aynı elemanda olsaydı her
frame yazılan transform animasyonun karesini ezerdi.

**Mobilde** küre küçülüp (30vw) sloganla CTA arasındaki banda, sol kenara
(raya yakın) yerleşiyor — "slogan → küre → CTA" dikey okuması (Eylül 2026,
canlı test düzeltmesi: eskiden sağ üstte, sloganın ÜSTÜNDE duruyordu, okuma
sırası ters ve küre kayık okunuyordu; bkz. aşağıdaki "Mobil kapanış düzeni"
alt bölümü). Masaüstündeki "butonların üstünde" konumu dar ekranda alt bandı
kalabalıklaştırıyordu, bu yüzden mobilde ayrı bir yerleşim korunuyor.

**Faz içi koreografi** (yerel `q`): ikon `q=0.256`'da ağdan doğar (ölçek +
blur çözülür), ayraç çubuğu `0.288`'de yukarıdan aşağı çizilir, başlık
`0.321`, kalemler `0.337–0.466` arasında `staggerDraw()` ile — logo
çizimiyle **aynı** stagger formülü, iki hareket aynı ritmi paylaşsın diye.
Bu değerler "Hizmet fazları uzatıldı" bölümündeki İKİNCİ geçişin (metin
gecikmesi) sonucu; kök (`PHASE_ENVELOPE`) hâlâ `q=0.06`'da fade-in'e
başlıyor, yalnızca bu içerik pencereleri geç geliyor.

`ITEMS_TO = 0.466` keyfi değil: giriş ne kadar geç biterse "her şey görünür"
platosu o kadar kısalır. Bu değerle plato faz süresinin **%51.4'ü**
(q 0.466→0.98 civarı — gerçek sönme `rOut`la biraz daha erken başladığı için
ölçülen plato bundan az kısa çıkıyor, bkz. yukarıdaki ölçüm tablosu).
Sırasıyla `0.46` (plato %43, birinci geçiş öncesi) → `0.34` (plato %53,
birinci geçiş) → `0.466` (ikinci geçiş, metin gecikmesi için EN BAŞA ~%24
eklendi, plato ORANI benzer kaldı ama ARTIK DAHA UZUN BİR FAZIN içinde,
yani plato MUTLAK vh olarak da büyük ölçüde korundu — ölçüldü, yukarıdaki
tablo). Kullanıcı seçimi gereği scroll-snap yok; hızlı scroll'a karşı tek
koruma bütçe + bu plato.

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
  `--hero-travel: 660vh` (~6.5 ekran; Eylül 2026'dan önce 520vh), faz başlığı `display-2xl → display-xl`,
  kalemler `body → body-sm`, ikon/ayraç bir kademe küçülür, faz göstergesi
  gizlenir. Eşik `useHeroScroll`'daki `isMobile()` ile aynı (860px). Override
  `:root` üzerinde — Tailwind v4'te `@theme` media query kabul etmiyor.
  Seek deadband mobilde hâlâ daha geniş (`0.02` vs `0.008`). Tek video dosyası
  (`hero-network.mp4`, 720p) her iki ortamda kullanılıyor; bu ortamda ffmpeg
  olmadığı için ayrı mobil varyant üretilemedi — ileride eklenirse
  `useHeroScroll`'daki tek `videoSrc` parametresi genişletilebilir.
- **Reduced-motion:** Video, scrub ve rAF döngüsü hiç mount edilmez. Yerine
  `.hero-bg-static`'in düz koyu radial-gradient zemini (interaktif daldakiyle
  birebir aynı class) + `.surface-ink` bir bölümde 6 hizmet ailesi hairline
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
- **`public/hero-poster.jpg` kaldırıldı.** Videodan (silinmiş `hero-network.mp4`,
  bkz. §8 mobil notu) `t=8s` karesi olarak üretilmişti; reduced-motion
  fallback'inde ham hâliyle görünüyordu ve altı ayrı hizmet klibine geçilen
  mimaride (bu bölümün başı) hangi klibi temsil ettiği artık anlamsızdı —
  hem interaktif dalda hem reduced-motion dalında `.hero-bg-static`'in aynı
  düz zeminine geçildi, dosya ve referansları kaldırıldı.

### Mobil kapanış düzeni (Eylül 2026)

Canlı test geri bildirimi: küre sloganın ÜSTÜNDE, kayık duruyordu ve dikey
ray "Projelerimiz" butonunun tam ortasından geçiyordu. Okuma sırası
yukarıdan aşağı **slogan → küre → CTA** olacak şekilde yeniden dizildi
(`app/globals.css`, `≤860px` bloğu — yalnızca CSS, JS'e dokunulmadı):

- **`--hero-outro-rail-x` %68 → %90.** CTA artık gutter'dan gutter'a tam
  genişlikte akıyor (`.hero-outro-cta`), yani rayın x'i doğrudan bir
  butonun üstüne denk gelebiliyordu. Ölçüldü: "Projelerimiz" butonunun sağ
  kenarı 390px genişlikte ~%78'de, 360px'te (buton piksel genişliği
  neredeyse sabit kaldığı için, oransal olarak) ~%85'e çıkıyor — ray %90'a
  çekilerek en dar ekranda bile en az ~19px pay bırakılıyor (ölçüldü:
  390px'te 46px, 360px'te 19px).
- **Slogan artık sahnenin ÜST bandında**, CTA'nın üstünde değil — kendi
  kapanış cümlesi ilk okunan şey olsun diye. `inset-block-start:
  calc(var(--nav-h) + 1.5rem)`: ham bir `svh` değeri nav'ın kendi
  yüksekliğine (mobilde 3.75rem) neredeyse birebir denk geliyordu,
  "FİKİRDEN"in üst kenarı fixed header'a yapışıyordu (gözlemlendi,
  düzeltildi). Punto bir kademe büyüdü: `--text-display-2xl` →
  `--text-hero-statement` (faz 1'in statement'ıyla AYNI token — kapanışın
  açılışla aynı ağırlıkta okunması zaten §8'in kuralı), `min(...,
  13svh)` ile üst sınırlanıyor ki 4 satır 844px'lik bir ekranda küreye ve
  CTA'ya yer bıraksın.
- **Küre sloganla CTA arasındaki banda**, sol kenara (raya yakın)
  taşındı — eskiden sağ üstte, sloganın üstündeki boşluktaydı.
- Rayın dikey kapsamı (`outroLayout()`, `useHeroScroll.ts`) değişmedi:
  nokta hâlâ CTA satırının hemen üstünde duruyor (bkz. Tur 3'ün "mobil
  kapanış çizgisi butonun üstünden geçiyor" düzeltmesi) — yalnızca YATAY
  konum (`--hero-outro-rail-x`) değişti.
- Doğrulama: 390×844 ve 360×740'ta ekran görüntüsüyle — slogan tepede
  nav'dan ayrık, küre ortada, ray "Projelerimiz"in sağında, hiçbir
  elemanda üst üste binme yok.

## 9. Hizmetler sayfası (`/hizmetler`)

Brief §5'in altı hizmet metninin evi. Üç karar taşıyor:

**Medya: video yok, seçilmiş beş görsel var.** İlk sürümde bu madde "medya
yok" idi ve gerekçesi şuydu: `public/hero-videos/*.mp4` yalnızca hero'da
kalmalı, altı klibi buraya taşımak (viewport'a girince yüklenen sessiz
döngüler olarak bile) hem MB'larca indirme hem altı ayrı poster karesi
demekti; daha önemlisi hero'nun tek görsel imzasını sulandırırdı.

**Bu gerekçe videolar için hâlâ aynen geçerli — klipler taşınmadı.** Değişen,
"medya" ile "video"nun eşitlenmesiydi. Karar kullanıcının iki isteğiyle
tersine çevrildi: (1) *gerçek işlerin görünürlüğü* — Grafik Tasarım ve Dijital
Pazarlama, anlatıldıkları yerde portfolyodan gerçek bir işle kanıtlanmalı;
(2) *görsel zenginlik* — altı bölümlük uzun tipografik bir sayfa scroll boyunca
ritim istiyor. Statik, `next/image` ile AVIF/WebP'ye inen tek bir kare eski
itirazın hiçbirini doğurmuyor: poster üretimi yok, otomatik oynatma yok,
indirme videonun onda biri, hero'nun imzası (hareketli görüntü) tekil kalıyor.

**Altı bölümün altısında da görsel var.** İlk sürümde `yazilim` bilinçli bir
boşluktu: o hizmet zaten anasayfadaki Emlak CRM Pro vitrinine ve bölüm
içindeki `/portfolyo/emlak-crm-pro` CTA'sına bağlıydı, ikinci bir görsel aynı
kanıtı tekrar ederdi. §16'daki anasayfa ray'i eklenince bu karar tersine
döndü: ray da aynı tabloyu okuyor ve altı panelden birinin görselsiz kalması
ray'in kendi ritmini bozuyordu (beşte bir boş panel). Çözüm bir portfolyo
kanıtı değil, **sembolik** bir kare: kod editörü ekran görüntüsü
(`public/images/hizmetler/yazilim.jpg`) — hizmetin doğasının görsel
kısaltması, belirli bir işin ispatı değil.

Eşleme `app/content/serviceMedia.ts`'te (`services.ts`'ten AYRI dosya:
`services.ts`'i hero'nun `heroPhases.ts`'i de okuyor, portfolyo verisi hero
bundle'ına girmesin). Grafik ve Dijital'in `alt` metni `portfolio.ts`'ten
okunuyor — aynı görselin alt metni iki yerde yazılmıyor.

### Parçalardan bütüne: şerit birleşme efekti

Görsel bölüm viewport'a girince beş dikey şeritten birleşerek gelir
(`app/components/services/ServiceImage.tsx` + `.service-media` /
`.service-shard`, globals.css).

- **Hero motoru buraya taşınmadı.** `useHeroScroll` her frame'de rAF ile
  scrub edilen 8 fazlı bir anlatı sürüyor; burada bölüm başına TEK ATIŞLIK
  bir tetik var: `IntersectionObserver` (`threshold: 0.25`), ilk kesişimde
  `data-reveal="in"` ve `observer.disconnect()`. Scroll listener yok, rAF yok,
  WebGL yok; birleşme bittikten sonra bölümün maliyeti sıfır ve geri scroll'da
  efekt tekrar oynamaz. Gözlemci deseni `useScrolledPastSentinel`'den geliyor
  (aynı gerekçe: ikinci bir scroll listener eklememek), ama o hook nav'a özel,
  paylaşılmadı.
- **Şerit mekaniği:** görselin beş kopyası üst üste durur, her biri
  `clip-path: inset()` ile yalnızca kendi %20'lik dilimini gösterir (`--i`
  React'ten inline stille gelir). `clip-path` elemanın kendi koordinat
  sisteminde uygulanır, `transform` ondan sonra — şerit kaydığında içindeki
  görüntü parçası da onunla kayar. Kesimlere 1px `--shard-bleed` payı
  veriliyor, yoksa birleşme anında rasterlemeden dikey seam çizgileri kalıyor.
  Beş kopya aynı `src`e çözüldüğü için tarayıcı tek istek atar.
- **Koreografi:** bekleyen durumda şeritler `--shard-mag` (%22, ≤860px'te %12)
  ile düzensiz çarpanlar (-1.2, 0.9, -0.65, 1, -0.8) çarpımı kadar dikeyde
  kayık ve saydam; açılışta `transform: none` + `opacity: 1`, 900ms
  `--ease-out-quart` ve şerit başına 70ms gecikme. Düzensiz çarpanlar bilinçli:
  eşit kaymalar bir jaluzi gibi okunuyordu.
- **`prefers-reduced-motion: reduce` tamamen CSS'te çözülüyor:** JS observer'ı
  hiç kurmaz (durum `pending` kalır), şeritleri koşulsuz `transform: none /
  opacity: 1` yapan globals.css'in reduce bloğudur. Bu bilinçli: medya sorgusu
  JS'ten bağımsız çalışır, yani hidrasyondan önceki tek bir karede bile
  dağınık hâl görünmez — durumu React'te `in`e çekmek aynı sonucu bir tur
  fazladan render'la ve daha kırılgan biçimde üretirdi.
- **Bilinçli kabul:** SSR'da başlangıç durumu `pending`, yani JS kapalı bir
  tarayıcıda görseller görünmez. Sayfanın komşusu olan hero zaten tamamen
  JS'e bağlı; ayrı bir no-script dalı bu sayfa için tutarsız bir istisna
  olurdu. Erişilebilirlik tarafı JS'ten bağımsız: `alt` yalnızca ilk şeritte
  duruyor (kalan dördü `aria-hidden`), yani ekran okuyucu görseli bir kez
  okuyor.

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

## 11. İletişim sayfası (`/iletisim`)

Sitenin tek dönüşüm noktası: nav'daki `NAV_CTA` ("Teklif Al"), `/hizmetler` ve
`/hakkimda` kapanış bantları hep buraya gönderiyor. Brief bu sayfa için
**yalnızca** §7'deki iletişim bilgilerini veriyor; form backend'i, sosyal medya
adresleri ve harita brief'te hiç geçmiyor — dördü de kullanıcıya soruldu,
aşağıdaki kararlar onun onayıyla alındı.

**Kalıp üçüncü kez tekrarlanıyor, bilinçli.** Koyu başlık bandı → açık gövde →
koyu kapanış bandı; gövde yine `.service-grid` + `.service-head`. Sol yapışkan
sütunda iletişim bilgileri, sağda form: uzun bir form doldurulurken telefon ve
adres ekranda kalıyor. `.contact-*` adıyla `.service-*` ikizleri yazılmadı
(§10'daki kuralın aynısı); yalnızca bilgi listesi ve form için yeni kural var.
Kapanış bandının CTA'sı burada `NAV_CTA` **olamaz** — zaten o sayfadayız;
yerine `tel:` bağlantısı konuldu.

### Form: Server Action + Resend, üçüncü parti form servisi yok

Site Vercel'de barınıyor (brief §1), yani sunucu tarafı zaten elimizde.
Formspree/Web3Forms gibi bir aracı, yazılım geliştirdiğini söyleyen bir ajansın
kendi sitesinde gereksiz bir dış bağımlılık olurdu — üstelik mesajlar bir
başkasının panelinden geçerdi. `mailto:` ise gönderimlerin çoğunu kaybeder
(webmail ve mobil).

- **`resend` npm paketi eklenmedi.** Gönderim tek bir `fetch` POST'u;
  `docs/CLAUDE.md`'deki "yeni paket eklemeden önce mevcut yolu değerlendir"
  notu burada da geçerli. Proje bağımlılık listesi değişmedi.
- **Progressive enhancement.** `useActionState` bir Server Action ile
  kullanıldığında React formu JS kapalıyken native olarak POST eder ve sonucu
  sunucudan render eder. Bu yüzden `ContactForm.tsx`'te `onSubmit`,
  `preventDefault` ve `alert` **yok**; doğrulama, spam kontrolü ve durum
  mesajının tamamı sunucuda üretilip `ContactState` olarak dönüyor. Aynı
  sebeple alanlar kontrolsüz ve hata hâlinde `defaultValue` sunucudan dönen
  `state.values`'tan geliyor — JS'siz turda yazılanlar kaybolmasın diye.
- **`CONTACT_INITIAL_STATE` ayrı bir modülde** (`contactState.ts`): bir
  `"use server"` dosyasından yalnızca async fonksiyon export edilebilir, sabit
  export'u derlemeyi kırar.
- **Env runtime'da okunuyor** (`RESEND_API_KEY`, `CONTACT_TO`,
  `CONTACT_FROM`; bkz. `.env.example`). Anahtar yokken build kırılmıyor,
  yalnızca gönderim başarısız oluyor ve kullanıcıya doğrudan e-posta/telefon
  alternatifi gösteriliyor — mesaj sessizce kaybolmuyor.
- **Spam: honeypot + doldurma süresi, reCAPTCHA yok.** reCAPTCHA üçüncü parti
  bir script; sayfanın "medya/ağırlık yok" çizgisine (§9) aykırı. Honeypot
  `display: none` ile değil ekran dışına taşınarak gizleniyor (bazı botlar
  `display: none` alanları atlar). İki kontrolün ikisi de yakaladığında
  **başarı** dönüyor — bota "engellendin" demek yeni bir deneme davetidir.
- **`reply_to` gönderenin adresi**: gelen kutusundan "Yanıtla" doğrudan
  müşteriye gidiyor. Formun e-postaya göre tek gerçek avantajı bu.

Alanlar: Ad Soyad\*, E-posta\*, Telefon, İlgilendiğiniz hizmet, Mesaj\*.
Eski sitede yalnızca ilk ikisi ve mesaj vardı; telefon ve hizmet seçimi bu
sayfa "Teklif Al" hedefi olduğu için eklendi ve ikisi de opsiyonel. Hizmet
seçeneği `SERVICES`'ten türüyor — altı kalem bu sayfada ikinci kez yazılmıyor
(§9'un tek kaynak kuralı).

### Yeni token: `--field-bg`

Form alanlarının zemini de yüzeyden gelmek zorunda (§2), yoksa form ileride
koyu bir banda konduğunda beyaz kutular olarak kalırdı. `.surface-ink`
`--color-ink-800`, `.surface-paper` ve `.on-paper` `--color-paper-0` bağlıyor.
Odak halkası ayrıca tanımlanmadı — `:focus-visible` zaten yüzeyin
`--focus`'undan geliyor (§7). Native `select` oku macOS'ta kenarlığı yok
saydığı için `appearance` sıfırlandı ve ok gerçek bir ikon elemanıyla çizildi
(`background-image` olsaydı rengi yüzeyden okuyamazdı).

### Harita ve KVKK

**Gömülü harita yok.** Adres metin olarak duruyor, yanında Google Maps'i
dışarıda açan tek bir bağlantı var. Bir iframe ~500KB'lık üçüncü parti yük ve
Google çerezi getirir (KVKK açısından da ayrı bir onay katmanı gerektirir),
üstelik sayfanın tipografi + hairline diline yabancı bir dikdörtgendir.
Randevusuz ziyaret alan bir ajans ofisi olmadığı için gömülü harita burada
işlevden çok dekor olurdu.

**KVKK: onay kutusu değil, tek satır bilgi notu** (gönder butonunun altında).
Tek amaçlı bir iletişim formunda zorunlu checkbox gereksiz sürtünme; ayrıca
linklenecek bir aydınlatma metni henüz yok. `/kvkk` sayfası yazıldığında bu
satır ona bağlanır.

### Eksik içerik — bilinçli boşluk

**Sosyal medya adresleri.** Eski sitede Facebook / Instagram / LinkedIn /
Pinterest bağlantıları vardı, brief bunları vermiyor. `app/content/socialLinks.ts`
tek kaynak olarak kuruldu ama **boş**: uydurma URL kırık link demek olurdu.
Dizi boş kaldığı sürece sayfa sosyal medya bölümünü hiç render etmiyor;
adresler gelince yalnızca o dosya değişecek. (`contact.ts` de aynı sebeple
ayrı bir modül — footer kurulduğunda telefon/adres iki yerde kopyalanmasın.)

## 12. Anasayfa (`/`)

Hero'nun altına brief §4'ün anasayfa sırasının tamamı kuruldu — altı bant: kısa
tanıtım, hizmetler özeti, Emlak CRM Pro vitrini, portfolyo teaser, partner
rozetleri, iletişim CTA'sı. (Emlak CRM Pro bandı önce ekran görüntüleri
olmadığı için ertelenmişti; kareler gelince eklendi.)

**Yüzey ritmi hero'nun son karesinden devralınıyor.** Hero'nun her iki dalı da
beyaz bitiyor — hareketli dalda `.hero-bg-wash` (`--color-paper-0`),
reduced-motion dalında `surface-paper surface-paper-raised` bandı. İlk bant
bu yüzden `surface-paper-raised` (#FFFFFF): iki bant arasında görünür bir renk
kesiği olmuyor. Sonra sayfa aşağı doğru koyulaşıyor:

| # | Bant | Yüzey | Neden |
|---|---|---|---|
| 1 | Kısa tanıtım | `surface-paper surface-paper-raised` | Hero'nun son karesinin devamı |
| 2 | Hizmetler özeti | `surface-paper` | Renk değil ton kademesi; iki açık bandı ayırıyor |
| 3 | Emlak CRM Pro | `surface-ink surface-ink-deep` | Sayfanın en derin tonu = en ağır bandı; aşağıya bakın |
| 4 | Portfolyo | `surface-ink` | Görseller koyu zeminde ayrışıyor; 3'ten ton kademesiyle ayrılıyor |
| 5 | Partnerler | `surface-paper` | Zorunlu — aşağıdaki alfa notuna bakın |
| 6 | İletişim CTA | `surface-ink surface-ink-deep` | Diğer üç sayfanın kapanış bandıyla aynı |

3 ve 4 birlikte sayfanın **vitrin bloğunu** kuruyor: açık "kimiz / ne
yapıyoruz" bloğundan sonra iki koyu bant, biri tek bir işin derinliği, öbürü
işlerin genişliği. Aralarındaki `ink-deep` → `ink` bir renk değişimi değil ton
kademesi — sayfanın tepesindeki `#FFF` → `#FAFAFA` adımının karşılığı.

**Kart yok, yine hairline satır.** Brief §4 hizmetler özetini "6 kart" diye
tarif ediyor ama §4'ün şekil dili kart grid'ini atıyor ve §9 `/hizmetler`'i
hairline ayraçlı satırlarla kurdu. Özet aynı dili tekrarlıyor: sayaç, ikon,
başlık ve kalemler tek mono satırda. Satırların dolgusu `.hero-service-row`'un
`--spacing-section-tight`'i DEĞİL sabit `2.5rem` — o ölçüyle bant 2300px'i
geçiyor ve "özet", `/hizmetler`'in kendisi kadar uzun oluyordu. Her satır
`/hizmetler#<id>`'ye giden bir bağlantı; o çapalar `.service-index` sayesinde
zaten var.

`.hero-phase-icon` yeniden kullanılamadı — §9'daki sebebin aynısı: o kural
`--color-accent`'i sabit yazıyor ve yalnızca koyu zeminde doğru. Açık zeminli
bu bantta ikon `.service-icon`'dan geliyor.

### Ray başlığının iki fazlı gelişi

Sabit köşe başlığı (`.home-rail-lede`) artık bandın açılışından itibaren
hazır durmuyor: tek sürekli scroll jestinde önce **dikey** çıkıyor (sayfanın
ortasından yukarı), sonra **yatay** sola kayıp bugünkü köşe konumuna
oturuyor; paneller ancak ondan sonra akmaya başlıyor. Yeni bir scroll motoru
yok — bandın tek `view-timeline`'ı (`--home-rail`) tek bir orana göre iki
ÇAKIŞMAYAN dilime bölünüyor:

```
--home-rail-arrive-share: 0.2;   /* timeline'ın ilk %20'si = geliş */
```

`.home-rail`'in yüksekliği `panels * travel / (1 - share)` olarak büyüyor:
panel başına düşen gerçek yol (`--home-rail-travel`) DEĞİŞMİYOR, geliş payı
bandın ÜSTÜNE ekleniyor. `share` tek kaynak — hem CSS'teki her
`animation-range`, hem `ServiceRail.tsx`'in klavye köprüsü (odaklanan paneli
doğru dikey konuma taşıyan hesap) aynı değişkeni okuyor, JS'te ikinci kez
yazılmıyor.

**Plaka oynamıyor, içi oynuyor.** `.home-rail-lede` (opak zemin +
maskeleme, yukarıdaki bölümdeki gerekçe) hâlâ durağan; hareket eden yeni
`.home-rail-lede__inner` katmanı, `home-rail-lede-arrive` keyframe'iyle
0%→55%'te dikey (sayfa ortası → plakanın üst hizası), 55%→100%'te yatay
(bant ortası → gerçek `[0,0]`) kayıyor. X/Y hiçbiri ölçülmüyor:
`translateY(-50%)` elemanın kendi yüksekliğinin yarısını otomatik çıkarıyor,
X de bandın gerçek genişliğinden (`100vw - 2 * --spacing-gutter`, aynı
düzeltme `home-rail-slide`'da da var) türüyor. Başlangıç çizgisi
(`border-inline-end`) de aynı fikri tekrarlıyor: geliş bitene kadar şeffaf,
son %40'ta `--hairline`e dönüyor — henüz köşesine oturmamış bir başlığın
yanına çizgi çizmek yalan olurdu.

**Paneller donuk, sonra sağdan süzülüyor.** `home-rail-slide`'ın menzili
artık `share`'den başlıyor; ondan önce `fill-mode: both` sayesinde `from`
karesinde (transform yok) donuk kalıyor — panel akışı geliş bitmeden
başlamıyor, ek bir kilit mekanizması gerekmiyor. Girişin kendisi (raf, ekran
sağı dışından yerine) `home-rail-panels-enter` ile GERÇEK bir konum
hareketi — denenen ilk hâl opacity 0→1 idi, sonuç düşük kontrastlı ve
okunmayan bir soluklaşmaydı; opacity yerine `translateX` geçince aynı
mekanik "raf geliyor, başlığı köşesine itiyor" gibi okunan bir jeste
dönüştü. Menzil geliş diliminin TAMAMI ama keyframe içeride ikiye bölünüyor:
%0-50 panel ekran dışında BEKLİYOR (başlık aynı pencerede sayfa ortasında
dikey çıkıyor, plaka orada opak zemin vermiyor — raf erken girse başlığın
altından geçerdi), %50-100 `--ease-out-quart` ile süpürüp `to` karesine
(translate 0) varıyor — başlığın kendi `home-rail-lede-arrive`sindeki
ikinci fazla AYNI eğri, ikisi aynı anda yavaşlayıp aynı karede duruyor.
Mesafe (`D`) altı panelde de AYNI (bandın gerçek genişliğinden plaka
sütunu düşülmüş) — raf tek parça geliyor, aralar sabit kalıyor, panel
başına ayrı bir indeks tablosu gerekmiyor.

Bu animasyon TRACK'TE DEĞİL, her `.home-rail-panel`in KENDİSİNDE tek
başına duruyor. Denenen ilk hâl track'e iki animasyon (`home-rail-slide` +
girişin ilk versiyonu, virgüllü `animation-timeline`/`animation-range`
listesiyle) veriyordu; aynı elemanda aynı adlı (`--home-rail`) timeline'a
bağlı ikinci bir animasyon canlı testte TÜM ray'i (başlık dahil) render-dışı
bıraktı — tarayıcı bunu besleyemiyor. Kural: **aynı adlı named
view-timeline'a bağlı animasyon elemanı başına birdir**; ikinci bir hareket
gerekiyorsa ayrı bir elemana (burada panelin kendisine) veriliyor, ikisi
ayrı property'lerde (panel: transform, track: transform — ama panelin
transform'u track'in İÇİNDE, ayrı bir eleman üzerinde) olduğu için yine
serbestçe kompozit ediliyor. Aynı gerekçeyle panel İÇERİĞİNİN drift'i
(`.home-rail-panel > *`, `home-rail-content-drift`) geliş dilimine hiç
girmiyor: panelin kendisi zaten bir bütün olarak kayarken içeriğin ayrıca
süzülmesi okunmaz, iki hareket üst üste biner.

**Fallback değişmedi.** `.home-rail-lede__inner` yalnızca gated blokta
(`@supports (animation-timeline: view())` + `no-preference` +
`min-width: 861px`) animasyon alıyor; taban kuralda hiç tanım yok. Yani
destek yok / reduced-motion / ≤860px üç durumda da başlık doğrudan bugünkü
dikey listedeki konumunda, durağan.

### Emlak CRM Pro vitrini (bant 3)

Brief §4'ün 4. sırası, §5.2'nin metni. Sitenin ana konumlandırma iddiasını —
yazılım da bir hizmet çizgisi — kanıtlayan bant: ajansın kendi geliştirdiği,
bugün gerçek bir ofiste çalışan ürün. Bu yüzden portfolyo işlerinden daha
ağırlıklı bir sunum alıyor (kendi bandı, en derin ton, `.btn-accent`).

**Yüzeyin koyu olması bir tercih değil, görsellerin dayattığı bir sonuç.**
Karelerin hepsi açık temalı ve zemini kremimsi beyaz; `#FAFAFA` üstünde kare
kenarları zemine akar — `meta-ads-digital.png`'nin partner bandını açık zemine
mecbur bırakmasının simetriği (aşağıdaki alfa notu). Koyu zeminde ışıyan
yüzeyler olarak ayrışıyorlar, üstelik `ink-deep` bandın istenen ağırlığını da
veriyor.

**Çerçeve: gri pasparta, hairline değil.** İlk sürüm portfolyo bandının 1px
hairline'ını kullanıyordu ve `#141414` üstünde yetmedi: karelerin kendi kenarı
da açık olduğu için sınır kayboluyor, ekran görüntüsü zeminde yüzüyordu.
İkinci denemede kenarlık **beyaz** (`--color-paper-0`) yapıldı ama bu kez ters
yöne taştı — ekran görüntülerinin kendi açık içeriğiyle kaynaşıp zeminde sert
bir beyaz blok gibi durdu. Kalın ve dolu bir **orta gri** kenarlığa geçildi:
`--color-fg-on-ink-muted` (`#A4A5A8`, logodan — `.st1`), zaten koyu yüzeylerde
muted metin/ikon için kullanılan token. Hem zeminden hem görüntülerin beyaz
içeriğinden ayrışıyor; yeni hex icat edilmedi, gölge yok, köşe yarıçapı 0
(§4). Kalınlık tek bir değişkenden (`--case-mat`) geliyor: açılış karesi
`0.75rem`, destekler `0.5rem` (aynı piksel değeri 1440px ve ~464px
genişlikte aynı oranı vermiyor), `≤860px`'te ikisi de `0.375rem`.

Layout shift yok: Tailwind preflight `box-sizing: border-box` bağladığı için
`aspect-ratio: 16 / 9` **kenarlık dâhil** dış kutuya uygulanıyor — çerçevenin
dış ölçüsü ve grid geometrisi kalınlıktan bağımsız, değişen yalnızca içerideki
kadraj. `.home-portfolio-frame`'e dokunulmadı; o bant kendi hairline idiomuyla
çalışmaya devam ediyor.

**Beş kare var, dördü kullanılıyor.** Dışarıda kalan
`emlak-crm-pro-analys.png` (Raporlar — Danışmanlar). Gerekçe **editoryal**:
`analys-2.png` (Raporlar — Portföy) zaten aynı ekranın kardeşi ve üç destek
yuvasının ikisini tek bir bölüme harcamak bandın "tek sistemde topladık"
iddiasını daraltıyor — üç yuva üç ayrı yeteneği gösteriyor. Bu kare önce
*teknik* bir sebeple elenmişti (tooltip artefaktı + kesik satırlar); dosya
4 Eylül 2026'da yenilendi, artefakt gitti ve kare açık temaya döndü, yani
artık kullanıma hazır bir seçenek. Eklenmesi istenirse destek satırı 4 sütuna
ya da 2×2'ye çıkar.

**Düzen: bir büyük + üç destek. Cihaz çerçevesi / tarayıcı mockup'ı YOK.**
Açılış karesi (yönetim paneli) bant genişliğinde, altında üç sütun: portföy
yönetimi → harita üzerinde analiz → raporlar. Sıra §5.2'nin cümlesini takip
ediyor. Sahte macOS trafik ışıkları §4'ün şekil diline (kart yok, gölge yok)
aykırı ve brief §7'nin "atılacak" dediği şablon hissinin ta kendisi; üstelik
karelerin kendi uygulama kabuğu (sidebar + üst bar) zaten var, kabuğu kabuğa
sarmak olurdu. Çerçeve düz hairline.

**Sabit anlatı bloğu + akan destek şeridi.** İlk sürümde yalnızca açılış
karesi (`.home-case-split__media`) sticky'ydi; başlık split'in dışında
sıradan bir `h2` olarak scroll'la birlikte yukarı kaçıyor, metin de görselin
YANINDA ayrı bir sütun olarak akıyordu — anlatı iki yere bölünüyordu. Düzen
`.home-case-split__anchor` / `.home-case-split__stream` ikilisine geçti:
işaret, başlık, açılış karesi, açıklama ve CTA'nın **tamamı** artık tek bir
sol blok (`__anchor`), sağ sütun (`__stream`) üç destek karesiyle bağımsız
akıyor. Ekstra bir motor gerekmiyor — şeridin "yukarı akması" zaten sayfa
scroll'unun kendisi, tek şart şeridin sol bloktan UZUN olması (aksi halde
pin görünmez); bu yüzden şerit aralığı `--spacing-section-tight` DEĞİL
`--spacing-section` (görünür pin yolunu belirginleştirmek için).

Sticky **koşullu**: `min-width: 861px` VE `min-height: 760px` ikisi birden
sağlanmadan `.home-case-split__anchor` sticky olmuyor. Yükseklik şartı
zorunlu — viewport'tan uzun bir sticky blok üst kenara yapışıp ALTINDAKİ
CTA'yı ekran dışına iterdi (görselin sabit kaldığı ama anlatının dağınık
okunduğu eski hissin bir başka biçimi); kısa ekranda blok sessizce normal
akışa düşüyor, düzen yine eksiksiz okunuyor. `≤860px`'te zaten tek sütuna
düşen taban kuralın üstüne ayrıca `static`e döndürecek bir şey yok — sticky
zaten `861px` kapısının arkasında hiç tanımlı değil.

Başlığın punto ayarı `.home-rail-lede__title`'daki aynı problemi çözüyor:
`.home-case-split__title` artık dar bir sütunda durduğu için `≥861px`'te
`--text-display-xl`'e iniyor, tek sütuna düşünce (`≤860px`, taban kural)
`--text-display-2xl`'e dönüyor — inline `style` ikisini birden ifade
edemezdi.

`.home-case-*` kuralları `.home-portfolio-*`'ın **ikizi değil kardeşi**:
hairline çerçeve idiomu aynı, oran ve düzen başka. Portfolyo kareleri 1/1
kampanya kadrajları, buradakiler 16/9 masaüstü arayüz görüntüleri — o kuralın
sabit `aspect-ratio: 1 / 1`i uymuyordu. `≤860px`'te destek kareleri portfolyo
gibi ikiye değil **tek** sütuna düşüyor: yarım telefon genişliğinde (~160px)
yoğun bir arayüz karesi okunaksız bir lekeye dönüşüyor.

**Ölçü ve performans.** Kaynak PNG'ler ~3330×1852 (≈1.80:1), toplamı ~5.7MB.
Çerçeve 16/9 ve kadraj `object-fit: cover` — yan kırpma genişliğin %1'i
(~17px/3336), görünmez; oran CSS'te sabit olduğu için layout shift yok.
`next/image` + `fill` + `sizes` build'de AVIF/WebP'ye ve gerçek görüntü
ölçüsüne indiriyor (açılış karesi ~1250px, destekler ~578px), 5.7MB'lık kaynak
seti tarayıcıya hiç gitmiyor. **`preload` VERİLMİYOR** (Next 16'da
`priority`nin yerini aldı): bant katlanın çok altında, hero'nun ilk boyaması
bloklanmamalı — `next/image`in varsayılanı `loading="lazy"` kalıyor.

**Kareler link değil**, portfolyo bandındaki kararın aynısı. Bandın tek
bağlantısı `/portfolyo/emlak-crm-pro` CTA'sı — `/hizmetler` ve `/hakkimda`
da aynı adrese gidiyor. **emlakcrmpro.com bu bantta geçmiyor**: brief §5.2
dış domaini yalnızca vaka çalışması sayfasının sonuna, küçük bir bağlantı
olarak koyuyor. Bölüm ürün satmıyor, yazılım yeteneğini kanıtlıyor.

#### Eylül 2026: açılış karesi şeride taşındı, yetenek indeksi eklendi

Kullanıcı geri bildirimi: bant zayıf duruyordu. Ölçüldü — eski sol blok
(işaret + başlık + açılış karesi + 2 paragraf + CTA) tarayıcıda 857–863px
(1440/1512/1920 genişliklerde), sticky kapısı `min-height: 950px`'ti; yani
**1440×900 ve 1366×768 gibi yaygın laptoplarda sticky HİÇ devreye
girmiyordu** — "sabit anlatı" iddiasının kendisi çalışmıyordu. Açılış karesi
de kendi tavanıyla (28rem) sınırlı olduğu için sağdaki destek karelerinden
küçük kalıyor, hiyerarşi tersine dönüyordu.

Mekanizma (sol sabit anlatı + sağda akan kanıt) **korundu**, yalnızca sol
bloğun içeriği hafifledi:

- **Açılış karesi sağ şeride taşındı** — dördüncü destek karesi değil,
  şeridin BAŞI (`CASE_SHOTS = [CASE_LEAD_SHOT, ...CASE_SUPPORT_SHOTS]`,
  page.tsx). Dört kare artık aynı boyut sınıfında ve aynı jesti paylaşıyor
  (aşağıdaki "Hareket" bölümü).
- **Yerine `CASE_INDEX`** geldi: dört satırlık numaralı bir yetenek listesi.
  YENİ METİN YOK — numaralar sıradan, etiketler `CASE_SHOTS`'un kendi
  `caption`'ından türüyor (açılış karesinin "EMLAK CRM PRO — YÖNETİM
  PANELİ" künyesinden yalnızca "—"den sonrası kalıyor, ajans/ürün adı bant
  başlığında zaten söylenmiş). `aria-hidden`: aynı bilgi zaten her karenin
  görünür `figcaption`'ında var.
- **Saf CSS scroll-spy, JS yok.** Her figür `timeline-scope` ile açılan
  kendi `--case-shot-N` view-timeline'ını ADLANDIRIYOR (`view-timeline`,
  bir animasyon DEĞİL — img'in kendi anonim `view()`'iyle çakışmaz); ilgili
  indeks satırı o adı `animation-timeline` ile OKUYOR ve karşılığı gelen
  kare okuma bölgesinden geçerken soluktan (opaklık 0.4) tam opaklığa
  çıkıyor. §12'nin "aynı adlı named view-timeline'a bağlı animasyon elemanı
  başına birdir" kısıtı ihlal edilmiyor: her isme yalnızca BİR figür kaynak,
  BİR satır tüketici bağlanıyor.
- **Blok içi ritim 2rem'den 1.5rem'e indi** (portfolyo bandının kendi sticky
  bütçesi için kullandığı AYNI değer) — tek ve uniform bir ritim, ayrı bir
  "index/CTA'ya daha çok boşluk" istisnası kalkı. Ölçüldü: yeni blok
  678–684px (1440–1920 genişlik), en dar `861–1366px` aralığında (paragraflar
  bir satır daha kırıyor) 702px.
- **Sticky kapısı `min-height: 950px` → `800px`** — en kötü ölçüm (702px) +
  üst offset (`--nav-h + 1rem` = 88px) = 790px, yuvarlanarak 800px;
  portfolyo bandının (aşağıda) kendi sticky kapısıyla AYNI sayı, ikinci bir
  "sihirli" eşik icat edilmedi. Sonuç: **1440×900 ve 1920×1080'de sticky artık
  çalışıyor**; 1366×768 gibi gerçekten kısa ekranlar hâlâ (bilinçli olarak)
  normal akışa düşüyor — bant orada da eksiksiz okunuyor.
- **Grid oranı 1.05fr/1fr'den 0.8fr/1.2fr'e** — sol blok yalnızca metin
  taşıdığı için dar bir sütuna sığıyor, kazanılan genişlik sağdaki dört
  ekranın daha büyük görünmesine gidiyor.

### Hareket: odak geçişi

Bandın imza jesti — `@keyframes case-focus` (`globals.css`). Dört ekran
görüntüsü de (Eylül 2026'dan önce YALNIZCA üç destek karesi; açılış karesi
şeride taşınınca dördü de aynı jesti paylaşıyor, bkz. yukarıki alt bölüm)
scroll ile viewport'tan geçerken dar bir yatay yarıktan tam boya açılıyor
(`clip-path: inset(46% 0 46% 0) → inset(0)`, eş zamanlı hafif bir
`scale(1.06) → 1`), orta bantta tam açık ve tam opak bir PLATO'da durup
üstten çıkarken geri çekilip söner — yani odak şeritte aşağı doğru geziniyor:
dört ekran, tek sistem, sırayla öne çıkan yetenekler. Gerekçe
**design-dna ölçümünden** geliyor, gözle tahminden değil: dört karenin
zemini de `measure-colors.mjs` ile ölçüldü, dördü de kremimsi beyaz
(%63-83 kaplama) ve `#141414` bandına oturuyor — koyu bir odada dört ekran.
Jest bu metaforu tekrar ediyor: karanlıkta bir yarıktan ışık taşıyor.

Dinlenme opaklığı (keyframe'in 0%/100%'ü) 0.4/0.45 — Eylül 2026'dan önce
0.55/0.62'ydi; açılış karesi de bu geçişi kullanmaya başlayınca şeridin İLK
karesi ekrana girerken eski değerle fazla "zaten açık" görünüyordu, odak anı
yeterince belirgin değildi.

**Renk kullanılmıyor.** Aynı ölçüm karelerin kendi aksanlarının birbirinden
(ve site paletinden) tamamen ayrı olduğunu gösterdi — turuncu, mavi, mor,
turkuaz. Bir amber tint veya glow eklemek bu renk çeşitliliğiyle çarpışırdı;
jest bilinçli olarak saf geometri (`clip-path` + `transform`), ikisi TEK
animasyonda (§8 kuralı, iki hareket aynı elemente ayrı yazılmaz).

**Animasyon çerçeveye değil İÇİNDEKİ `img`'e uygulanıyor**
(`.home-case-frame > img`): gri pasparta (kenarlık) her zaman tam ve durağan
kalmalı — ServiceImage'in "çerçeve her zaman görünür, yalnızca içerik açılır"
disipliniyle aynı ayrım. Çerçevenin kendisine uygulansaydı transform kenarlığı
da ölçekler, "kapı" değil "kutunun kendisi büyüyor" gibi okunurdu.

**Menzil karenin viewport'tan TAM GEÇİŞİ** (`cover 0% → cover 100%`),
kademe `nth-of-type` ile DEĞİL karelerin kendi konumlarıyla geliyor — her
kare ekrandan kendi sırasında geçiyor, yani odak şeritte kendiliğinden
aşağı doğru geziniyor (kareler `--spacing-section` arayla ayrı anlarda
geçiyor, art arda değil üst üste binerek okunuyor — SplitWords'teki OVERLAP
mantığıyla aynı gerekçe). Dört kare TEK bir kuralı paylaşıyor, üç ayrı
`nth-of-type` istisnası yok (Eylül 2026'dan önce açılış karesi ayrı bir
`entry`-tabanlı tek-seferlik açılış — `case-aperture` — kullanıyordu, o
kaldırıldı; bkz. yukarıki alt bölüm).

**Sol bloğun yetenek indeksi de aynı fizikten besleniyor.** Her figür kendi
`--case-shot-N` view-timeline'ını ADLANDIRIYOR (`view-timeline`, farklı bir
mekanizma — `animation-timeline` DEĞİL, dolayısıyla img'in kendi anonim
`view()`'iyle çakışmaz); ilgili indeks satırı o adı okuyarak kendi karesi
odaktayken yanıyor. Ayrıntı: yukarıki alt bölüm.

**Metin sakin kalıyor.** İki paragraftan, yetenek indeksinden ve dört
figürden `data-enter` bilerek kaldırıldı: figürde kalsaydı figürün kendisi
`enter-rise` ile yükselirken içindeki `img` aynı anda odak jestiyle açılır,
aynı görsel alanda iki çakışan hareket olurdu. Bandın hareketi tek bir yerde
toplanıyor — yalnızca ekranlar açılıyor, metin ilk kareden itibaren okunur.

**Gramer kısıtı.** Komşu bantlar zaten kinetik tipografi (bant 1, `SplitWords`)
ve pin+pan (bant 2, `home-rail-*`) kullanıyor; bant 4 kendi pinli rayı +
iki efektini kullanıyor (aşağıda). Bu bant DERİNLİKTE scrub ediyor — ayrı
bir eksen, komşularıyla aynı jesti tekrarlamıyor.

**Fallback.** `@supports (animation-timeline: view())` + `no-preference`
sağlanmazsa (tarayıcı desteği yok / reduced-motion / JS kapalı) kural hiç
görülmez, `img` hiçbir zaman `clip-path`/`transform` almaz — resting hâli
zaten tam açık görüntü (§8'in "animasyonsuz durağan hâl doğru olmak zorunda"
disiplini). Mobilde de aynı kural geçerli: `.home-case-split__anchor`'ın
sticky'den taban (statik) hâle düşmesi (`≤860px`, veya sticky'nin
`min-height: 800px` kapısına takıldığı kısa ekranlar) odak geçişini
etkilemiyor, ayrı bir mobil menzili yazmaya gerek kalmadı.

#### Eksik içerik — bilinçli boşluk

**Teknoloji künyesi yok.** `NEXT.JS · POSTGRESQL · …` gibi mono bir satır
bandın yazılım iddiasını güçlendirirdi (`.eyebrow`in zaten tarif edilen
kullanımlarından biri, §tipografi) ama brief §5.1 bu stack'i *ajansın genel*
teknolojileri olarak veriyor, Emlak CRM Pro'nunkiler olarak değil — ürünün
gerçek stack'i bilinmiyor ve uydurulmadı. §10'daki yıl/kurum verisi ve
§11'deki sosyal medya adresleriyle aynı pratik: veri gelmeden yer tutucu
yazılmıyor. Stack doğrulandığında CTA'nın yanına tek satır mono künye olarak
eklenecek; sayfada değişecek başka bir şey yok.

**Taban düzen: statik grid, `≤860px`'te de bu kalıyor.** Üç sütun + tek bir
`span 2` kare: sekiz iş dokuz hücreye, yani tam üç sıraya oturuyor, boş hücre
kalmıyor. `span 2` olan `Welsness_Kurumsal.jpg` — sekiz görselin tek manzara
oranlısı (3000×1987), diğer yedisi kare. Kadraj `object-fit: cover`; hiçbiri
`contain` ile küçültülmüyor, çünkü hepsi kendi kompozisyonu olan kampanya/
mockup kareleri. Bant `--container-wide` (1440) genişliğinde: metin bandı değil
vitrin. Eskiden bu grid'de bir editoryal dikey kaydırma vardı
(`:nth-child(3n + 2) { margin-block-start: 3rem }`, orta sütunu aşağı iten);
kullanıcı geri bildirimiyle ilk sıranın üst hizasının tutarsız okunduğu
ortaya çıkınca kural **kaldırıldı** — ilk sıra artık eşit üst hizada.

**"Statik grid, marquee değil" kararı iptal edildi — yatay PİNLİ RAY
eklendi.** Eski gerekçe hâlâ geçerli bir uyarı: klasik bir marquee (JS + DOM
kopyası, sonsuz döngü) `prefers-reduced-motion` için ayrı bir dal gerektirir
ve hareketin tek sahibi hero olmalı ilkesini (§9) çiğner. Ama kullanıcı
isteği ilk sıranın TAM ve kesilmeden görünüp durmasını, ardından sağdan sola
akmasını istedi — bu marquee değil, `.home-rail`in (bant 2) kardeşi bir
**pin + tek translate** mekanizmasıyla çözülüyor
(`.home-portfolio-rail` / `-viewport` / `-track`, `globals.css`), JS yok,
DOM kopyası yok, `prefers-reduced-motion` fallback'i taban gridin kendisi
(aşağıda).

Kimlik `.home-rail`in KOPYASI değil kardeşi:

| | bant 2 `.home-rail` | bant 4 `.home-portfolio-rail` |
|---|---|---|
| paneller | tavandan tabana tam yükseklikte şeritler | viewport'un dikey ortasında duran dar bir RAF |
| başlık | ray'in İÇİNDE, pin'li, iki fazlı "geliş"i var | ray'in DIŞINDA, dikey, hiç hareket etmiyor |
| açılış | her şey hareket ederek gelir | hiçbir şey hareket ETMEZ — ilk kadraj bir DURUŞ |
| JS | `ServiceRail` klavye köprüsü | yok (tile'lar link değil, odaklanacak eleman yok) |

Mekanizma: bölüm pin'lenir → track ilk `--portfolio-hold-share` payı
(timeline'ın ilk `%15`'i) boyunca **durağan** durur — kullanıcının "ilk sıra
kesilmeden tam görünsün" isteğinin karşılığı, `fill-mode: both` sayesinde
`from` karesinde (transform yok) donuk kalıyor, ek bir bekleme kilidi
gerekmiyor — → kalan yolda track TEK bir `translate3d`
(`home-portfolio-slide`) ile sağdan sola akıyor. Tek animasyon, tek
compositor katmanı. `align-items: start` EŞİT ÜST HİZA'nın kaynağı: taban
gridin kaldırılan `3n+2` ofseti burada hiç yok, şerit tek sıra olduğu için
zaten aynı hizadan başlıyor. Geniş iş (`Welsness_Kurumsal.jpg`) yatayda ÇİFT
genişlik alıyor (`2 * --portfolio-tile-w + gap`), 2/1 oranı sabit kaldığı
için yüksekliği karelerle AYNI — üst VE alt hizası bozulmuyor.

Kademeli giriş (`[data-enter-stagger]`, taban gridin kendi jesti) yatay
modda KAPATILIYOR: her tile'ın kendi anonim `view()`'i pin'li ve yatay kayan
bir kabın içinde anlamsız olurdu, bandın tek hareket sahibi track'in kendi
kaymasıdır. Named `--home-portfolio` timeline'a bağlı animasyon TEK BAŞINA
track'te duruyor (§12'nin "aynı adlı named view-timeline'a bağlı animasyon
elemanı başına birdir" kuralı, canlı testte keşfedilen bug) — tile'ların
`animation: none` sıfırlaması ayrı bir elemanda, çakışma yok.

`≤860px`'te yatay ray hiç kurulmuyor (gated blok `min-width: 861px`'in
arkasında) — bant 2'nin mobilde bilinçli olarak carousel'e geçmemesiyle
aynı gerekçe: gerçek yatay deneyim başka yerde (`/hizmetler`) veriliyor,
aynı jest telefonda ikinci kez kurulmuyor. Aynı taban grid,
`prefers-reduced-motion: reduce` ve `animation-timeline` desteklenmeyen
tarayıcılar için de tek ve aynı fallback.

**Tile'lar link değil.** Tek tek vaka çalışması sayfaları yok, bu yüzden
tile'da hover durumu da yok — tıklanabilirlik ima edilmiyor. Bandın tek
bağlantısı alttaki `/portfolyo` CTA'sı. O sayfa henüz kurulmadı ve bağlantı
bilerek şimdiden konuldu (kullanıcı kararı): nav'da zaten aynı adres var ve o
da 404 veriyor, yani yeni bir kırılma değil; sayfa kurulunca burada
değişecek bir şey olmuyor.

**Partner bandı açık zeminde olmak ZORUNDA.** Eski sitede rozetler koyu zeminde
dairelerdi; §4'te daire ve pill olmadığı için sunum yeniden kuruldu (solda
başlık, sağda üç hairline kare). Ama asıl kısıt renk değil dosya:
`meta-ads-digital.png` **alfasız** (RGB) ve zemini pişmiş beyaz. Koyu bantta
beyaz bir kare olarak dururdu; `#FAFAFA` üstünde bile logonun etrafında ince
bir kenar görünüyor. Bu yüzden bant `surface-paper`, tile zemini ise yüzeyden
değil sabit `--color-paper-0` (`--field-bg`'nin gerekçesiyle aynı).

Tile iki satırlı bir grid (`1fr auto`): logo esneyen üst satırda, etiket
altta. Tek `place-items: center` ile her tile kendi içeriğini ayrı ortalıyor
ve üç etiket farklı yüksekliklerde duruyordu — logolar aynı ölçüde değil
(Google Ads dikey 251×313, diğer ikisi kare). Logo ölçüsü de genişlikten değil
**yükseklikten** sınırlanıyor; aynı sebeple. Sütun sayısı sabit 3: `auto-fit`
861–1000px arasında 2'ye düşüp üçüncü rozeti tek başına alt satıra bırakıyordu.
`≤860px`'te üçü alt alta ve yatay (solda sabit genişlikte logo sütunu, sağda
etiket) — dar ekranda üç küçük kare hem sıkışık hem kırık okunuyordu.

**Partner logoları düz `<img>`, `next/image` değil.** `Google_Ads.svg` bir SVG
ve Next'in görsel optimizasyonu SVG'yi varsayılan olarak reddediyor
(`images.dangerouslyAllowSVG: false`). Üç küçük logo için `next.config.ts`'i
gevşetmeye değmiyor; `width`/`height` açıkça verildiği için layout shift de
yok. Portfolyo görselleri ise `next/image` `fill` + `sizes` ile geliyor
(çerçevenin oranı CSS'te). Hiçbirine `preload` verilmiyor — Next 16'da
`priority`nin yerini alan bu prop hero'nun ilk boyamasını bloklardı.

### Portfolyo bandı (bant 4): başlık ve ray aynı sabit sahnede

Başlık (`KURUMSAL KİMLİKTEN KAMPANYAYA` + lede) eskiden rayın **kardeşi** ve
normal akıştaydı: ray daha akmaya başlamadan yukarı kaçıyordu, yani bandın ne
gösterdiğini söyleyen cümle, gösterme başlar başlamaz kayboluyordu. Artık
başlık rayın **içinde** ve şeritle aynı pinlenmiş kutuyu paylaşıyor.

**İki ayrı sticky kardeş DEĞİL, ikisini de kapsayan tek sticky kutu.** Ayrı
ayrı yapışsalardı pencerenin ofseti `nav + başlıkYüksekliği + boşluk` olurdu —
başlığın yüksekliği genişlikle değişen bir ölçü, ölçmeden yazılamaz, JS
gerekirdi. Bunun yerine:

```
.home-portfolio-rail            uzun kap + view-timeline (DEĞİŞMEDİ)
  .home-portfolio-stage         sticky, 100svh - nav, flex column, center
      .home-portfolio-head      işaret + başlık + lede
      .home-portfolio-viewport  şerit penceresi (artık kendisi pinlenmiyor)
```

Ölçüm yok, yeni motor yok — bant 3'ün `.home-case-split__anchor`ı ile aynı
disiplin. **Rayın kendisine dokunulmadı:** `block-size` hesabı,
`view-timeline`ı, `--portfolio-hold-share`lı iki fazlı `animation-range`i ve
`home-portfolio-slide` keyframe'i aynen duruyor; pencerenin genişliği de
değişmediği için slide'ın `100vw - gutter` matematiği ve "ilk kadraj eşit üst
hizada tam görünür durur, sonra sağdan sola akar" davranışı korunuyor. Değişen
tek şey pencerenin **kim tarafından** pinlendiği.

**Kapı ölçüldü, komşu banttan kopyalanmadı.**
`@media (min-width: 861px) and (min-height: 800px)`. 1440px'te headless
Chrome'da ölçülen: başlık bloğu 298px + flex gap 40px + şerit 366px = 704px;
`100svh - 4.5rem ≥ 704` ⇒ ~776px, payla birlikte 800px (sınırda, 1440×800'de,
sahnede 24px pay ölçüldü). Kapının altında sahne kurulmuyor ve bant bugünkü
hâlinde kalıyor: ray çalışır, pencere dikey ortada kendi başına pinlenir,
başlık akıp gider — kısa ekranda başlığı da sabitlemek viewport'un yarısını
kalıcı işgal ederdi, `.home-case-split__anchor`ın kısa ekranda akışa
düşmesiyle aynı karar. `≤860px` ve `prefers-reduced-motion` yollarında
`.home-portfolio-stage` `display: contents` ile düzenden tamamen çıkıyor;
dördü de tarayıcıda doğrulandı.

Başlık ve kareler artık aynı dikey bütçeyi paylaştığı için ikisi de bir kademe
küçülüyor: punto `display-2xl` → `display-xl` (`.home-case-split__title`'daki
aynı gerekçe). Kare genişliği Eylül 2026'da `19vw/21rem` tavanından
`24vw/28rem`'e büyüdü — bkz. aşağıki alt bölüm, sebep başlığın tek satıra
inmesi.

**`--portfolio-strip-h` sahnede TEKRAR beyan edilmek zorunda** ve bu bir kopya
değil: bir custom property'nin içindeki `var()`, **özelliğin beyan edildiği
elemanda** çözülür. `:root`taki `--portfolio-strip-h`, orada `:root`un
`--portfolio-tile-w`si (22vw) ile hesaplanmış bir uzunluğa dönüşüp aşağıya o
hâliyle kalıtılıyor — `.home-portfolio-rail`deki daraltma ona hiç ulaşmıyordu.
Ölçüldü: pencere 366px yerine 409px kalıyordu, yani şeridin altında ~83px ölü
boşluk ve yalan bir kapı hesabı. Formül kendi elemanında yeniden beyan edilince
düzeliyor. Aynı tuzak `--portfolio-tile-w`yi türeten her ölçü için geçerli;
`.home-portfolio-track > figure` ve `home-portfolio-slide` etkilenmiyor, çünkü
onlar değişkeni **kullanım yerinde** okuyor.

#### Eylül 2026: başlık tek satıra indi, sıra değişti, iki efekt eklendi

Kullanıcı geri bildirimi: ilk kare (Wellness Antalya, kurumsal kimlik)
diğerlerine göre belirgin küçük/eksik kalıyordu.

**Başlık artık DİKEY YIĞIN değil TEK SATIR** (`@media (min-height: 800px)`
gated bloğu — yalnızca sabit sahne kurulduğunda). Eskiden işaret+başlık+lede
üç ayrı çocuk olarak `> * + *` ile alt alta dizilip 298px yer kaplıyordu;
gerçek sebep kullanıcının "kareler küçük" bulmasının kaynağıydı — dar bir
şeride sıkışan başlık, kareye ayrılabilecek dikey bütçenin çoğunu yiyordu.
İşaret+başlık artık kendi mini-sütununda (`.home-portfolio-head__title`),
lede sağda alt kenardan hizalı (`flex-end`, bant 3'ün künyeleri gibi) —
`justify-content: space-between`. Ölçüldü: satır 212–219px (1440–1920
genişliklerde). Kazanılan pay doğrudan `--portfolio-tile-w`ya gitti:
`clamp(13rem, 19vw, 21rem)` → `clamp(14rem, 24vw, 28rem)`, 1440px'te
317px → 346px (+%9). `--portfolio-strip-h` aynı formülle büyüdü (366px →
438px), sticky kapısı (800px) aynı kaldı — 1366×768 gibi kısa ekranlar hâlâ
taban gride düşüyor, bu kapının zaten hedefiydi.

**Sıra değişti** (`portfolio.ts`): `wide` (Wellness) baştan 5. sıraya
(index 4) taşındı. Grid geometrisi DEĞİŞMEDİ — 3×3, 9 hücre; satır 1 üç
normal iş, satır 2 bir normal iş + `wide`, satır 3 üç normal iş (CSS grid
auto-placement bunu otomatik dolduruyor). Yatay pinli rayda ise sıra
DOĞRUDAN "ne zaman göründüğü": ray artık dört doygun sosyal medya işiyle
(Golden Rose, Nur Pastaneleri, iki Rixos kampanyası) açılıyor, Wellness
beşinci kare olarak geliyor — ilk izlenim artık en düşük kontrastlı işle
kurulmuyor.

**Wellness'in kendi görsel zayıflığı ayrıca telafi edildi**
(`.home-portfolio-media--boost`, UNGATED — mobil ve reduced-motion'da da
geçerli): `scale(1.14)` + `saturate(1.16) contrast(1.08) brightness(1.03)`.
Kaynak dosyaya DOKUNULMADI; gerekçe hero videosundaki
`--hero-video-filter`le aynı disiplin — zayıf bir kaynağı CSS'te telafi
etmek, içerik uydurmak değil. `object-fit: cover` görseli kadraja
SIĞDIRIYOR ama içeriği büyütmüyordu; ölçekle içerik (kırtasiye takımı)
çerçeveyi daha çok dolduruyor.

**İki yeni efekt** (kullanıcı isteği: "daha çekici ve düzenli, efekt
kullanarak"), yalnızca `≥861px` gated blokta:

1. **Varış perdesi** (`@keyframes portfolio-curtain`,
   `.home-portfolio-track > figure .home-portfolio-frame`): kareler
   pin'lenmeden hemen önce, sahne yukarı sürüklenirken alttan açılıyor.
   Figürün KENDİ anonim `view()`'i kullanılıyor ama yalnızca `entry` fazı —
   `data-enter-stagger`'ın burada KAPATILAN `cover`-tabanlı deseninin AYNISI
   DEĞİL (o, tile pin'lendikten sonra hiç tamamlanmayan bir geçişti); bant
   3'ün eski `case-aperture`'ı gibi TEK SEFERLİK ve pin'den ÖNCE biten bir
   açılış (`both` ile pin boyunca açık kalıyor). `--enter-i` (page.tsx'te
   zaten `data-enter-stagger` için satır içi yazılı, aynı değişken burada
   PAYLAŞILIYOR) kademe veriyor: tile'lar tek satırda aynı anda ekrana
   girse de menzil ofseti her birini farklı bir anda açıyor, dalga gibi
   okunuyor. Clip-path DOĞRUDAN çerçeveye uygulanıyor (kenarlık dahil) —
   bant 3'ün kalın gri paspartası gibi ayrı bir katman yok, "kare kendi
   kutusundan doğuyor" okuması yeterli.
2. **Pencere parallax'ı** (`@keyframes portfolio-pan`,
   `.home-portfolio-track > figure .home-portfolio-frame > img`): img,
   track'in yatay kaymasına göre hafifçe ters yönde süzülüyor (klasik
   derinlik parallax'ı, tek katman). Figürün KENDİ `view()`'i DEĞİL, NAMED
   `--home-portfolio` timeline'ına bağlı — img'in kendi `view()`'i de
   pin'de donardı, oysa parallax'ın TÜM kayma boyunca sürmesi gerekiyor.
   Track zaten bu isme bağlı `home-portfolio-slide`'ı taşıyor; burada
   FARKLI bir eleman (img) kendi TEK animasyonuyla aynı ismi okuyor — §12'nin
   kısıtı yalnızca AYNI elemanda iki animasyonu yasaklıyor, ihlal edilmiyor.
   Ölçek `--pan-scale` (page.tsx'te satır içi) normal karelerde 1.08,
   Wellness'te 1.22 — `.home-portfolio-media--boost` zaten büyütüyor,
   parallax'ın kendisi onun üstüne biniyor, img'i çerçeveden taşıracak
   kadar büyütüyor ki kayma sırasında kenar boşluğu hiç görünmesin.

Mobil (`≤860px`) ve reduced-motion'da her iki efekt de KURULMUYOR
(`@media (min-width: 861px)` gated blokta) — taban grid değişmedi, yalnızca
`.home-portfolio-media--boost` (ungated) orada da geçerli.

#### Eylül 2026, ikinci geçiş: Wellness masaüstü rayda tamamen gizli

Yukarıdaki düzeltmeye (5. sıraya taşıma + boost + efektler) rağmen canlı
testte Wellness Antalya hâlâ diğer kareler kadar dolgun görünmüyordu.
Teşhis: sorun konum ya da kırpma değil, GÖRSELİN KENDİSİ — kırtasiye takımı
beyaz kâğıt ve açık gri zeminde, ince/düşük kontrastlı nesneler; kenardan
kenara doygun kampanya afişlerinin yanında CSS ile (daha fazla yakınlaştırma
kartvizitleri keser, daha fazla renk düzeltmesi müşteri işini değiştirir)
gerçekten eşit yoğunluğa getirilemiyor.

**Karar: rayda gizlemek, veriden SİLMEMEK.** `PORTFOLIO_ITEMS`'tan tamamen
çıkarmak mobil ızgarayı (2 sütun, Wellness tam satır) ve taban 3×3 ızgarayı
(9 hücre) da 7 işe göre yeniden kurmayı gerektirirdi — ikisinde de mobilde
bu kare zaten SORUNSUZ (kullanıcı doğruladı), yalnızca masaüstü YATAY RAYDA
zayıf duruyordu. Bu yüzden:

- `.home-portfolio-item--wide { display: none; }` yalnızca gated blokta
  (`≥861px`, hareket açık) — `.home-portfolio-item--wide`'ın eski çift-
  genişlik kuralı (grid-column/inline-size/flex-basis) kalktı, yerini bu
  tek satır aldı.
- `page.tsx`: `--home-portfolio-units` artık `PORTFOLIO_ITEMS.filter(item
  => !item.wide).length` (7) — geniş işi SAYMIYOR, ray tam 7 kareyle akıp
  son karede (`Zenges Enerji`) tam gutter hizasında duruyor (ölçüldü, ekran
  görüntüsüyle doğrulandı: `home-portfolio-slide`'ın hedef `translate3d`'i
  7 birime göre hesaplandığı için taşma/eksik kalma yok).
- Taban ızgara (mobil + reduced-motion) **8 işle aynen kalıyor** —
  `PORTFOLIO_ITEMS`e dokunulmadı, yalnızca CSS'te bir görünürlük kuralı
  eklendi. `.home-portfolio-media--boost` orada geçerli olmaya devam
  ediyor (doğrulandı: reduced-motion ve 390px'te 8 kare görünür).
- **Bedel:** `.home-portfolio-head__lede`'nin metni ("Farklı sektörlerden
  seçilmiş **sekiz** iş…") rayda görünen 7 kareyle artık birebir
  eşleşmiyor. Metne dokunmama kısıtı gereği bilerek DEĞİŞTİRİLMEDİ —
  cümle sekiz işin TAMAMINI (taban ızgarada + vaka çalışmalarında) anlatan
  bir toplam beyanı, tek bir bandın anlık görünümünü sayan bir sayaç değil.

### Aynı marka + kategori iki kez: künyedeki `event` alanı

Rixos Premium Bodrum'un iki ayrı etkinlik kampanyası (Chelsea / Orange Fest ve
Ozan Doğulu / White Party) ray'de yan yana akıyor ve künye yalnızca
`brand` + `category` bastığı için **iki özdeş etiket** okunuyordu — iş
yanlışlıkla kopyalanmış gibi görünüyordu. Veride hata yoktu; **künyede bilgi
eksikti**.

`PortfolioItem`'a opsiyonel `event` alanı eklendi ve ikinci satır
`KATEGORİ · ETKİNLİK` olarak basılıyor. Yalnızca aynı `brand` + `category`
çifti dizide tekrar ettiğinde dolduruluyor; diğer altı işin künyesi değişmedi.
**`category`nin içine yazılmadı** çünkü o alan brief §7'nin fasetidir ve
`/portfolyo` kurulduğunda filtre ondan türeyecek — etkinlik adı faseti
kirletirdi. Künye tek satır kaldığı için üçüncü bir tipografik katman da
açılmıyor; `--portfolio-strip-h`in künye payı yine de 4.5rem'den 5.75rem'e
çıkarıldı, çünkü pencerede `overflow: clip` var ve dar bir karede sarma
sessizce kesilirdi.

### Türkçe `text-transform: uppercase` tuzağı

`.eyebrow` metni büyütüyor ve `<html lang="tr">` altında tarayıcı **Türkçe**
büyütme kuralını uyguluyor: her "i" → "İ". Türkçe sözcüklerde doğru
("kimlik" → "KİMLİK") ama yabancı özel adlarda değil — "Rixos Premium" →
"RİXOS PREMİUM", "Business" → "BUSİNESS", "Direct" → "DİRECT", "City" →
"CİTY". Bu yüzden `content/portfolio.ts`'teki `brand`/`category` ve
`content/partners.ts`'teki `label` alanları **doğrudan büyük harfle** yazılıyor;
metin zaten büyükse dönüşümün değiştireceği bir şey kalmıyor. Doğal yazım
`alt` metinlerinde duruyor. `portfolio.ts`'in `event` alanı da aynı kurala
tabi ("WHITE PARTY", "ORANGE FEST").

### İçerik `app/content/portfolio.ts` ve `partners.ts`'e çıkarıldı

`services.ts` / `contact.ts` deseni: `/portfolyo` sayfası kurulduğunda aynı
diziyi okuyacak (kategori filtresi `category`den türer — bu yüzden ayırt edici
etkinlik adı `category`ye değil ayrı bir `event` alanına yazılıyor, yukarı
bakın), liste iki yerde tutulmaz. Kısa tanıtım metni ise sayfa-yerel bir `const` — tek tüketicisi var
(`CHAPTERS`'ın `hakkimda/page.tsx`'te durmasıyla aynı gerekçe). O metin brief
§7'nin korunacak iki vurgusunu taşıyor: "20 yıla yakın tecrübe" (§7 eski
sitedeki "tec**br**übeyle" hatasının düzeltilmesini istiyor) ve "Dijitalde Fark
Yaratın".

Anasayfada `metadata` tanımlanmadı: `layout.tsx`'in kök `title`/`description`'ı
zaten "/" için yazılmış, burada tekrarlamak ikinci bir kaynak olurdu.

---

## Kapsam dışı

Bu doküman ve `app/globals.css` yalnızca tasarım sistemini kurar. Sayfa
içerikleri (hero dışındaki bölümler), GSAP/dense-GOP re-encode ve
`next.config.ts` yönlendirmeleri ayrı işler olarak ele alınacak.
