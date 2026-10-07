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
 * (bkz. HeroClipPrefetch.tsx). Script fetch()'leri başlatır ve Blob'a
 * çözülen promise'leri `window.__heroClips[url]` altında bırakır;
 * useHeroScroll'un download()'ı aynı URL için önce oraya bakar. URL
 * listesi derleme anında SERVICE_PHASES'ten türetilir — elle kopya yok.
 *
 * Öncelik: klip 1 `high` (faz 2 onu ilk ister). Klip 2–6 klip 1 bittikten
 * sonra `low` — hydration için gereken JS chunk'larıyla yarışmasınlar; JS
 * çalışmadan hero hiç hareket edemiyor. `priority` desteklemeyen tarayıcı
 * seçeneği yok sayar.
 *
 * Sıra: klip 2–6 faz sırasıyla TEK TEK, paralel DEĞİL. Wi-Fi'da paralel
 * daha hızlı (gecikme baskın), ama telefonda bant genişliği baskın: beş
 * paralel istek hattı bölüşüp HER birini geciktiriyor, yani bir sonraki
 * fazın klibi geç bitiyor. Ölçüm (Fast 4G + CPU 4×, medyan): faz 3 klibi
 * paralelde ~3170 ms, sıralıda ~2250 ms'de hazır; hydration aynı.
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

const MOBILE_CLIPS = SERVICE_PHASES.map((phase) => phase.video.mobileSrc);
const DESKTOP_CLIPS = SERVICE_PHASES.map((phase) => phase.video.src).slice(0, 1);

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
var list=mm(${JSON.stringify(HERO_MOBILE_VIDEO_MEDIA)}).matches?${JSON.stringify(MOBILE_CLIPS)}:${JSON.stringify(DESKTOP_CLIPS)};
var clips=w.__heroClips=w.__heroClips||{},T=w.__heroClipT=w.__heroClipT||{};
function get(u,pr){if(clips[u])return clips[u];var t=T[u]={start:performance.now(),by:"inline"};
var p=fetch(u,{priority:pr}).then(function(r){if(!r.ok)throw new Error(r.status+" "+u);return r.blob()}).then(function(b){t.end=performance.now();t.size=b.size;return b});
p["catch"](function(){t.failed=performance.now();if(clips[u]===p)delete clips[u]});return clips[u]=p}
var first=get(list[0],"high");
var i=1;var next=function(){if(i<list.length)get(list[i++],"low").then(next,next)};first.then(next,next);
}catch(e){}})();`;
