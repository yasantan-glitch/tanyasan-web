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
      // Panel i, bu yolun i/(n-1) noktasında tam ortalanıyor.
      const travel = section.offsetHeight - window.innerHeight;
      if (travel <= 0) return;

      // `section.offsetTop` DEĞİL: offsetTop, en yakın KONUMLANMIŞ ata'ya
      // görelidir. Anasayfada ray'i saran bant `.seam` (position: relative)
      // taşıyor — bu, offsetTop'u belge-mutlak olmaktan çıkarır ve hesabı
      // yanlış bir konuma sıçratır. `getBoundingClientRect` + `scrollY`
      // konumlanmış ata zincirinden bağımsız, her zaman belge-mutlak.
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const top = sectionTop + (travel * index) / Math.max(panelCount - 1, 1);

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
