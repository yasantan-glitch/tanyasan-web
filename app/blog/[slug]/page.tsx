import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { NAV_CTA } from "@/app/components/nav/navLinks";
import { formatBlogDate, getPostBySlug, getPublishedPosts } from "@/app/content/blog";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Yalnızca yayında (draft olmayan) yazılar statik olarak üretilir — bir
 * taslağın URL'i tahmin edilirse de `notFound()` devreye girer, §aşağıya. */
export function generateStaticParams() {
  return getPublishedPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} — Tan Yasan Blog`,
    description: post.excerpt,
  };
}

/**
 * /blog/[slug] — tek yazı sayfası. Görsel yok (design-system §9'un "medya
 * yalnızca hero'nun imzası" kararı burada da geçerli), sayfa tipografi +
 * hairline.
 *
 * layout.tsx zaten <main id="icerik"> sağlıyor — burada ikinci bir <main>
 * AÇILMAZ.
 */
export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <section className="surface-ink surface-ink-deep px-(--spacing-gutter) pb-(--spacing-section-tight) pt-[calc(var(--nav-h)+var(--spacing-section))]">
        <div className="mx-auto max-w-(--container-site)">
          <Link href="/blog" className="eyebrow text-accent-auto">
            ← Blog
          </Link>
          <p className="eyebrow text-muted mt-8">
            {formatBlogDate(post.date)} · {post.category.title}
          </p>
          <h1
            className="font-display text-strong mt-6 max-w-(--container-prose)"
            style={{
              fontSize: "var(--text-display-2xl)",
              lineHeight: "var(--text-display-2xl--line-height)",
              letterSpacing: "var(--text-display-2xl--letter-spacing)",
              fontWeight: "var(--text-display-2xl--font-weight)",
            }}
          >
            {post.title}
          </h1>
        </div>
      </section>

      <section className="surface-paper px-(--spacing-gutter) py-(--spacing-section)">
        <div className="mx-auto max-w-(--container-site)">
          {/* marked ile derleme zamanında üretilen, yazının kendi
              Markdown'ından gelen HTML. */}
          <div className="blog-prose text-body" dangerouslySetInnerHTML={{ __html: post.html }} />
        </div>
      </section>

      <section className="surface-ink surface-ink-deep px-(--spacing-gutter) py-(--spacing-section)">
        <div className="mx-auto flex max-w-(--container-site) flex-wrap items-end justify-between gap-8">
          <p
            className="font-display text-strong max-w-[18ch]"
            style={{
              fontSize: "var(--text-display-xl)",
              lineHeight: "var(--text-display-xl--line-height)",
              letterSpacing: "var(--text-display-xl--letter-spacing)",
              fontWeight: "var(--text-display-xl--font-weight)",
            }}
          >
            İŞİNİZİN GÖRÜNEN YÜZÜNÜ DE ARKASINI DA KONUŞALIM.
          </p>
          <Link href={NAV_CTA.href} className="btn btn-accent eyebrow">
            {NAV_CTA.label}
          </Link>
        </div>
      </section>
    </>
  );
}
