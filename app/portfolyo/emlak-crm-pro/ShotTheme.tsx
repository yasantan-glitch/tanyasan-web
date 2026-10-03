"use client";

import { useState, type ReactNode } from "react";

/**
 * Vaka sayfasındaki ekran görüntülerinin tema anahtarı (Ekim 2026). Her kare
 * açık ve koyu hâliyle üst üste basılı (sunucuda); bu bileşen yalnızca
 * sarmalayıcıdaki `data-shot-theme`i çeviriyor, geçişi CSS yapıyor
 * (koyu kare soldan sağa bir perdeyle açılıyor — globals.css `.case-shot`).
 *
 * Anahtar bölümün içinde sticky: hangi modülde olursanız olun bir dokunuşla
 * tüm kareler birlikte döner. JS kapalıyken açık tema görünür, içerik eksiksiz.
 */
type Theme = "light" | "dark";

const OPTIONS: readonly { value: Theme; label: string }[] = [
  { value: "light", label: "Açık tema" },
  { value: "dark", label: "Koyu tema" },
];

export default function ShotTheme({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  return (
    <div className="shot-theme" data-shot-theme={theme}>
      <div className="shot-theme__bar">
        <div className="shot-theme__switch" role="group" aria-label="Ekran görüntüsü teması">
          {OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className="shot-theme__option eyebrow"
              aria-pressed={theme === option.value}
              onClick={() => setTheme(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
}
