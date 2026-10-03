"use client";

import { useEffect, useState, type RefObject } from "react";

export type HeaderTone = "dark" | "light";

export interface HeaderToneState {
  tone: HeaderTone;
  /** Header'ın arkasındaki bölümün zemin rengi; `null` → gradyan kapalı. */
  gradient: string | null;
  /** Amber zemin (footer): logonun amber "TAN"ı ve amber buton kaybolur —
   * header tek renk mürekkebe geçiyor. */
  accent: boolean;
}

const INITIAL: HeaderToneState = { tone: "dark", gradient: null, accent: false };

/**
 * Header'ın ALTINDAKİ bölümü okuyup tonu (koyu/açık) ve gradyan rengini
 * türetir — Hayler referansının davranışı (Ekim 2026): header hep şeffaf,
 * logo ve link rengi altından geçen bölüme göre beyaz ↔ koyu döner, arkasına
 * o bölümün zemin renginden şeffafa inen bir gradyan iner.
 *
 * NEDEN `elementsFromPoint` ve IntersectionObserver DEĞİL: bölüm tonu her
 * zaman bir `<section>`ın sınıfından gelmiyor — /portfolyo'nun üst üste
 * binen kartları sticky bir sahnenin İÇİNDE, hero'nun beyaz kapanışı bir
 * katmanın inline opaklığında. Header çizgisinin tam altındaki elemana
 * sormak üç durumu da tek kuralla çözüyor. Ton kaynağı sırasıyla:
 *   1. `.hero-stage` içi → `.hero-bg-wash`ın inline opaklığı (hero'nun kendi
 *      motoru her karede yazıyor; burada yalnızca OKUNUYOR, hero'ya
 *      dokunulmuyor). Koyu hero'da gradyan YOK — video görünür kalsın, eski
 *      scrim okunurluğu veriyor.
 *   2. En yakın `[data-header-tone]` → açık beyan (ör. portfolyo kartları).
 *   3. En yakın yüzey sınıfı: `.surface-ink` → koyu; `.surface-paper`,
 *      `.on-paper`, `.surface-accent` → açık.
 *
 * MALİYET: pasif scroll dinleyicisi rAF ile karede en çok bir kez çalışır,
 * tek bir hit-test yapar ve React state'ini YALNIZCA ton/renk değiştiğinde
 * yazar. Zemin rengi (`getComputedStyle`) yalnızca altındaki eleman
 * değiştiğinde okunur. docs/CLAUDE.md'deki "scroll dinleyicisi" istisna
 * listesine eklendi.
 */
export function useHeaderTone(
  headerRef: RefObject<HTMLElement | null>,
  routeKey: string
): HeaderToneState {
  const [state, setState] = useState<HeaderToneState>(INITIAL);

  useEffect(() => {
    let queued = false;
    let heroPoll: number | undefined;
    let heroStable = 0;
    let lastLight: boolean | null = null;
    let lastHit: Element | null = null;
    let lastBg: string | null = null;

    const backgroundOf = (from: Element): string | null => {
      for (let node: Element | null = from; node; node = node.parentElement) {
        const bg = getComputedStyle(node).backgroundColor;
        if (bg && bg !== "transparent" && !/rgba\(.*,\s*0\)$/.test(bg)) {
          return bg;
        }
      }
      return null;
    };

    const resolve = () => {
      queued = false;
      const header = headerRef.current;
      if (!header) return;

      const probeY = Math.round(header.offsetHeight / 2);
      const hit = document
        .elementsFromPoint(8, probeY)
        .find((el) => !header.contains(el) && !el.closest("[data-header-ignore]"));
      if (!hit) return;

      let next: HeaderToneState;
      if (hit.closest(".hero-stage")) {
        // Hero'nun motoru opaklığı KENDİ rAF'ında yazıyor; bu okuma o
        // kareden önce düşebilir ve scroll durunca bir daha tetiklenmezdi.
        // Hero altındayken düşük frekansla yeniden bak (tek hit-test).
        const wash = document.querySelector<HTMLElement>(".hero-bg-wash");
        const light = parseFloat(wash?.style.opacity || "0") > 0.5;
        // Sonuç birkaç kez üst üste aynıysa dur; bir scroll yeniden başlatır.
        heroStable = light === lastLight ? heroStable + 1 : 0;
        lastLight = light;
        window.clearTimeout(heroPoll);
        if (heroStable < 5) heroPoll = window.setTimeout(schedule, 150);
        next = light
          ? { tone: "light", gradient: "var(--color-paper-0)", accent: false }
          : { tone: "dark", gradient: null, accent: false };
      } else {
        const declared = hit.closest<HTMLElement>(
          "[data-header-tone], .surface-ink, .surface-paper, .surface-accent, .on-paper"
        );
        const tone: HeaderTone =
          declared?.dataset.headerTone === "light" ||
          (!declared?.dataset.headerTone &&
            declared?.matches(".surface-paper, .surface-accent, .on-paper"))
            ? "light"
            : "dark";
        if (hit !== lastHit) {
          lastHit = hit;
          lastBg = backgroundOf(hit);
        }
        next = {
          tone,
          gradient: lastBg,
          accent: !declared?.dataset.headerTone && !!declared?.matches(".surface-accent"),
        };
      }

      setState((prev) =>
        prev.tone === next.tone &&
        prev.gradient === next.gradient &&
        prev.accent === next.accent
          ? prev
          : next
      );
    };

    function schedule(event?: Event) {
      if (event) heroStable = 0;
      if (queued) return;
      queued = true;
      requestAnimationFrame(resolve);
    }

    schedule();
    // Sayfa geçişinden sonra içerik ilk karede henüz boyanmamış olabilir.
    const settle = window.setTimeout(schedule, 120);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // Portfolyo kartı açılıp kapanınca altındaki eleman değişebilir.
    document.addEventListener("header-tone:refresh", schedule);
    return () => {
      window.clearTimeout(settle);
      window.clearTimeout(heroPoll);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("header-tone:refresh", schedule);
    };
  }, [headerRef, routeKey]);

  return state;
}
