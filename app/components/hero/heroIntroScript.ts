/**
 * Hero intro'sunun zamanlaması ve ATLANMASI (Ekim 2026) — bkz. HeroIntroArt.tsx.
 *
 * Intro tamamen CSS animasyonu; HTML ile birlikte başlıyor. Bu script onu
 * iki noktada yönetiyor ve hydration'ı beklememeli (telefonda hydration
 * saniyeler sürüyor, intro zaten 5 sn). Bu yüzden HTML ayrıştırılırken
 * çalışan küçük bir inline script (bkz. HeroIntroSkip.tsx), heroClipScript.ts
 * ile aynı desen.
 *
 * 1) FONT BEKLEMESİ (CLS): kompozisyon statement'ın ÜSTÜNE yaslı. Web
 *    fontları (preload: false, swap) geldiğinde statement'ın satır kırılımı
 *    değişiyor ve blok ~45px uzuyor — bu kayma intro'dan önce de vardı, ama
 *    kompozisyon onunla birlikte kayınca etki alanı büyüyor (ölçüm: CLS
 *    0.031 → 0.040). Opaklığı 0 olan alt ağaç CLS'e sayılmıyor (ölçüldü).
 *    Bu yüzden kompozisyon, hero'nun üç fontu (statement, alt başlık, mono
 *    etiket) inene dek bir WAAPI animasyonuyla opaklık 0'da tutuluyor, en
 *    fazla FONT_WAIT_MS. Açıldığı an intro saati (ve ona bağlı statement
 *    ötelemesi) BAŞTAN başlıyor: ızgara + tohum fazı kaybolmuyor, statement
 *    yine intro'nun 3.5. saniyesinde. Fontlar önbellekteyse fark ~0.
 *
 * 2) ATLAMA: ilk scroll / tekerlek / dokunuş / pointer / tuşta
 *    - `hero-intro-*` animasyonları finish() → bitmiş kompozisyon;
 *    - statement'ın hâlâ gecikmesinde bekleyen giriş animasyonları
 *      (hero-rise-in / hero-sub-rise-in) intro ötelemesinden arındırılıp
 *      ŞİMDİ başlatılır — kendi 0 / 0.12 / 0.26 s kademeleriyle.
 *    İlk ayrıştırmada sayfa zaten aşağıdaysa (scroll geri yükleme) hemen.
 *
 * Yalnızca Web Animations API: DOM'a hiçbir öznitelik yazılmıyor, yani
 * React hydration'ı birebir aynı işaretlemeyi görüyor. Dinleyiciler pasif,
 * hiçbiri preventDefault çağırmıyor — scroll asla kilitlenmiyor.
 * useHeroScroll'un kendi niyet dinleyicilerinden (startEagerQueue) bağımsız.
 * 3) HEADER LOGOSU YEDEĞİ: anasayfada header logosu kompozisyon ekrandayken
 *    CSS'te gizli; scroll'la logonun header'a gitmesini HeroIntroArt'ın
 *    denetleyicisi sürüyor — ama o hydration'dan sonra. Sayfa logonun varış
 *    eşiğinin ALTINDA açılırsa (orta sayfada yenileme, bfcache'siz geri,
 *    #çapa) header logosu hydration'a dek yok olurdu. Bu yüzden: scroll
 *    eşiği geçince header logosu WAAPI ile görünür, kompozisyon gizli;
 *    geri dönünce iptal. Yolculuk animasyonu yok (hero zaten hydration'a
 *    dek donuk). Denetleyici devralınca `__heroIntroPre.stop()` çağırır.
 *    Eşik heroIntroTiming.ts'ten derleme anında — denetleyiciyle aynı.
 *
 * Reduced-motion: atlama/yeniden başlatma/header yedeği yok, yalnızca font
 * beklemesi (sunucu HTML'i hareketli dalı basıyor; kompozisyon orada da
 * durağan, header logosu CSS'te gizlenmiyor).
 */

import { HERO_INTRO_DOCK_SHARE, HERO_INTRO_PHASE_END } from "./heroIntroTiming";

/** globals.css'teki `.hero-intro-lead` ötelemesi (ms) — ikisi aynı tutulmalı. */
export const HERO_INTRO_LEAD_MS = 3500;
/** Font beklemesinin üst sınırı (ms). Aşılırsa kompozisyon yine açılır. */
const FONT_WAIT_MS = 2000;
/** Intro'nun bitişi (ms, saat başladıktan sonra): dinleyiciler kalkar. */
const INTRO_END_MS = 5400;

export const HERO_INTRO_SCRIPT = `(function(){try{
var w=window,d=document,root=d.querySelector(".hero-intro-lead");
if(!root||!root.getAnimations||!w.matchMedia)return;
var motion=!w.matchMedia("(prefers-reduced-motion: reduce)").matches,LEAD=${HERO_INTRO_LEAD_MS};
var art=root.querySelector(".hero-intro-art"),hold=null,shown=false,done=false,timer;
var ev=["scroll","wheel","touchstart","pointerdown","keydown"],o={capture:true,passive:true};
function each(fn){var l=root.getAnimations({subtree:true});for(var i=0;i<l.length;i++){var a=l[i],n=a.animationName||"";
if(n.indexOf("hero-intro-")===0)fn(a,0);
else if(n==="hero-rise-in"||n==="hero-sub-rise-in"){var t=a.effect.getTiming();if(t.delay>=LEAD&&a.currentTime<t.delay)fn(a,t.delay)}}}
function off(){for(var i=0;i<ev.length;i++)w.removeEventListener(ev[i],skip,o);clearTimeout(timer)}
function skip(){if(done)return;done=true;off();try{var now=d.timeline.currentTime;
each(function(a,delay){if(!delay)a.finish();else{a.effect.updateTiming({delay:delay-LEAD});a.startTime=now}})}catch(e){}}
function show(){if(shown)return;shown=true;try{if(hold)hold.cancel();
if(motion&&!done){var now=d.timeline.currentTime;each(function(a){a.startTime=now});timer=setTimeout(off,${INTRO_END_MS})}}catch(e){}}
if(art&&art.animate)hold=art.animate([{opacity:0},{opacity:0}],{duration:1e9});
var F=d.fonts;
if(!F||!F.load||!w.Promise||!hold){show()}else{
var els=[root.querySelector(".hero-statement"),root.querySelector(".hero-intro-sub p"),art.querySelector(".hero-intro-label")],ps=[];
for(var i=0;i<els.length;i++){var e=els[i];if(!e)continue;var s=getComputedStyle(e);
ps.push(F.load(s.fontStyle+" "+s.fontWeight+" 16px "+s.fontFamily,(i===2?art:e).textContent||" "))}
Promise.all(ps).then(show,show);setTimeout(show,${FONT_WAIT_MS})}
if(!motion)return;
var sec=root.closest("section"),logo=d.querySelector(".site-header-logo"),pre=[],docked=false,po={passive:true};
function guard(){try{if(!art||!sec||!logo||!logo.animate||getComputedStyle(art).display==="none")return;
var y=w.scrollY-(sec.getBoundingClientRect().top+w.scrollY),on=y>=${HERO_INTRO_PHASE_END * HERO_INTRO_DOCK_SHARE}*Math.max(sec.offsetHeight-root.offsetHeight,1);
if(on===docked)return;docked=on;
if(on){pre=[logo.animate([{opacity:1},{opacity:1}],{duration:1e9}),art.animate([{opacity:0},{opacity:0}],{duration:1e9})]}
else{for(var i=0;i<pre.length;i++)pre[i].cancel();pre=[]}}catch(e){}}
w.__heroIntroPre={stop:function(){w.removeEventListener("scroll",guard,po);for(var i=0;i<pre.length;i++)pre[i].cancel();pre=[]}};
w.addEventListener("scroll",guard,po);guard();
if(w.scrollY>0){skip();return}
for(var j=0;j<ev.length;j++)w.addEventListener(ev[j],skip,o);
}catch(e){}})();`;
