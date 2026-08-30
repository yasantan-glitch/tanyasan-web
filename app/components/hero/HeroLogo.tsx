"use client";

import { LOGO_WORDMARK_ELEMENTS, type LogoElement } from "./logoData";

// Wordmark elemanları yalnızca viewBox'ın üst kısmını (y 11-190.8) kaplıyor;
// tam 0 0 1080 335 kullanmak alt tarafta boş alan bırakır. Sıkı kırpılmış
// viewBox, logonun hero'da gereksiz padding olmadan render olmasını sağlar.
const WORDMARK_VIEWBOX = "0 4 1080 200";

const FILL_COLOR: Record<"st0" | "st1", string> = {
  st0: "#ffffff",
  st1: "#e8ae30",
};

/**
 * Statik, tamamen dolu logo — nav'ın tek logo kaynağı (hero'nun kendi
 * çizim katmanı kaldırıldı; faz 1 artık tipografik bir statement).
 * Yalnızca "TANYASAN" logotype'ı (monogram + wordmark) — bkz. logoData.ts.
 */
export function HeroLogoSolid({
  className,
  elements = LOGO_WORDMARK_ELEMENTS,
}: {
  className?: string;
  elements?: LogoElement[];
}) {
  return (
    <svg
      className={className}
      viewBox={WORDMARK_VIEWBOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Tan Yasan"
      role="img"
    >
      {elements.map((el, i) =>
        el.type === "polygon" ? (
          <polygon key={i} points={el.points} fill={FILL_COLOR[el.fill]} />
        ) : (
          <path key={i} d={el.d} fill={FILL_COLOR[el.fill]} />
        )
      )}
    </svg>
  );
}
