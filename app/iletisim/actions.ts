"use server";

import { CONTACT } from "@/app/content/contact";

import type { ContactField, ContactState } from "./contactState";

/**
 * İletişim formunun sunucu tarafı.
 *
 * NEDEN SERVER ACTION, ÜÇÜNCÜ PARTİ FORM SERVİSİ DEĞİL: site Vercel'de
 * barınıyor (brief §1), yani sunucu tarafı zaten elimizde. Formspree/Web3Forms
 * gibi bir aracı, yazılım geliştirdiğini söyleyen bir ajansın kendi sitesinde
 * gereksiz bir dış bağımlılık olurdu — ve mesajlar bir başkasının panelinden
 * geçerdi.
 *
 * NEDEN `resend` NPM PAKETİ DEĞİL: gönderim tek bir POST isteği. Paket
 * eklemek docs/CLAUDE.md'deki "yeni paket eklemeden önce mevcut yolu
 * değerlendir" notuna aykırı olurdu; `fetch` yeterli.
 *
 * PROGRESSIVE ENHANCEMENT: bu bir Server Action olduğu için JS kapalıyken de
 * çalışır (native form POST). Bu yüzden hiçbir şey istemciye bırakılmıyor:
 * doğrulama, spam kontrolü ve durum mesajı tamamen burada üretilip
 * `ContactState` olarak geri dönüyor.
 */

const SUCCESS_MESSAGE = "Mesajınız ulaştı. En kısa sürede dönüş yapacağız.";

/**
 * Kullanıcının hatası değil, bizim tarafımızın hatası — mesaj kaybolmasın
 * diye ikinci bir yol gösteriliyor.
 */
const TRANSPORT_ERROR_MESSAGE = `Mesaj şu anda gönderilemedi. Doğrudan ${CONTACT.email} adresine yazabilir ya da ${CONTACT.phone.display} numarasını arayabilirsiniz.`;

/** Alan bazlı üst sınırlar — hem spam yükünü hem e-posta boyutunu keser. */
const MAX_LENGTH: Record<ContactField, number> = {
  name: 120,
  email: 200,
  phone: 40,
  subject: 120,
  message: 5000,
};

/**
 * Bilinçli olarak gevşek: RFC 5322'yi regex ile kovalamak geçerli adresleri
 * eler. Gerçek doğrulama zaten yanıtın ulaşıp ulaşmadığıdır.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Formun doldurulması için gereken en kısa makul süre. Altı = bot. */
const MIN_FILL_MS = 3000;

function read(formData: FormData, field: ContactField): string {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim().slice(0, MAX_LENGTH[field]) : "";
}

/** Konu satırı tek satır kalmalı — kullanıcı metnine kaçak satır sonu girmesin. */
function singleLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

export async function sendContactMessage(
  _prevState: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // --- Spam: honeypot -------------------------------------------------------
  // Görünmez alan doluysa gönderim BAŞARILI görünür ama hiçbir yere gitmez;
  // bota "engellendin" demek yeni bir deneme davetidir.
  const honeypot = formData.get("website");
  if (typeof honeypot === "string" && honeypot.length > 0) {
    return { status: "success", message: SUCCESS_MESSAGE };
  }

  // --- Spam: doldurma süresi ------------------------------------------------
  // Zaman damgası istemcide mount anında yazılıyor; yoksa/okunamıyorsa kontrol
  // atlanır (JS kapalı kullanıcıyı cezalandırmaz — onu honeypot yakalar).
  const renderedAt = Number(formData.get("renderedAt"));
  if (Number.isFinite(renderedAt) && renderedAt > 0 && Date.now() - renderedAt < MIN_FILL_MS) {
    return { status: "success", message: SUCCESS_MESSAGE };
  }

  const values = {
    name: read(formData, "name"),
    email: read(formData, "email"),
    phone: read(formData, "phone"),
    subject: read(formData, "subject"),
    message: read(formData, "message"),
  };

  // --- Doğrulama ------------------------------------------------------------
  // İstemcideki `required` / `type="email"` yalnızca ilk savunma; tek geçerli
  // doğrulama burada.
  const fieldErrors: Partial<Record<ContactField, string>> = {};
  if (!values.name) fieldErrors.name = "Adınızı yazın.";
  if (!values.email) fieldErrors.email = "E-posta adresinizi yazın.";
  else if (!EMAIL_PATTERN.test(values.email))
    fieldErrors.email = "Bu adres geçerli görünmüyor.";
  if (!values.message) fieldErrors.message = "Kısaca ne yapmak istediğinizi yazın.";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Formda eksik alanlar var.",
      fieldErrors,
      values,
    };
  }

  // --- Gönderim -------------------------------------------------------------
  // Env RUNTIME'da okunuyor: anahtar yokken build kırılmaz, yalnızca gönderim
  // başarısız olur ve kullanıcıya doğrudan e-posta yolu gösterilir.
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO ?? CONTACT.email;
  const from = process.env.CONTACT_FROM;

  if (!apiKey || !from) {
    console.error(
      "[iletisim] RESEND_API_KEY veya CONTACT_FROM tanımlı değil — mesaj gönderilemedi.",
    );
    return { status: "error", message: TRANSPORT_ERROR_MESSAGE, values };
  }

  const subject = values.subject
    ? `Site formu: ${singleLine(values.subject)} — ${singleLine(values.name)}`
    : `Site formu: ${singleLine(values.name)}`;

  const text = [
    `Ad Soyad : ${values.name}`,
    `E-posta  : ${values.email}`,
    values.phone ? `Telefon  : ${values.phone}` : null,
    values.subject ? `Hizmet   : ${values.subject}` : null,
    "",
    values.message,
  ]
    .filter((line) => line !== null)
    .join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        // Gelen kutusundan "Yanıtla" doğrudan gönderene gitsin — formun
        // e-postaya göre tek gerçek avantajı bu.
        reply_to: values.email,
        subject,
        text,
      }),
    });

    if (!response.ok) {
      console.error("[iletisim] Resend %s: %s", response.status, await response.text());
      return { status: "error", message: TRANSPORT_ERROR_MESSAGE, values };
    }
  } catch (error) {
    console.error("[iletisim] Gönderim isteği başarısız:", error);
    return { status: "error", message: TRANSPORT_ERROR_MESSAGE, values };
  }

  return { status: "success", message: SUCCESS_MESSAGE };
}
