"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Header'ın şeffaf → solid geçişini süren tetik.
 *
 * Bilinçli olarak IntersectionObserver: hero'nun kendi scroll motoru
 * (useHeroScroll) window'a zaten passive bir scroll listener ve kalıcı bir
 * rAF döngüsü bağlıyor. İkinci bir scroll listener eklemek yerine sentinel
 * gözlemliyoruz — eşik geçişinde tek bir boolean state güncellenir, her
 * frame'de iş yapılmaz ve hero'nun state'ine hiç dokunulmaz.
 *
 * Sentinel `--nav-solid-after` yüksekliğinde, akış dışı bir kutu.
 * Viewport'un üstünden tamamen çıktığında (isIntersecting === false)
 * nav solid'e döner; yukarı geri scroll'da kendiliğinden şeffaflaşır.
 *
 * @param enabled false ise (hero'suz sayfalar) gözlemci hiç kurulmaz ve
 *   header baştan solid başlar.
 */
export function useScrolledPastSentinel(enabled: boolean) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [pastSentinel, setPastSentinel] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setPastSentinel(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [enabled]);

  // Sentinel yoksa (hero'suz sayfa) durum türetiliyor — effect içinde
  // setState yok, dolayısıyla zincirleme render de yok.
  return { sentinelRef, solid: !enabled || pastSentinel };
}
