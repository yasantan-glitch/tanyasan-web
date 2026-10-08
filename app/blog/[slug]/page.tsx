import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import JsonLd from "@/app/components/seo/JsonLd";
import { NAV_CTA } from "@/app/components/nav/navLinks";
import BlogRow from "@/app/blog/BlogRow";
import {
  categoryName,
  formatBlogDate,
  getPostBySlug,
  getPublishedPosts,
  getRelatedPosts,
} from "@/app/content/blog";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const SITE = "https://tanyasan.com";

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
    title: post.title,
    description: post.excerpt,
    // Çocuk sayfadaki openGraph/twitter, layout'unkini derin birleştirmez,
    // bütünüyle değiştirir; bu yüzden siteName/locale burada yeniden verilir.
    // Görsel: app/opengraph-image.tsx dosya tabanlı olarak eklenir.
    openGraph: {
      type: "article",
      locale: "tr_TR",
      siteName: "Tan Yasan Reklam ve Tasarım Ajansı",
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      publishedTime: post.date,
      ...(post.updated ? { modifiedTime: post.updated } : {}),
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
      title: post.title,
      description: post.excerpt,
      images: ["/opengraph-image"],
    },
  };
}

/**
 * /blog/[slug] — tek yazı sayfası. Görsel yok (design-system §9'un "medya
 * yalnızca hero'nun imzası" kararı burada da geçerli; yazar kutusundaki
 * küçük portre /hakkimda'nın AYNI dosyası), sayfa tipografi + hairline.
 *
 * Düzen diğer gövde sayfalarının kalıbı (bkz. design-system "Blog"):
 * koyu başlık bandı (kırıntı + h1 + lede + meta satırı) → açık gövde,
 * `.service-grid`: solda yapışkan İçindekiler, sağda metin, metnin altında
 * yazar + kapanış bloğu → "Diğer yazılar". Eski koyu kapanış bandı YOK —
 * hemen altındaki amber footer zaten slogan + Teklif Al taşıyor (§13).
 *
 * layout.tsx zaten <main id="icerik"> sağlıyor — burada ikinci bir <main>
 * AÇILMAZ.
 */
export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = getRelatedPosts(post.slug);
  const url = `${SITE}/blog/${post.slug}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt,
          datePublished: post.date,
          dateModified: post.updated ?? post.date,
          image: `${SITE}/opengraph-image`,
          inLanguage: "tr-TR",
          articleSection: categoryName(post.category),
          wordCount: post.wordCount,
          author: { "@type": "Person", name: "Tan Yasan", url: `${SITE}/hakkimda` },
          publisher: { "@id": `${SITE}/#business` },
          mainEntityOfPage: url,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Anasayfa", item: SITE },
            { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
            { "@type": "ListItem", position: 3, name: post.title, item: url },
          ],
        }}
      />

      <article>
        <header className="surface-ink surface-ink-deep px-(--spacing-gutter) pb-(--spacing-section-tight) pt-[calc(var(--nav-h)+var(--spacing-section))]">
          <div className="mx-auto max-w-(--container-page)">
            <nav aria-label="Konum" className="mb-6">
              <ol className="blog-breadcrumb eyebrow">
                <li>
                  <Link href="/">Anasayfa</Link>
                </li>
                <li>
                  <Link href="/blog">Blog</Link>
                </li>
                <li aria-current="page">{post.title}</li>
              </ol>
            </nav>
            <h1
              data-enter="mask"
              className="font-display text-strong max-w-[22ch]"
              style={{
                fontSize: "var(--text-display-2xl)",
                lineHeight: "var(--text-display-2xl--line-height)",
                letterSpacing: "var(--text-display-2xl--letter-spacing)",
                fontWeight: "var(--text-display-2xl--font-weight)",
              }}
            >
              {post.title}
            </h1>
            <p className="text-lead text-muted mt-8 max-w-(--container-prose)">{post.excerpt}</p>

            {/* Meta satırı /hizmetler başlığındaki çapa rayının yerinde ve
                görünüşünde: hairline üst çizgi + mono etiketler. */}
            <ul className="blog-meta eyebrow">
              <li>
                <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
              </li>
              {post.updated ? (
                <li>
                  Güncellendi <time dateTime={post.updated}>{formatBlogDate(post.updated)}</time>
                </li>
              ) : null}
              <li>
                <Link href={`/hizmetler#${post.category.id}`}>{post.category.title}</Link>
              </li>
              <li>{post.readingMinutes} dk okuma</li>
            </ul>
          </div>
        </header>

        {/* Tek yazı varsa "Diğer yazılar" basılmaz; o zaman footer'ın dikiş
            payı bu bölüme düşer. */}
        <section
          className={`surface-paper px-(--spacing-gutter) pt-(--spacing-section) ${
            related.length > 0
              ? "pb-(--spacing-section)"
              : "pb-[calc(var(--spacing-section)+4rem)] max-[860px]:pb-[calc(var(--spacing-section)+2rem)]"
          }`}
        >
          <div className="blog-post service-grid mx-auto max-w-(--container-page)">
            {/* İçindekiler — masaüstünde yapışkan sol sütun (.service-head),
                ≤860px'te gizlenir, yerini metnin üstündeki <details> alır.
                Etkin bölümü izleyen bir scroll-spy YOK: ikinci bir scroll
                listener kurulmuyor (docs/CLAUDE.md). */}
            <aside className="blog-aside service-head">
              <p className="eyebrow text-accent-auto">İçindekiler</p>
              <nav aria-label="İçindekiler">
                <TocList items={post.toc} />
              </nav>
            </aside>

            <div className="blog-body">
              <details className="blog-toc-details">
                <summary className="eyebrow">İçindekiler</summary>
                <nav aria-label="İçindekiler">
                  <TocList items={post.toc} />
                </nav>
              </details>

              {/* marked ile derleme zamanında üretilen, yazının kendi
                  Markdown'ından gelen HTML. */}
              <div className="blog-prose text-body" dangerouslySetInnerHTML={{ __html: post.html }} />

              {/* Yazar — metin /hakkimda'nın lede'inden kısaltılmadan
                  özetlendi, yeni iddia yok. Portre aynı dosya. */}
              <aside aria-label="Yazar" className="blog-author">
                <Image
                  src="/images/tan-yasan-portre.jpg"
                  alt=""
                  width={1200}
                  height={1500}
                  sizes="5rem"
                  className="blog-author-portrait"
                />
                <div>
                  <p className="eyebrow text-accent-auto">Yazar</p>
                  <p className="font-display text-strong blog-author-name">Tan Yasan</p>
                  <p className="text-muted mt-2">
                    Yaklaşık 20 yıllık grafik tasarım ve dijital pazarlama
                    deneyimiyle markalara stratejik iletişim çözümleri
                    geliştiren bir tasarım ve marka yönetimi uzmanı.
                  </p>
                  <Link href="/hakkimda" className="blog-author-link eyebrow mt-4 inline-flex">
                    Hakkımda →
                  </Link>
                </div>
              </aside>

              {/* Kapanış — eski koyu bandın yerine akış içinde, aynı yüzeyde.
                  Birincil eylem iletişim; ikincil eylem yazının kategorisi
                  olan hizmet bölümü. */}
              <div className="blog-endcap">
                <p className="font-display text-strong blog-endcap-title">
                  {categoryName(post.category)} tarafında destek mi lazım?
                </p>
                <p className="text-muted mt-3">
                  İşletmenizin durumunu birlikte değerlendirelim; neyin
                  gerçekten işe yarayacağını konuşalım.
                </p>
                <div className="blog-endcap-actions">
                  <Link href={NAV_CTA.href} className="btn btn-ink eyebrow">
                    {NAV_CTA.label} →
                  </Link>
                  <Link href={`/hizmetler#${post.category.id}`} className="btn btn-ghost eyebrow">
                    {post.category.title} hizmeti
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </article>

      {/* Diğer yazılar. Alt pay + 4rem (mobil 2rem): footer'ın dikiş şeridi
          (--seam-h) bu bölümün dibini örtüyor — anasayfa bant 5'in kalıbı. */}
      {related.length > 0 ? (
        <section
          aria-labelledby="diger-yazilar"
          className="surface-paper px-(--spacing-gutter) pb-[calc(var(--spacing-section)+4rem)] max-[860px]:pb-[calc(var(--spacing-section)+2rem)]"
        >
          <div className="blog-related mx-auto max-w-(--container-page)">
            <h2 id="diger-yazilar" className="eyebrow text-accent-auto">
              Diğer yazılar
            </h2>
            <div data-enter-stagger className="mt-6">
              {related.map((item, index) => (
                <BlogRow key={item.slug} post={item} index={index} headingLevel="h3" />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

function TocList({ items }: { items: { id: string; text: string; depth: 2 | 3 }[] }) {
  return (
    <ol className="blog-toc">
      {items.map((item) => (
        <li key={item.id} className={item.depth === 3 ? "blog-toc-sub" : undefined}>
          <a href={`#${item.id}`}>{item.text}</a>
        </li>
      ))}
    </ol>
  );
}
