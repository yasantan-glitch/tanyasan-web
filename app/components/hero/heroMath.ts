/**
 * Sitenin paylaşılan hareket matematiği.
 *
 * Başlangıçta yalnızca deterministik gürültüyü tutuyordu; hero'nun eğrileri
 * `useHeroScroll.ts` içinde modül-private duruyordu. Hero dışındaki bölümler de
 * hareket kazanınca bunlar buraya alındı: amaç sitenin tek bir hareket dili
 * konuşması. Kopyalanmış bir easing, iki yerde farklı ayarlanma riski taşır ve
 * zamanla iki ayrı "his" doğurur.
 *
 * Buraya YALNIZCA saf fonksiyonlar girer — DOM'a, `PHASE_RANGES`'e veya hero'ya
 * özgü sabitlere bağlı olanlar (`phaseProgress`, `scatterOf`, …) motorun kendi
 * dosyasında kalır.
 */

/**
 * Deterministik 0..1 gürültü. Math.random DEĞİL: hem kelimelerin savrulma
 * yönü/hızı hem kürenin nokta dokusu her yüklemede AYNI olmalı — aksi halde
 * aynı sayfa her ziyarette başka türlü davranır ve hareket tasarlanmış değil
 * kazara görünür. Küre için ayrıca zorunlu: değerler SSR HTML'ine inline
 * yazıldığı için sunucu ve istemci birebir aynı diziyi üretmek zorunda.
 *
 * sin tabanlı bu hash klasik GLSL ideomu; girdi tamsayı olduğu sürece
 * platformlar arası da kararlı.
 */
export function hash01(n: number) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

// ---- eğriler (scrollcraft'ın read() mantığının portu) ---------------------

export function clamp(x: number, a: number, b: number) {
  return x < a ? a : x > b ? b : x;
}

export function clamp01(x: number) {
  return clamp(x, 0, 1);
}

/** Smoothstep. Sitenin varsayılan eğrisi — uçlarda türevi sıfır olduğu için
 * bir hareket ne başlarken ne biterken kesik görünür. */
export function smooth(x: number) {
  x = clamp01(x);
  return x * x * (3 - 2 * x);
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Girişte yumuşak geçiş, ortada plato, çıkışta yumuşak geçiş. */
export function cue(p: number, from: number, to: number, rIn = 0.3, rOut = 0.3) {
  const win = Math.max(to - from, 0.0001);
  const inEnd = from + win * rIn;
  const outStart = to - win * rOut;
  if (p < from) return 0;
  if (p < inEnd) return smooth((p - from) / Math.max(inEnd - from, 0.0001));
  if (p <= outStart) return 1;
  return smooth(1 - (p - outStart) / Math.max(to - outStart, 0.0001));
}

/** Kalemlerin/kelimelerin sırayla (staggered) belirmesi için — motorun kinetic
 * metin stagger'ıyla aynı formül. Hizmet kalemlerinde ve faz 8'in kapanış
 * sloganında aynısı kullanılıyor ki iki hareket aynı ritmi paylaşsın. */
export function staggerDraw(
  linear: number,
  index: number,
  total: number,
  spread = 0.62
) {
  const uStart = (index / Math.max(total, 1)) * spread;
  return smooth(clamp01((linear - uStart) / (1 - spread + 0.0001)));
}

/**
 * Yaylanmalı yerleşme (sönümlü kosinüs). Hedefe varmadan önce bir miktar
 * aşıp geri salınır — kapanış sahnesinde satırlar ve butonlar sert durmasın
 * diye. YALNIZCA KONUMA uygulanır: opaklığa uygulansaydı overshoot 1'i aşıp
 * geri döndüğü için gözle görülür bir titreme olurdu (opaklık monotonik
 * `smooth` ile sürülüyor).
 *
 * t=0'da tam 0. t=1'de artık ~0.005 kalıyor (e^-5.2·cos 6.6); bu, en büyük
 * mesafede bile pikselin altında — yine de uçta sert olarak 1'e kilitleniyor
 * ki scroll geri geldiğinde tam kapanan bir eğri olsun.
 */
export function springOut(t: number) {
  t = clamp01(t);
  if (t >= 1) return 1;
  return 1 - Math.exp(-5.2 * t) * Math.cos(6.6 * t);
}
