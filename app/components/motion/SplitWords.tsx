import type { CSSProperties } from "react";

/**
 * Bir cümleyi kelime `<span>`lerine böler ve her kelimeye kendi scroll
 * menzilini yazar — anasayfanın "kelime kelime çözülen statement"ı için.
 *
 * SERVER COMPONENT: `"use client"` YOK. Kelimeler SSR HTML'ine statik
 * `<span>`ler olarak basılır, hidrasyon beklenmez, JS kapalıyken de cümle
 * eksiksiz okunur. Bölme işi tarayıcıda yapılsaydı ilk karede tek bir düz
 * paragraf görünür, sonra kelimelere ayrılırdı.
 *
 * Menzil neden SUNUCUDA hesaplanıyor:
 * Kademe, CSS'te `calc(... + var(--i) * sabit)` ile de yazılabilirdi ama o
 * durumda toplam süre kelime sayısıyla büyürdü — 8 kelimelik bir cümle
 * yolun yarısında biterken 20 kelimelik cümle sonuna yetişemezdi. Burada
 * pencere kelime sayısına BÖLÜNÜYOR, yani cümle uzunluğu ne olursa olsun
 * hareket statement'ın scroll yolunun aynı dilimine yayılıyor.
 *
 * Menzil `cover START% cover END%` olarak `.home-statement__word` kuralında
 * okunur (globals.css, hareket substratı). Kelimeler ÜST ÜSTE BİNİYOR
 * (OVERLAP): bir kelime bitmeden sonraki başlıyor, aksi halde koyulaşma
 * kesik kesik ilerler ve dalga değil sayaç gibi okunur.
 */

/** Cümlenin çözülmeye başladığı ve bittiği nokta (view timeline `cover` %). */
const WINDOW_FROM = 12;
const WINDOW_TO = 74;
/** Bir kelimenin kendi geçişinin, kendi diliminin kaç katı sürdüğü. */
const OVERLAP = 2.4;

type Props = {
  text: string;
  className?: string;
};

export default function SplitWords({ text, className }: Props) {
  const words = text.split(/\s+/).filter(Boolean);
  const step = (WINDOW_TO - WINDOW_FROM) / Math.max(words.length, 1);

  return (
    <span className={className}>
      {words.map((word, index) => {
        const from = WINDOW_FROM + index * step;
        const to = Math.min(from + step * OVERLAP, 100);

        return (
          <span
            key={`${word}-${index}`}
            className="home-statement__word"
            style={
              {
                "--w-from": `${from.toFixed(2)}%`,
                "--w-to": `${to.toFixed(2)}%`,
              } as CSSProperties
            }
          >
            {/* Kelimeden SONRA boşluk: span'ler arasına konsaydı JSX onu
                kırpardı ve kelimeler birbirine yapışırdı. */}
            {word}{" "}
          </span>
        );
      })}
    </span>
  );
}
