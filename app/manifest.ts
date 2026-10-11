import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tan Yasan Reklam ve Tasarım Ajansı",
    short_name: "Tan Yasan",
    start_url: "/",
    display: "standalone",
    background_color: "#202020",
    theme_color: "#202020",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
