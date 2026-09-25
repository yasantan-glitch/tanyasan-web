"use client";

import { useEffect } from "react";

/**
 * Sayfanın SON kaydırma yönünü `<html data-scroll-dir="up|down">` olarak
 * yazar — yalnızca özel scroll imlecinin (globals.css, public/cursors/
 * scroll-up|down.svg) oku doğru yöne çevirmesi için. Render etmez.
 *
 * Bu bir scroll MOTORU DEĞİL: hiçbir şey sürmüyor, tek bir bayrak tutuyor.
 * docs/CLAUDE.md'deki "nav ikinci bir scroll listener eklemez" kuralının
 * BELGELENMİŞ istisnası: o kuralın gerekçesi her karede iş yapmamaktı;
 * burada dinleyici pasif, rAF ile karede en çok bir kez çalışıyor, yalnızca
 * iki sayıyı karşılaştırıyor ve DOM'a yalnızca YÖN DEĞİŞTİĞİNDE yazıyor.
 * Ölü bölge (DEADBAND) trackpad'in birkaç piksellik geri tepmesinin oku
 * titretmesini engelliyor.
 */
const DEADBAND = 4;

export default function ScrollDirection() {
  useEffect(() => {
    const root = document.documentElement;
    let lastY = window.scrollY;
    let dir: "up" | "down" | null = null;
    let queued = false;

    const update = () => {
      queued = false;
      const y = window.scrollY;
      const delta = y - lastY;
      if (Math.abs(delta) < DEADBAND) return;
      lastY = y;
      const next = delta > 0 ? "down" : "up";
      if (next !== dir) {
        dir = next;
        root.dataset.scrollDir = next;
      }
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      delete root.dataset.scrollDir;
    };
  }, []);

  return null;
}
