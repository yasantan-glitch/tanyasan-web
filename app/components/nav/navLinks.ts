/**
 * Navigasyonun tek kaynağı. Masaüstü menü, mobil drawer ve ileride footer
 * aynı diziyi okur — link listesi iki yerde kopyalanmaz.
 * Adresler docs/tanyasan-com-yeniden-tasarim-brief.md §4'teki site
 * haritasından birebir alındı.
 */
export interface NavLink {
  href: string;
  label: string;
}

export const NAV_LINKS: readonly NavLink[] = [
  { href: "/hizmetler", label: "Hizmetler" },
  { href: "/portfolyo", label: "Portfolyo" },
  { href: "/hakkimda", label: "Hakkımda" },
  { href: "/blog", label: "Blog" },
  { href: "/iletisim", label: "İletişim" },
];

export const NAV_CTA: NavLink = { href: "/iletisim", label: "Teklif Al" };

/**
 * Aktif sayfa işareti. Alt kırılımlar da üst linki aktif göstersin diye
 * prefix eşleşmesi kullanılıyor (/portfolyo/emlak-crm-pro → Portfolyo).
 */
export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
