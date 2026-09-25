import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";

import { NAV_CTA } from "@/app/components/nav/navLinks";
import {
  CASE_APPROACH,
  CASE_CLOSING,
  CASE_EXTERNAL,
  CASE_LEAD_SHOT,
  CASE_MODULES,
  CASE_PARAGRAPHS,
  CASE_PROBLEM,
  CASE_RESULTS,
  CASE_STACK,
  CASE_TITLE,
  type CaseShot,
} from "@/app/content/emlakCrmPro";

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
 * ve `case-focus` odak geçişiyle (globals.css gated blok) duruyor.
 *
 * DIŞ BAĞLANTI (emlakcrmpro.com) brief §5.2 gereği YALNIZCA burada, en
 * sonda ve küçük.
 */

/** Anlatı bölümleri. Sayaç /hakkimda'nın `NN / NN` kalıbı; modüllerin
 * sayacı ayrı (kendi bölümlerini sayıyorlar). */
const STORY = [
  { id: "problem", title: "PROBLEM", paragraphs: CASE_PROBLEM },
  { id: "yaklasim", title: "YAKLAŞIM", paragraphs: CASE_APPROACH },
] as const;

const pad = (n: number) => String(n).padStart(2, "0");

function Shot({ shot, sizes }: { shot: CaseShot; sizes: string }) {
  return (
    <figure>
      <div className="home-case-frame">
        <Image
          src={shot.src}
          alt={shot.alt}
          fill
          sizes={sizes}
          style={{ objectFit: "cover" }}
        />
      </div>
      <figcaption className="home-case-caption eyebrow text-muted">
        {shot.caption}
      </figcaption>
    </figure>
  );
}

export default function EmlakCrmProPage() {
  return (
    <>
      {/* 1 — Başlık. Metin anasayfa bant 3'ün (brief §5.2) aynısı; altında
          yönetim paneli karesi --container-wide genişliğinde. */}
      <section className="surface-ink surface-ink-deep px-(--spacing-gutter) pb-(--spacing-section) pt-[calc(var(--nav-h)+var(--spacing-section))]">
        <div className="mx-auto max-w-(--container-wide)">
          <nav aria-label="Konum" className="case-crumb eyebrow text-muted">
            <Link href="/portfolyo">Portfolyo</Link>
            <span aria-hidden="true">/</span>
            <span className="text-accent-auto">Emlak CRM Pro</span>
          </nav>

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

          <div className="case-lead mt-(--spacing-section-tight)">
            <Shot shot={CASE_LEAD_SHOT} sizes="(max-width: 860px) 100vw, 90vw" />
          </div>
        </div>
      </section>

      {/* 2 — Problem + Yaklaşım. Tek açık yüzey, hairline ayraçlı
          (/hakkimda'nın `.about-section` kalıbı). */}
      <section className="surface-paper seam px-(--spacing-gutter) py-(--spacing-section)">
        <div className="mx-auto max-w-(--container-site)">
          {STORY.map((block, index) => (
            <article
              key={block.id}
              id={block.id}
              className="about-section service-grid"
            >
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
            </article>
          ))}
        </div>
      </section>

      {/* 3 — Çözüm, modül modül. En derin ton: ekran görüntüleri açık temalı,
          gri paspartayla koyu zeminde ayrışıyor (anasayfa bant 3, §12). Sol
          sütunda yapışkan modül adı, sağda kareler akıyor — bant 3'ün "sabit
          anlatı + akan kanıt" okumasının sayfa boyu hali, ama named
          view-timeline'sız: her kare kendi anonim `view()`'iyle odaklanıyor. */}
      <section className="surface-ink surface-ink-deep seam px-(--spacing-gutter) py-(--spacing-section)">
        <div className="mx-auto max-w-(--container-wide)">
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

          <div className="case-modules">
            {CASE_MODULES.map((module, index) => (
              <article
                key={module.id}
                id={module.id}
                className={`case-module service-grid${
                  module.shots.length === 0 ? " case-module--bare" : ""
                }`}
              >
                <div className="service-head">
                  <p className="eyebrow text-accent-auto">
                    {pad(index + 1)} / {pad(CASE_MODULES.length)}
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
                        key={shot.src}
                        shot={shot}
                        sizes="(max-width: 860px) 100vw, 60vw"
                      />
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 4 — Teknoloji künyesi. CASE_STACK boşken HİÇ render edilmez
          (socialLinks.ts'teki kural). 5 — Sonuç. İkisi aynı açık bantta:
          ikisi de kısa, mono künye dilinde. */}
      <section className="surface-paper seam px-(--spacing-gutter) py-(--spacing-section)">
        <div className="mx-auto max-w-(--container-site)">
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
        </div>
      </section>

      {/* 6 — Kapanış. Brief §6'nın cümlesi → İletişim. Dış bağlantı
          (brief §5.2) burada, küçük ve ikincil; "← Tüm işler" geri yolu. */}
      <section className="surface-accent seam px-(--spacing-gutter) py-(--spacing-section)">
        <div className="mx-auto max-w-(--container-wide)">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <p
              className="font-display max-w-[18ch]"
              data-enter="mask"
              style={{
                fontSize: "var(--text-display-xl)",
                lineHeight: "var(--text-display-xl--line-height)",
                letterSpacing: "var(--text-display-xl--letter-spacing)",
                fontWeight: "var(--text-display-xl--font-weight)",
              }}
            >
              {CASE_CLOSING}
            </p>
            <Link href={NAV_CTA.href} className="btn btn-ink eyebrow">
              {NAV_CTA.label}
            </Link>
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
      </section>
    </>
  );
}
