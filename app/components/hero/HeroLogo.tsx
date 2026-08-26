"use client";

import { LOGO_WORDMARK_ELEMENTS, type LogoElement } from "./logoData";
import type { MutableRefObject } from "react";

// Wordmark elemanları yalnızca viewBox'ın üst kısmını (y 11-190.8) kaplıyor;
// tam 0 0 1080 335 kullanmak alt tarafta boş alan bırakır. Sıkı kırpılmış
// viewBox, logonun hero'da gereksiz padding olmadan render olmasını sağlar.
const WORDMARK_VIEWBOX = "0 4 1080 200";

const FILL_COLOR: Record<"st0" | "st1", string> = {
  st0: "#ffffff",
  st1: "#e8ae30",
};

/**
 * Statik, tamamen dolu logo — reduced-motion fallback'inde ve hero'nun
 * çizim animasyonu tamamlandıktan sonraki hedef durumunda kullanılır.
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

/**
 * Scroll'a bağlı stroke-dasharray çizim katmanı. Path/polygon uzunlukları
 * mount'ta getTotalLength() ile okunur; stroke-dashoffset her frame'de
 * useHeroScroll'un read() döngüsü tarafından doğrudan bu ref'lere yazılır
 * (React state'e alınmıyor — her scroll frame'inde re-render tetiklememek
 * için, bkz. docs/design-system.md ve hero planı). Yalnızca "TANYASAN"
 * logotype'ı animasyona alınıyor (bkz. logoData.ts).
 */
export function HeroLogoStroke({
  className,
  pathRefs,
}: {
  className?: string;
  pathRefs: MutableRefObject<Array<SVGPathElement | SVGPolygonElement | null>>;
}) {
  return (
    <svg
      className={className}
      viewBox={WORDMARK_VIEWBOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {LOGO_WORDMARK_ELEMENTS.map((el, i) =>
        el.type === "polygon" ? (
          <polygon
            key={i}
            ref={(node) => {
              pathRefs.current[i] = node;
            }}
            points={el.points}
            fill="none"
            stroke={FILL_COLOR[el.fill]}
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
        ) : (
          <path
            key={i}
            ref={(node) => {
              pathRefs.current[i] = node;
            }}
            d={el.d}
            fill="none"
            stroke={FILL_COLOR[el.fill]}
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
        )
      )}
    </svg>
  );
}

export const LOGO_ELEMENT_COUNT = LOGO_WORDMARK_ELEMENTS.length;
