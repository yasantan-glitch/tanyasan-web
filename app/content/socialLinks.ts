/**
 * Sosyal medya hesaplarının TEK KAYNAĞI — /iletisim ve footer aynı diziyi
 * okur. Adresler kullanıcıdan (Ekim 2026). `icon` footer'daki ikonun
 * anahtarı (app/components/footer/SocialIcon.tsx).
 */
export interface SocialLink {
  label: string;
  href: string;
  icon: "facebook" | "instagram" | "linkedin" | "pinterest";
}

export const SOCIAL_LINKS: readonly SocialLink[] = [
  { label: "Facebook", href: "https://www.facebook.com/tan.graphic", icon: "facebook" },
  { label: "Instagram", href: "https://www.instagram.com/tan.graphic/", icon: "instagram" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/tan-yasan-34962866", icon: "linkedin" },
  { label: "Pinterest", href: "https://tr.pinterest.com/yasantan/", icon: "pinterest" },
];
