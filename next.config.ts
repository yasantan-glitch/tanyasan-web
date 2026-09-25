import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
