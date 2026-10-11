import { HERO_INTRO_SCRIPT } from "./heroIntroScript";

/**
 * Hero intro'sunun font beklemesi ve ilk etkileşimde atlanması — yalnızca anasayfada
 * (app/page.tsx, <Hero />'dan HEMEN SONRA: script ayrıştırıldığında hero
 * işaretlemesi DOM'da olmalı). Server component; gerekçe ve script:
 * heroIntroScript.ts. İstemci tarafı gezinmede inline script çalışmaz — o
 * durumda intro zaten oynamıyor (bkz. HeroIntroArt'taki introPlayed).
 */
export default function HeroIntroSkip() {
  return <script dangerouslySetInnerHTML={{ __html: HERO_INTRO_SCRIPT }} />;
}
