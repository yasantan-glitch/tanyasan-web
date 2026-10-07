import { HERO_CLIP_PREFETCH_SCRIPT } from "./heroClipScript";

/**
 * Hero kliplerinin hydration'dan önceki indirmesi — yalnızca anasayfada
 * (app/page.tsx, <Hero />'dan hemen önce). Server component: script ilk
 * HTML'de, parser ona ulaştığı anda çalışıyor; async JS chunk'larını
 * beklemiyor. Gerekçe ve script: heroClipScript.ts.
 *
 * `next/script` beforeInteractive DEĞİL: Next 16'da yalnızca root layout'ta
 * kullanılabiliyor, yani her sayfaya basılırdı.
 */
export default function HeroClipPrefetch() {
  return <script dangerouslySetInnerHTML={{ __html: HERO_CLIP_PREFETCH_SCRIPT }} />;
}
