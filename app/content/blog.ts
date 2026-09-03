import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { marked } from "marked";

import { SERVICES } from "@/app/content/services";

/**
 * Blog içeriğinin TEK KAYNAĞI: `content/blog/*.md`. CMS yok — Tan bir yazıyı
 * bu klasöre bir `.md` dosyası olarak ekler (bkz. `content/blog/README.md`),
 * Vercel geri kalanını build zamanında yapar. Sayfaya sıfır ekstra JS gider;
 * `marked`/`gray-matter` yalnızca sunucuda/derlemede çalışır.
 *
 * `category` serbest metin değil: SERVICES'teki altı hizmetten biri olmak
 * ZORUNDA (design-system §9'un "tek kaynak" kuralı — hizmet listesi burada
 * ikinci kez yazılmıyor). Geçersiz bir `category` build'i kırar; bu bilinçli,
 * sessizce yanlış kategoriyle yayınlanan bir yazıdansa erken hata tercih
 * edildi.
 */

export interface BlogPost {
  slug: string;
  title: string;
  /** ISO tarih (YYYY-AA-GG). Görüntüleme için `formatBlogDate`'i kullanın. */
  date: string;
  excerpt: string;
  category: (typeof SERVICES)[number];
  draft: boolean;
  html: string;
}

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

/** gray-matter/js-yaml, tırnaksız `date: 2026-03-14` yazılırsa bunu bir JS
 * Date nesnesine çeviriyor (string'e değil) — şablon ve README tırnak
 * kullanmayı söylüyor ama biri unutursa build kırılmasın diye burada
 * normalize ediliyor. */
function toIsoDate(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return String(value);
}

function isValidCategory(value: unknown): value is string {
  return typeof value === "string" && SERVICES.some((service) => service.id === value);
}

function readPost(fileName: string): BlogPost {
  const slug = fileName.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(BLOG_DIR, fileName), "utf8");
  const { data, content } = matter(raw);

  if (typeof data.title !== "string" || !data.title.trim()) {
    throw new Error(`content/blog/${fileName}: "title" eksik.`);
  }
  if (typeof data.excerpt !== "string" || !data.excerpt.trim()) {
    throw new Error(`content/blog/${fileName}: "excerpt" eksik.`);
  }
  if (!isValidCategory(data.category)) {
    throw new Error(
      `content/blog/${fileName}: "category" geçersiz (${String(data.category)}). ` +
        `content/blog/README.md'deki altı değerden biri olmalı.`,
    );
  }

  const category = SERVICES.find((service) => service.id === data.category)!;

  return {
    slug,
    title: data.title,
    date: toIsoDate(data.date),
    excerpt: data.excerpt,
    category,
    draft: data.draft === true,
    html: marked.parse(content, { async: false }),
  };
}

/** Şablon (`_sablon.md`) ve `_` ile başlayan diğer dosyalar hariç, taslak
 * olmayan tüm yazılar — en yeniden en eskiye sıralı. */
export function getPublishedPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  return fs
    .readdirSync(BLOG_DIR)
    .filter(
      (file) => file.endsWith(".md") && !file.startsWith("_") && file !== "README.md",
    )
    .map((file) => readPost(file))
    .filter((post) => !post.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return getPublishedPosts().find((post) => post.slug === slug);
}

/** Sayfada gösterilecek biçim: "14 Mart 2026". `timeZone: "UTC"` zorunlu —
 * ISO tarih saatsiz olduğu için yerel saat diliminde parse edilirse sunucu
 * ile istemci farklı günler üretebilir (hydration mismatch). */
export function formatBlogDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
