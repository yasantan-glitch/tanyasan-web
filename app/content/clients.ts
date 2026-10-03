/**
 * "Çalıştığım Firmalar" bandının TEK KAYNAĞI (anasayfa bant 3, Ekim 2026 —
 * eski "Öne Çıkan İş" bandının yerine). gertix.studio'nun "OUR CLIENTS"
 * logo ızgarası referans alındı.
 *
 * LOGOSU OLAN firma `logo` alanıyla gelir (`public/images/musteriler/`
 * altına konur; SVG ya da şeffaf PNG tercih edilir). LOGOSU OLMAYAN firma
 * yalnızca `name` ile girilir — bant onu bir yazı markası olarak basar.
 * İkisi aynı hücrede, aynı ölçüde durur; karışık liste sorun değil.
 *
 * GEÇİCİ LİSTE: kullanıcının kendi firma/logo listesi gelene kadar burada
 * portfolyo.ts'teki işlerin markaları (gerçek müşteriler, uydurma değil)
 * logosuz duruyor. Liste gelince bu dizi olduğu gibi değiştirilir.
 *
 * `name` BÜYÜK HARFLE yazılır — `portfolio.ts`'teki Türkçe büyütme notu
 * (<html lang="tr"> altında "i" → "İ"): "RIXOS" doğru kalsın diye.
 */
export interface Client {
  /** BÜYÜK HARF. Logo varsa `alt` metninde de kullanılır. */
  name: string;
  /** `public/` köküne göre yol; yoksa isim yazı markası olarak basılır. */
  logo?: string;
  /** Opsiyonel dış bağlantı (firmanın sitesi). */
  href?: string;
}

export const CLIENTS: readonly Client[] = [
  { name: "RIXOS PREMIUM BODRUM" },
  { name: "GOLDEN ROSE TERRA CITY" },
  { name: "NUR PASTANELERİ" },
  { name: "POYRAZ GAYRİMENKUL" },
  { name: "POYRAZ GLOBAL" },
  { name: "WELLNESS ANTALYA" },
  { name: "ANEMON DENTAL CLINIC" },
  { name: "KEMER MASTER CUP" },
  { name: "EVİM DOOR" },
  { name: "HOOP VİZE" },
  { name: "ZENGES ENERJİ" },
  { name: "MAVİ AKDENİZ" },
  { name: "YÜNER HALI" },
  { name: "TRIO AKADEMİ" },
  { name: "GİZEMERDEM" },
  { name: "HEDEF SPOR KULÜBÜ" },
  { name: "SUUFLE" },
  { name: "TÜRKSOY" },
  { name: "ALVİS PURE BEAUTY" },
  { name: "MAXIUMU" },
];
