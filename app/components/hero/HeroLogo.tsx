"use client";

import { LOGO_WORDMARK_ELEMENTS, type LogoElement } from "./logoData";

// Wordmark elemanları yalnızca viewBox'ın üst kısmını (y 11-190.8) kaplıyor;
// tam 0 0 1080 335 kullanmak alt tarafta boş alan bırakır. Sıkı kırpılmış
// viewBox, logonun hero'da gereksiz padding olmadan render olmasını sağlar.
// Hero intro'su (HeroIntroArt) da aynı kutuyu kullanıyor: dolgu, kontur ve
// üçgen ayrı SVG'ler, aynı viewBox sayesinde üst üste birebir oturuyor.
export const WORDMARK_VIEWBOX = "0 4 1080 200";

const FILL_COLOR: Record<"st0" | "st1", string> = {
  st0: "#ffffff",
  st1: "#e8ae30",
};

/** `decorative`: süs katmanı — erişilebilir adı yok, ekran okuyucudan gizli. */
function a11yProps(decorative: boolean) {
  return decorative
    ? ({ "aria-hidden": true, focusable: "false" } as const)
    : ({ "aria-label": "Tan Yasan", role: "img" } as const);
}

function LogoShape({ el, ...paint }: { el: LogoElement } & React.SVGProps<SVGPathElement>) {
  return el.type === "polygon" ? (
    <polygon points={el.points} {...(paint as React.SVGProps<SVGPolygonElement>)} />
  ) : (
    <path d={el.d} {...paint} />
  );
}

/**
 * Statik, tamamen dolu logo. Yalnızca "TANYASAN" logotype'ı (monogram +
 * wordmark) — bkz. logoData.ts.
 */
export function HeroLogoSolid({
  className,
  elements = LOGO_WORDMARK_ELEMENTS,
  decorative = false,
  viewBox = WORDMARK_VIEWBOX,
}: {
  className?: string;
  elements?: LogoElement[];
  decorative?: boolean;
  /** Varsayılan: sıkı kırpılmış wordmark kutusu. Tam logo için LOGO_VIEWBOX. */
  viewBox?: string;
}) {
  return (
    <svg
      className={className}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...a11yProps(decorative)}
    >
      {elements.map((el, i) => (
        <LogoShape key={i} el={el} fill={FILL_COLOR[el.fill]} />
      ))}
    </svg>
  );
}

/**
 * Aynı geometrinin yalnızca konturu (dolgu yok). Çizgi kalınlığı ekran
 * pikselinde sabit (`non-scaling-stroke`) — logo hangi boyutta çizilirse
 * çizilsin 1px'lik bir "inşa çizgisi" olarak okunuyor. Renk `currentColor`.
 */
export function HeroLogoOutline({
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
      stroke="currentColor"
      strokeWidth={1}
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      {...a11yProps(true)}
    >
      {elements.map((el, i) => (
        <LogoShape key={i} el={el} vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}
