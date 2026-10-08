import type { Metadata } from "next";

/**
 * Sayfaya özel openGraph + twitter etiketleri. Aksi halde alt sayfalar
 * anasayfanın og:title / og:url değerlerini miras alıyor. Blog sayfalarındaki
 * kalıbın aynısı; url metadataBase'e göre mutlak URL'ye çözülür.
 */
export function socialMetadata(opts: {
  title: string;
  description: string;
  path: string;
}): Pick<Metadata, "openGraph" | "twitter"> {
  const { title, description, path } = opts;
  return {
    openGraph: {
      type: "website",
      locale: "tr_TR",
      siteName: "Tan Yasan Reklam ve Tasarım Ajansı",
      title,
      description,
      url: path,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          type: "image/png",
          alt: "Tan Yasan Reklam ve Tasarım Ajansı — Antalya Web Tasarım & Yazılım Ajansı",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
  };
}
