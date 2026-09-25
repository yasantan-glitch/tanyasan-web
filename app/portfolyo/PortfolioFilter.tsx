"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";

import type { PortfolioItem } from "@/app/content/portfolio";

/**
 * /portfolyo'nun kategori filtresi + grid'i. Kategoriler `PortfolioItem.category`
 * fasetinden TÜRETİLİYOR (ilk görünüş sırasıyla) — elle yazılmış bir liste yok;
 * `portfolio.ts`'e yeni kategoride bir iş eklenince buton kendiliğinden gelir,
 * işi kalmayan kategori (bugün brief §7'nin "WEB TASARIM"ı) hiç görünmez.
 *
 * NEDEN CLIENT STATE, URL DEĞİL: `?kategori=` searchParams sayfayı dinamik
 * render'a çeker; sekiz işlik statik bir sayfa için bu maliyet değmez. Tüm
 * işler SSR'da render ediliyor, filtre yalnızca `hidden` bayrağını çeviriyor —
 * JS kapalıyken butonlar etkisiz kalır ama sekiz işin tamamı görünür durur
 * (varsayılan "TÜMÜ"), yani içerik hiçbir koşulda kaybolmuyor.
 *
 * HAREKET: grid, sitenin mevcut `data-enter-stagger` substratını kullanıyor
 * (globals.css HAREKET SUBSTRATI) — ek motor yok. Reduced-motion ve
 * `animation-timeline` desteksizliği orada zaten çözülü.
 *
 * Çerçeve/künye/boost sınıfları anasayfa bant 4'ün TABAN (ungated) kuralları
 * (`.home-portfolio-frame` vb.) — ray davranışı yalnızca
 * `.home-portfolio-track > figure` altında bağlandığı için buraya sızmıyor.
 * Bkz. docs/design-system.md §13.
 */

const ALL = "TÜMÜ";

type Props = {
  items: readonly PortfolioItem[];
};

export default function PortfolioFilter({ items }: Props) {
  const [active, setActive] = useState<string>(ALL);

  const categories = Array.from(new Set(items.map((item) => item.category)));
  const countOf = (category: string) =>
    category === ALL
      ? items.length
      : items.filter((item) => item.category === category).length;
  const visible = countOf(active);

  return (
    <>
      <div
        className="portfolio-filter"
        role="group"
        aria-label="Kategoriye göre filtrele"
      >
        {[ALL, ...categories].map((category) => (
          <button
            key={category}
            type="button"
            className="eyebrow"
            aria-pressed={active === category}
            onClick={() => setActive(category)}
          >
            {category}
            <span className="portfolio-filter__count">
              {String(countOf(category)).padStart(2, "0")}
            </span>
          </button>
        ))}
      </div>

      {/* Ekran okuyucuya filtre sonucunu söyler; görsel karşılığı butondaki
          sayaç. */}
      <p className="sr-only" aria-live="polite">
        {visible} iş gösteriliyor
      </p>

      <div className="portfolio-grid" data-enter-stagger>
        {items.map((item, index) => (
          <figure
            key={item.src}
            className={item.wide ? "portfolio-item--wide" : undefined}
            hidden={active !== ALL && item.category !== active}
            style={{ "--enter-i": index % 3 } as CSSProperties}
          >
            <div className="home-portfolio-frame">
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes={
                  item.wide
                    ? "(max-width: 860px) 100vw, 62vw"
                    : "(max-width: 860px) 50vw, 31vw"
                }
                className={item.wide ? "home-portfolio-media--boost" : undefined}
                style={{ objectFit: "cover" }}
              />
            </div>
            {/* Künye anasayfa bant 4'ün aynısı: marka / KATEGORİ · ETKİNLİK
                (`event` yalnızca aynı marka+kategori çifti tekrar ederken
                dolu, bkz. portfolio.ts). */}
            <figcaption className="home-portfolio-caption">
              <span className="eyebrow text-strong">{item.brand}</span>
              <span className="eyebrow text-muted mt-1">
                {item.event ? `${item.category} · ${item.event}` : item.category}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}
