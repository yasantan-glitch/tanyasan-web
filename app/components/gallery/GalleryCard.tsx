import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

/**
 * Galeri karesi — gertix.studio "Beitragsgalerie" kartının karşılığı
 * (Ekim 2026). İki yerde AYNI kart: anasayfa portfolyo galerisi (bant 4) ve
 * /portfolyo kategori kartlarının detay görünümü — kullanıcı isteği: detaydaki
 * görseller anasayfa galerisinin hover efektini kullansın.
 *
 * Düzen: üstte künye satırı (marka solda, kategori sağda — gertix'te başlık
 * + tarih), ortada görsel (kendi kutusundan 0.5rem içeride kırpılmış),
 * altta kapalı bir açıklama paneli. Hover'da görsel yukarıdan da içeri
 * çekilip küçülür, panel 12rem açılır (globals.css `.gallery-card`).
 *
 * `href` yoksa kart bir `<div>` — tıklanabilirlik ima edilmez.
 */
export interface GalleryCardProps {
  src: string;
  alt: string;
  brand: string;
  meta: string;
  description: string;
  href?: string;
  more?: string;
  sizes: string;
  className?: string;
  style?: CSSProperties;
}

export default function GalleryCard({
  src,
  alt,
  brand,
  meta,
  description,
  href,
  more,
  sizes,
  className,
  style,
}: GalleryCardProps) {
  const inner = (
    <>
      <span className="gallery-card__head">
        <span className="gallery-card__brand">{brand}</span>
        <span className="gallery-card__meta">{meta}</span>
      </span>
      <span className="gallery-card__thumb">
        <Image src={src} alt={alt} fill sizes={sizes} draggable={false} />
      </span>
      <span className="gallery-card__excerpt">
        <span className="gallery-card__text">{description}</span>
        {more ? <span className="gallery-card__more">{more}</span> : null}
      </span>
    </>
  );

  return (
    <article
      className={`gallery-card${className ? ` ${className}` : ""}`}
      style={style}
    >
      {href ? (
        <Link href={href} className="gallery-card__body" draggable={false}>
          {inner}
        </Link>
      ) : (
        <div className="gallery-card__body">{inner}</div>
      )}
    </article>
  );
}
