import type { Metadata } from "next";
import Link from "next/link";

import BlogRow from "@/app/blog/BlogRow";
import { NAV_CTA } from "@/app/components/nav/navLinks";
import { getPublishedPosts } from "@/app/content/blog";
import { SERVICES } from "@/app/content/services";

/** Meta açıklaması ve başlık bandının lede'i aynı cümle — sayfa için yeni
 * metin yazılmadı. */
const DESCRIPTION =
  "Antalya'dan web tasarım, grafik tasarım, dijital pazarlama ve yazılım geliştirme üzerine rehberler ve notlar.";

export const metadata: Metadata = {
  title: "Blog: Web Tasarım, Dijital Pazarlama ve Yazılım Yazıları",
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Tan Yasan Reklam ve Tasarım Ajansı",
    title: "Blog: Web Tasarım, Dijital Pazarlama ve Yazılım Yazıları",
    description: DESCRIPTION,
    url: "/blog",
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
    title: "Blog: Web Tasarım, Dijital Pazarlama ve Yazılım Yazıları",
    description: DESCRIPTION,
    images: ["/opengraph-image"],
  },
};

/**
 * /blog — brief §8: "altyapı şimdi, içerik sonra". `content/blog/*.md`'de
 * yayında (draft olmayan) yazı yoksa liste yerine dürüst bir boş durum
 * gösterilir; "Yakında" değil, ne yazılacağını söyleyen kısa bir metin +
 * iletişim CTA'sı (bkz. content/blog/README.md — yazı eklemek için).
 *
 * Kart yok, hairline satırlar — sitenin geri kalanıyla aynı dil (§4). İlk
 * (en yeni) satır bir kademe büyük; satır bileşeni `BlogRow.tsx`.
 *
 * layout.tsx zaten <main id="icerik"> sağlıyor — burada ikinci bir <main>
 * AÇILMAZ.
 */
export default function BlogPage() {
  const posts = getPublishedPosts();

  // Kategori satırı: SERVICES sırasıyla, yalnızca yazısı olan kategoriler
  // (/portfolyo'nun eski filtre sayaçlarının kalıbı: "TÜMÜ 04 · …"). Bugün
  // TIKLANMAZ — dört yazı için istemci tarafı filtre değmez; ~8 yazıdan
  // sonra aria-pressed düğmelere çevrilebilir (bkz. design-system "Blog").
  const categories = SERVICES.map((service) => ({
    title: service.title,
    count: posts.filter((post) => post.category.id === service.id).length,
  })).filter((category) => category.count > 0);
  const pad = (count: number) => String(count).padStart(2, "0");

  return (
    <>
      {/* Başlık bandı. Diğer sayfalarla (/hizmetler, /hakkimda, /iletisim)
          aynı kalıp: eyebrow → h1 → lede → hairline'lı mono satır. */}
      <section className="surface-ink surface-ink-deep px-(--spacing-gutter) pb-(--spacing-section-tight) pt-[calc(var(--nav-h)+var(--spacing-section))]">
        <div className="mx-auto max-w-(--container-page)">
          <p className="eyebrow text-accent-auto mb-6">Blog</p>
          <h1
            data-enter="mask"
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
          <p className="text-lead text-muted mt-8 max-w-(--container-prose)">{DESCRIPTION}</p>

          {posts.length > 0 ? (
            <ul aria-label="Kategoriler" className="blog-categories eyebrow">
              <li>
                Tümü <span className="blog-categories-count">{pad(posts.length)}</span>
              </li>
              {categories.map((category) => (
                <li key={category.title}>
                  {category.title}{" "}
                  <span className="blog-categories-count">{pad(category.count)}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      {/* Alt pay + 4rem (mobil 2rem): footer'ın dikiş şeridi (--seam-h) bu
          bölümün dibini örtüyor — anasayfa bant 5'in kalıbı. */}
      <section className="surface-paper px-(--spacing-gutter) pt-(--spacing-section) pb-[calc(var(--spacing-section)+4rem)] max-[860px]:pb-[calc(var(--spacing-section)+2rem)]">
        <div className="mx-auto max-w-(--container-page)">
          {posts.length > 0 ? (
            <div data-enter-stagger>
              {posts.map((post, index) => (
                <BlogRow key={post.slug} post={post} index={index} featured={index === 0} />
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
