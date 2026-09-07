"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

import { ServiceImage } from "@/app/components/services/ServiceImage";
import type { ServiceMedia } from "@/app/content/serviceMedia";

/**
 * Anasayfa hizmet ray'inin tek paneli. `.home-service-row` ile AYNI iç
 * markup ve CSS sınıflarını taşıyor (ikon | başlık+kalemler) — ray CSS
 * desteklenmediğinde / prefers-reduced-motion'da / ≤860px'te panel bu
 * sınıfların üstünden bugünkü dikey satır görünümüne düşer. Ray'e özgü
 * olan tek şey görselin HOVER İLE MOUNT OLMASI, bkz. aşağıdaki not.
 *
 * GÖRSEL NEDEN "GİZLE" DEĞİL "MOUNT ETME"
 * Görseli CSS'le (`opacity:0`) gizleyip DOM'da hep tutmak daha basit
 * olurdu ama ServiceImage'in kendi IntersectionObserver'ı scroll
 * kesişiminde tetiklenir — panel scroll ile görünür olur olmaz shard efekti
 * (kullanıcı hiç hover etmeden, arka planda) oynar ve biterdi; hover
 * geldiğinde zaten birleşmiş bir görsel bulunurdu. İstenen şey bu değil:
 * "görsel görününce shard efekti tetiklenmeli". Çözüm görseli hover'a kadar
 * hiç DOM'a yazmamak — mount anı = görünme anı = IO'nun ilk tetiklendiği
 * an, üçü çakışıyor. `opened` hiç `false`'a dönmediği için (tek yönlü
 * kapı), ServiceImage bir kez mount olduktan sonra kalır ve kendi tek
 * atışlık kuralını doğal olarak koruyor — burada ayrıca bir "tekrar
 * oynatma" kilidi gerekmiyor.
 *
 * DOKUNMATİK / REDUCED-MOTION FALLBACK
 * `(hover: hover) and (prefers-reduced-motion: no-preference)` yanlışsa
 * (dokunmatik cihaz VEYA azaltılmış hareket) `gated` false'a düşer ve görsel
 * baştan mount edilir — hover'a hiç ihtiyaç duyulmaz. Reduced-motion'da
 * ServiceImage'in kendi IO'su hiç kurulmuyor zaten (bkz. ServiceImage.tsx),
 * şeritler CSS'in reduce bloğuyla dursun. Dokunmatikte IO normal çalışır,
 * panel scroll ile göründüğünde shard efekti /hizmetler'deki gibi oynar.
 *
 * SSR/hidrasyon: başlangıç durumu `gated:true, opened:false` (görsel
 * gizli) — matchMedia sonucu bilinmeden önce en güvenli varsayım budur ve
 * sunucu çıktısıyla eşleşir. Etki devreye girince dokunmatik/reduced-motion
 * kullanıcılarında görsel bir kare içinde belirir (flaş-gösterme), tersi
 * (flaş-gizleme) daha kötü bir izlenim bırakırdı.
 */

const GATE_QUERY = "(hover: hover) and (prefers-reduced-motion: no-preference)";

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
  const [gated, setGated] = useState(true);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(GATE_QUERY);
    const sync = () => setGated(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const visible = !gated || opened;

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
      onPointerEnter={() => setOpened(true)}
      onFocus={() => setOpened(true)}
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
        <div
          className="home-rail-panel__media"
          data-open={visible ? "true" : "false"}
          style={{ aspectRatio: media.ratio }}
        >
          {visible ? <ServiceImage {...media} /> : null}
        </div>
      ) : null}
    </Link>
  );
}
