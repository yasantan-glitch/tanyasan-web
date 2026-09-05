"use client";

import { useSyncExternalStore } from "react";

import { useCursorLens } from "./useCursorLens";

const SHARD_COUNT = 3;

/**
 * Fare VE hareket isteği. İkisi tek sorguda birleştirildi: eşleşmezse
 * aşağıda hiçbir DOM kurulmuyor, dolayısıyla hiçbir dinleyici de kurulmuyor.
 */
const LENS_QUERY = "(pointer: fine) and (prefers-reduced-motion: no-preference)";

function subscribe(callback: () => void) {
  const mq = window.matchMedia(LENS_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}
function getSnapshot() {
  return window.matchMedia(LENS_QUERY).matches;
}
/** Sunucuda pointer bilinmez; katman hidrasyondan sonra kurulur. */
function getServerSnapshot() {
  return false;
}

/**
 * Site geneline yayılan imleç katmanı.
 *
 * İki modu var, aynı iskelet üzerinde (bkz. useCursorLens):
 *
 *  - **hale + dağılma** (varsayılan): imlecin altındaki alan `backdrop-filter`
 *    ile hafifçe berraklaşır, çevresinde yumuşak amber bir hale durur ve üç
 *    küçük uydu imleci farklı gecikmelerle takip eder. Hızlı harekette
 *    art arda dizilip bulanıklaşır (dağılma), fare durunca halenin içinde
 *    eriyip kaybolur.
 *  - **büyüteç** (`[data-cursor-lens]` işaretli görsel çerçevelerinde):
 *    aynı görselin büyütülmüş bir kırpımı yumuşak köşeli bir kare içinde.
 *
 * Neden bu ayrım: `backdrop-filter` blur/kontrast/doygunluk yapabilir ama
 * ÖLÇEKLEYEMEZ — CSS'te rastgele DOM'u gerçekten büyüten bir mercek yok. Onu
 * kurmanın tek yolu sayfanın `scale`'lenmiş ikinci bir kopyasını taşımak;
 * layout/paint maliyeti ikiye katlanır, `position: fixed` öğeler ve videolar
 * bozulur. Gerçek optik büyütme bu yüzden yalnızca GÖRSELLER üstünde ve
 * `background-image` kırpımıyla yapılıyor: aynı, zaten decode edilmiş
 * bitmap yeniden çizilir — ek istek yok, DOM kopyası yok.
 *
 * Native imleç yalnızca lens bölgelerinin içinde gizlenir. Site genelinde
 * gizlemek, rAF gecikmesinde imleci gerçek tıklama noktasının gerisinde
 * bırakır ve metin/form/link imleçlerinin anlamını yok eder.
 */
export default function CursorLens() {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return enabled ? <CursorLensLayer /> : null;
}

function CursorLensLayer() {
  const { rootRef, glowRef, zoomRef, shardRefs } = useCursorLens();

  return (
    <div
      ref={rootRef}
      className="cursor-lens"
      data-active="false"
      data-mode="glow"
      aria-hidden="true"
    >
      {Array.from({ length: SHARD_COUNT }, (_, i) => (
        <div
          key={i}
          ref={(el) => {
            shardRefs.current[i] = el;
          }}
          className="cursor-lens__shard"
        />
      ))}
      <div ref={glowRef} className="cursor-lens__glow" />
      <div ref={zoomRef} className="cursor-lens__zoom" />
    </div>
  );
}
