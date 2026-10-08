import type { NextConfig } from "next";

/**
 * public/ altındaki statik dosyalar (hero klipleri, posterler, logolar,
 * görseller, imleçler) tekrar ziyarette ağa gitmesin. `immutable` DEĞİL:
 * dosya adları sürümlü değil, dosya değiştirilince en geç bir gün sonra
 * (arka planda yenilenerek) yenisi gelir.
 */
const PUBLIC_ASSET_CACHE = [
  {
    key: "Cache-Control",
    value: "public, max-age=86400, stale-while-revalidate=604800",
  },
];

const nextConfig: NextConfig = {
  /**
   * CSS <link> yerine <head>'de <style> (Ekim 2026, mobil LCP). Ölçüm
   * (1.6 Mb/s, 150 ms RTT, CPU 4×): render-blocking globals.css chunk'ı
   * altı font preload'uyla bant genişliğini paylaşıp ~1.9 s'de bitiyordu;
   * header logosu ~870 ms'de inmiş olsa da ilk boyama CSS'i bekliyordu
   * (PSI: "element render delay" 1,980 ms). Satır içi CSS'le logo ~0.4 s'de
   * boyanıyor. Bedeli: HTML ~20 KB (sıkıştırılmış) büyüyor — ilk yüklemede
   * CSS RSC payload'ında da tekrar ediyor — ve CSS sert yüklemeler arasında
   * ayrıca önbelleklenmiyor. İstemci tarafı gezinmeler CSS'i yeniden
   * indirmiyor. Yalnızca production build'de etkin.
   */
  experimental: {
    inlineCss: true,
  },

  async headers() {
    return [
      { source: "/hero-videos/:path*", headers: PUBLIC_ASSET_CACHE },
      { source: "/images/:path*", headers: PUBLIC_ASSET_CACHE },
      { source: "/cursors/:path*", headers: PUBLIC_ASSET_CACHE },
      { source: "/Logo.svg", headers: PUBLIC_ASSET_CACHE },
      { source: "/Logo_Beyaz.svg", headers: PUBLIC_ASSET_CACHE },
    ];
  },

  /**
   * Brief §4: eski sitenin `/grafik-tasarim` sayfası `/portfolyo`'ya 301 ile
   * yönlendirilir — arama motorlarında biriken değer korunur.
   * `permanent: true` Next'te 308 üretir; brief açıkça 301 istediği için
   * `statusCode` elle veriliyor.
   */
  async redirects() {
    return [
      {
        source: "/grafik-tasarim",
        destination: "/portfolyo",
        statusCode: 301,
      },
    ];
  },
};

export default nextConfig;
