/**
 * Sosyal medya hesaplarının TEK KAYNAĞI — /iletisim ve ileride footer aynı
 * diziyi okur.
 *
 * ŞU AN BOŞ, BİLİNÇLİ OLARAK. Eski tanyasan.com'da Facebook / Instagram /
 * LinkedIn / Pinterest bağlantıları vardı ama brief bu adresleri hiç
 * vermiyor; uydurma veya yer tutucu URL yazmak kırık bir link demek olurdu.
 * Dizi boş kaldığı sürece /iletisim sayfası sosyal medya bölümünü hiç
 * render etmiyor (bkz. app/iletisim/page.tsx) — adresler gelince buraya
 * eklemek yeterli, başka hiçbir dosya değişmez.
 *
 * Beklenen biçim:
 *   { label: "Instagram", href: "https://www.instagram.com/..." }
 */
export interface SocialLink {
  label: string;
  href: string;
}

export const SOCIAL_LINKS: readonly SocialLink[] = [];
