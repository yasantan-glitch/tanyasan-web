import { hash01 } from "./heroMath";

/**
 * Faz 8'in parçacık küresi — geometri ve çizim (Canvas 2D).
 *
 * KARAR DEĞİŞTİ (Ekim 2026, kullanıcı kararı): referans Auros'un "Particle
 * Sphere Visual"ı — "binlerce küçük noktadan oluşan, dönen 3B bir küre;
 * kenarlarında aksan rengini yakalayan, biyolüminesan bir veri küresi".
 * Görselde ayrıca kürenin bir yanı DAĞILIYOR: parçacıklar o tarafta yüzeyden
 * kopup seyrekleşiyor.
 *
 * Önceki sürüm 680 noktalı statik bir SVG'ydi; "dönme" hissi yalnızca 10
 * dilimin sırayla şişmesinden geliyordu. Gerçek dönüş + binlerce parçacık +
 * dağılma, her karede binlerce noktanın yeniden izdüşümü demek: SVG'de bu
 * binlerce DOM elemanının her karede yeniden yazılması olurdu. Canvas'ta tek
 * bir bitmap, birkaç düzine `fillRect` çağrısı grubu.
 *
 * DETERMİNİZM KORUNUYOR: Math.random yok, Fibonacci kafesi + hash01. Küre
 * her yüklemede aynı başlıyor. (SSR zorunluluğu artık yok — canvas yalnızca
 * istemcide çiziliyor — ama "tasarlanmış, kazara değil" disiplini aynı.)
 *
 * KOORDİNATLAR: birim küre. Ekran: x sağ, y AŞAĞI, z izleyiciye doğru.
 */

/** Parçacık sayısı. Auros'un "binlerce" yoğunluğu. 2400'de (ilk deneme)
 * küre seyrek, noktalar tek tek sayılabilir okunuyordu; 4200'de yüzey
 * sürekli bir doku. */
export const ORB_PARTICLES = 4200;

/** Küre yarıçapı, canvas kenarının oranı olarak. Kalan pay dağılan
 * parçacıkların gideceği alan — 0.5'e yaklaşırsa dağılma kenarda kırpılır. */
export const ORB_RADIUS_RATIO = 0.33;

/** Bir tam tur (sn). Auros'ta dönüş ağır ve sinematik; hızlısı oyuncak
 * gibi okunuyor. */
export const ORB_TURN_SECONDS = 48;

/** Dönme ekseninin izleyiciye eğimi (radyan): kutup hafifçe öne yatık,
 * kafesin kutup sarmalı tepede simetrik bir "kapak" gibi okunmuyor. */
const ORB_TILT = 0.38;

/**
 * DAĞILMA ALANI — kürenin "çözülen" yanı. Alan EKRANA sabit (sağ alt), küre
 * onun içinden DÖNEREK geçiyor: bir parçacık o yana geldiğinde yüzeyden
 * kopup dışa savruluyor, arkaya dönünce yeniden yerine oturuyor. Böylece
 * dağılma tek bir donuk yara değil, sürekli akan bir hareket.
 *
 * Yön: sağ-alt (ekranda y aşağı). Eşikler: dot ürünü FROM'dan küçükse hiç
 * etkilenmiyor, TO'da tam etki.
 */
const SCATTER_DIR = (() => {
  const v = [0.82, 0.46, 0.34];
  const len = Math.hypot(v[0], v[1], v[2]);
  return v.map((c) => c / len) as [number, number, number];
})();
const SCATTER_FROM = 0.1;
const SCATTER_TO = 0.92;
/** En uzağa savrulan parçacığın merkezden mesafesi (yarıçap cinsinden ek). */
const SCATTER_REACH = 0.5;

/** Parçacık kenarı (CSS px), derinliğe göre. Kare parçacık: Auros'taki
 * noktalar da yuvarlak değil küçük kareler — "veri" hissi oradan geliyor. */
const SIZE_BACK = 0.6;
const SIZE_FRONT = 1.6;

/** Opaklık seviyeleri. Her parçacık bir kovaya düşüyor; kova başına tek
 * `fillStyle` → kare başına ~2×ALPHA_LEVELS durum değişimi, parçacık başına
 * değil. */
const ALPHA_LEVELS = 8;

export interface OrbParticles {
  /** Birim küre koordinatları, [x0,y0,z0, x1,y1,z1, …]. */
  pos: Float32Array;
  /** Parçacık başına sabit rastgelelik (0–1): savrulma payı, titreşim fazı. */
  seed: Float32Array;
}

/**
 * DAĞILIM: hash'li düzgün rastgele (y = 1 − 2u, θ = 2πv) — Fibonacci
 * kafesi DEĞİL. İlk denemede Fibonacci kullanıldı: noktalar kusursuz eşit
 * aralıklı olunca küre sarmal sıralı bir "örgü" gibi okunuyordu. Auros'un
 * dokusu organik; hafif kümelenmeler ve boşluklar onu "veri bulutu" yapıyor.
 * Hash yine deterministik.
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
  /** Kenar ve savrulan parçacıklar — markanın amberi. Auros'ta bu rol
   * lavanta-pembe; bizde logo amberi. */
  accent: string;
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

/** Kovalar, çağrılar arasında yeniden kullanılıyor (her karede ayırma yok). */
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
 * Tek kare. `t` saniye. `size` canvas'ın CSS px kenarı, `dpr` cihaz oranı
 * (bağlam zaten dpr ile ölçeklenmiş olmalı).
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

  // Dönüş: dikey eksen etrafında (yaw), sonra sabit eğim (X ekseni). Hafif
  // bir yalpa (±0.05 rad, 31 sn) eğimi canlı tutuyor — tam sabit eksen
  // mekanik okunuyordu.
  const yaw = (t / ORB_TURN_SECONDS) * Math.PI * 2;
  const tilt = ORB_TILT + Math.sin(t * ((Math.PI * 2) / 31)) * 0.05;
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);

  const buckets = getBuckets(count);
  for (const b of buckets) b.n = 0;

  const [dx, dy, dz] = SCATTER_DIR;

  for (let i = 0; i < count; i++) {
    const px = pos[i * 3];
    const py = pos[i * 3 + 1];
    const pz = pos[i * 3 + 2];

    // yaw (Y ekseni)
    const x1 = px * cy + pz * sy;
    const z1 = -px * sy + pz * cy;
    // tilt (X ekseni)
    const y2 = py * ct - z1 * st;
    const z2 = py * st + z1 * ct;
    const x2 = x1;

    // Dağılma: ekrana sabit alana ne kadar girdiği.
    const s = seed[i];
    const field = smoothstep(SCATTER_FROM, SCATTER_TO, x2 * dx + y2 * dy + z2 * dz);
    // Her parçacık aynı anda kopmuyor: seed eşiği alanın içinde parçacığa
    // kendi kopma noktasını veriyor; savrulma mesafesi de parçacığa özel.
    // Sonuç: kenarda seyrekleşen, düzensiz bir saçak.
    const loose = smoothstep(s * 0.55, s * 0.55 + 0.45, field);
    const flutter = 1 + 0.18 * Math.sin(t * 0.9 + s * 40);
    const push = loose * SCATTER_REACH * (0.25 + 0.75 * hash(s)) * flutter;

    // Savrulma radyal + alan yönüne doğru hafif sürüklenme: parçacıklar
    // yalnızca "şişmiyor", bir yöne akıyor.
    const sx = x2 * (1 + push) + dx * push * 0.35;
    const syy = y2 * (1 + push) + dy * push * 0.35;
    const sz = z2 * (1 + push);

    // Derinlik 0 (arka) … 1 (ön).
    const depth = Math.min(Math.max((sz + 1) / 2, 0), 1);
    // Kenar ışığı (fresnel benzeri): izleyiciye yan duran yüzey.
    const rim = Math.pow(1 - Math.abs(z2), 3);

    let alpha =
      (0.1 + 0.9 * Math.pow(depth, 1.3)) * (1 - 0.4 * loose) *
      (0.85 + 0.15 * s);
    // Arka yarıkürenin kenarı da hafifçe görünsün (kürenin hacmi).
    alpha = Math.max(alpha, rim * 0.35);

    // Renk: kenarda ya da savrulmuşsa amber. Eşik seed'le yumuşatılıyor —
    // keskin bir halka değil, kenara doğru yoğunlaşan bir parıltı.
    // Savrulanların yarısı kadarı amber (loose × 0.6): hepsi amber
    // olunca dağılma ayrı renkte bir leke gibi okunuyordu; Auros'ta saçak
    // gövdeyle aynı malzemeden, yalnızca ışığı yakalayanlar parlıyor.
    const accentScore = rim * 0.9 + loose * 0.6;
    const isAccent = accentScore > 0.55 + s * 0.35 ? 1 : 0;
    // Amber beyaz zeminde mürekkepten çok daha açık: aynı opaklıkta
    // kayboluyordu (ilk denemede savrulan bulut neredeyse görünmezdi).
    // Amber parçacıklara bir taban opaklık veriliyor.
    if (isAccent) alpha = Math.max(alpha, 0.55 + 0.35 * depth);

    const level = Math.min(Math.floor(alpha * ALPHA_LEVELS), ALPHA_LEVELS - 1);
    if (level < 0) continue;
    const b = buckets[isAccent * ALPHA_LEVELS + level];
    const sz2 = SIZE_BACK + (SIZE_FRONT - SIZE_BACK) * depth;
    b.xs[b.n] = half + sx * R - sz2 / 2;
    b.ys[b.n] = half + syy * R - sz2 / 2;
    b.ss[b.n] = sz2;
    b.n++;
  }

  for (let k = 0; k < buckets.length; k++) {
    const b = buckets[k];
    if (b.n === 0) continue;
    const accent = k >= ALPHA_LEVELS;
    const level = k % ALPHA_LEVELS;
    ctx.globalAlpha = (level + 0.5) / ALPHA_LEVELS;
    ctx.fillStyle = accent ? palette.accent : palette.body;
    for (let j = 0; j < b.n; j++) ctx.fillRect(b.xs[j], b.ys[j], b.ss[j], b.ss[j]);
  }
  ctx.globalAlpha = 1;
}

/** seed'den ikinci, bağımsız bir 0–1 değeri (savrulma mesafesi için). */
function hash(s: number) {
  const x = Math.sin(s * 9973.13) * 43758.5453;
  return x - Math.floor(x);
}
