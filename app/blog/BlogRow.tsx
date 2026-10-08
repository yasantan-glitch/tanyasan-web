import type { CSSProperties } from "react";
import Link from "next/link";

import { formatBlogDate, type BlogPost } from "@/app/content/blog";

interface BlogRowProps {
  post: BlogPost;
  /** Kademeli giriş sırası (`data-enter-stagger` ebeveyninin `--enter-i`'si). */
  index: number;
  /** Listenin ilk (en yeni) yazısı — başlık ve özet bir kademe büyük. */
  featured?: boolean;
  /** /blog'da satır başlığı h2; yazı sayfasının "Diğer yazılar"ında h3
   * (orada bölüm başlığı h2). */
  headingLevel?: "h2" | "h3";
}

/**
 * Tek hairline satır — /blog listesi ve yazı sayfasının "Diğer yazılar"ı
 * aynı bileşeni kullanır. Satırın tamamı TEK link (klavyede tek durak,
 * /portfolyo'nun öne çıkan iş satırıyla aynı karar). Masaüstünde üç sütun:
 * meta | başlık + özet | ok; ilk sütun `.service-grid`in sol sütunuyla aynı
 * genişlikte, başlıklar yazı sayfasındaki metin sütunuyla aynı çizgide
 * başlıyor. ≤860px'te alt alta.
 */
export default function BlogRow({ post, index, featured = false, headingLevel = "h2" }: BlogRowProps) {
  const Heading = headingLevel;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={featured ? "blog-row blog-row--featured" : "blog-row"}
      style={{ "--enter-i": index } as CSSProperties}
    >
      <p className="blog-row-meta eyebrow">
        <time dateTime={post.date} className="text-accent-auto">
          {formatBlogDate(post.date)}
        </time>
        <span>{post.category.title}</span>
        <span>{post.readingMinutes} dk okuma</span>
      </p>
      <div>
        <Heading className="blog-row-title font-display">{post.title}</Heading>
        <p className="blog-row-excerpt text-muted">{post.excerpt}</p>
      </div>
      <span className="blog-row-arrow" aria-hidden="true">
        →
      </span>
    </Link>
  );
}
