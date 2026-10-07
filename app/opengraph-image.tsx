import fs from "node:fs";
import path from "node:path";

import { ImageResponse } from "next/og";

export const alt = "Tan Yasan Reklam ve Tasarım Ajansı — Antalya Web Tasarım & Yazılım Ajansı";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Geçici OG görseli (marka varlıklarından). Tasarlanmış bir görselle
 * değiştirilecekse bu dosyayı `opengraph-image.png` ile değiştirmek yeter. */
export default async function OpengraphImage() {
  const logo = fs.readFileSync(path.join(process.cwd(), "public", "Logo_Beyaz.svg"));
  const logoSrc = `data:image/svg+xml;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "0 96px",
          background: "#141414",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt="" width={720} height={223} />
        <div
          style={{
            marginTop: 56,
            width: 96,
            height: 6,
            background: "#e8ae30",
          }}
        />
        <div
          style={{
            marginTop: 36,
            fontSize: 44,
            color: "#ffffff",
            letterSpacing: "-0.01em",
          }}
        >
          Antalya Web Tasarım &amp; Yazılım Ajansı
        </div>
      </div>
    ),
    size,
  );
}
