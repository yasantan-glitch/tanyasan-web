"use client";

import { useEffect, useRef } from "react";

/**
 * Hayler'in saat widget'ı ("CEST Berlin 07:36 PM") — burada İstanbul,
 * 24 saat. Saat sunucuda bilinmiyor (statik sayfa): ilk karede "--:--",
 * mount sonrası DOM'a doğrudan yazılıyor (React state yok, hidrasyon
 * uyuşmazlığı yok). Dakikada bir değil 15 sn'de bir bakıyor — dakika
 * dönümünü en çok 15 sn geç gösterir.
 */
const FORMAT = new Intl.DateTimeFormat("tr-TR", {
  timeZone: "Europe/Istanbul",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export default function FooterClock() {
  const hRef = useRef<HTMLSpanElement>(null);
  const mRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const tick = () => {
      const parts = FORMAT.formatToParts(new Date());
      const hour = parts.find((part) => part.type === "hour")?.value ?? "--";
      const minute = parts.find((part) => part.type === "minute")?.value ?? "--";
      if (hRef.current) hRef.current.textContent = hour;
      if (mRef.current) mRef.current.textContent = minute;
    };
    tick();
    const timer = window.setInterval(tick, 15000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="footer-clock">
      <p className="footer-clock__label">GMT+3 İstanbul</p>
      <p className="footer-clock__time" aria-live="off">
        <span ref={hRef}>--</span>
        <span className="footer-clock__colon" aria-hidden="true">:</span>
        <span ref={mRef}>--</span>
      </p>
    </div>
  );
}
