import { hash01 } from "./heroMath";

/**
 * Faz 8'in nokta bulutu küresi — geometrisi VE nefes alma parametreleri
 * deterministik üretilir.
 *
 * Math.random YOK (faz 1'in kelime saçılmasıyla aynı disiplin, bkz.
 * heroMath.ts): küre her yüklemede aynı görünmeli ve aynı ritimde nefes
 * almalı, aksi halde tasarlanmış değil kazara oluşmuş gibi okunur. Burada
 * ayrıca zorunlu: değerler SSR HTML'ine inline custom property olarak
 * yazıldığı için sunucu ve istemci birebir aynı diziyi üretmek zorunda
 * (hydration uyuşmazlığı olmaz).
 *
 * Dağılım: Fibonacci (altın açı) kafesi. Kutuplarda yığılan enlem/boylam
 * ızgarasının aksine noktaları küre yüzeyine eşit aralıklı serer, yani
 * silüet her yönden aynı yoğunlukta okunur.
 *
 * İzdüşüm ortografik: z yalnızca noktanın YARIÇAPINI ve OPAKLIĞINI belirler.
 * Arka yarıküre küçük ve soluk kaldığı için düz bir daire değil, hacimli bir
 * küre olarak okunuyor — perspektif matrisi gerekmeden.
 *
 * NEFES ALMA BURADA HESAPLANIR, CSS'TE SÜRÜLÜR: her nokta kendi gecikmesi,
 * süresi ve genliğiyle tek bir paylaşılan @keyframes'i (hero-orb-dot) sürer.
 * Tek bir <g> animasyonu yerine per-nokta olmasının sebebi, kürenin dış
 * hattının mükemmel küresel kalmaması ve rengin bulutta aynı anda değil
 * içinde dolaşarak dönmesi (bkz. docs/design-system.md §8).
 */

/** SVG viewBox'ı: kare, 200×200. Nefeste noktalar dışa doğru taştığı için
 * küre yarıçapı 200'ün yarısı değil, 82 — en büyük genlik + en büyük nokta
 * bile kutunun içinde kalır. */
export const ORB_VIEWBOX = 200;
const ORB_CENTER = ORB_VIEWBOX / 2;
const ORB_RADIUS = 82;

/** Nokta sayısı. 140 seyrek kalıyordu; 280 dokuyu doldururken hâlâ tek bir
 * paylaşılan keyframe ve küçük bir boyama alanıyla (240×240 CSS px)
 * çalışılabilir bir sayı. */
const ORB_POINT_COUNT = 280;

/** Derinliğe bağlı taban yarıçap. Üstüne per-nokta çarpan biniyor. */
const ORB_R_BASE_MIN = 0.8;
const ORB_R_BASE_MAX = 3.9;
/** Derinlik eğrisi: üs 1 değil 1.7 — ön yüzeydeki birkaç nokta belirgin
 * biçimde öne çıkarken arka yarıküre topluca küçük kalıyor. */
const ORB_R_DEPTH_POW = 1.7;
/** Per-nokta boyut çarpanı. Hash'in KARESİ alınıyor: çoğunluk küçük kalır,
 * azınlık belirgin şekilde büyür — "büyük noktalar arasında çok daha
 * küçükler" dokusu düz bir dağılımdan değil bu eğrilikten geliyor. */
const ORB_R_JITTER_MIN = 0.45;
const ORB_R_JITTER_SPAN = 1.25;
/** Uç değer emniyeti: en öndeki en şanslı nokta bile disk gibi görünmesin. */
const ORB_R_MAX = 5.6;

const ORB_OPACITY_MIN = 0.18;
const ORB_OPACITY_SPAN = 0.8;

/** Nefeste bir noktanın dışa doğru kat edebileceği en büyük yol (viewBox
 * birimi ≈ yarıçapın %8.5'i). Yön 3B radyal, yani küre gerçekten şişiyor. */
const ORB_BREATH_UNITS = 7;

/** Nefes süresi aralığı (sn). Farklı süreler vuru (beat) yaratır: bulutun
 * bütünü gözle görülür biçimde asla tekrarlamaz. */
const ORB_DUR_MIN = 4.4;
const ORB_DUR_SPAN = 2.8;

export interface OrbDot {
  cx: number;
  cy: number;
  r: number;
  opacity: number;
  /** Nefesin tepe anında noktanın kat ettiği yol (viewBox birimi). CSS'e
   * `px` olarak yazılır — SVG'de 1px = 1 kullanıcı birimi. */
  dx: number;
  dy: number;
  /** Tepe anındaki ölçek. */
  scale: number;
  /** Saniye, NEGATİF: nokta döngünün ortasından başlar, yani ilk karede
   * bulut zaten asimetrik. Pozitif gecikmeyle hepsi bir süre kıpırdamadan
   * bekler ve sahneye "sıra sıra" girerdi. */
  delay: number;
  duration: number;
}

/** Altın açı — Fibonacci kafesinin boylam adımı. */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * Küre biraz eğik duruyor: kafes ekseni tam dikeyken kutuplardaki düzenli
 * sarmal ekranın tepesinde ve dibinde simetrik bir "kapak" gibi okunuyordu.
 * Sabit bir eğim (radyan) bunu kırıyor — yine deterministik.
 */
const ORB_TILT = 0.42;

const round = (value: number, digits: number) => Number(value.toFixed(digits));

export const ORB_DOTS: OrbDot[] = (() => {
  const dots: OrbDot[] = [];
  const cosT = Math.cos(ORB_TILT);
  const sinT = Math.sin(ORB_TILT);

  for (let i = 0; i < ORB_POINT_COUNT; i++) {
    // y: -1..1 arasında eşit aralıklı; ring yarıçapı küre denkleminden.
    const y = 1 - (2 * i + 1) / ORB_POINT_COUNT;
    const ring = Math.sqrt(Math.max(1 - y * y, 0));
    const theta = GOLDEN_ANGLE * i;
    const x = Math.cos(theta) * ring;
    const z = Math.sin(theta) * ring;

    // X ekseni etrafında sabit eğim. (ux, uy, uz) noktanın birim yönü.
    const ux = x;
    const uy = y * cosT - z * sinT;
    const uz = y * sinT + z * cosT;

    // depth 0 = en arka, 1 = en ön.
    const depth = (uz + 1) / 2;

    const rBase =
      ORB_R_BASE_MIN + Math.pow(depth, ORB_R_DEPTH_POW) * (ORB_R_BASE_MAX - ORB_R_BASE_MIN);
    const rJitter = ORB_R_JITTER_MIN + hash01(i + 911) ** 2 * ORB_R_JITTER_SPAN;

    /**
     * Lob alanı: düşük frekanslı İKİ harmoniğin çarpımı. Genliği yöne göre
     * değiştirdiği için sağ/sol/üst/alt farklı miktarda şişer — dış hat
     * mükemmel küresel kalmaz. Frekanslar bilinçli olarak düşük: yüksek
     * frekansta komşu noktalar zıt yönlere gider ve bulut kaynayan bir
     * gürültüye döner, oysa istenen birkaç geniş şişkinlik.
     */
    const lobeRaw = Math.sin(2.1 * ux + 1.7 * uz) * Math.cos(1.6 * uy);
    const lobe =
      (0.1 + 0.9 * (0.5 + 0.5 * lobeRaw)) * (0.9 + 0.2 * hash01(i + 617));
    const amp = ORB_BREATH_UNITS * lobe;

    /**
     * Süre ve faz KONUMA BAĞLI DÜZGÜN ALANLARDAN geliyor, saf hash'ten
     * değil. Saf hash olsaydı komşu noktalar bağımsız titrer ve bulut TV
     * karıncasına dönerdi; düzgün alan sayesinde komşular neredeyse aynı
     * fazda olur ve bulutun etrafında dolaşan tutarlı bir şişme dalgası
     * doğar. Hash yalnızca ince bir kırılma olarak ekleniyor ki alan
     * matematiksel bir desen gibi okunmasın.
     */
    const durField = 0.5 + 0.5 * Math.sin(1.3 * uy + 2.2 * uz + 0.4);
    const duration =
      (ORB_DUR_MIN + durField * ORB_DUR_SPAN) * (0.96 + 0.08 * hash01(i + 199));

    const phaseField = 0.5 + 0.5 * Math.sin(2.6 * ux - 1.4 * uy + 0.8);
    const phase = (phaseField + 0.22 * hash01(i + 457)) % 1;

    dots.push({
      cx: round(ORB_CENTER + ux * ORB_RADIUS, 2),
      cy: round(ORB_CENTER + uy * ORB_RADIUS, 2),
      r: round(Math.min(rBase * rJitter, ORB_R_MAX), 2),
      opacity: round(
        (ORB_OPACITY_MIN + depth * ORB_OPACITY_SPAN) * (0.85 + 0.15 * hash01(i + 337)),
        3
      ),
      dx: round(ux * amp, 2),
      dy: round(uy * amp, 2),
      scale: round(1 + 0.16 * lobe + 0.14 * hash01(i + 733), 3),
      delay: round(-phase * duration, 2),
      duration: round(duration, 2),
    });
  }
  return dots;
})();
