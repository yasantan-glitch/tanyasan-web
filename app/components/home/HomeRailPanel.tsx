import Link from "next/link";
import type { ReactNode } from "react";

import { ServiceImage } from "@/app/components/services/ServiceImage";
import type { ServiceMedia } from "@/app/content/serviceMedia";

/**
 * Anasayfa hizmet ray'inin tek paneli. `.home-service-row` ile AYNI iç
 * markup ve CSS sınıflarını taşıyor (ikon | başlık+kalemler) — ray CSS
 * desteklenmediğinde / prefers-reduced-motion'da / ≤860px'te panel bu
 * sınıfların üstünden bugünkü dikey satır görünümüne düşer.
 *
 * GÖRSEL — /hizmetler'deki ServiceImage'İN AYNISI, HOVER YOK
 * Önceki sürüm görseli hover'a kadar hiç mount etmiyordu (kullanıcı
 * dokunana kadar birleşme efekti hiç oynamasın diye). Artık istenen şey
 * bunun tam tersi: panel ray içinde scroll ile görünür olur olmaz efekt
 * KENDİLİĞİNDEN oynasın — tıpkı /hizmetler'de olduğu gibi. Bu yüzden
 * `<ServiceImage>` burada da /hizmetler'deki gibi BAŞTAN mount ediliyor;
 * "ne zaman görünür olacağı" sorusunun cevabı artık component'in dışında,
 * ServiceImage'in kendi IntersectionObserver'ında (bkz. ServiceImage.tsx).
 *
 * Bu component artık client olmak ZORUNDA DEĞİL — `"use client"` ve
 * hover/focus state'i kalktı, geriye yalnızca sunucuda render edilebilen
 * bir markup kaldı (ServiceImage kendi client sınırını zaten taşıyor).
 *
 * DOKUNMATİK / REDUCED-MOTION FALLBACK
 * Ayrıca bir şey KURULMUYOR — ServiceImage bunu zaten kendi başına
 * hallediyor: reduced-motion'da observer hiç kurulmuyor, şeritler
 * globals.css'in reduce bloğuyla dururken görünür kalıyor; dokunmatikte
 * IO normal çalışıyor ve panel scroll ile göründüğünde efekt
 * /hizmetler'deki gibi oynuyor.
 */

type Props = {
  id: string;
  /** Sunucuda önceden render edilmiş ikon (`<service.icon />`). `Service.icon`
   * bir bileşen FONKSİYONU — ham hâliyle bu client component'e prop olarak
   * geçemez (server→client sınırı yalnızca serileştirilebilir değer veya
   * zaten render edilmiş bir React elemanı taşır). Sunucu bileşeni
   * (`page.tsx`) elemanı burada oluşturup hazır JSX olarak yolluyor. */
  icon: ReactNode;
  title: string;
  items: string[];
  index: number;
  total: number;
  media?: ServiceMedia;
};

export default function HomeRailPanel({
  id,
  icon,
  title,
  items,
  index,
  total,
  media,
}: Props) {
  return (
    <Link
      href={`/hizmetler#${id}`}
      className="home-service-row home-rail-panel border-hairline"
      // Dikey fallback'te standart scroll-giriş jesti (globals.css hareket
      // substratı). Yatay/pinned modda `.home-rail-panel`in kendi drift
      // animasyonu aynı elementin `animation` özelliğini SONRADAN yazıp bunu
      // ezer — iki ayrı hareket aynı anda çakışmıyor, yalnızca hangi modda
      // hangisinin geçerli olduğu değişiyor.
      data-enter
    >
      <div className="service-icon" aria-hidden="true">
        {icon}
      </div>

      <div>
        <p className="eyebrow text-accent-auto">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
        <h3 className="home-service-title service-title font-display mt-2">
          {title}
        </h3>
        {/* Yatay/pinned modda gizleniyor (globals.css): sticky viewport sabit
            ve kısa yükseklikte, kalem satırı + görsel toplamı onu taşırırdı.
            Dikey fallback'te görünür kalıyor — bugünkü özet listesiyle
            birebir aynı bilgi. */}
        <p className="eyebrow text-muted mt-4 home-rail-panel__items">
          {items.join(" · ")}
        </p>
      </div>

      {media ? (
        <div className="home-rail-panel__media">
          <ServiceImage {...media} />
        </div>
      ) : null}
    </Link>
  );
}
