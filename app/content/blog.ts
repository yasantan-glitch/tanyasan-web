import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { Marked } from "marked";

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

/** İçindekiler satırı: başlığın gövdedeki `id`'si ve düz metni. */
export interface BlogTocItem {
  id: string;
  text: string;
  depth: 2 | 3;
}

export interface BlogPost {
  slug: string;
  title: string;
  /** ISO tarih (YYYY-AA-GG). Görüntüleme için `formatBlogDate`'i kullanın. */
  date: string;
  /** İsteğe bağlı son güncelleme tarihi (ISO). Yoksa `undefined` —
   * JSON-LD `dateModified` ve sitemap `lastModified` o zaman `date`'e düşer. */
  updated?: string;
  excerpt: string;
  category: (typeof SERVICES)[number];
  draft: boolean;
  html: string;
  toc: BlogTocItem[];
  wordCount: number;
  readingMinutes: number;
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

/** Türkçe okuma hızı için muhafazakâr bir ortalama (dakikada ~200 kelime).
 * Gövde Markdown'ı sayılıyor; işaretler (`##`, `**`) kelime sayısını
 * anlamlı ölçüde değiştirmiyor. */
const WORDS_PER_MINUTE = 200;

/** İçindekiler eşiği: bir yazıda bundan az `##` varsa `###`'ler de listeye
 * girer (örn. sosyal-medya-hatalari: 3 bölüm, 9 numaralı alt başlık). */
const TOC_MIN_H2 = 4;

/** Başlık metninden çapa `id`'si: "İki platform nasıl çalışır?" →
 * "iki-platform-nasil-calisir". `tr-TR` küçültmesi I/İ'yi doğru çevirir,
 * kalan Türkçe harfler ASCII karşılıklarına iner. */
function slugify(text: string): string {
  const map: Record<string, string> = { ı: "i", ş: "s", ğ: "g", ü: "u", ö: "o", ç: "c" };
  return text
    .toLocaleLowerCase("tr-TR")
    .replace(/[ışğüöç]/g, (char) => map[char])
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** marked'in metin çıktısındaki temel HTML varlıklarını çözer — İçindekiler
 * metni JSX'e düz metin olarak gidiyor, orada yeniden kaçışlanıyor. */
function decodeEntities(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** Gövdeyi HTML'e çevirir. Yazı başına AYRI bir `Marked` örneği: global
 * `marked.use` başka bir tüketiciye sızardı, ayrıca `id` sayacı yazıya
 * özel olmalı (iki yazıda aynı başlık olabilir, bir yazıda iki kez olamaz).
 * `##`/`###` başlıklarına `id` verilir (İçindekiler ve derin bağlantı için);
 * tablolar dar ekranda sayfayı yatay kaydırmasın diye kendi kaydırma
 * kabına sarılır. */
function renderBody(markdown: string): { html: string; toc: BlogTocItem[] } {
  const headings: BlogTocItem[] = [];
  const usedIds = new Map<string, number>();

  const parser = new Marked({
    renderer: {
      heading({ tokens, depth }) {
        const inner = this.parser.parseInline(tokens);
        const text = decodeEntities(this.parser.parseInline(tokens, this.parser.textRenderer));
        const base = slugify(text) || "bolum";
        const seen = usedIds.get(base) ?? 0;
        usedIds.set(base, seen + 1);
        const id = seen === 0 ? base : `${base}-${seen + 1}`;
        if (depth === 2 || depth === 3) headings.push({ id, text, depth });
        return `<h${depth} id="${id}">${inner}</h${depth}>\n`;
      },
    },
  });

  const html = parser
    .parse(markdown, { async: false })
    .replace(
      /<table>/g,
      '<div class="blog-table-wrap" tabindex="0" role="region" aria-label="Tablo"><table>',
    )
    .replace(/<\/table>/g, "</table></div>");

  const h2Count = headings.filter((heading) => heading.depth === 2).length;
  const toc = h2Count >= TOC_MIN_H2 ? headings.filter((heading) => heading.depth === 2) : headings;

  return { html, toc };
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
  const { html, toc } = renderBody(content);
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  return {
    slug,
    title: data.title,
    date: toIsoDate(data.date),
    updated: data.updated ? toIsoDate(data.updated) : undefined,
    excerpt: data.excerpt,
    category,
    draft: data.draft === true,
    html,
    toc,
    wordCount,
    readingMinutes: Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE)),
  };
}

/** Şablon (`_sablon.md`) ve `_` ile başlayan diğer dosyalar hariç, taslak
 * olmayan tüm yazılar — en yeniden en eskiye sıralı. Aynı gün yayınlanan
 * yazılar slug'a göre (A→Z) sıralanır: eski karşılaştırıcı eşitlikte hiç 0
 * döndürmüyordu, sıra `readdir`'in dosya sırasına kalıyordu. */
export function getPublishedPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  return fs
    .readdirSync(BLOG_DIR)
    .filter(
      (file) => file.endsWith(".md") && !file.startsWith("_") && file !== "README.md",
    )
    .map((file) => readPost(file))
    .filter((post) => !post.draft)
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return getPublishedPosts().find((post) => post.slug === slug);
}

/** Kategori adı cümle içinde: SERVICES başlıkları büyük harf ("DİJİTAL
 * PAZARLAMA") — eyebrow'larda zaten büyük basılıyor, ama cümle içinde ve
 * JSON-LD'de "Dijital Pazarlama" olmalı. `tr-TR` küçültme/büyütme I/İ'yi
 * doğru çevirir; bağlaç "ve" küçük kalır. */
export function categoryName(category: BlogPost["category"]): string {
  return category.title
    .toLocaleLowerCase("tr-TR")
    .split(" ")
    .map((word) =>
      word === "ve" ? word : word.charAt(0).toLocaleUpperCase("tr-TR") + word.slice(1),
    )
    .join(" ");
}

/** Yazının altındaki "Diğer yazılar": önce aynı kategoriden, sonra en
 * yeniden — ikisi de `getPublishedPosts` sırasını korur. */
export function getRelatedPosts(slug: string, count = 2): BlogPost[] {
  const posts = getPublishedPosts();
  const current = posts.find((post) => post.slug === slug);
  const others = posts.filter((post) => post.slug !== slug);
  if (!current) return others.slice(0, count);

  const sameCategory = others.filter((post) => post.category.id === current.category.id);
  const rest = others.filter((post) => post.category.id !== current.category.id);
  return [...sameCategory, ...rest].slice(0, count);
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
