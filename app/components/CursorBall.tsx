"use client";

import { useEffect, useRef } from "react";

/**
 * Hayler referansının imleci (Ekim 2026): native ok imlecinin yerine
 * işaretçiyi hafif gecikmeyle izleyen küçük amber bir KARE ("ball").
 *
 *   default — 14px kare, köşe 2px (Hayler: 14px, radius 2px)
 *   link    — tıklanabilir öğe üstünde büyüyüp yarı saydam bir daireye döner
 *             (Hayler'in "highlight" hâli); hassasiyet için ortada nokta kalır
 *   drag    — `data-cursor="drag"` alanlarında (anasayfa galerisi) etiketli
 *             daire: "SÜRÜKLE"
 *   hidden  — metin girişleri ve KENDİ imleci olan alanlar (hero /
 *             raylardaki "çember içinde ok"). Hayler topu logoda da gizliyor
 *             ama orada native imleç görünür kalıyor; burada native gizli
 *             olduğu için logo normal link hâlini alıyor — imleçsiz alan yok.
 *
 * HANGİ ALANDA GÖRÜNECEĞİNE CSS KARAR VERİYOR: top yalnızca altındaki
 * elemanın hesaplanmış `cursor`ı `none` olduğunda görünür (globals.css
 * ÖZEL İMLEÇ bloğu `html[data-cursor-ball="on"]` altında ok/pointer'ı
 * `none` yapıyor). Scroll imleci (`url(scroll-*.svg)`), `text`,
 * `not-allowed` olduğu gibi kalıyor ve top o alanlarda kendiliğinden
 * gizleniyor — ikinci bir seçici listesi tutulmuyor.
 *
 * Bayrak (`data-cursor-ball`) yalnızca JS çalışıp bileşen mount olunca
 * yazılıyor: hidrasyondan önce ya da JS kapalıyken native SVG imleçleri
 * (arrow/pointer) geçerli, kullanıcı hiçbir an imleçsiz kalmıyor.
 *
 * Yalnızca `(hover: hover) and (pointer: fine)` + forced-colors kapalıyken.
 * rAF döngüsü yalnızca top hedefe yaklaşana dek döner, sonra durur.
 */
const INTERACTIVE = 'a, button, [role="button"], summary, label[for], select';
const FOLLOW = 0.3;

export default function CursorBall() {
  const ballRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ball = ballRef.current;
    if (!ball) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const forced = window.matchMedia("(forced-colors: active)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || forced.matches) return;

    const root = document.documentElement;
    root.dataset.cursorBall = "on";

    const target = { x: -100, y: -100 };
    const pos = { x: -100, y: -100 };
    let seen = false;
    let raf = 0;
    let lastEl: Element | null = null;

    const paint = () => {
      ball.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
    };

    const loop = () => {
      const k = reduced.matches ? 1 : FOLLOW;
      pos.x += (target.x - pos.x) * k;
      pos.y += (target.y - pos.y) * k;
      paint();
      if (Math.abs(target.x - pos.x) + Math.abs(target.y - pos.y) > 0.2) {
        raf = requestAnimationFrame(loop);
      } else {
        pos.x = target.x;
        pos.y = target.y;
        paint();
        raf = 0;
      }
    };

    const classify = (el: Element) => {
      const declared = el.closest<HTMLElement>("[data-cursor]")?.dataset.cursor;
      let state = "default";
      if (getComputedStyle(el).cursor !== "none") state = "hidden";
      else if (declared === "drag") state = "drag";
      else if (el.closest(INTERACTIVE)) state = "link";
      ball.dataset.state = state;
      // Amber zeminde amber top görünmez — orada mürekkep rengine döner.
      ball.dataset.onAccent = el.closest(".surface-accent") ? "true" : "false";
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      target.x = event.clientX;
      target.y = event.clientY;
      if (!seen) {
        seen = true;
        pos.x = target.x;
        pos.y = target.y;
        ball.dataset.visible = "true";
      }
      // Hedef eleman değiştiğinde (ör. scroll altından bir link geçirdiğinde
      // pointerover tetiklenmez) yeniden sınıflandır — move başına bir kez
      // karşılaştırma, getComputedStyle yalnızca değişimde.
      const el = event.target instanceof Element ? event.target : null;
      if (el && el !== lastEl) {
        lastEl = el;
        classify(el);
      }
      if (!raf) raf = requestAnimationFrame(loop);
    };

    // Scroll, işaretçi kıpırdamadan altındaki elemanı değiştirir.
    const onScroll = () => {
      if (!seen) return;
      const el = document.elementFromPoint(target.x, target.y);
      if (el && el !== lastEl) {
        lastEl = el;
        classify(el);
      }
    };

    const onLeave = (event: PointerEvent) => {
      if (!event.relatedTarget) ball.dataset.visible = "false";
    };
    const onEnter = () => {
      if (seen) ball.dataset.visible = "true";
    };
    const onDown = () => (ball.dataset.pressed = "true");
    const onUp = () => (ball.dataset.pressed = "false");

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointerout", onLeave);
    document.addEventListener("pointerover", onEnter);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    return () => {
      cancelAnimationFrame(raf);
      delete root.dataset.cursorBall;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("pointerout", onLeave);
      document.removeEventListener("pointerover", onEnter);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div
      ref={ballRef}
      className="cursor-ball"
      data-state="default"
      data-visible="false"
      aria-hidden="true"
    >
      <div className="cursor-ball__shape">
        <span className="cursor-ball__label">Sürükle</span>
      </div>
    </div>
  );
}
