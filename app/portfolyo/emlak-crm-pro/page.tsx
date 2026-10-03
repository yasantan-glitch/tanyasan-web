import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  CASE_APPROACH,
  CASE_EXTERNAL,
  CASE_FIELD_NOTE,
  CASE_FIELD_USERS,
  CASE_LEAD_SHOT,
  CASE_MODULES,
  CASE_PARAGRAPHS,
  CASE_PROBLEM,
  CASE_RESULTS,
  CASE_STACK,
  CASE_TITLE,
  type CaseModule,
  type CaseShot,
} from "@/app/content/emlakCrmPro";

import ShotTheme from "./ShotTheme";
import ShotZoom from "./ShotZoom";

export const metadata: Metadata = {
  title: "Emlak CRM Pro — Vaka Çalışması — Tan Yasan Reklam ve Tasarım Ajansı",
  description:
    "Bir emlak ofisinin portföyünü, müşterilerini, danışman performansını ve muhasebesini tek sistemde topladık. Sıfırdan tasarlanan ve kodlanan Emlak CRM Pro'nun vaka çalışması.",
};

/**
 * /portfolyo/emlak-crm-pro — brief §6'nın vaka çalışması sayfası. Bölüm
 * sırası tablonun aynısı: Problem → Yaklaşım → Çözüm (modül modül) →
 * Teknoloji → Sonuç → Kapanış. Bkz. docs/design-system.md §13.
 *
 * TÜM METİN content/emlakCrmPro.ts'te; brief'in verdiği cümleler birebir,
 * uzatılmadı. Brief'te olmayan her şey BİLİNÇLİ BOŞLUK:
 * - modül açıklamaları (`CaseModule.body`) — hiçbirinde yok,
 * - üç modülün ekran görüntüsü — görselsiz satır olarak basılıyor,
 * - teknoloji künyesi (`CASE_STACK = []`) — boşken bölüm HİÇ render edilmez.
 *
 * DÜZEN yeniden kullanıldı: anlatı ve modül bölümleri `.service-grid` +
 * `.service-head` (sol sütun yapışkan, ≤860px'te tek sütun) —
 * /hakkimda ve /iletisim'deki kuralın aynısı, `.case-*` ikizleri yazılmadı.
 * Ekran görüntüleri anasayfa bant 3'ün `.home-case-frame` gri paspartasıyla
 * ve `case-slide` kayarak girişiyle (globals.css gated blok) duruyor.
 *
 * EKRAN GÖRÜNTÜLERİ (Ekim 2026): her kare açık + koyu tema çifti; "Çözüm"
 * bölümünün tepesindeki sticky anahtar (ShotTheme) tüm kareleri birlikte
 * çeviriyor. Kareler kayarak giriyor (case-slide) ve tıklanınca tam ekran
 * açılıyor (ShotZoom). Dosyası olmayan kare derleme anında eleniyor (`existing`).
 *
 * DIŞ BAĞLANTI (emlakcrmpro.com): başlıkta görünür bir bağlantı + sonda
 * küçük bağlantı (Ekim 2026 kullanıcı kararı, brief §5.2'yi gevşetiyor).
 */

/** Anlatı bölümleri. Sayaç /hakkimda'nın `NN / NN` kalıbı; modüllerin
 * sayacı ayrı (kendi bölümlerini sayıyorlar). */
const STORY = [
  { id: "problem", title: "PROBLEM", paragraphs: CASE_PROBLEM },
  { id: "yaklasim", title: "YAKLAŞIM", paragraphs: CASE_APPROACH },
] as const;

const pad = (n: number) => String(n).padStart(2, "0");

/** Statik sayfa: dosya varlığı DERLEME anında okunuyor. Kullanıcı yeni bir
 * kare çiftini klasöre bıraktığında (ör. crm-dashboard-1.png) bir sonraki
 * derlemede kendiliğinden görünür; eksik koyu kare açık kareye düşer. */
const publicFile = (src: string) =>
  fs.existsSync(path.join(process.cwd(), "public", src));

const existing = (shots: readonly CaseShot[]) =>
  shots
    .filter((shot) => publicFile(shot.light))
    .map((shot) => (publicFile(shot.dark) ? shot : { ...shot, dark: shot.light }));

const MODULES: readonly CaseModule[] = CASE_MODULES.map((module) => ({
  ...module,
  shots: existing(module.shots),
})).filter((module) => !module.optional || module.shots.length > 0);

/** Açık ve koyu kare üst üste; hangisinin görüneceğini `.shot-theme`
 * sarmalayıcısının `data-shot-theme`i belirliyor (globals.css). Koyu kare
 * ekran okuyucuya ikinci kez okutulmuyor. */
function Shot({ shot, sizes }: { shot: CaseShot; sizes: string }) {
  return (
    <figure className="case-shot">
      <ShotZoom light={shot.light} dark={shot.dark} alt={shot.alt}>
      <div className="home-case-frame">
        {/* Perde (clip-path) yalnızca içteki koyu karede; kayarak giriş
            (case-slide) ise figürün kendisinde — ayrı elemanlar. */}
        <div className="case-shot__stack">
          <Image
            src={shot.light}
            alt={shot.alt}
            fill
            sizes={sizes}
            className="case-shot__img case-shot__img--light"
          />
          <Image
            src={shot.dark}
            alt=""
            aria-hidden="true"
            fill
            sizes={sizes}
            className="case-shot__img case-shot__img--dark"
          />
        </div>
      </div>
      </ShotZoom>
      <figcaption className="home-case-caption eyebrow text-muted">
        {shot.caption}
      </figcaption>
    </figure>
  );
}

export default function EmlakCrmProPage() {
  return (
    <>
      {/* 1 — Başlık. Metin anasayfa bant 3'ün (brief §5.2) aynısı. Masaüstünde
          sol sütun: başlık + iki paragraf alt alta; sağ sütun: açılış görseli.
          ≤860px'te tek sütun, eski sıra (başlık → metin → görsel). */}
      <section className="surface-ink surface-ink-deep px-(--spacing-gutter) pb-(--spacing-section) pt-[calc(var(--nav-h)+var(--spacing-section))]">
        <div className="mx-auto max-w-(--container-page)">
          <div className="case-head-row">
            <nav aria-label="Konum" className="case-crumb eyebrow text-muted">
              <Link href="/portfolyo">Portfolyo</Link>
              <span aria-hidden="true">/</span>
              <span className="text-accent-auto">Emlak CRM Pro</span>
            </nav>
            <a
              href={CASE_EXTERNAL.href}
              className="case-live btn btn-ghost eyebrow"
              target="_blank"
              rel="noopener"
            >
              <span className="case-live__dot" aria-hidden="true" />
              Canlı: {CASE_EXTERNAL.label} ↗
            </a>
          </div>

          <div className="case-hero">
            <div className="case-hero__text">
              <h1
                className="font-display text-strong max-w-[24ch] mt-6"
                data-enter="mask"
                style={{
                  fontSize: "var(--text-display-2xl)",
                  lineHeight: "var(--text-display-2xl--line-height)",
                  letterSpacing: "var(--text-display-2xl--letter-spacing)",
                  fontWeight: "var(--text-display-2xl--font-weight)",
                }}
              >
                {CASE_TITLE}
              </h1>

              <div className="case-intro mt-8">
                {CASE_PARAGRAPHS.map((paragraph, index) => (
                  <p
                    key={paragraph}
                    className={index === 0 ? "text-lead" : "text-muted"}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <figure className="case-lead">
              <div className="case-lead__frame">
                <Image
                  src={CASE_LEAD_SHOT.src}
                  alt={CASE_LEAD_SHOT.alt}
                  fill
                  preload
                  sizes="(max-width: 860px) 100vw, 50vw"
                />
              </div>
              <figcaption className="home-case-caption eyebrow text-muted">
                {CASE_LEAD_SHOT.caption}
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* 2 — Problem + Yaklaşım. Ekim 2026: her blok kendi bandı;
          "Yaklaşım" açık gri (kullanıcı isteği) — iki açık yüzey arasındaki
          ton kademesi, ayraç çizgisinin yerine geçiyor. Masaüstünde iki yarı
          yan yana (`.case-story`), ≤860px'te alt alta — eski düzen. */}
      <div className="case-story">
      {STORY.map((block, index) => (
        <section
          key={block.id}
          id={block.id}
          className={`case-story__half surface-paper seam py-(--spacing-section)${
            index === 0 ? "" : " case-story--gray"
          }`}
        >
          <div className="service-grid mx-auto max-w-(--container-page)">
            <div className="service-head">
              <p className="eyebrow text-accent-auto">
                {pad(index + 1)} / {pad(STORY.length)}
              </p>
              <h2 className="service-title font-display text-strong">
                {block.title}
              </h2>
            </div>
            <div>
              {block.paragraphs.map((paragraph, paragraphIndex) => (
                <p
                  key={paragraph}
                  className={`max-w-(--container-prose) ${
                    paragraphIndex === 0 ? "text-lead" : "text-muted mt-6"
                  }`}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>
      ))}
      </div>

      {/* 3 — Çözüm, modül modül. En derin ton: ekran görüntüleri açık temalı,
          gri paspartayla koyu zeminde ayrışıyor (anasayfa bant 3, §12). Sol
          sütunda yapışkan modül adı, sağda kareler akıyor — bant 3'ün "sabit
          anlatı + akan kanıt" okumasının sayfa boyu hali, ama named
          view-timeline'sız: her kare kendi anonim `view()`'iyle odaklanıyor. */}
      <section className="surface-ink surface-ink-deep case-solution seam px-(--spacing-gutter) py-(--spacing-section)">
        <div className="mx-auto max-w-(--container-page)">
          <p className="eyebrow text-accent-auto">Çözüm</p>
          <h2
            className="font-display text-strong max-w-[20ch] mt-6"
            data-enter="mask"
            style={{
              fontSize: "var(--text-display-xl)",
              lineHeight: "var(--text-display-xl--line-height)",
              letterSpacing: "var(--text-display-xl--letter-spacing)",
              fontWeight: "var(--text-display-xl--font-weight)",
            }}
          >
            MODÜL MODÜL
          </h2>

          <ShotTheme>
          <div className="case-modules">
            {MODULES.map((module, index) => (
              <article
                key={module.id}
                id={module.id}
                className={`case-module service-grid${
                  module.shots.length === 0 ? " case-module--bare" : ""
                }`}
              >
                <div className="service-head">
                  <p className="eyebrow text-accent-auto">
                    {pad(index + 1)} / {pad(MODULES.length)}
                  </p>
                  <h3 className="case-module__title font-display text-strong">
                    {module.title}
                  </h3>
                </div>

                {module.body || module.shots.length > 0 ? (
                  <div className="case-module__body">
                    {module.body?.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="text-muted max-w-(--container-prose)"
                      >
                        {paragraph}
                      </p>
                    ))}
                    {module.shots.map((shot) => (
                      <Shot
                        key={shot.light}
                        shot={shot}
                        sizes="(max-width: 860px) 100vw, 60vw"
                      />
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
          </ShotTheme>
        </div>
      </section>

      {/* 4 — Teknoloji künyesi. CASE_STACK boşken HİÇ render edilmez
          (socialLinks.ts'teki kural). 5 — Sonuç. Beyaz bant, footer'ın hemen
          üstünde: künye + geri yol/dış bağlantı + "Sahada kullanılıyor"
          (refs/emlakcrmpro-1.png düzeni, beyaz zeminde). Slogan + "Teklif Al"
          kapanış bandı kaldırıldı — global footer'da zaten var. */}
      <section className="surface-paper surface-paper-raised seam px-(--spacing-gutter) pt-(--spacing-section) pb-0">
        <div className="mx-auto max-w-(--container-page)">
          {CASE_STACK.length > 0 ? (
            <div className="case-facts">
              <h2 className="eyebrow text-accent-auto">Teknoloji</h2>
              <ul className="case-facts__list">
                {CASE_STACK.map((entry) => (
                  <li key={entry} className="eyebrow text-strong">
                    {entry}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="case-facts">
            <h2 className="eyebrow text-accent-auto">Sonuç</h2>
            <ul
              className="case-facts__list case-facts__list--result"
              data-enter-stagger
            >
              {CASE_RESULTS.map((entry, index) => (
                <li
                  key={entry}
                  className="font-display text-strong"
                  style={{ "--enter-i": index } as CSSProperties}
                >
                  {entry}
                </li>
              ))}
            </ul>
          </div>

          <div className="case-outro-links">
            <Link href="/portfolyo" className="eyebrow">
              ← Tüm işler
            </Link>
            <a
              href={CASE_EXTERNAL.href}
              className="eyebrow"
              target="_blank"
              rel="noopener"
            >
              {CASE_EXTERNAL.label} ↗
            </a>
          </div>
        </div>

        <div className="case-field" data-enter>
          <p className="case-field__note">{CASE_FIELD_NOTE}</p>
          <div className="case-field__row">
            <p className="case-field__label">Sahada kullanılıyor.</p>
            <ul className="case-field__logos">
              {CASE_FIELD_USERS.map((user) => (
                <li key={user.name}>
                  {user.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.logo.src}
                      alt={user.name}
                      width={user.logo.width}
                      height={user.logo.height}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <span className="case-field__name">{user.name}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
