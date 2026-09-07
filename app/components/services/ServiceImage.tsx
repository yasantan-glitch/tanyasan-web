"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import type { ServiceMedia } from "@/app/content/serviceMedia";

/** Görselin bölündüğü dikey şerit sayısı. CSS `--shard-count` ile aynı olmalı. */
const SHARD_COUNT = 5;

const RATIO_CLASS: Record<ServiceMedia["ratio"], string> = {
  "3/2": "service-media--3x2",
  "1/1": "service-media--square",
  "16/9": "service-media--16x9",
};

/**
 * Hizmet bölümünün görseli: viewport'a girince PARÇALARDAN BÜTÜNE birleşir.
 *
 * Mekanik — hero'nun scroll motoruyla (useHeroScroll) hiçbir ortak yanı yok ve
 * olmamalı: orada her frame'de rAF ile scrub edilen 8 fazlı bir anlatı var,
 * burada bölüm başına TEK ATIŞLIK bir tetik. Scroll listener yok, rAF yok.
 *
 *  - Görselin `SHARD_COUNT` kopyası üst üste duruyor; her kopya `clip-path:
 *    inset()` ile yalnızca kendi dikey şeridini gösteriyor (kesim `--i`'den
 *    hesaplanıyor, globals.css'te).
 *  - `clip-path` elemanın kendi koordinat sisteminde uygulanır, `transform`
 *    ondan sonra gelir — yani şerit kaydığında içindeki görüntü parçası da
 *    onunla kayar. Aranan "parça" davranışı bu.
 *  - IntersectionObserver ilk kesişimde `data-reveal`i "in" yapıp KENDİNİ
 *    KAPATIYOR; sonrasında bu bölümün maliyeti sıfır, geri scroll'da efekt
 *    tekrar oynamaz.
 *
 * Aynı `src`li beş `<Image>` aynı optimize URL'e çözülür: tarayıcı tek istek
 * atar, DOM'da beş düğüm olur. `preload` verilmiyor (Next 16'da `priority`nin
 * yerini aldı) — görseller katın çok altında.
 *
 * prefers-reduced-motion: burada observer HİÇ kurulmuyor ve şeritleri yerine
 * oturtma işi tamamen globals.css'in reduce bloğuna bırakılıyor — medya
 * sorgusu JS'ten bağımsız çalışır, hidrasyondan önceki karede bile dağınık
 * hâl görünmez.
 */
export function ServiceImage({ src, alt, ratio, sizes }: ServiceMedia) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    // Hareket istenmiyorsa gözlemci HİÇ kurulmaz; durum "pending" kalır ve
    // görseli tam/durağan gösterme işini globals.css'in reduce bloğu yapar
    // (.service-shard { transform: none; opacity: 1 }). setState ile "in"e
    // çekmek aynı sonucu bir tur fazladan render'la üretirdi.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setRevealed(true);
        observer.disconnect();
      },
      // Bölümün dörtte biri göründüğünde: görsel ekrana tam girmeden
      // başlıyor, kullanıcı birleşmenin ortasına düşmüyor.
      //
      // rootMargin HER İKİ EKSENDE daraltılıyor. /hizmetler artık yatay bir
      // ray: paneller yandan giriyor, dolayısıyla yalnızca dikey eksene
      // ayarlanmış bir kenar boşluğu orada hiçbir şey yapmıyordu. Ray'de
      // kırpmayı .rail-viewport'un `overflow: clip`i yapıyor — ekran dışı
      // paneller gerçekten "kesişmiyor" sayılıyor, bu yüzden gözlemci yatayda
      // da doğru çalışıyor.
      { threshold: 0.25, rootMargin: "0px -10% -10% -10%" }
    );
    observer.observe(frame);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={frameRef}
      className={`service-media ${RATIO_CLASS[ratio]}`}
      data-reveal={revealed ? "in" : "pending"}
      // İmleç büyüteci bu çerçevede açılır. useCursorLens `data-reveal`i de
      // okuyor: şeritler henüz birleşmemişken (pending) lens açılmaz, yarım
      // bir kareyi büyütmek birleşme efektini bozardı.
      data-cursor-lens
    >
      {Array.from({ length: SHARD_COUNT }, (_, i) => (
        <div
          key={i}
          className="service-shard"
          style={{ "--i": i } as React.CSSProperties}
        >
          {/* alt yalnızca ilk şeritte: beş kopya aynı görseli taşıyor, ekran
              okuyucu aynı metni beş kez duymamalı. */}
          <Image
            src={src}
            alt={i === 0 ? alt : ""}
            aria-hidden={i === 0 ? undefined : true}
            fill
            sizes={sizes}
            style={{ objectFit: "cover" }}
          />
        </div>
      ))}
    </div>
  );
}
