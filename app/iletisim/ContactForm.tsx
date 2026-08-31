"use client";

import { ChevronDown } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";

import { SERVICES } from "@/app/content/services";

import { sendContactMessage } from "./actions";
import { CONTACT_INITIAL_STATE, type ContactField } from "./contactState";

/**
 * İletişim formu.
 *
 * JS KAPALIYKEN DE ÇALIŞIR: `useActionState` bir Server Action ile
 * kullanıldığında React formu native olarak POST eder ve sonucu sunucudan
 * render eder. Bu yüzden burada `onSubmit`/`preventDefault` YOK, `alert` YOK
 * ve durum mesajı state'ten okunuyor. Aynı sebeple alanlar kontrolsüz
 * (uncontrolled) ve hata hâlinde `defaultValue` sunucudan dönen
 * `state.values`'tan geliyor — JS'siz turda yazılanlar kaybolmasın diye.
 */
export default function ContactForm() {
  const [state, formAction, pending] = useActionState(
    sendContactMessage,
    CONTACT_INITIAL_STATE,
  );

  /**
   * Spam zaman kontrolü. Mount anında yazılıyor, render sırasında DEĞİL:
   * `Date.now()` JSX içinde okunsaydı sunucu ve istemci farklı değer üretir,
   * hydration patlardı.
   */
  const renderedAtRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (renderedAtRef.current) renderedAtRef.current.value = String(Date.now());
  }, []);

  const errors = state.fieldErrors;
  const initial = (field: ContactField) => state.values?.[field] ?? "";

  /** Hata varsa alanı `aria-invalid` yapıp mesajını `aria-describedby` ile bağlar. */
  const errorProps = (field: ContactField) =>
    errors?.[field]
      ? { "aria-invalid": true, "aria-describedby": `${field}-error` }
      : {};

  if (state.status === "success") {
    return (
      <p className="form-status" data-status="success" role="status">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="contact-form">
      {/* Gönderim hatası (doğrulama ya da taşıma). aria-live: JS'li turda
          form yeniden mount olmadığı için ekran okuyucu değişimi duymalı. */}
      {state.status === "error" ? (
        <p className="form-status" data-status="error" role="alert">
          {state.message}
        </p>
      ) : null}

      {/* Honeypot. `display:none` bazı botlarca atlanır, o yüzden ekran dışına
          taşınıyor (bkz. .honeypot). Klavye ve ekran okuyucudan tamamen
          kapalı — gerçek kullanıcı buraya asla ulaşmamalı. */}
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">Bu alanı boş bırakın</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input ref={renderedAtRef} type="hidden" name="renderedAt" defaultValue="" />

      <div className="field-row">
        <div className="field">
          <label htmlFor="name" className="eyebrow text-muted">
            Ad Soyad *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            maxLength={120}
            defaultValue={initial("name")}
            {...errorProps("name")}
          />
          {errors?.name ? (
            <p id="name-error" className="field-error">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="email" className="eyebrow text-muted">
            E-posta *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            maxLength={200}
            defaultValue={initial("email")}
            {...errorProps("email")}
          />
          {errors?.email ? (
            <p id="email-error" className="field-error">
              {errors.email}
            </p>
          ) : null}
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="phone" className="eyebrow text-muted">
            Telefon
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={40}
            defaultValue={initial("phone")}
          />
        </div>

        {/* Seçenekler SERVICES'ten türüyor — altı hizmetin listesi bu sayfada
            ikinci kez YAZILMIYOR (services.ts tek kaynak). */}
        <div className="field">
          <label htmlFor="subject" className="eyebrow text-muted">
            İlgilendiğiniz hizmet
          </label>
          <div className="select-wrap">
            <select id="subject" name="subject" defaultValue={initial("subject")}>
              <option value="">Seçiniz (opsiyonel)</option>
              {SERVICES.map((service) => (
                <option key={service.id} value={service.title}>
                  {service.title}
                </option>
              ))}
              <option value="Diğer">Diğer</option>
            </select>
            <ChevronDown aria-hidden="true" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      <div className="field">
        <label htmlFor="message" className="eyebrow text-muted">
          Mesajınız *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={7}
          maxLength={5000}
          placeholder="Ne yapmak istediğinizi birkaç cümleyle anlatın."
          defaultValue={initial("message")}
          {...errorProps("message")}
        />
        {errors?.message ? (
          <p id="message-error" className="field-error">
            {errors.message}
          </p>
        ) : null}
      </div>

      <div className="form-submit">
        <button type="submit" className="btn btn-accent eyebrow" disabled={pending}>
          {pending ? "Gönderiliyor…" : "Mesajı Gönder"}
        </button>
        {/* KVKK: onay kutusu değil bilgi notu — tek amaçlı bir iletişim
            formunda zorunlu checkbox gereksiz sürtünme. /kvkk sayfası
            yazıldığında bu satır ona link olur. */}
        <p className="form-note">
          Formu göndererek verdiğiniz bilgilerin yalnızca talebinize dönüş
          yapmak için işlenmesine izin vermiş olursunuz. Bilgiler üçüncü
          kişilerle paylaşılmaz.
        </p>
      </div>
    </form>
  );
}
