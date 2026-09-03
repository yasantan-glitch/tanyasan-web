import type { Metadata } from "next";
import Link from "next/link";

import { NAV_CTA } from "@/app/components/nav/navLinks";
import { formatBlogDate, getPublishedPosts } from "@/app/content/blog";

export const metadata: Metadata = {
  title: "Blog — Tan Yasan Reklam ve Tasarım Ajansı",
  description:
    "Grafik tasarım, dijital pazarlama, web tasarımı ve yazılım geliştirme üzerine yazılar.",
};

/**
 * /blog — brief §8: "altyapı şimdi, içerik sonra". `content/blog/*.md`'de
 * yayında (draft olmayan) yazı yoksa liste yerine dürüst bir boş durum
 * gösterilir; "Yakında" değil, ne yazılacağını söyleyen kısa bir metin +
 * iletişim CTA'sı (bkz. content/blog/README.md — yazı eklemek için).
 *
 * Kart yok, hairline satırlar — sitenin geri kalanıyla aynı dil (§4).
 *
 * layout.tsx zaten <main id="icerik"> sağlıyor — burada ikinci bir <main>
 * AÇILMAZ.
 */
export default function BlogPage() {
  const posts = getPublishedPosts();

  return (
    <>
      {/* Başlık bandı. Diğer üç sayfayla (/hizmetler, /hakkimda, /iletisim)
          birebir aynı kalıp. */}
      <section className="surface-ink surface-ink-deep px-(--spacing-gutter) pb-(--spacing-section-tight) pt-[calc(var(--nav-h)+var(--spacing-section))]">
        <div className="mx-auto max-w-(--container-site)">
          <p className="eyebrow text-accent-auto mb-6">Blog</p>
          <h1
            className="font-display text-strong"
            style={{
              fontSize: "var(--text-display-2xl)",
              lineHeight: "var(--text-display-2xl--line-height)",
              letterSpacing: "var(--text-display-2xl--letter-spacing)",
              fontWeight: "var(--text-display-2xl--font-weight)",
            }}
          >
            TASARIM VE
            <br />
            YAZILIM ÜZERİNE
          </h1>
        </div>
      </section>

      <section className="surface-paper px-(--spacing-gutter) py-(--spacing-section)">
        <div className="mx-auto max-w-(--container-site)">
          {posts.length > 0 ? (
            <div>
              {posts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-row">
                  <p className="eyebrow text-accent-auto">
                    {formatBlogDate(post.date)} · {post.category.title}
                  </p>
                  <h2
                    className="blog-row-title font-display text-strong mt-3"
                    style={{
                      fontSize: "var(--text-display-lg)",
                      lineHeight: "var(--text-display-lg--line-height)",
                      letterSpacing: "var(--text-display-lg--letter-spacing)",
                      fontWeight: "var(--text-display-lg--font-weight)",
                    }}
                  >
                    {post.title}
                  </h2>
                  <p className="text-muted mt-3 max-w-(--container-prose)">{post.excerpt}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="blog-empty">
              <p className="text-lead">
                Blog henüz boş. Grafik tasarım, dijital pazarlama, web
                tasarımı ve yazılım geliştirme üzerine yazılar yakında burada
                olacak.
              </p>
              <Link href={NAV_CTA.href} className="btn btn-ghost eyebrow mt-8 inline-flex">
                {NAV_CTA.label} →
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
