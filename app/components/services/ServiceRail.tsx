"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * Yatay ray'lerin (bugün ikisi var: /hizmetler'in tam ekran rayı ve
 * anasayfanın özet rayı) KLAVYE KÖPRÜSÜ. Rayın görsel hareketinin tamamı
 * CSS'te (globals.css, `*-slide` + `view-timeline`); burada hiçbir stil
 * yazılmıyor, hiçbir frame sürülmüyor. Mekanik ikisinde de birebir aynı
 * olduğu için tek dosya paylaşılıyor — `panelSelector` hangi ray'in
 * panellerini arayacağını söylüyor (varsayılan `/hizmetler`'inki, geriye
 * dönük uyumluluk için değişmedi).
 *
 * ÇÖZÜLEN SORUN
 * Paneller yatayda kayarken ekran dışındakiler `overflow: clip` ile
 * kırpılıyor. Kullanıcı Tab'a basıp ekran dışı bir paneldeki bağlantıya
 * odaklandığında tarayıcı o elemanı görünür kılmaya çalışır. `clip`
 * kutuyu programatik olarak kaydırılamaz yaptığı için tarayıcı bunu
 * beceremez: odak görünmeyen bir yere gider ve kullanıcı odağı kaybeder.
 *
 * ÇÖZÜM
 * Tek bir `focusin` dinleyicisi. Odaklanan eleman hangi panelin içindeyse
 * o panelin sırasına karşılık gelen DİKEY scroll konumuna gidiyoruz —
 * ray zaten dikey scroll'a bağlı olduğu için panel kendiliğinden görünür
 * hâle geliyor. Yani odak rayı sürmüyor, sayfayı sürüyor; ikisi CSS
 * üzerinden zaten senkron.
 *
 * MALİYET
 * Tek listener, `focusin` (nadir bir olay). rAF yok, scroll listener yok
 * — hero'nun motoru sitedeki tek scroll dinleyicisi olarak kalıyor.
 *
 * NE ZAMAN ÇALIŞMAZ (ve çalışmamalı)
 * Ray yalnızca >860px'te ve `animation-timeline` destekliyken kuruluyor.
 * Diğer her durumda paneller normal dikey akışta; tarayıcının kendi
 * kaydırması zaten doğru çalışıyor ve buraya girmemek gerekiyor. Aynı
 * koşulları JS'te tekrar yazmak yerine rayın CANLI olup olmadığını
 * ölçüyoruz: sticky viewport gerçekten kırpıyorsa ray canlıdır.
 */

type Props = {
  /** Panel sayısı — dikey konum hesabı için. İçerikten gelir. */
  panelCount: number;
  children: ReactNode;
  className?: string;
  /** `--rail-panels` gibi custom property'ler için. */
  style?: CSSProperties;
  /** Panel köküne verilen CSS sınıfı. Varsayılan /hizmetler'in `.rail-panel`'i
   * — geriye dönük uyumluluk için değişmedi. Anasayfa `.home-rail-panel`
   * geçiriyor. */
  panelSelector?: string;
};

export default function ServiceRail({
  panelCount,
  children,
  className,
  style,
  panelSelector = ".rail-panel",
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const panels = () =>
      Array.from(section.querySelectorAll<HTMLElement>(panelSelector));

    function onFocusIn(event: FocusEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const panel = target.closest<HTMLElement>(panelSelector);
      if (!panel || !section) return;

      // Ray canlı mı? Yatay hâlde track ekranın birkaç katı genişliktedir;
      // dikey listede panel genişliği bölümün genişliğine eşittir. Medya
      // sorgusunu ve @supports'u JS'te kopyalamak yerine SONUCU ölçüyoruz
      // — kural değişirse burası kendiliğinden takip eder.
      const track = panel.parentElement;
      if (!track) return;
      if (track.scrollWidth <= section.clientWidth + 1) return;

      const index = panels().indexOf(panel);
      if (index < 0) return;

      // Bölümün dikey yolu: toplam yükseklik eksi pin'in kendi ekranı.
      const travel = section.offsetHeight - window.innerHeight;
      if (travel <= 0) return;

      // İKİ RAY, İKİ HESAP.
      // /hizmetler'de panel = tam ekran, kayma doğrusal ve panel i yolun
      // i/(n-1) noktasında tam ortalanıyor — aşağıdaki basit oran.
      // Anasayfada ise solda SABİT bir başlık plakası var ve paneller onun
      // altına girip kayboluyor: aynı oran, odaklanan paneli plakanın
      // ALTINA sürebilirdi. Plaka varsa oranı indeksten değil GERÇEK
      // GEOMETRİDEN çıkarıyoruz — panelin sol kenarı tam plakanın sağına
      // gelsin. Plaka yoksa (/hizmetler) tek satır bile değişmiyor.
      const lede = section.querySelector<HTMLElement>(".home-rail-lede");
      let progress = index / Math.max(panelCount - 1, 1);

      if (lede && lede.offsetParent !== null) {
        // Track'in kat edeceği toplam yatay yol (CSS'teki home-rail-slide
        // ile aynı büyüklük, ama ölçülerek — keyframe'i JS'te kopyalamıyoruz).
        const slide = track.scrollWidth - section.clientWidth;
        // Panelin track içindeki konumu zaten plaka genişliği kadar
        // padding'li; onu geri çıkarınca istenen kayma miktarı çıkıyor.
        const wanted = panel.offsetLeft - lede.offsetWidth;
        const rayProgress =
          slide > 0 ? Math.min(Math.max(wanted / slide, 0), 1) : 0;

        // Bandın timeline'ı artık İKİ dilime bölünmüş: ilk `share`
        // başlığın gelişi (paneller donuk duruyor), kalanı ray. Yukarıdaki
        // oran SADECE ray dilimi içindeki ilerlemeyi ölçüyor — tam
        // timeline'daki karşılığını bulmak için `share`'i CSS'ten okuyup
        // (sayı ikinci kez yazılmasın diye) geri kalan `1 - share`'e
        // ölçekliyoruz.
        const share = parseFloat(
          getComputedStyle(section).getPropertyValue(
            "--home-rail-arrive-share",
          ),
        );
        const arriveShare = Number.isFinite(share) ? share : 0;
        progress = arriveShare + (1 - arriveShare) * rayProgress;
      }

      // `section.offsetTop` DEĞİL: offsetTop, en yakın KONUMLANMIŞ ata'ya
      // görelidir. Anasayfada ray'i saran bant `.seam` (position: relative)
      // taşıyor — bu, offsetTop'u belge-mutlak olmaktan çıkarır ve hesabı
      // yanlış bir konuma sıçratır. `getBoundingClientRect` + `scrollY`
      // konumlanmış ata zincirinden bağımsız, her zaman belge-mutlak.
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const top = sectionTop + travel * progress;

      // `instant`: odak hareketi anlık olmalı. Yumuşak kaydırma sırasında
      // kullanıcı bir kez daha Tab'a basarsa iki animasyon çakışır ve odak
      // hiç yakalanamaz. Ayrıca prefers-reduced-motion'da smooth zaten
      // istenmiyor (globals.css scroll-behavior'ı auto'ya çekiyor).
      window.scrollTo({ top, behavior: "instant" });
    }

    section.addEventListener("focusin", onFocusIn);
    return () => section.removeEventListener("focusin", onFocusIn);
  }, [panelCount, panelSelector]);

  return (
    <section ref={sectionRef} className={className} style={style}>
      {children}
    </section>
  );
}
