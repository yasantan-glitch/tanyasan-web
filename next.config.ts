import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Brief §4: eski sitenin `/grafik-tasarim` sayfası `/portfolyo`'ya 301 ile
   * yönlendirilir — arama motorlarında biriken değer korunur.
   * `permanent: true` Next'te 308 üretir; brief açıkça 301 istediği için
   * `statusCode` elle veriliyor.
   */
  /**
   * Hero klipleri ve posterleri tekrar ziyarette ağa gitmesin. `immutable`
   * DEĞİL: dosya adları sürümlü değil, klip değiştirilince en geç bir gün
   * sonra (arka planda yenilenerek) yenisi gelir.
   */
  async headers() {
    return [
      {
        source: "/hero-videos/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },

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
