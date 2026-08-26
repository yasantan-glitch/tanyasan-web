# Hero — 8 fazlı scroll deneyimi

`app/components/hero/` altındaki hero, tek anlatılı bir scroll-scrub
sahnesi değil; sekans hâlinde geçen **8 fazlı** bir deneyimdir: `intro`
(slogan) → 6 hizmet fazı (`grafik`, `dijital`, `web`, `yazilim`, `foto`,
`danismanlik`) → `resolve` (outro: logo netleşir, slogan geri döner,
CTA'lar). Rasyonel için `docs/design-system.md` §8'e bakın.

## Tek kaynak: `heroPhases.ts`

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

## Plato mekanizması (%43) — hızlı scroll'a karşı tek koruma

Her hizmet fazının içinde, tüm öğeler (ikon, ayraç, başlık, kalemler) tam
göründükten sonra **faz süresinin ~%43'ü** boyunca hiçbir şey değişmeden
kalır (`q ≈ 0.445 → 0.871`, yerel faz ilerlemesi `q ∈ [0,1]` üzerinde).

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
hizmet listesi render eder — video yerine `hero-poster.jpg` + hairline
ayraçlı satırlar. İçerik iki yerde kopyalanmıyor; `heroPhases.ts`'e
eklenen bir hizmet fazı otomatik olarak hem scrub dalında hem bu statik
listede görünür.

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
