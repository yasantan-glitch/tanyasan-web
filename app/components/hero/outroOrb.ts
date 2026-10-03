import { hash01 } from "./heroMath";

/**
 * Faz 8'in parçacık küresi — geometri ve çizim (Canvas 2D).
 *
 * Referans: Auros'un "Particle Sphere Visual"ı — binlerce küçük noktadan
 * oluşan, dönen 3B bir küre; kenarlarında aksan rengini yakalıyor.
 *
 * HAREKET (Ekim 2026, ikinci tur — kullanıcı geri bildirimi): ilk sürümde
 * dağılma ekrana sabit bir alandı, küre o yanından HEP parçalanmış duruyordu.
 * İstenen: organik, canlı bir küre — "dağılıp hemen toplanan" bir dalgalanma.
 * Şimdi üç katman var:
 *
 * 1. DÖNÜŞ — 48 sn'de bir tur, hafif yalpa.
 * 2. YÜZEY DALGASI — sürekli, küçük genlikli radyal dalgalanma (birkaç
 *    sinüsün toplamı, küreyle birlikte döner). Küre hiç tam durmuyor ama
 *    silüeti hep küre: "nefes alan" organik yüzey.
 * 3. DAĞILMA NABZI — her ORB_PULSE_SECONDS'ta bir, kürenin bir yanından
 *    öbür yanına bir dalga geçiyor: değdiği parçacıklar hızla dışa açılıp
 *    (~0.5 sn) yumuşakça yerlerine toplanıyor (~1.7 sn). Nabızlar arasında
 *    küre BÜTÜN. Dalganın yönü her nabızda altın açı kadar dönüyor — aynı
 *    yerden tekrar etmiyor.
 *
 * DETERMİNİZM: Math.random yok, hash01. Küre her yüklemede aynı başlıyor.
 *
 * KOORDİNATLAR: birim küre. Ekran: x sağ, y AŞAĞI, z izleyiciye doğru.
 */

/** Parçacık sayısı. 2400'de küre seyrek okunuyordu; 4200'de yüzey sürekli
 * bir doku, noktalar yine seçilebiliyor. */
export const ORB_PARTICLES = 4200;

/** Küre yarıçapı, canvas kenarının oranı. Kalan pay nabızda açılan
 * parçacıkların alanı — 0.5'e yaklaşırsa kenarda kırpılır. */
export const ORB_RADIUS_RATIO = 0.33;

/** Bir tam tur (sn). Auros'ta dönüş ağır ve sinematik. */
export const ORB_TURN_SECONDS = 48;

/** Dönme ekseninin izleyiciye eğimi (radyan). */
const ORB_TILT = 0.38;

/** Yüzey dalgasının genliği (yarıçap oranı). Fazlası silüeti bozuyor,
 * azı fark edilmiyor. */
const WAVE_AMP = 0.035;

/** Dağılma nabzı: periyot, dalganın küreyi baştan sona geçme süresi,
 * açılma ve toplanma süreleri (sn). Açılma hızlı, toplanma yavaş — "patlama"
 * değil "nefes verip toplanma". */
export const ORB_PULSE_SECONDS = 6.5;
const PULSE_SWEEP = 1.4;
const PULSE_OUT = 0.5;
const PULSE_BACK = 1.7;
/** En uzağa açılan parçacığın ek mesafesi (yarıçap cinsinden). */
const PULSE_REACH = 0.42;

/** Parçacık kenarı (CSS px), derinliğe göre. Kare parçacık: Auros'taki
 * noktalar da küçük kareler — "veri" hissi oradan. */
const SIZE_BACK = 0.6;
const SIZE_FRONT = 1.6;

/** Opaklık seviyeleri. Parçacıklar kovalara düşüyor; kova başına tek
 * `fillStyle` → kare başına ~2×ALPHA_LEVELS durum değişimi. */
const ALPHA_LEVELS = 8;

export interface OrbParticles {
  /** Birim küre koordinatları, [x0,y0,z0, x1,y1,z1, …]. */
  pos: Float32Array;
  /** Parçacık başına sabit rastgelelik (0–1). */
  seed: Float32Array;
}

/**
 * DAĞILIM: hash'li düzgün rastgele — Fibonacci kafesi DEĞİL. Kusursuz eşit
 * aralık sarmal bir "örgü" gibi okunuyordu; Auros'un dokusu organik.
 */
export function buildOrbParticles(count: number = ORB_PARTICLES): OrbParticles {
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const y = 1 - 2 * hash01(i * 3 + 11);
    const ring = Math.sqrt(Math.max(1 - y * y, 0));
    const theta = Math.PI * 2 * hash01(i * 3 + 29);
    pos[i * 3] = Math.cos(theta) * ring;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = Math.sin(theta) * ring;
    seed[i] = hash01(i * 3 + 503);
  }
  return { pos, seed };
}

export interface OrbPalette {
  /** Gövde parçacıkları (açık zeminde mürekkep). */
  body: string;
  /** Kenar ışığı ve nabızda açılan parçacıklar — logo amberi (Auros'taki
   * lavanta-pembenin rolü). */
  accent: string;
}

const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOutSine = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2;

/** Nabız zarfı: 0 → 1 (hızlı açılma) → 0 (yumuşak toplanma). `u` sn,
 * parçacığın kendi dalga anından itibaren. */
function pulseEnvelope(u: number) {
  if (u <= 0 || u >= PULSE_OUT + PULSE_BACK) return 0;
  if (u < PULSE_OUT) return easeOutCubic(u / PULSE_OUT);
  return 1 - easeInOutSine((u - PULSE_OUT) / PULSE_BACK);
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

type Buckets = { xs: Float32Array; ys: Float32Array; ss: Float32Array; n: number }[];
let bucketCache: { size: number; buckets: Buckets } | null = null;

function getBuckets(count: number): Buckets {
  if (bucketCache && bucketCache.size === count) return bucketCache.buckets;
  const buckets: Buckets = Array.from({ length: ALPHA_LEVELS * 2 }, () => ({
    xs: new Float32Array(count),
    ys: new Float32Array(count),
    ss: new Float32Array(count),
    n: 0,
  }));
  bucketCache = { size: count, buckets };
  return buckets;
}

/**
 * Tek kare. `t` saniye. `size` canvas'ın CSS px kenarı (bağlam dpr ile
 * ölçeklenmiş olmalı).
 */
export function drawOrb(
  ctx: CanvasRenderingContext2D,
  particles: OrbParticles,
  t: number,
  size: number,
  palette: OrbPalette,
) {
  const { pos, seed } = particles;
  const count = seed.length;
  const half = size / 2;
  const R = size * ORB_RADIUS_RATIO;

  ctx.clearRect(0, 0, size, size);

  const yaw = (t / ORB_TURN_SECONDS) * Math.PI * 2;
  const tilt = ORB_TILT + Math.sin(t * ((Math.PI * 2) / 31)) * 0.05;
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);

  // Bu karenin nabzı: hangi döngüdeyiz, döngünün neresindeyiz, dalga
  // hangi yönden geliyor. İlk nabız 1.2 sn sonra — küre önce bütün görünsün.
  const pt = t - 1.2;
  const cycle = Math.floor(pt / ORB_PULSE_SECONDS);
  const local = pt - cycle * ORB_PULSE_SECONDS;
  const ang = cycle * GOLDEN_ANGLE + 0.6;
  // Ekran düzleminde bir yön + hafif derinlik; birim vektör.
  const pdx = Math.cos(ang) * 0.92;
  const pdy = Math.sin(ang) * 0.92;
  const pdz = 0.39;

  const buckets = getBuckets(count);
  for (const b of buckets) b.n = 0;

  for (let i = 0; i < count; i++) {
    const px = pos[i * 3];
    const py = pos[i * 3 + 1];
    const pz = pos[i * 3 + 2];
    const s = seed[i];

    // 2) Yüzey dalgası — nesne koordinatlarında, yani küreyle birlikte
    // döner. Üç düşük frekanslı sinüs: tekrar eden bir desen değil, yavaşça
    // kayan tepeler ve çukurlar.
    const wave =
      WAVE_AMP *
      (Math.sin(px * 3.1 + t * 0.9) * Math.sin(py * 2.6 - t * 0.7 + pz * 1.9) +
        0.6 * Math.sin(pz * 4.3 + py * 1.7 + t * 1.3));
    const k = 1 + wave;

    // 1) Dönüş: yaw (Y ekseni), sonra eğim (X ekseni).
    const x1 = px * cy + pz * sy;
    const z1 = -px * sy + pz * cy;
    const y2 = py * ct - z1 * st;
    const z2 = py * st + z1 * ct;
    const x2 = x1;

    // 3) Nabız: dalga yön boyunca −1 → +1 ilerliyor; parçacığın sırası
    // yöndeki izdüşümünden. Seed'den küçük bir gecikme payı cepheyi
    // dalgalı yapıyor (düz bir çizgi değil).
    const along = (x2 * pdx + y2 * pdy + z2 * pdz + 1) / 2; // 0..1
    const arrive = along * PULSE_SWEEP + s * 0.25;
    const env = pulseEnvelope(local - arrive);
    // Her parçacık aynı mesafeye gitmiyor: çoğu biraz, azı çok — saçak.
    const reach = PULSE_REACH * Math.pow(hash(s), 2.2);
    const push = env * reach;
    // Hafif sürüklenme dalga yönünde: parçacıklar yalnızca şişmiyor, akıyor.
    const r = k + push;
    const sx = x2 * r + pdx * push * 0.3;
    const syy = y2 * r + pdy * push * 0.3;
    const sz = z2 * r;

    const depth = Math.min(Math.max((sz + 1) / 2, 0), 1);
    const rim = Math.pow(1 - Math.abs(z2), 3);
    const lift = Math.min(push / 0.15, 1); // ne kadar açıldı (0..1)

    let alpha = (0.1 + 0.9 * Math.pow(depth, 1.3)) * (1 - 0.3 * lift) * (0.85 + 0.15 * s);
    alpha = Math.max(alpha, rim * 0.35);

    // Renk: kenar ışığı ya da nabızda belirgin açılmış parçacık amber.
    const accentScore = rim * 0.9 + lift * 0.75;
    const isAccent = accentScore > 0.55 + s * 0.35 ? 1 : 0;
    // Amber beyaz zeminde mürekkepten çok açık; taban opaklık olmadan
    // kayboluyor.
    if (isAccent) alpha = Math.max(alpha, 0.55 + 0.35 * depth);

    const level = Math.min(Math.floor(alpha * ALPHA_LEVELS), ALPHA_LEVELS - 1);
    const b = buckets[isAccent * ALPHA_LEVELS + level];
    const side = SIZE_BACK + (SIZE_FRONT - SIZE_BACK) * depth;
    b.xs[b.n] = half + sx * R - side / 2;
    b.ys[b.n] = half + syy * R - side / 2;
    b.ss[b.n] = side;
    b.n++;
  }

  for (let kk = 0; kk < buckets.length; kk++) {
    const b = buckets[kk];
    if (b.n === 0) continue;
    const accent = kk >= ALPHA_LEVELS;
    ctx.globalAlpha = ((kk % ALPHA_LEVELS) + 0.5) / ALPHA_LEVELS;
    ctx.fillStyle = accent ? palette.accent : palette.body;
    for (let j = 0; j < b.n; j++) ctx.fillRect(b.xs[j], b.ys[j], b.ss[j], b.ss[j]);
  }
  ctx.globalAlpha = 1;
}

/** seed'den ikinci, bağımsız bir 0–1 değeri. */
function hash(s: number) {
  const x = Math.sin(s * 9973.13) * 43758.5453;
  return x - Math.floor(x);
}
