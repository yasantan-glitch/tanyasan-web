"use client";

import { ArrowUp } from "lucide-react";

/** Hayler'in "Back to Top"u: daire içinde ok + yuvarlanan etiket. Yumuşak
 * scroll; reduced-motion'da tarayıcı zaten anlık atlıyor (globals.css). */
export default function BackToTop() {
  return (
    <button
      type="button"
      className="footer-top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <span className="footer-top__icon" aria-hidden="true">
        <ArrowUp strokeWidth={1.5} />
      </span>
      <span className="footer-top__text">
        <span data-label="Başa Dön">Başa Dön</span>
      </span>
    </button>
  );
}
