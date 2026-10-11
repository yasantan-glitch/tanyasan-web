import { INTRO_PHASE_INDEX, PHASE_RANGES } from "./heroPhases";

/**
 * Hero intro'sunun scroll eşikleri — TEK kaynak. Hem HeroIntroArt'ın
 * denetleyicisi hem HTML'deki inline script (heroIntroScript.ts, hydration
 * öncesi yedek) okuyor; ikisi farklı eşik kullanırsa header logosu
 * hydration'da yer değiştirir.
 *
 * Paylar faz 1'in (intro) scroll uzunluğuna oranla. Kaydır ipucu %25'te
 * söner, statement'ın saçılması ~%68'de, faz 2 devri ~%82'de başlar.
 */

/** Etiketler ve inşa çizgileri faz 1'in ilk %35'inde söner. */
export const HERO_INTRO_FADE_SHARE = 0.35;

/** Logo faz 1'in ilk %50'sinde header'daki yerine varır — saçılmadan önce. */
export const HERO_INTRO_DOCK_SHARE = 0.5;

/** Normalize hero ilerlemesinde (p ∈ [0,1]) faz 1'in bitişi. */
export const HERO_INTRO_PHASE_END = PHASE_RANGES[INTRO_PHASE_INDEX].end;

declare global {
  interface Window {
    /** Hydration öncesi yedek (heroIntroScript.ts): sayfa logonun varış
     * eşiğinin altında açıldıysa header logosunu gösterip kompozisyonu
     * gizliyor. HeroIntroArt'ın denetleyicisi ilk karesini yazınca durdurur. */
    __heroIntroPre?: { stop: () => void };
  }
}
