/**
 * Formun sunucu ↔ istemci sözleşmesi.
 *
 * NEDEN AYRI DOSYA: `actions.ts` bir `"use server"` modülü ve orada YALNIZCA
 * async fonksiyon export edilebilir — `CONTACT_INITIAL_STATE` gibi bir sabit
 * oraya konursa derleme hata verir. Tipler zaten silinir ama sabit silinmez.
 */
export type ContactField = "name" | "email" | "phone" | "subject" | "message";

export interface ContactState {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Partial<Record<ContactField, string>>;
  /**
   * Hata hâlinde formu doldurulmuş bırakmak için geri yollanan değerler.
   * JS açıkken form remount olmadığı için gerekmez; JS KAPALIYKEN sayfa
   * sunucudan yeniden render edildiği için bu olmadan kullanıcı yazdığı
   * her şeyi kaybederdi.
   */
  values?: Partial<Record<ContactField, string>>;
}

export const CONTACT_INITIAL_STATE: ContactState = { status: "idle", message: "" };
