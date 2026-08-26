import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tasarım Sistemi — tanyasan.com",
  robots: { index: false, follow: false },
};

type Swatch = {
  name: string;
  hex: string;
  varName: string;
  note: string;
};

const inkSwatches: Swatch[] = [
  { name: "ink-950", hex: "#141414", varName: "--color-ink-950", note: "en derin zemin" },
  { name: "ink-900", hex: "#1C1C1C", varName: "--color-ink-900", note: "brief: ana koyu zemin" },
  { name: "ink-800", hex: "#242424", varName: "--color-ink-800", note: "yükseltilmiş yüzey" },
  { name: "ink-700", hex: "#2E2E2E", varName: "--color-ink-700", note: "kenarlık dolgusu" },
];

const paperSwatches: Swatch[] = [
  { name: "paper-0", hex: "#FFFFFF", varName: "--color-paper-0", note: "açık zeminde kart" },
  { name: "paper-50", hex: "#FAFAFA", varName: "--color-paper-50", note: "brief: içerik zemini" },
  { name: "paper-200", hex: "#E5E5E5", varName: "--color-paper-200", note: "açık zemin kenarlık" },
];

const accentSwatches: Swatch[] = [
  { name: "accent", hex: "#E8AE30", varName: "--color-accent", note: "logodan · koyu zeminde 8.5:1" },
  { name: "accent-hi", hex: "#F5C95C", varName: "--color-accent-hi", note: "hover parlaması" },
  { name: "accent-lo", hex: "#C98F1E", varName: "--color-accent-lo", note: "basılı hâl" },
  { name: "accent-dim", hex: "#6B4E14", varName: "--color-accent-dim", note: "sönük ağ çizgisi" },
  { name: "accent-ink", hex: "#7A5200", varName: "--color-accent-ink", note: "açık zeminde metin · 6.6:1" },
];

function SwatchCard({ s }: { s: Swatch }) {
  return (
    <div className="border-hairline border rounded-(--radius-md) overflow-hidden">
      <div className="h-20" style={{ backgroundColor: s.hex }} />
      <div className="p-3">
        <p className="eyebrow text-muted">{s.name}</p>
        <p className="font-mono text-body-sm mt-1">{s.hex}</p>
        <p className="text-caption text-muted mt-1">{s.note}</p>
      </div>
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <main className="surface-paper">
      {/* ================= HERO ÖRNEĞİ ================= */}
      <section className="surface-ink surface-ink-deep px-(--spacing-gutter) py-(--spacing-section)">
        <div className="max-w-(--container-site) mx-auto">
          <p className="eyebrow text-accent-auto mb-6">Tasarım Sistemi — Hero Örneği</p>
          <h1
            className="font-display font-extrabold text-accent-auto"
            style={{
              fontSize: "var(--text-display-hero)",
              lineHeight: "var(--text-display-hero--line-height)",
              letterSpacing: "var(--text-display-hero--letter-spacing)",
              fontStretch: "112%",
            }}
          >
            FARK YARATAN
            <br />
            <span className="text-strong">TASARIM,</span>
          </h1>
          <h1
            className="font-display font-extrabold text-strong"
            style={{
              fontSize: "var(--text-display-hero)",
              lineHeight: "var(--text-display-hero--line-height)",
              letterSpacing: "var(--text-display-hero--letter-spacing)",
              fontStretch: "112%",
            }}
          >
            İŞLEYEN SİSTEM
          </h1>
          <p className="text-lead text-muted max-w-(--container-prose) mt-8">
            Markanızı görünür kılın, süreçlerinizi hızlandırın.
          </p>
          <div className="flex flex-wrap gap-4 mt-10">
            <button className="eyebrow bg-(--color-accent) text-(--color-ink-900) px-6 py-3 rounded-(--radius-sm) hover:bg-(--color-accent-hi) transition-colors duration-(--duration-base)">
              Hizmetler
            </button>
            <button className="eyebrow border-hairline border text-strong px-6 py-3 rounded-(--radius-sm) hover:border-(--color-accent) hover:text-accent-auto transition-colors duration-(--duration-base)">
              Projelerimiz
            </button>
          </div>
          <p className="text-caption text-muted mt-6">
            Archivo Expanded 800 — font-stretch: 112% ile genişlik ekseni test ediliyor.
            Harf genişliği değişmiyorsa axes: [&quot;wdth&quot;] yüklenmemiş demektir.
          </p>
        </div>
      </section>

      {/* ================= PALET ================= */}
      <section className="px-(--spacing-gutter) py-(--spacing-section-tight)">
        <div className="max-w-(--container-site) mx-auto">
          <p className="eyebrow text-accent-auto mb-2">01 — Palet</p>
          <h2
            className="font-display font-bold mb-8"
            style={{
              fontSize: "var(--text-display-2xl)",
              lineHeight: "var(--text-display-2xl--line-height)",
              letterSpacing: "var(--text-display-2xl--letter-spacing)",
            }}
          >
            Renk tokenları
          </h2>

          <p className="eyebrow text-muted mb-3">Ink — koyu zeminler</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {inkSwatches.map((s) => (
              <SwatchCard key={s.name} s={s} />
            ))}
          </div>

          <p className="eyebrow text-muted mb-3">Paper — açık zeminler</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            {paperSwatches.map((s) => (
              <SwatchCard key={s.name} s={s} />
            ))}
          </div>

          <p className="eyebrow text-muted mb-3">Accent — logodan (#E8AE30)</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {accentSwatches.map((s) => (
              <SwatchCard key={s.name} s={s} />
            ))}
          </div>

          <div className="border-hairline border rounded-(--radius-md) p-6 mt-8 bg-(--color-paper-0)">
            <p className="eyebrow text-accent-auto mb-3">Kontrast doğrulaması</p>
            <ul className="text-body-sm space-y-2">
              <li>
                <span className="font-mono">#E8AE30</span> / <span className="font-mono">#1C1C1C</span> →{" "}
                <strong>8.5:1</strong> (AAA — koyu zeminde metin serbest)
              </li>
              <li>
                <span className="font-mono">#E8AE30</span> / <span className="font-mono">#FAFAFA</span> →{" "}
                <strong>1.9:1</strong> (başarısız — açık zeminde kullanılmaz)
              </li>
              <li>
                <span className="font-mono">#7A5200</span> / <span className="font-mono">#FAFAFA</span> →{" "}
                <strong>6.6:1</strong> (AA — açık zeminde metin/link burada)
              </li>
              <li>
                <span className="font-mono">#A4A5A8</span> / <span className="font-mono">#1C1C1C</span> →{" "}
                <strong>6.9:1</strong> (AA)
              </li>
              <li>
                <span className="font-mono">#676767</span> / <span className="font-mono">#FAFAFA</span> →{" "}
                <strong>5.4:1</strong> (AA)
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ================= TİPOGRAFİ ================= */}
      <section className="px-(--spacing-gutter) py-(--spacing-section-tight) bg-(--color-paper-0)">
        <div className="max-w-(--container-site) mx-auto">
          <p className="eyebrow text-accent-auto mb-2">02 — Tipografi</p>
          <h2
            className="font-display font-bold mb-8"
            style={{
              fontSize: "var(--text-display-2xl)",
              lineHeight: "var(--text-display-2xl--line-height)",
              letterSpacing: "var(--text-display-2xl--letter-spacing)",
            }}
          >
            Tip ölçeği
          </h2>

          <div className="space-y-8">
            <div>
              <p className="eyebrow text-muted mb-2">display-2xl · 36–64px · Archivo 700</p>
              <p
                className="font-display font-bold"
                style={{
                  fontSize: "var(--text-display-2xl)",
                  lineHeight: "var(--text-display-2xl--line-height)",
                  letterSpacing: "var(--text-display-2xl--letter-spacing)",
                }}
              >
                Sadece anlatmıyoruz, yapıyoruz.
              </p>
            </div>

            <div>
              <p className="eyebrow text-muted mb-2">display-xl · 28–44px · Archivo 700</p>
              <p
                className="font-display font-bold"
                style={{
                  fontSize: "var(--text-display-xl)",
                  lineHeight: "var(--text-display-xl--line-height)",
                  letterSpacing: "var(--text-display-xl--letter-spacing)",
                }}
              >
                Yazılım Geliştirme
              </p>
            </div>

            <div>
              <p className="eyebrow text-muted mb-2">display-lg · 24–32px · Archivo 600</p>
              <p
                className="font-display font-semibold"
                style={{
                  fontSize: "var(--text-display-lg)",
                  lineHeight: "var(--text-display-lg--line-height)",
                  letterSpacing: "var(--text-display-lg--letter-spacing)",
                }}
              >
                Grafik Tasarım
              </p>
            </div>

            <div className="max-w-(--container-prose)">
              <p className="eyebrow text-muted mb-2">lead · 20px · Instrument Sans</p>
              <p
                style={{
                  fontSize: "var(--text-lead)",
                  lineHeight: "var(--text-lead--line-height)",
                  letterSpacing: "var(--text-lead--letter-spacing)",
                }}
              >
                Hazır çözümler her işletmeye uymuyor. Süreçlerinizi bir yazılıma
                uydurmak yerine, yazılımı süreçlerinize göre kuruyoruz.
              </p>
            </div>

            <div className="max-w-(--container-prose)">
              <p className="eyebrow text-muted mb-2">body · 17px · Instrument Sans</p>
              <p style={{ fontSize: "var(--text-body)", lineHeight: "var(--text-body--line-height)" }}>
                20 yıllık tasarım geçmişimiz, geliştirdiğimiz yazılımların
                yalnızca çalışmasını değil, kullanılmak istenmesini de
                sağlıyor. Çünkü çoğu kurumsal yazılımın asıl sorunu eksik
                özellik değil, kimsenin kullanmak istememesi.
              </p>
            </div>

            <div>
              <p className="eyebrow text-muted mb-2">label · 12px · JetBrains Mono</p>
              <p className="eyebrow">01 — Hizmetler · Next.js · PostgreSQL · Bulut Altyapı</p>
            </div>

            <div className="border-hairline border rounded-(--radius-md) p-6 bg-(--color-paper-50)">
              <p className="eyebrow text-muted mb-3">Türkçe glif kontrolü</p>
              <p className="font-display font-bold text-2xl">Ğ ş ı İ ç Ö ü — ĞŞıİÇÖÜ</p>
              <p className="font-mono text-body-sm mt-2">ğ ş ı İ ç ö ü — JetBrains Mono</p>
              <p className="mt-2" style={{ fontSize: "var(--text-body)" }}>
                ğ ş ı İ ç ö ü — Instrument Sans gövde metninde.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BİLEŞENLER ================= */}
      <section className="px-(--spacing-gutter) py-(--spacing-section-tight)">
        <div className="max-w-(--container-site) mx-auto">
          <p className="eyebrow text-accent-auto mb-2">03 — Bileşenler ve yüzeyler</p>
          <h2
            className="font-display font-bold mb-8"
            style={{
              fontSize: "var(--text-display-2xl)",
              lineHeight: "var(--text-display-2xl--line-height)",
              letterSpacing: "var(--text-display-2xl--letter-spacing)",
            }}
          >
            Hairline liste · buton · kart
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="surface-ink rounded-(--radius-md) p-6">
              <p className="eyebrow text-accent-auto mb-4">Koyu yüzey</p>
              <ul className="divide-y divide-(--hairline)">
                {["Kurumsal Kimlik", "Web Tasarım", "Sosyal Medya"].map((item) => (
                  <li key={item} className="py-3 flex items-center justify-between group cursor-pointer">
                    <span className="text-strong">{item}</span>
                    <span className="text-accent-auto opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </li>
                ))}
              </ul>
              <button className="eyebrow border-hairline border rounded-(--radius-sm) px-5 py-2.5 mt-4 hover:border-(--color-accent) hover:text-accent-auto transition-colors">
                İletişim
              </button>
            </div>

            <div className="surface-paper surface-paper-raised border-hairline border rounded-(--radius-md) p-6">
              <p className="eyebrow text-accent-auto mb-4">Açık yüzey</p>
              <ul className="divide-y divide-(--hairline)">
                {["Portföy & Harita", "Müşteri Eşleştirme", "Muhasebe"].map((item) => (
                  <li key={item} className="py-3 flex items-center justify-between group cursor-pointer">
                    <span className="text-strong">{item}</span>
                    <span className="text-accent-auto opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </li>
                ))}
              </ul>
              <button className="eyebrow bg-(--color-ink-900) text-(--color-fg-on-ink) rounded-(--radius-sm) px-5 py-2.5 mt-4 hover:bg-(--color-ink-800) transition-colors">
                Projeyi İncele
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BOŞLUK / GRID ================= */}
      <section className="px-(--spacing-gutter) py-(--spacing-section-tight) bg-(--color-paper-0)">
        <div className="max-w-(--container-site) mx-auto">
          <p className="eyebrow text-accent-auto mb-2">04 — Boşluk ve container</p>
          <h2
            className="font-display font-bold mb-8"
            style={{
              fontSize: "var(--text-display-2xl)",
              lineHeight: "var(--text-display-2xl--line-height)",
              letterSpacing: "var(--text-display-2xl--letter-spacing)",
            }}
          >
            Ölçek
          </h2>
          <div className="space-y-3 font-mono text-body-sm">
            <div className="flex items-center gap-4">
              <span className="w-40 shrink-0 text-muted">container-prose</span>
              <div className="h-3 bg-(--color-accent)" style={{ width: "min(100%, var(--container-prose))" }} />
              <span className="text-muted">576px</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-40 shrink-0 text-muted">container-site</span>
              <div className="h-3 bg-(--color-accent-lo)" style={{ width: "min(100%, var(--container-site))" }} />
              <span className="text-muted">1280px</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-40 shrink-0 text-muted">container-wide</span>
              <div className="h-3 bg-(--color-accent-dim)" style={{ width: "100%" }} />
              <span className="text-muted">1440px</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
