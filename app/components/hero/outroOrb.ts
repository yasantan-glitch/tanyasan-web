import { hash01 } from "./heroMath";

/**
 * Faz 8'in nokta küresi — geometrisi VE nefes gruplaması deterministik
 * üretilir.
 *
 * Math.random YOK (faz 1'in kelime saçılmasıyla aynı disiplin, bkz.
 * heroMath.ts): küre her yüklemede aynı görünmeli, aksi halde tasarlanmış
 * değil kazara oluşmuş gibi okunur. Burada ayrıca zorunlu: değerler SSR
 * HTML'ine attribute olarak yazıldığı için sunucu ve istemci birebir aynı
 * diziyi üretmek zorunda (hydration uyuşmazlığı olmaz).
 *
 * KARAR DEĞİŞTİ (Eylül 2026, kullanıcı geri bildirimi): önceki sürüm 280
 * noktalı, bilinçli olarak DÜZENSİZ bir buluttu — karesel boyut jitter'ı, dış
 * hattı yönlere göre şişiren bir lob alanı ve her noktanın kendi yönüne
 * giden per-nokta animasyonu. Sonuç küre değil seyrek bir bulut gibi
 * okunuyordu. Artık hedef GERÇEKÇİ bir küre: sık, yüzeye düzgün oturan
 * noktalar; boyut ve ton yalnızca derinlikten ve ışıktan geliyor.
 *
 * Dağılım: Fibonacci (altın açı) kafesi. Kutuplarda yığılan enlem/boylam
 * ızgarasının aksine noktaları küre yüzeyine eşit aralıklı serer.
 *
 * İzdüşüm ortografik: z yalnızca noktanın YARIÇAPINI ve OPAKLIĞINI belirler;
 * üstüne sol üst önden gelen bir Lambert ışığı biniyor. Arka yarıküre küçük
 * ve soluk, aydınlık taraf dolgun — perspektif matrisi gerekmeden hacimli.
 *
 * NEFES GRUP SEVİYESİNDE: noktalar boylamlarına göre ORB_GROUP_COUNT dilime
 * ayrılıyor, her dilim (<g>) küre merkezinden hafifçe şişiyor ve gecikmeler
 * dilim sırasına göre kaydırılmış. Şişkinlik kürenin etrafında DOLAŞIYOR —
 * yavaş bir dönüş gibi okunuyor, silüet küresel kalıyor. 680 animasyon
 * yerine 10: per-nokta animasyonun bedelini (bkz. docs/design-system.md §8)
 * artık ödemiyoruz.
 */

/** SVG viewBox'ı: kare, 200×200. Nefeste dilimler dışa taştığı için küre
 * yarıçapı 200'ün yarısı değil, 88 — en büyük ölçek + en büyük nokta bile
 * kutunun içinde kalır. */
export const ORB_VIEWBOX = 200;
const ORB_CENTER = ORB_VIEWBOX / 2;
const ORB_RADIUS = 88;

/** Nokta sayısı. 680'de komşu aralığı ~12 viewBox birimi: yüzey sürekli bir
 * doku olarak okunuyor, noktalar yine tek tek seçilebiliyor. */
const ORB_POINT_COUNT = 680;

/** Derinliğe bağlı yarıçap aralığı. Jitter yalnızca ±%6 — boyut farkı
 * rastlantıdan değil derinlikten gelmeli, yoksa yüzey kırılır. */
const ORB_R_MIN = 0.7;
const ORB_R_MAX = 2.3;
const ORB_R_DEPTH_POW = 1.4;

/** Opaklık = taban + derinlik payı + ışık payı. */
const ORB_OPACITY_BASE = 0.1;
const ORB_OPACITY_DEPTH = 0.5;
const ORB_OPACITY_LIGHT = 0.4;

/** Işık yönü (birim vektör): sol (−x), üst (SVG'de −y), öne doğru (+z). */
const LIGHT = (() => {
  const v = [-0.45, -0.55, 0.7];
  const len = Math.hypot(v[0], v[1], v[2]);
  return v.map((c) => c / len);
})();

/** Nefes dilimi sayısı. 10 dilim dalganın gözle görülür adımlarla değil
 * akarak dolaşmasına yetiyor; her dilim ayrı bir animasyon olduğu için daha
 * fazlası yalnızca maliyet. */
export const ORB_GROUP_COUNT = 10;

/** Dalganın kürenin etrafında bir tur atma süresi (sn). */
export const ORB_WAVE_DURATION = 7.2;

export interface OrbDot {
  cx: number;
  cy: number;
  r: number;
  opacity: number;
}

export interface OrbGroup {
  /** Saniye, NEGATİF: dilim döngünün ortasından başlar, yani ilk karede
   * dalga zaten yolda. Pozitif gecikmeyle dilimler bir süre kıpırdamadan
   * bekler ve sahneye "sıra sıra" girerdi. */
  delay: number;
  dots: OrbDot[];
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

export const ORB_GROUPS: OrbGroup[] = (() => {
  const groups: OrbGroup[] = Array.from({ length: ORB_GROUP_COUNT }, (_, g) => ({
    delay: round(-(g / ORB_GROUP_COUNT) * ORB_WAVE_DURATION, 2),
    dots: [],
  }));
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
    const light = Math.max(ux * LIGHT[0] + uy * LIGHT[1] + uz * LIGHT[2], 0);

    const r =
      (ORB_R_MIN + Math.pow(depth, ORB_R_DEPTH_POW) * (ORB_R_MAX - ORB_R_MIN)) *
      (0.94 + 0.12 * hash01(i + 911));
    const opacity = Math.min(
      (ORB_OPACITY_BASE + depth * ORB_OPACITY_DEPTH + light * ORB_OPACITY_LIGHT) *
        (0.94 + 0.06 * hash01(i + 337)),
      1
    );

    /**
     * Dilim: dikey eksen etrafındaki boylam. Eğimden ÖNCEKİ (x, z) değil
     * ekrandaki (ux, uz) kullanılıyor ki dalga görünen dikey eksen etrafında
     * dönsün — eğik eksende dönen bir dalga "yalpalıyor" gibi okunuyordu.
     */
    const azimuth = Math.atan2(ux, uz); // -π..π
    const g = Math.min(
      Math.floor(((azimuth + Math.PI) / (2 * Math.PI)) * ORB_GROUP_COUNT),
      ORB_GROUP_COUNT - 1
    );

    groups[g].dots.push({
      cx: round(ORB_CENTER + ux * ORB_RADIUS, 2),
      cy: round(ORB_CENTER + uy * ORB_RADIUS, 2),
      r: round(r, 2),
      opacity: round(opacity, 3),
    });
  }

  // Boyama sırası: arkadaki noktalar önce. Dilim içinde nokta yarıçapına
  // (derinliğin tekdüze bir fonksiyonu) göre; dilimler arasında ortalama
  // derinliğe göre — arka yarıküredeki bir dilim DOM'da öndekinin üstüne
  // binmesin. Gecikme dilime bağlı sabit kaldığı için sıra dalgayı bozmuyor.
  const meanR = (group: OrbGroup) =>
    group.dots.reduce((sum, dot) => sum + dot.r, 0) / Math.max(group.dots.length, 1);
  for (const group of groups) group.dots.sort((a, b) => a.r - b.r);
  return groups.sort((a, b) => meanR(a) - meanR(b));
})();
