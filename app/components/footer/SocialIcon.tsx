import type { SocialLink } from "@/app/content/socialLinks";

/**
 * Marka ikonları — lucide v1 marka ikonlarını kaldırdı; aynı çizgi dilinde
 * (24 ızgara, 1.5 kontur, yuvarlak uç) elle çizildi. Yeni bir paket
 * eklenmedi.
 */
export default function SocialIcon({ name }: { name: SocialLink["icon"] }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === "facebook" ? (
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      ) : null}
      {name === "instagram" ? (
        <>
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <path d="M17.5 6.5h.01" />
        </>
      ) : null}
      {name === "linkedin" ? (
        <>
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </>
      ) : null}
      {name === "pinterest" ? (
        <>
          <circle cx="12" cy="12" r="10" />
          <path d="M10.6 21.8 12.4 14" />
          <path d="M11.5 15.6c.6.5 1.4.8 2.2.8 2.3 0 3.8-2 3.8-4.6 0-2.9-2.3-4.8-5.3-4.8-3.3 0-5.4 2.2-5.4 4.8 0 1.2.5 2.3 1.2 2.8" />
        </>
      ) : null}
    </svg>
  );
}
