import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

/**
 * "Çalıştığım Firmalar" bandının TEK KAYNAĞI (anasayfa bant 3).
 *
 * LOGOLAR `public/images/clients/` klasöründen BUILD ZAMANINDA okunur
 * (portfolioFolders.ts ile aynı desen) — yeni logo = dosyayı klasöre atmak.
 * - SIRA: dosya adının sayısal öneki (`2-` < `10-`). `2- mavi-akdeniz.svg`
 *   gibi tireden sonra boşluklu adlar da okunur. Önek yoksa dosya atlanır.
 * - İSİM: `NAMES` tablosu (doğru Türkçe yazım, BÜYÜK HARF — portfolio.ts'teki
 *   Türkçe büyütme notu: <html lang="tr"> altında "i" → "İ"). Tabloda olmayan
 *   anahtar dosya adından Title Case'e düşer.
 * - Logolar CSS mask ile tek renkli siluet basılır (yalnızca alfa kanalı
 *   kullanılır). Bu yüzden ARKA PLANI OPAK logo (tam sayfa dolu dikdörtgen)
 *   katı bir kutuya dönerdi: o dosyalar listeye ALINMAZ ve build'de UYARI
 *   çıkar — şeffaf sürümü gelince düzelir.
 * - BEYAZ DOLGULU SVG'ler (#fff/#ffffff/white): beyaz şekiller siluette
 *   ŞEFFAF OYUK olmalı (Suufle'de kırmızı şeridin içindeki beyaz harfler).
 *   Build'de SVG, luminance maskesine çevrilir: beyaz şekiller siyah,
 *   diğerleri beyaz boyanır; sonuç data URI olarak verilir.
 *
 * Bant YALNIZCA bu klasördeki logoları gösterir; yazı markası yoktur.
 */
export interface Client {
  /** BÜYÜK HARF. Logo varsa `aria-label`'da da kullanılır. */
  name: string;
  /** CSS `url()` içine girecek adres: `public/` yolu ya da data URI. */
  logo: string;
  /** Logonun doğal boyutu — `aspect-ratio` için (yerleşim kayması olmaz). */
  width: number;
  height: number;
  /** Opsiyonel dış bağlantı (firmanın sitesi). */
  href?: string;
}

const FOLDER = "images/clients";
const ROOT = path.join(process.cwd(), "public", FOLDER);
const LOGO_EXT = /\.(svg|png|webp|jpe?g)$/i;

/** Anahtar: önek/uzantı atılmış, küçük harf, boşluk → `-`. */
const NAMES: Readonly<Record<string, string>> = {
  "rw-poyraz": "POYRAZ GAYRİMENKUL",
  poyraz: "POYRAZ GLOBAL",
  "mavi-akdeniz": "MAVİ AKDENİZ",
  emor: "EMOR",
  nur: "NUR PASTANELERİ",
  hoop: "HOOP VİZE",
  rixos: "RIXOS PREMIUM BODRUM",
  terra: "TERRA CITY",
  "evim-door": "EVİM DOOR",
  aggik: "AGGİK",
  "emlak-crm": "EMLAK CRM PRO",
  suufle: "SUUFLE",
  golden: "GOLDEN ROSE",
  wellness: "WELLNESS ANTALYA",
  yuner: "YÜNER HALI",
};

const prefixOf = (file: string) => {
  const match = /^(\d+)-/.exec(file);
  return match ? Number(match[1]) : Infinity;
};

const keyOf = (file: string) =>
  file
    .replace(LOGO_EXT, "")
    .replace(/^\d+-\s*/, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");

const titleCase = (key: string) =>
  key
    .split("-")
    .map((word) => word.charAt(0).toLocaleUpperCase("en-US") + word.slice(1))
    .join(" ");

interface Probe {
  width: number;
  height: number;
  /** Arka planı opak mı (mask'ta katı dikdörtgen olur). */
  opaque: boolean;
  /** Beyaz dolgular oyuğa çevrilmiş SVG (data URI); beyaz yoksa tanımsız. */
  maskUri?: string;
}

const SHAPE = /<(path|polygon|polyline|rect|circle|ellipse)\b[^>]*>/gi;
const isWhite = (fill: string) => /^(#fff(fff)?|white)$/i.test(fill.trim());

/** Her şeklin etkin dolgusu (satır içi attr > sınıf kuralı > varsayılan siyah). */
function fillOf(node: string, styles: Map<string, string>) {
  const inline =
    /\sstyle\s*=\s*"[^"]*fill\s*:\s*([^;"]+)/i.exec(node)?.[1] ??
    /\sfill\s*=\s*"([^"]*)"/i.exec(node)?.[1];
  if (inline) return inline.trim();
  const className = /\sclass\s*=\s*"([^"]*)"/i.exec(node)?.[1] ?? "";
  for (const c of className.split(/\s+/)) {
    const fill = /fill\s*:\s*([^;]+)/i.exec(styles.get(c) ?? "")?.[1];
    if (fill) return fill.trim();
  }
  return "#000";
}

/**
 * Beyaz dolgulu SVG'yi alfa maskesine çevirir: tüm şekiller beyaza, beyazlar
 * siyaha boyanır ve <mask> içine konur; üstte tam kaplayan siyah <rect> bu
 * maskeyle çizilir. Sıra/transform korunduğu için beyaz şekil, altındaki
 * rengin üstünde oyuk açar. Dolgusu `none` olanlar dokunulmadan kalır.
 */
function whiteKnockoutSvg(
  source: string,
  styles: Map<string, string>,
  [x, y, w, h]: number[],
): string | undefined {
  const inner = /<svg\b[^>]*>([\s\S]*)<\/svg>/i.exec(source)?.[1];
  if (!inner) return undefined;
  const defs = (inner.match(/<defs\b[\s\S]*?<\/defs>/gi) ?? []).join("");
  const body = inner.replace(/<defs\b[\s\S]*?<\/defs>/gi, "").replace(/<!--[\s\S]*?-->/g, "");

  let hasWhite = false;
  const painted = body.replace(SHAPE, (node) => {
    const fill = fillOf(node, styles);
    if (fill === "none") return node;
    if (isWhite(fill)) hasWhite = true;
    const style = isWhite(fill) ? "fill:#000" : "fill:#fff";
    return node.replace(/(\/?>)$/, ` style="${style}"$1`);
  });
  if (!hasWhite) return undefined;

  const box = `x="${x}" y="${y}" width="${w}" height="${h}"`;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${x} ${y} ${w} ${h}">` +
    defs +
    `<mask id="k" maskUnits="userSpaceOnUse" ${box}><rect ${box} fill="#000"/>${painted}</mask>` +
    `<rect ${box} fill="#000" mask="url(#k)"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, " "))}`;
}

/** Kök <svg>'nin `viewBox`'ı (yoksa width/height). */
function probeSvg(source: string): Probe | null {
  const tag = /<svg\b[^>]*>/i.exec(source)?.[0] ?? "";
  const attr = (name: string) =>
    new RegExp(`\\s${name}\\s*=\\s*"([^"]*)"`, "i").exec(tag)?.[1];

  let width = 0;
  let height = 0;
  let box = [0, 0, 0, 0];
  const viewBox = attr("viewBox")?.trim().split(/[\s,]+/).map(Number);
  if (viewBox && viewBox.length === 4 && viewBox.every(Number.isFinite)) {
    box = viewBox;
    [, , width, height] = viewBox;
  } else {
    width = parseFloat(attr("width") ?? "");
    height = parseFloat(attr("height") ?? "");
    box = [0, 0, width, height];
  }
  if (!(width > 0 && height > 0)) return null;

  // Opak arka plan: viewBox'ın tamamını kaplayan, dolgusu `none` olmayan <rect>.
  const styles = new Map<string, string>();
  for (const rule of source.matchAll(/\.([\w-]+)\s*\{([^}]*)\}/g)) {
    styles.set(rule[1], rule[2]);
  }
  let opaque = false;
  for (const rect of source.matchAll(/<rect\b[^>]*>/gi)) {
    const node = rect[0];
    const num = (name: string) =>
      parseFloat(new RegExp(`\\s${name}\\s*=\\s*"([^"]*)"`, "i").exec(node)?.[1] ?? "0");
    const covers =
      num("x") <= width * 0.01 &&
      num("y") <= height * 0.01 &&
      num("width") >= width * 0.99 &&
      num("height") >= height * 0.99;
    if (!covers) continue;
    const className = /\sclass\s*=\s*"([^"]*)"/i.exec(node)?.[1] ?? "";
    const css = className.split(/\s+/).map((c) => styles.get(c) ?? "").join(";");
    const fill =
      /\sfill\s*=\s*"([^"]*)"/i.exec(node)?.[1] ?? /fill\s*:\s*([^;]+)/i.exec(css)?.[1] ?? "#000";
    if (fill.trim() !== "none" && !isWhite(fill)) opaque = true;
  }
  return { width, height, opaque, maskUri: whiteKnockoutSvg(source, styles, box) };
}

/** 8-bit, interlace'siz PNG'nin dört köşe pikselinin alfa değeri (yoksa null). */
function cornerAlphas(buffer: Buffer, width: number, height: number): number[] | null {
  const colorType = buffer[25];
  if (buffer[24] !== 8 || buffer[28] !== 0 || (colorType !== 6 && colorType !== 4)) return null;
  const bpp = colorType === 6 ? 4 : 2;
  const idat: Buffer[] = [];
  for (let at = 8; at + 8 <= buffer.length; ) {
    const length = buffer.readUInt32BE(at);
    const type = buffer.toString("ascii", at + 4, at + 8);
    if (type === "IDAT") idat.push(buffer.subarray(at + 8, at + 8 + length));
    at += 12 + length;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * bpp;
  const rows: Buffer[] = [];
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
    const prev = rows[y - 1];
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? line[i - bpp] : 0;
      const b = prev ? prev[i] : 0;
      const c = prev && i >= bpp ? prev[i - bpp] : 0;
      let add = 0;
      if (filter === 1) add = a;
      else if (filter === 2) add = b;
      else if (filter === 3) add = (a + b) >> 1;
      else if (filter === 4) {
        const pa = Math.abs(b - c);
        const pb = Math.abs(a - c);
        const pc = Math.abs(a + b - 2 * c);
        add = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      line[i] = (line[i] + add) & 255;
    }
    rows.push(line);
  }
  const alphaAt = (x: number, y: number) => rows[y][x * bpp + bpp - 1];
  return [alphaAt(0, 0), alphaAt(width - 1, 0), alphaAt(0, height - 1), alphaAt(width - 1, height - 1)];
}

/** PNG: IHDR'den boyut; alfa yoksa ya da dört köşe opaksa arka plan opak. */
function probePng(buffer: Buffer): Probe | null {
  if (buffer.length < 33 || buffer.toString("ascii", 1, 4) !== "PNG") return null;
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const colorType = buffer[25];
  let opaque = (colorType === 0 || colorType === 2) && !buffer.includes("tRNS");
  if (!opaque && (colorType === 6 || colorType === 4)) {
    // Şeffaf logonun köşeleri şeffaftır; köşe opaksa tam sayfa zemin vardır.
    opaque = cornerAlphas(buffer, width, height)?.some((alpha) => alpha > 200) ?? false;
  }
  return { width, height, opaque };
}

function probe(file: string): Probe | null {
  const buffer = fs.readFileSync(path.join(ROOT, file));
  if (/\.svg$/i.test(file)) return probeSvg(buffer.toString("utf8"));
  if (/\.png$/i.test(file)) return probePng(buffer);
  return null; // webp/jpg: boyut okunamıyor → yazı markası
}

function readLogoClients(): Client[] {
  let files: string[];
  try {
    files = fs.readdirSync(ROOT);
  } catch {
    return [];
  }

  return files
    .filter((file) => LOGO_EXT.test(file) && prefixOf(file) !== Infinity)
    .sort((a, b) => prefixOf(a) - prefixOf(b))
    .map((file) => {
      const key = keyOf(file);
      const name = NAMES[key] ?? titleCase(key);
      const info = probe(file);
      if (!info || info.opaque) {
        console.warn(
          `[clients] "${file}" logo olarak kullanılamadı (opak arka plan ya da boyut okunamadı) — bantta GÖSTERİLMİYOR. Şeffaf sürüm gerekli.`,
        );
        return null;
      }
      return {
        name,
        logo: info.maskUri ?? `/${FOLDER}/${encodeURIComponent(file)}`,
        width: info.width,
        height: info.height,
      } satisfies Client;
    })
    .filter((client): client is Client => client !== null);
}

export const CLIENTS: readonly Client[] = readLogoClients();
