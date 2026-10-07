import type { MetadataRoute } from "next";

import { getPublishedPosts } from "@/app/content/blog";

const BASE = "https://tanyasan.com";

const STATIC_ROUTES = [
  "/",
  "/hizmetler",
  "/portfolyo",
  "/portfolyo/emlak-crm-pro",
  "/hakkimda",
  "/iletisim",
  "/blog",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...STATIC_ROUTES.map((route) => ({
      url: route === "/" ? BASE : `${BASE}${route}`,
    })),
    ...getPublishedPosts().map((post) => ({
      url: `${BASE}/blog/${post.slug}`,
      lastModified: post.date,
    })),
  ];
}
