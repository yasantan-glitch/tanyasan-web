# Hero — 8 fazlı scroll deneyimi

`app/components/hero/` altındaki hero, tek anlatılı bir scroll-scrub
sahnesi değil; sekans hâlinde geçen **8 fazlı** bir deneyimdir: `intro`
(ekrana hakim tipografik statement) → 6 hizmet fazı (`grafik`, `dijital`,
`web`, `yazilim`, `foto`, `danismanlik`) → `resolve` (kapanış: zemin koyudan
beyaza döner, sayfanın 2/3 hattındaki dikey rayı bir nokta çizerek iner,
slogan satırları raydan sola / CTA'lar aynı raydan sağa çıkar, sağda nokta
bulutundan bir küre nefes alır).

**Faz 8'in hiç medyası yoktur** — sahne tamamen kod tabanlı (CSS + SVG).
Eski monitör fotoğrafı, 3D yerleşme koreografisi ve `mix-blend-mode: multiply`
kompozisyonu kaldırıldı; bir kapanış görseli geri getirmek istenirse bu bir
tasarım kararıdır, mevcut sahnenin eksiği değil.
Rasyonel için `docs/design-system.md` §8'e bakın.

Faz 1 → faz 2 sınırında crossfade yok: `handoff` eğrisi faz 1'in çıkışıyla
faz 2'nin girişini tek bir devam eden harekete bağlar ve faz 2'nin içerik
zaman çizgisi `leadingPhaseProgress()` ile o kadar erkene alınır. Bu yalnızca
ilk hizmet fazına uygulanır; diğer sınırlar standart faz zarfını kullanır.
Faz 1'in metni blok hâlinde sönmez: kelimeler deterministik bir hash'ten
(`hash01`, `scatterOf`) türeyen yön/hız/gecikmelerle dağılır — `Math.random`
kullanılmaz, aynı sayfa her yüklemede aynı dağılmalıdır.

**Giriş animasyonu ile scroll sürüşü aynı elementte olamaz.** CSS
animasyonunun çıktısı kaskadda inline stilin üstündedir ve `.hero-intro-rise`
`fill-mode: both` ile son karesini kalıcı tutar; motorun yazdığı
`style.opacity`/`style.transform` o elementte etkisiz kalır. Giriş
sarmalayıcıya, scroll içteki elemente verilir (statement: satır span'ı /
kelime span'ı; alt başlık: `.hero-intro-sub` div'i / içteki `<p>`).
Doğrularken `element.style` değil `getComputedStyle` okuyun.

**Video yalnızca fazlar 2-7'dedir.** Faz 8'in medyası yoktur; motorda
resolve'a ait video katmanı da yoktur. `VIDEO_PRELOAD_RADIUS` yalnızca hizmet
kliplerini ilgilendirir.

**Faz 8'in ölçüleri frame içinde okunmaz.** Noktanın durma yüksekliği CTA
kutusunun `offsetTop`'undan, rayın tepesi sahne yüksekliğinin %8'inden
`layout()` sırasında (mount + resize) hesaplanır. `getBoundingClientRect`
kullanılmaz — rect transform'u içerir ve CTA'nın çocukları her frame
kaydırılır. Aynı nedenle `.hero-outro-cta` sarmalayıcısına **transform
yazılmaz**; kaydırma butonların kendisindedir.

**Yaylanma yalnızca konuma uygulanır.** `springOut()` hedefi aşıp geri
salınır; opaklığa uygulansaydı görünür bir titreme olurdu — opaklık her yerde
monotonik `smooth` ile sürülür.

**Kürenin geometrisi VE nefes dilimleri deterministiktir**
(`outroOrb.ts`, Fibonacci kafesi + `hash01`): `Math.random` yok, modül
seviyesinde bir kez hesaplanır. Burada bu bir stil tercihi değil zorunluluk —
değerler SSR HTML'ine attribute olarak yazılır, sunucu ile istemci aynı
diziyi üretmezse hydration patlar.

**Küre gerçekçi olmalı, düzensiz değil** (Eylül 2026 kullanıcı kararı; eski
280 noktalı düzensiz bulut kaldırıldı). 680 nokta; boyut ve opaklık yalnızca
derinlikten ve bir Lambert ışığından gelir, hash payı ±%6. Boyut jitter'ı ya
da dış hattı bozan bir alan geri eklenmemeli. **Nefes per-nokta değil dilim
seviyesindedir:** noktalar boylama göre 10 `<g>`'ye ayrılır, her dilim
`hero-orb-wave` ile viewBox merkezinden `scale(1.035)`'e çıkar, gecikmeler
dilim sırasına göre kayar ve dalga kürenin etrafında dolaşır. Hareket
CSS'tedir (rAF değil); `will-change` verilmez. Gerekçe için
`docs/design-system.md` §8.

## Tek kaynak: `heroPhases.ts`

> **İçerik bir katman aşağıda.** Hizmet fazlarının ikon/başlık/kalemleri
> `app/content/services.ts`'te (`SERVICES`) durur; `/hizmetler` sayfası da aynı
> diziyi okur. `heroPhases.ts` onu map'ler ve yalnızca faz sırasını, scroll
> bütçesi payını (`SERVICE_WEIGHTS`) ve klipleri (`SERVICE_VIDEOS`) tutar —
> aşağıdaki her şey geçerli, "içerik" dendiğinde kaynak `services.ts`'tir.

Faz sırası, ağırlığı ve içeriği (`title`, `items`, `icon`) yalnızca
`app/components/hero/heroPhases.ts`'te tanımlıdır. `useHeroScroll.ts`
veya `Hero.tsx` içinde faz sınırı için elle yazılmış sabit **yoktur**.

- Her fazın bir `weight` değeri var; `PHASE_RANGES` bu ağırlıklardan
  **hesaplanan** `[start, end]` aralıklarıdır (normalize scroll ilerlemesi
  `p ∈ [0,1]` üzerinde).
- **Yeni faz eklemek / süre değiştirmek istediğinizde tek yapmanız gereken
  `heroPhases.ts`'teki ağırlığı değiştirmek** — tüm zamanlama (`PHASE_RANGES`,
  dolayısıyla `useHeroScroll`'un okuduğu her şey) kendiliğinden yeniden
  dağılır. `read()` içinde veya CSS'te elle senkronize edilecek ikinci bir
  yer yoktur.
- `HERO_PHASES` dizisindeki sıra = ekrandaki sıra. Aradan yeni bir hizmet
  fazı eklemek istiyorsanız diziye yeni bir `HeroServicePhase` girdisi
  eklemeniz yeterli; `SERVICE_PHASES`, `PHASE_RANGES`, `HERO_PHASE_COUNT`
  otomatik güncellenir.

## `useHeroScroll.ts` mimarisi

- **React state kullanmıyor.** Scroll her tetiklendiğinde React re-render
  tetiklenmez; `read()` fonksiyonu doğrudan ref'lenmiş DOM node'larına
  `style.opacity` / `style.transform` yazar. Bu, 8 faz × ~9 öğelik bir
  sahnenin 60fps'te kalabilmesinin sebebidir.
- **Video playhead lerp'lidir.** Hedef ilerleme (`playhead.target`) scroll'dan
  doğrudan gelir, ama gerçek video `currentTime` (`playhead.cur`) her
  `requestAnimationFrame`'de `target`'a `× 0.18` katsayıyla yaklaşır —
  ani scroll'da video seek'i pürüzsüzleşir. Mobilde deadband daha geniştir
  (`0.02` vs `0.008`) çünkü mobil seek daha pahalı/gecikmeli.
- **Yalnızca aktif faz güncellenir.** Her `read()` çağrısında hangi fazın
  aralığında olunduğu bulunur (`PHASE_RANGES` taraması); yalnızca o fazın
  ikon/ayraç/başlık/kalem node'larına stil yazılır. Diğer fazlar bir kez
  `opacity: 0`'a set edilip (`zeroed[]` bayrağıyla) bir daha dokunulmaz —
  aksi hâlde her frame'de görünmeyen ~60-70 node'a boşuna yazım yapılırdı.
  **Yeni bir faz öğesi eklerken bu deseni bozmayın**: öğe render için
  DOM'da her zaman dursun (React state ile mount/unmount etmeyin), yalnızca
  `read()` içinde opaklığını sürün.

## Plato mekanizması ve içerik gecikmesi — hızlı scroll'a karşı tek koruma

Her hizmet fazının içinde, tüm öğeler (ikon, ayraç, başlık, kalemler) tam
göründükten sonra bir süre hiçbir şey değişmeden kalır (`q ≈ 0.466 → ~0.98`,
yerel faz ilerlemesi `q ∈ [0,1]` üzerinde). 1440×900'de bu GRAFİK için
~90vh, en kısa fazlar için ~60vh (ölçüldü — Eylül 2026'nın İKİNCİ geçişinden
sonra, aşağıya bakın).

**İçerik (ikon/başlık/kalemler) fazın kendisinden GEÇ başlıyor** — Eylül
2026'nın ikinci geçişi, canlı test geri bildirimi: metin ~1.5s/~30vh daha
geç görünsün. `ICON_WINDOW`/`RULE_WINDOW`/`TITLE_WINDOW`/`ITEMS_FROM`/
`ITEMS_TO` `new = (old + 0.236) / 1.236` affine formülüyle yeniden
hesaplandı (türetim `docs/design-system.md` §8). **`PHASE_ENVELOPE`'A
DOKUNULMADI** — kökün kendi fade-in'i hâlâ erken (q=0.06): dokunulsaydı
faz 1→2 devrinde (`leadingPhaseProgress`) kök uzunca süre görünmez kalır,
video oynarken boş bir çerçeve asılı dururdu. Yeni bir içerik penceresi
eklerken bu ayrımı koruyun: KÖK erken görünsün, İÇERİK geç gelsin.

**Hizmet fazlarının uzunluğu iki yerde birlikte ayarlanır:**
`heroPhases.ts`'teki `SERVICE_WEIGHTS` ve `globals.css`'teki `--hero-travel`.
Ağırlıklar oransal: yalnızca hizmet ağırlığını büyütmek intro ile kapanışı
kısaltır. Ağırlık başına yolu (~95.5vh) sabit tutmak için bütçe de aynı
oranda büyütülür — **bu iki dosya HER ZAMAN birlikte değişir.** Faz
sınırını aşan köprüler (`HANDOFF_SPAN`, `SCATTER_*`, `INDICATOR_PAD`)
`useHeroScroll.ts`'te **ağırlık birimi** (`WEIGHT_UNIT =
1 / HERO_WEIGHT_TOTAL`) cinsinden yazılı; ham p sabiti eklemeyin, toplam
değişince sessizce kısalır. Video playhead'i (`VIDEO_FADE`,
`driveVideoLayer`) bu ağırlık/pencere değişikliklerinin HİÇBİRİNDEN
etkilenmez — hep fazın tam yerel `q ∈ [0,1]`'ini kendi süresine eşler.

Bu **bilinçli bir tasarım kararı**: scroll-snap veya benzeri bir "durdurma"
mekanizması **kullanılmıyor** — kullanıcı hızlı scroll yaparsa fazı hızlı
geçebilir, ama en azından bir faz görüş alanındayken donuk durduğu süre
(plato) yeterince uzun olduğu için tamamen okunmadan kaybolmuyor. Plato
uzunluğunu `useHeroScroll.ts`'teki `ITEMS_TO` sabiti belirliyor (kalemlerin
ne kadar erken tamamlandığı) — bu değeri geciktirmek platoyu kısaltır.

## Reduced-motion dalı (`HeroReduced`)

`prefers-reduced-motion: reduce` olduğunda `useHeroScroll` hiç mount
edilmez (video/scrub/rAF döngüsü çalışmaz). Bunun yerine `HeroReduced`,
**aynı `heroPhases.ts` verisinden** (`SERVICE_PHASES`) beslenen statik bir
hizmet listesi render eder — video yerine `.hero-bg-static`'in düz koyu
radial-gradient zemini (interaktif daldakiyle aynı) + hairline ayraçlı
satırlar, en altta da faz 8'in kapanışı (slogan + CTA) kendi **açık**
yüzeyinde. Ray, nokta ve küre bu dalda hiç render edilmez: üçü de yalnızca
hareketten ibarettir, durağan hâlde anlam taşımazlar. İçerik
iki yerde kopyalanmıyor; `heroPhases.ts`'e eklenen bir hizmet fazı otomatik
olarak hem scrub dalında hem bu statik listede görünür.

## Mobil

Ayrı bir mobil bileşen/dal yok. Aynı 8 faz, **sıkıştırılmış bütçeyle**
çalışır: `≤860px`'te `--hero-travel` küçülür (bkz. `globals.css`), faz
başlığı/kalem tipografisi bir kademe küçük tokene düşer. `useHeroScroll`
içindeki `isMobile()` eşiği (860px) bu CSS breakpoint'iyle aynı tutulmalı.

## Bağımlılıklar

`lucide-react`, 8 fazlı hizmet ikonları için bu işte eklendi (`Palette`,
`Megaphone`, `Globe`, `CodeXml`, `Camera`, `GraduationCap`). Not:
`docs/design-system.md`'de daha önce "yeni npm bağımlılığı yok" notu vardı
— artık geçersiz, güncellendi. Yeni bir hero özelliği için başka bir
paket eklemeden önce mevcut motoru (CSS + `useHeroScroll`) genişletmenin
yeterli olup olmadığını değerlendirin; proje bilinçli olarak
framer-motion/GSAP kullanmıyor.

# Nav — `SiteHeader` + `MobileDrawer`

`app/components/nav/` altında, `app/layout.tsx`'e (`SkipLink` + `SiteHeader`
+ `<main id="icerik">`) mount edilmiş, **tüm sayfalarda ortak** bir nav
kurulumu var:

- **`SiteHeader.tsx`** — `position: fixed` header. Masaüstü linkler +
  logo + CTA'yı render eder, mobilde hamburger'ı gösterir.
- **`MobileDrawer.tsx`** — sağdan kayan panel; `SiteHeader`'ın state'ini
  (`open`/`onClose`/hamburger'ın ref'i) prop olarak alır.
- **`navLinks.ts`** — link listesinin (`NAV_LINKS`) ve CTA'nın (`NAV_CTA`)
  **tek kaynağı**. Masaüstü menü ve mobil drawer aynı diziyi okur; link
  listesi iki yerde kopyalanmaz. `isActive()` prefix eşleşmesiyle alt
  rotaları da üst linkte aktif işaretler.
- **`useScrolledPastSentinel.ts`** — şeffaf → solid geçiş tetiği.
- **`SkipLink.tsx`** — klavye kullanıcısının fixed header'ı atlayıp
  `#icerik`'e geçmesi için ilk durak.

## Şeffaf → solid geçiş mekanizması

`SiteHeader` anasayfada (`pathname === "/"`) hero'nun ilk ekranı boyunca
şeffaf başlar, `--nav-solid-after` (`100svh`, ≈ hero intro fazının bitişi)
kadar scroll edildiğinde koyu/blur'lu (`backdrop-filter: blur(10px)`)
zemine geçer.

- Bu geçiş **`IntersectionObserver`** ile tetiklenir, `window` scroll
  listener ile **değil**. Sebep: hero'nun kendi scroll motoru
  (`useHeroScroll`) zaten window'a passive bir scroll listener ve kalıcı
  bir `rAF` döngüsü bağlıyor; ikinci bir scroll listener eklemek yerine
  `.nav-sentinel` (anasayfada `SiteHeader` tarafından render edilen,
  `--nav-solid-after` yüksekliğinde akış-dışı bir kutu) gözlemleniyor.
  Sentinel viewport'un üstünden tamamen çıktığında (`isIntersecting ===
  false`) nav solid'e döner; geri scroll'da kendiliğinden şeffaflaşır.
  **Tek belgelenmiş istisna:** `app/components/ScrollDirection.tsx`
  (Eylül 2026, özel scroll imleci için — bkz. `docs/design-system.md` §7)
  gerçekten üçüncü bir `window` scroll listener'ı ekliyor. Bunun burada
  uyarılan maliyeti taşımamasının sebebi işin kendisi: `IntersectionObserver`
  kullanılamıyor (yön için art arda iki `scrollY` okuması gerekiyor, kesişim
  değil), ama dinleyici PASİF, rAF'la karede en çok bir kez çalışıyor ve
  DOM'a yalnızca yön DEĞİŞTİĞİNDE (`dataset.scrollDir`) yazıyor — hero'nun
  `tick()`'i gibi her karede iş yapan bir döngü değil. Yeni bir istisna
  eklemeden önce bu üçünü karşılaştırın: hero'nunki sürekli veri okuyup DOM
  yazıyor (zorunlu, per-frame scrub), nav'ınki hiç okumuyor (event tabanlı,
  gözlemci), ScrollDirection'ınki nadiren yazıyor (event tabanlı, eşiğe
  bağlı bayrak).
- **Hero'nun kendi scroll state'ine (`useHeroScroll.ts`) hiç dokunmaz** —
  eşik geçişinde yalnızca tek bir boolean state (`solid`) güncellenir, her
  frame'de iş yapılmaz.
- `/design-system` gibi **sentinel'i olmayan sayfalarda** (`enabled=false`,
  yani `isHome === false`) nav baştan solid görünür — `useScrolledPastSentinel`
  bu durumu `solid: !enabled || pastSentinel` ile türetir, gözlemci hiç
  kurulmaz.

## Katman ve konumlandırma

- Nav her zaman `position: fixed`, doküman akışını değiştirmez — hero'nun
  `layout()`'ta cache'lediği ölçümler bu yüzden geçersizleşmez.
  `.hero-stage`'in `overflow: clip`i header'ı içeriye koyarsa kırpardı,
  fixed olduğu için bu sorun oluşmuyor.
- Global z-index ölçeği `globals.css`'te: `--z-nav: 100`,
  `--z-drawer-overlay: 200`, `--z-drawer: 210`, `--z-skip-link: 300`.
  Hero kendi içinde z-index **kullanmıyor** (saf DOM sırası) — bu ölçek
  yalnızca hero sahnesinin üstünde duran global kabuk içindir.

## Logo davranışı

`.site-header-logo` her zaman görünür. Önceden şeffaf nav'da gizleniyordu
(hero üst-ortada kendi büyük logosunu çiziyordu, iki logo aynı anda ekranda
durmasın diye); hero'nun logo katmanı kaldırılıp faz 1 tipografik bir
statement'a dönüşünce logonun tek yeri nav oldu. Şeffaf durumda okunurluğu
`.site-header::before` scrim'i veriyor.

## Mobil drawer davranışı (`MobileDrawer.tsx`)

Panel sürekli DOM'da mount kalır, `data-open` attribute'uyla CSS'te
sürülür (transform + visibility) — açılış/kapanış için JS tarafında
zamanlayıcı veya `transitionend` beklenmez, `prefers-reduced-motion`
geçiş süresini `0.01ms`'ye indirdiğinde de bozulmaz.

- **Focus trap**: panel açıldığında ilk odaklanabilir öğeye focus gider,
  `Tab`/`Shift+Tab` panel içinde döngü yapar (ilk/son öğe arasında).
- **ESC ile kapanır.**
- **Scroll kilidi**: açıkken `document.documentElement.style.overflow =
  "hidden"`. `html`'de kalıcı `scrollbar-gutter: stable` olduğu için kilit
  anında sayfa genişliği değişmiyor — aksi halde hero'nun cache'lediği
  ölçümler tutarsızlaşırdı.
- **Kapanışta odak hamburger'a döner** (`returnFocusRef`).
- Kapalıyken panel `inert` — klavye ve ekran okuyucu erişimi kapanır.
- Rota değişince otomatik kapanır (`pathname` değişimini izleyen efekt) —
  link tıklamasının yakalanmadığı durumlar (klavye aktivasyonu, prefetch'li
  geçiş) için güvence.
- `min-width: 861px`'e genişleyince açık drawer otomatik kapanır.

## Planda olmayan iki ek düzeltme

Nav eklenirken, mevcut hero ile çakışmayı önlemek için plan dışı iki
düzeltme de yapıldı:

1. **`.hero-logo-layer`'ın üst boşluğu nav yüksekliğine göre ayarlandı** —
   `top: var(--spacing-gutter)` yerine `top: calc(var(--nav-h) +
   var(--spacing-gutter))`. Nedeni: hero'nun kendi büyük logosu artık
   fixed header'ın altından başlamalı, aksi halde nav solid'e geçtiğinde
   iki logo üst üste binerdi. *(Sonradan geçersiz kaldı: hero'nun logo
   katmanı kaldırıldı, bkz. yukarıdaki Logo davranışı.)*
2. **Hero section'larına (`HeroInteractive` ve `HeroReduced`)
   `surface-ink` class'ı eklendi.** Nedeni: nav CTA'sı ile paylaşılan
   `.btn-ghost` sınıfı, hairline/focus/fg renklerini `surface-ink`'in
   tanımladığı CSS custom property'lerden okuyor; bu class olmadan
   hero içindeki ghost buton (ve focus halkası) yanlış (açık zemine göre
   ayarlanmış) tonu alıyordu.

## Nav linklerinin sayfaları

`navLinks.ts`'teki `/hizmetler`, `/portfolyo` (+ `/portfolyo/emlak-crm-pro`),
`/hakkimda` ve `/iletisim` kurulu; **yalnızca `/blog`** içerik bekliyor. Yeni
bir sayfa eklerken `navLinks.ts`'i güncellemeye gerek yok, adresler zaten
oradan geliyor; yapılması gereken yalnızca o route'ta bir sayfa oluşturmak.

# Portfolyo sayfaları — `/portfolyo`, `/portfolyo/emlak-crm-pro`

Gerekçe `docs/design-system.md` §13. Kısaca:

- **Yeni motor yok.** Mevcut kalıp (`.service-grid`/`.service-head`) ve
  substrat (`data-enter`, `data-enter-stagger`, `case-focus` anonim
  `view()` ile). Named view-timeline eklemeyin.
- **Metin `app/content/emlakCrmPro.ts`'te** (bant 3 metni dahil — anasayfa
  da oradan okuyor). Brief'te olmayan metin uydurulmaz: modül `body`'leri
  ve `CASE_STACK` bilinçli olarak boş; boş künye bölümü render edilmez.
- **`.home-portfolio-item--wide` bu sayfalarda kullanılmaz** — gated blok
  onu global `display: none`'a çekiyor (anasayfa rayı). `/portfolyo`'nun
  kendi `.portfolio-item--wide`i var.
- **Filtre client state'te, URL'de değil** (sayfa statik kalsın); sekiz iş
  SSR'da basılı, filtre yalnızca `hidden`ı çeviriyor.
- **emlakcrmpro.com yalnızca vaka sayfasının sonunda** (`CASE_EXTERNAL`,
  brief §5.2). Başka sayfa import etmemeli.
- `/grafik-tasarim` → `/portfolyo` 301 `next.config.ts`'te.

# İletişim formu — sitenin tek sunucu tarafı

`/iletisim` sitedeki tek **çalışan backend'i** taşıyor: `app/iletisim/
actions.ts` bir Server Action, Resend'in REST API'sine tek bir `fetch` POST'u
yapıyor (`resend` npm paketi bilinçli olarak eklenmedi). Üçüncü parti bir form
servisi yok.

- **`"use server"` dosyasından yalnızca async fonksiyon export edilebilir.**
  `ContactState` tipi ve `CONTACT_INITIAL_STATE` sabiti bu yüzden ayrı bir
  modülde (`app/iletisim/contactState.ts`); sabiti `actions.ts`'e taşımak
  derlemeyi kırar.
- **Form JS kapalıyken de çalışmalı.** `useActionState` + Server Action bunu
  veriyor; `ContactForm.tsx`'e `onSubmit`/`preventDefault` **eklenmemeli**,
  durum mesajı state'ten render edilmeli ve alanlar kontrolsüz kalmalı
  (hata hâlinde `defaultValue` sunucudan dönen `state.values`'tan gelir).
- **`Date.now()` render sırasında okunmaz** — hydration mismatch olurdu; spam
  zaman damgası `useEffect` içinde hidden input'a yazılıyor.
- **Env runtime'da okunuyor** (`RESEND_API_KEY`, `CONTACT_TO`,
  `CONTACT_FROM` — bkz. `.env.example`): anahtar yokken build kırılmaz,
  yalnızca gönderim başarısız olur ve kullanıcıya e-posta/telefon alternatifi
  gösterilir.
- İletişim bilgileri ve sosyal linkler `app/content/contact.ts` /
  `app/content/socialLinks.ts`'te — `services.ts` ile aynı desen. Sosyal dizi
  **şu an boş** (adresler brief'te yok); boş kaldığı sürece sayfa o bölümü hiç
  render etmiyor, yer tutucu link yazılmamalı.

Gerekçelerin tamamı için `docs/design-system.md` §11.

# Claude Code skill'leri — gerçek durum

**Bu projede fiilen yüklü ve devrede olan iki skill var** (`.claude/skills/`,
`skills-lock.json` ile kayıtlı):

- **design-dna** — referans tasarımdan token/stil/efekt çıkarımı ve
  `scripts/measure-colors.mjs` / `verify.mjs` ile deterministik renk ölçümü
  (`sharp` bağımlılığı `scripts/node_modules`'a kurulu; Node ≥18.17).
  Kullanım izi: `docs/design-system.md` §12 diyafram gerekçesi bu ölçüme
  dayanır. Ölçüm JSON'ları repoya alınmaz, gerekince yeniden üretilir.
- **web-design-guidelines** (Vercel) — verilen dosyaları
  `vercel-labs/web-interface-guidelines`'a göre inceleyen salt-review
  skill'i; tasarım görüşü dayatmaz. Sevkiyat öncesi a11y/UX taraması için.

**Plugin yok.** `.claude/settings.json` boş; `nateherk-design@nateherk`
girdisi kaldırıldı — plugin hiçbir zaman kurulu değildi (marketplace kayıtlı
değildi), girdi hiçbir şey yapmıyordu. `design-system.md` §8'deki
"scrollcraft tekniklerinin portu" ifadesi tarihsel gerekçedir ve geçerli
kalır: motor alınmadı, teknikler alındı.

**Paylaşımlı kütüphane, oturuma YÜKLENMEZ.**
`CLAUDE-PROJELER/.claude/skills/` (ayrı repo: `yasantan-glitch/tan-claude-skills`)
22 skill barındırır — scroll-craft, taste-skill, frontend-design,
ui-ux-pro-max, design-system, ui-styling ve SEO/pazarlama seti. Proje kökünün
üstünde durduğu için Claude Code bunları bu projede otomatik yüklemez; bir
skill'in burada devreye girmesi için `.claude/skills/` altına kopyalanması
gerekir. Değerlendirme (22 Eyl 2026):

- **scroll-craft, taste-skill (§9 "AI tells", §14 pre-flight),
  ui-ux-pro-max (`references/quick-reference.md`)** — ad hoc review lensi
  olarak paylaşımlı klasörden okunabilir; sürekli aktif edilmez (ağır ve yer
  yer `design-system.md` ile çelişir).
- **design-system, ui-styling (claudekit)** — token yeniden yapılandırma /
  shadcn reçeteleri; projenin Tailwind v4 `@theme` + `.surface-*` şeması ve
  "shadcn yok" tercihiyle çelişir. Eklenmez.
- **landing-conventions** — başka bir repo'nun (`real-estate-crm-landing`)
  kuralları. Buraya asla kopyalanmaz.
- **frontend-design** — genel tasarım yönü rehberi; yön belirlenmiş bu
  projede marjinal. İstenirse user scope'ta açılır, proje işi değildir.

Çelişki kuralı değişmedi: herhangi bir skill'in önerisi projenin
`docs/design-system.md` ve `services.ts` gibi tek-kaynak kararlarıyla
çelişirse proje dokümantasyonu esas alınır.
