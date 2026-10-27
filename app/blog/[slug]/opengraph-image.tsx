import fs from "node:fs";
import path from "node:path";

import { ImageResponse } from "next/og";

import {
  categoryName,
  getPostBySlug,
  getPublishedPosts,
} from "@/app/content/blog";

export const alt = "Tan Yasan Reklam ve Tasarım Ajansı blog yazısı";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Yalnızca yayındaki yazılar için build zamanında üretilir (sayfayla aynı liste). */
export function generateStaticParams() {
  return getPublishedPosts().map((post) => ({ slug: post.slug }));
}

/** Başlık uzunluğuna göre punto: uzun başlık da 3 satıra sığsın. */
function titleSize(title: string): number {
  if (title.length > 80) return 50;
  if (title.length > 60) return 56;
  if (title.length > 40) return 64;
  return 72;
}

/**
 * /blog/[slug] paylaşım görseli (1200×630). Kök `app/opengraph-image.tsx` ile
 * aynı koyu zemin + altın vurgu; üstte logo, ortada yazı başlığı, altta
 * kategori ve alan adı. Yazı bulunamazsa (taslak vb.) genel başlıkla düşer.
 */
export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  const title = post?.title ?? "Tan Yasan Reklam ve Tasarım Ajansı";
  const category = post ? categoryName(post.category) : "Blog";

  const logo = fs.readFileSync(path.join(process.cwd(), "public", "Logo_Beyaz.svg"));
  const logoSrc = `data:image/svg+xml;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 80px",
          background: "#141414",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} alt="" width={280} height={87} />
          <div
            style={{
              display: "flex",
              fontSize: 26,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#e8ae30",
            }}
          >
            {category}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              width: 96,
              height: 6,
              background: "#e8ae30",
              marginBottom: 36,
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: titleSize(title),
              lineHeight: 1.15,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#9a9a9a",
          }}
        >
          tanyasan.com/blog
        </div>
      </div>
    ),
    size,
  );
}
