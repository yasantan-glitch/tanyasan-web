import fs from "node:fs";
import path from "node:path";

import type { PortfolioItem } from "./portfolio";

/**
 * /portfolyo'nun işleri `public/images/portfolyo/<klasör>/` altındaki
 * dosyalardan BUILD ZAMANINDA okunuyor (blog.ts ile aynı desen) — yeni iş
 * eklemek = dosyayı klasöre atmak. Elle tutulan liste klasörden kayardı.
 *
 * - SIRA: dosya adının sayısal öneki (`2-` < `10-`, doğal sıralama); önek
 *   yoksa ad sırası. Aynı önek (kurumsal-kimlik'te iki `8-`) ad sırasıyla
 *   çözülür ve build'de UYARI basılır — çökmez. Eksik numara (`6-`) sorun değil.
 * - GRUPLAMA: önek ve sondaki `-N`/`_N` atılınca aynı anahtarı veren dosyalar
 *   TEK İŞ (örn. `3-nur`, `4-nur`, `5-nur`). Detayda her dosya kendi karesi,
 *   künyede `KATEGORİ · 1/3`. İşin sırası ilk dosyasının sırası.
 * - İSİM: `NAMES` tablosu (doğru Türkçe yazım). Tabloda olmayan anahtar dosya
 *   adının yazımıyla Title Case'e düşer — emin olmadığım adlara (Chealse,
 *   Sahman...) bilerek dokunulmadı.
 * - BÜYÜK HARF künye: portfolio.ts'teki Türkçe büyütme notu geçerli; bu
 *   yüzden `NAMES` her iş için büyük harfli biçimi AÇIKÇA taşıyor.
 */

const ROOT = path.join(process.cwd(), "public", "images", "portfolyo");
const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;

/** [Doğal yazım, BÜYÜK HARF künye]. Anahtar: önek/sonek atılmış, küçük harf,
 * boşluk ve `_` → `-`. */
const NAMES: Readonly<Record<string, readonly [string, string]>> = {
  "mavi-akdeniz": ["Mavi Akdeniz", "MAVİ AKDENİZ"],
  suufle: ["Suufle", "SUUFLE"],
  poyraz: ["Poyraz Gayrimenkul", "POYRAZ GAYRİMENKUL"],
  "evim-door": ["Evim Door", "EVİM DOOR"],
  turksoy: ["Türksoy", "TÜRKSOY"],
  wellness: ["Wellness Antalya", "WELLNESS ANTALYA"],
  yuner: ["Yüner Halı", "YÜNER HALI"],
  anemon: ["Anemon Dental Clinic", "ANEMON DENTAL CLINIC"],
  trio: ["Trio Akademi", "TRİO AKADEMİ"],
  zenges: ["Zenges Enerji", "ZENGES ENERJİ"],
  aggik: ["Aggik", "AGGİK"],
  emor: ["Emor", "EMOR"],
  gmt: ["GMT", "GMT"],
  gr: ["Golden Rose Terra City", "GOLDEN ROSE TERRA CITY"],
  nur: ["Nur Pastaneleri", "NUR PASTANELERİ"],
  rixos: ["Rixos Premium Bodrum", "RIXOS PREMIUM BODRUM"],
  alvis: ["Alvis Pure Beauty", "ALVİS PURE BEAUTY"],
  hoop: ["Hoop Vize Hizmetleri", "HOOP VİZE HİZMETLERİ"],
  "hoop-vize": ["Hoop Vize Hizmetleri", "HOOP VİZE HİZMETLERİ"],
  ingiltere: ["İngiltere", "İNGİLTERE"],
  "kemer-mastercup": ["Kemer Master Cup", "KEMER MASTER CUP"],
  "poyraz-global": ["Poyraz Global", "POYRAZ GLOBAL"],
  emlakcrmpro: ["Emlak CRM Pro", "EMLAK CRM PRO"],
  "talep-form": ["Talep Formu", "TALEP FORMU"],
};

/** Aynı işin farklı dosya adlarını tek anahtara indirir. */
const ALIASES: Readonly<Record<string, string>> = {
  "suufle-hmwr": "suufle",
  "turksoy-logo": "turksoy",
};

interface CategorySpec {
  id: string;
  /** Klasör adı (public/images/portfolyo/ altında). */
  folder: string;
  /** BÜYÜK HARF, kartın başlığı. */
  title: string;
  /** Alt metinde işin cinsi. */
  noun: string;
  /** Kapak — klasör kökünden dosya yolu (başka klasörden de olabilir). */
  cover: string;
  /** Kategorinin tüm kareleri manzara (16:9) — grid'de iki sütun. */
  wide?: boolean;
}

export const FOLDER_CATEGORIES: readonly CategorySpec[] = [
  {
    id: "kurumsal-kimlik",
    folder: "kurumsal-kimlik",
    title: "KURUMSAL KİMLİK",
    noun: "kurumsal kimlik çalışması",
    cover: "kurumsal-kimlik/2-mavi-akdeniz.jpg",
  },
  {
    id: "logo",
    folder: "logo",
    title: "LOGO",
    noun: "logo tasarımı",
    // İstek: Logo kapağı kurumsal-kimlik klasöründeki Poyraz karesi.
    cover: "kurumsal-kimlik/5-poyraz.jpg",
  },
  {
    id: "sosyal-medya",
    folder: "sosyal-medya",
    title: "SOSYAL MEDYA",
    noun: "sosyal medya görseli",
    cover: "sosyal-medya/1-gr.jpg",
  },
  {
    id: "afis",
    folder: "afis",
    title: "AFİŞ",
    noun: "afiş tasarımı",
    cover: "afis/3-ozan.jpg",
  },
  {
    id: "web",
    folder: "web",
    title: "WEB",
    noun: "web sitesi tasarımı",
    cover: "web/talep-form.png",
    wide: true,
  },
];

/** Vaka sayfası olan işler (anahtar → rota). */
const WORK_LINKS: Readonly<Record<string, string>> = {
  emlakcrmpro: "/portfolyo/emlak-crm-pro",
};

const naturalCompare = (a: string, b: string) =>
  a.localeCompare(b, "tr", { numeric: true, sensitivity: "base" });

const prefixOf = (file: string) => {
  const match = /^(\d+)-/.exec(file);
  return match ? Number(match[1]) : Infinity;
};

/** `Evim Door.png` < `Evim Door-2.png` < `Evim Door-10.png`: sonek yoksa 1.
 * Düz ad sıralaması "-" ile "." arasında kalıyor ve ana dosyayı sona atıyordu. */
const suffixOf = (file: string) => {
  const match = /[-_](\d+)$/.exec(file.replace(IMAGE_EXT, ""));
  return match ? Number(match[1]) : 1;
};

const keyOf = (file: string) => {
  const stem = file
    .replace(IMAGE_EXT, "")
    .replace(/^\d+-/, "")
    .replace(/[-_]\d+$/, "")
    .toLowerCase()
    .replace(/[\s_]+/g, "-");
  return ALIASES[stem] ?? stem;
};

const titleCase = (key: string) =>
  key
    .split("-")
    .map((word) => word.charAt(0).toLocaleUpperCase("en-US") + word.slice(1))
    .join(" ");

const names = (key: string): readonly [string, string] =>
  NAMES[key] ?? [titleCase(key), titleCase(key).toLocaleUpperCase("en-US")];

/** PNG / JPEG / WebP başlığından piksel boyutu — `sharp`/`image-size`
 * doğrudan bağımlılık değil, 3 biçim için küçük bir okuyucu yeterli. */
function dimensions(file: string): { w: number; h: number } | null {
  const buf = fs.readFileSync(file);
  if (buf.length > 24 && buf.toString("ascii", 1, 4) === "PNG") {
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  }
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) return null;
      const marker = buf[i + 1];
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { w: buf.readUInt16BE(i + 7), h: buf.readUInt16BE(i + 5) };
      }
      i += 2 + buf.readUInt16BE(i + 2);
    }
    return null;
  }
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    const kind = buf.toString("ascii", 12, 16);
    if (kind === "VP8X") return { w: buf.readUIntLE(24, 3) + 1, h: buf.readUIntLE(27, 3) + 1 };
    if (kind === "VP8 ") return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
    if (kind === "VP8L") {
      const bits = buf.readUInt32LE(21);
      return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
    }
  }
  return null;
}

/** 16:9'a yakın manzara kareler grid'de iki sütun (`wide`). */
const isLandscape = (file: string) => {
  const size = dimensions(file);
  return !!size && size.w / size.h > 1.4;
};

interface Entry {
  file: string;
  key: string;
}

function readEntries(folder: string): Entry[] {
  const dir = path.join(ROOT, folder);
  if (!fs.existsSync(dir)) return [];
  const files = fs
    .readdirSync(dir)
    .filter((file) => IMAGE_EXT.test(file))
    .sort((a, b) => prefixOf(a) - prefixOf(b) ||
        naturalCompare(keyOf(a), keyOf(b)) ||
        suffixOf(a) - suffixOf(b) ||
        naturalCompare(a, b));

  const seen = new Map<number, string>();
  for (const file of files) {
    const prefix = prefixOf(file);
    if (prefix === Infinity) continue;
    const other = seen.get(prefix);
    if (other) {
      console.warn(
        `[portfolyo] ${folder}/: "${prefix}-" öneki iki dosyada (${other}, ${file}) — ad sırasıyla çözüldü.`,
      );
    }
    seen.set(prefix, file);
  }
  return files.map((file) => ({ file, key: keyOf(file) }));
}

export interface FolderCategory {
  id: string;
  title: string;
  /** Kategorideki İŞ sayısı (grup sayılır, dosya değil). */
  workCount: number;
  /** Kategorinin TÜM kareleri, sırayla (kapak dahil — başka klasörden
   * gelen kapak, ör. Logo'nun Poyraz karesi, galeriye girmez). */
  items: PortfolioItem[];
  labels: string[];
  cover: { src: string; alt: string };
  coverWide: boolean;
}

const publicPath = (relative: string) => `/images/portfolyo/${relative}`;

export function getFolderCategories(): FolderCategory[] {
  return FOLDER_CATEGORIES.map((spec) => {
    const entries = readEntries(spec.folder);

    // İş = aynı anahtar; sıra ilk görülme sırası.
    const groups = new Map<string, Entry[]>();
    for (const entry of entries) {
      groups.set(entry.key, [...(groups.get(entry.key) ?? []), entry]);
    }

    const toItem = (entry: Entry, index: number, total: number): PortfolioItem => {
      const [name, brand] = names(entry.key);
      const part = total > 1 ? ` (${index + 1}/${total})` : "";
      const abs = path.join(ROOT, spec.folder, entry.file);
      const size = dimensions(abs);
      return {
        src: publicPath(`${spec.folder}/${entry.file}`),
        brand,
        category: spec.title,
        event: total > 1 ? `${spec.title} · ${index + 1}/${total}` : undefined,
        alt: `${name} ${spec.noun}${part}`,
        wide: spec.wide || isLandscape(abs) || undefined,
        href: WORK_LINKS[entry.key],
        width: size?.w,
        height: size?.h,
      };
    };

    const all = [...groups.values()].flatMap((group) =>
      group.map((entry, index) => toItem(entry, index, group.length)),
    );

    const coverSrc = publicPath(spec.cover);
    const coverEntry = all.find((item) => item.src === coverSrc);
    let cover: FolderCategory["cover"];
    let coverWide: boolean;
    if (coverEntry) {
      cover = { src: coverEntry.src, alt: coverEntry.alt };
      coverWide = !!coverEntry.wide;
    } else {
      // Kapak başka klasörden (Logo → kurumsal-kimlik/5-poyraz.jpg).
      const file = path.basename(spec.cover);
      const [name] = names(keyOf(file));
      cover = { src: coverSrc, alt: `${name} ${spec.noun}` };
      coverWide = !!spec.wide || isLandscape(path.join(ROOT, spec.cover));
    }

    return {
      id: spec.id,
      title: spec.title,
      workCount: groups.size,
      // Kapak da galeride (kendi sırasında, tek kez): her işin etiketi bir
      // kareye gidebilsin — yalnızca kapağı olan iş (Afiş "Orange") dahil.
      items: all,
      labels: [...new Set(all.map((item) => item.brand))],
      cover,
      coverWide,
    };
  });
}
