/**
 * İletişim bilgilerinin TEK KAYNAĞI. Değerler
 * docs/tanyasan-com-yeniden-tasarim-brief.md §7'den ("mevcut siteden
 * taşınacaklar") birebir alındı.
 *
 * Şimdilik tek tüketicisi /iletisim; footer kurulduğunda o da buradan
 * okuyacak — telefon/adres iki yerde kopyalanmasın diye baştan ayrı bir
 * modül (navLinks.ts ve services.ts ile aynı desen).
 */

const ADDRESS_LINES = [
  "Hurma Mh. 255 Sk. No:37/7",
  "07130 Konyaaltı / Antalya",
] as const;

export const CONTACT = {
  email: "tan@tanyasan.com",

  /** Görünen hâli boşluklu, href'i E.164 — ikisi ayrı tutulmalı. */
  phone: {
    display: "+90 530 691 3612",
    href: "tel:+905306913612",
  },

  address: {
    lines: ADDRESS_LINES,
    /**
     * Gömülü harita yok (design-system §11): iframe ~500KB'lık üçüncü parti
     * yük ve Google çerezi getiriyor, sayfanın tipografi + hairline diline de
     * yabancı bir dikdörtgen. Yerine Maps'i dışarıda açan tek bir bağlantı.
     */
    directionsHref: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      ADDRESS_LINES.join(" "),
    )}`,
  },
} as const;
