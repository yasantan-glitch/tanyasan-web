/**
 * Reklam platformu iş ortaklıklarının TEK KAYNAĞI. Brief §7 üçünü de
 * "korunacak" listesine koyuyor: Meta Business Partner, Google Ads Partner,
 * Yandex Direct.
 *
 * NEDEN `next/image` DEĞİL, DÜZ `<img>`: Google_Ads.svg bir SVG ve Next'in
 * görsel optimizasyonu SVG'yi varsayılan olarak reddediyor
 * (`images.dangerouslyAllowSVG: false`). Üç küçük logo için `next.config.ts`'i
 * gevşetmeye değmez; üçü de sabit ölçülü, `width`/`height` açıkça verildiği
 * için layout shift de yok.
 *
 * Ölçüler dosyalardan okundu: Google_Ads.svg `viewBox="0 0 250.8 312.8"`,
 * meta-ads-digital.png 640×640, yandex-direct.png 280×280.
 *
 * NOT — meta-ads-digital.png ALFASIZ (RGB), zemini pişmiş beyaz. Bu yüzden
 * partner bandı açık yüzeyde ve tile'ların zemini `--color-paper-0` (#FFFFFF);
 * `#FAFAFA` üstünde logonun etrafında görünür bir kare kenarı oluşurdu.
 */
export interface Partner {
  src: string;
  /** Doğal ölçüler — layout shift olmasın diye açıkça veriliyor. */
  width: number;
  height: number;
  /**
   * Tile'ın altındaki mono etiket. BÜYÜK HARF yazılır: <html lang="tr">
   * altında `text-transform: uppercase` her "i"yi "İ" yapıyor ve
   * "Business"/"Direct" gibi yabancı adlar bozuluyordu ("BUSİNESS",
   * "DİRECT"). Aynı gerekçe content/portfolio.ts'te ayrıntılı yazılı.
   */
  label: string;
  alt: string;
}

export const PARTNERS: readonly Partner[] = [
  {
    // Kırpılmış kopya (Ekim 2026): orijinal 640×640'ın yalnızca ~%23'ü logo,
    // kalanı beyaz pay — rozet karesinde logo minicik kalıyordu. Orijinal
    // dosya yerinde duruyor.
    src: "/images/partners/meta-ads-digital-trim.png",
    width: 449,
    height: 163,
    label: "META BUSINESS PARTNER",
    alt: "Meta Business Partner rozeti",
  },
  {
    src: "/images/partners/Google_Ads.svg",
    width: 251,
    height: 313,
    label: "GOOGLE ADS PARTNER",
    alt: "Google Ads logosu",
  },
  {
    src: "/images/partners/yandex-direct-trim.png",
    width: 223,
    height: 185,
    label: "YANDEX DIRECT",
    alt: "Yandex Direct rozeti",
  },
];
