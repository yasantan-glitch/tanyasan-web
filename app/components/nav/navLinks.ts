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

/**
 * Ekim 2026: menü Hayler referansının sırasına geçti (Index – Services –
 * Portfolio – About – Blog – Contact); "Index"in Türkçe karşılığı
 * "Anasayfa" ilk sıraya eklendi. `isActive("/")` yalnızca tam eşleşmede
 * true döner — prefix kuralı "/"'ı her sayfada aktif gösterirdi.
 */
export const NAV_LINKS: readonly NavLink[] = [
  { href: "/", label: "Anasayfa" },
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
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
