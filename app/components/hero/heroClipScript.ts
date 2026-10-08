import { HERO_MOBILE_VIDEO_MEDIA, SERVICE_PHASES } from "./heroPhases";

/**
 * Hero kliplerinin HYDRATION'DAN ÖNCE inmeye başlaması (Ekim 2026).
 *
 * Canlı ölçüm: ilk klip isteği ~1340 ms'de başlıyordu — 216 KB JS inip
 * React hydrate olduktan sonra, useHeroScroll'un mount effect'inde.
 * Klipler Vercel önbelleğinden hızlı iniyor; darboğaz indirme değil,
 * indirmenin hydration'ı beklemesiydi. Telefonda hydration saniyeler
 * sürüyor ve kullanıcı faz 2–3'e geldiğinde ortada klip yoktu.
 *
 * Bu modül, HTML ayrıştırılırken çalışan küçük bir inline script üretir
 * (bkz. HeroClipPrefetch.tsx). Script fetch()'i başlatır ve Blob'a
 * çözülen promise'i `window.__heroClips[url]` altında bırakır;
 * useHeroScroll'un download()'ı aynı URL için önce oraya bakar. URL
 * derleme anında SERVICE_PHASES'ten türetilir — elle kopya yok.
 *
 * YALNIZCA klip 1, `high` öncelikle (faz 2 onu ilk ister; açılışta
 * görünen tek klip o). `priority` desteklemeyen tarayıcı seçeneği yok sayar.
 *
 * Klip 2–6 burada İNMİYOR (Ekim 2026, PSI mobil: ilk yüklemede altı klip
 * ≈2.4 MB'tı). Onları useHeroScroll indiriyor: ilk kullanıcı niyetinde
 * (dokunma / tekerlek / tuş / scroll) faz sırasıyla TEK TEK — paralel
 * DEĞİL; telefonda bant genişliği baskın, paralel istekler hattı bölüşüp
 * bir sonraki fazın klibini geciktiriyordu (ölçüm: faz 3 klibi paralelde
 * ~3170 ms, sıralıda ~2250 ms). Ayrıca syncVideoWindow aktif faz ±1'in
 * klibini her durumda ister: bir klip en geç önceki fazda inmeye başlar.
 */

declare global {
  interface Window {
    /** URL → Blob promise'i. Hem inline script hem useHeroScroll yazar;
     * aynı URL iki kez indirilmez. Reddedilen kayıt silinir. */
    __heroClips?: Record<string, Promise<Blob>>;
    /** `?herodebug` zamanları — performance.now() (navigationStart'a göre). */
    __heroClipT?: Record<string, HeroClipTiming>;
  }
}

export interface HeroClipTiming {
  start: number;
  end?: number;
  size?: number;
  failed?: number;
  /** "inline" = HTML'deki script, "hook" = useHeroScroll'un kendi fetch'i. */
  by: "inline" | "hook";
}

const FIRST_MOBILE_CLIP = SERVICE_PHASES[0].video.mobileSrc;
const FIRST_DESKTOP_CLIP = SERVICE_PHASES[0].video.src;

/**
 * ES5, try/catch'li — hata verirse hook kendi fetch'ine düşer. Koşullar
 * motorla aynı: reduced-motion (o kullanıcıya video hiç mount edilmiyor),
 * Save-Data (motor da toplu ön yükleme yapmıyor) ve HERO_MOBILE_VIDEO_MEDIA
 * (motorun mobileSource sorgusu).
 */
export const HERO_CLIP_PREFETCH_SCRIPT = `(function(){try{
var w=window,mm=w.matchMedia,n=navigator,c=n.connection;
if(!mm||!w.fetch||!w.Promise||!w.performance)return;
if(mm("(prefers-reduced-motion: reduce)").matches)return;
if(c&&c.saveData)return;
var u=mm(${JSON.stringify(HERO_MOBILE_VIDEO_MEDIA)}).matches?${JSON.stringify(FIRST_MOBILE_CLIP)}:${JSON.stringify(FIRST_DESKTOP_CLIP)};
var clips=w.__heroClips=w.__heroClips||{},T=w.__heroClipT=w.__heroClipT||{};
if(clips[u])return;var t=T[u]={start:performance.now(),by:"inline"};
var p=fetch(u,{priority:"high"}).then(function(r){if(!r.ok)throw new Error(r.status+" "+u);return r.blob()}).then(function(b){t.end=performance.now();t.size=b.size;return b});
p["catch"](function(){t.failed=performance.now();if(clips[u]===p)delete clips[u]});clips[u]=p;
}catch(e){}})();`;
