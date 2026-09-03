/**
 * Emlak CRM Pro vitrininin ekran görüntüleri — TEK KAYNAK. `portfolio.ts` ve
 * `partners.ts` ile aynı desen. Şu an tek tüketicisi anasayfanın "Öne Çıkan
 * İş" bandı; brief §4'ün site haritasındaki `/portfolyo/emlak-crm-pro` vaka
 * çalışması sayfası kurulduğunda aynı kareleri o da okuyacak (orada büyük
 * ölçüde ve tek tek anlatılarıyla), liste iki yerde tutulmaz.
 *
 * BEŞ KARE VAR, DÖRDÜ KULLANILIYOR. Dışarıda kalan `emlak-crm-pro-analys.png`
 * (Raporlar — Danışmanlar). Gerekçe EDİTORYAL, teknik değil: `analys-2.png`
 * (Raporlar — Portföy) zaten aynı ekranın kardeşi ve üç destek yuvasının
 * ikisini tek bir bölüme harcamak, bandın "tek sistemde topladık" iddiasını
 * daraltıyor — üç yuva üç ayrı yeteneği gösteriyor (portföy, harita, rapor).
 *
 * NOT: bu kare önce TEKNİK bir sebeple elenmişti (logonun üzerine binmiş bir
 * tooltip artefaktı + üstten/alttan kesik satırlar). Dosya 4 Eylül 2026'da
 * yenilendi, artefakt gitti ve kare açık temaya geçti — yani artık kullanıma
 * hazır bir seçenek. Beşincinin eklenmesi istenirse destek satırı 4 sütuna
 * ya da 2×2'ye çıkar (`.home-case-grid`).
 *
 * ÖLÇÜLER dosyalardan okundu: beşi de 3330–3360 × ~1850, yani ≈1.80:1.
 * Çerçevelere 16/9 (1.778) veriliyor ve kadraj `object-fit: cover` — yan
 * kırpma toplam genişliğin ~%1'i, görünmez. Oran CSS'te sabit olduğu için
 * layout shift de yok.
 *
 * BEŞİ DE AÇIK TEMALI (iki rapor karesi 4 Eylül'de koyudan açığa döndü) ve
 * zeminleri kremimsi beyaz. Bandın ink-deep yüzeyde olmasının ve karelerin
 * beyaz paspartayla çerçevelenmesinin sebebi bu; bkz. design-system §12.
 *
 * DİKKAT — `caption` BÜYÜK HARFLE yazılır, `.eyebrow`in
 * `text-transform: uppercase`ine bırakılmaz. Gerekçe `portfolio.ts`'te
 * ayrıntılı yazılı (<html lang="tr"> altında her "i" → "İ" olur).
 */
export interface CaseShot {
  /** `public/` köküne göre yol. */
  src: string;
  /** Çerçevenin altındaki mono künye. BÜYÜK HARF — yukarıdaki nota bakın. */
  caption: string;
  /** Türkçe, betimleyici alt metin — dosya adı tekrarı DEĞİL. */
  alt: string;
}

/**
 * Bandın açılış karesi, bant genişliğinde. Beşinin en okunaklısı: açık tema,
 * sayfanın tepesinden tam kare, kesik satır yok.
 */
export const CASE_LEAD_SHOT: CaseShot = {
  src: "/images/emlak-crm-pro/emlak-crm-pro-1.png",
  caption: "EMLAK CRM PRO — YÖNETİM PANELİ",
  alt: "Emlak CRM Pro yönetim paneli: portföy, müşteri ve aktif talep sayıları, ofis kasası, son aktiviteler listesi ve portföy dağılımı grafiği",
};

/**
 * Lead'in altındaki üç sütun. Sıra brief §5.2'nin cümlesini takip ediyor:
 * portföy yönetimi → harita üzerinde analiz → raporlama.
 */
export const CASE_SUPPORT_SHOTS: readonly CaseShot[] = [
  {
    src: "/images/emlak-crm-pro/emlak-crm-pro-portfoy.png",
    caption: "PORTFÖY YÖNETİMİ",
    alt: "Emlak CRM Pro portföy listesi: sol tarafta yetki durumu, fiyat ve metrekare filtreleri, sağda ilan kartları",
  },
  {
    src: "/images/emlak-crm-pro/emlak-crm-pro-map.png",
    caption: "HARİTA ÜZERİNDE ANALİZ",
    alt: "Emlak CRM Pro coğrafi analiz ekranı: Antalya haritası üzerinde konumlandırılmış portföyler ve alan analizi paneli",
  },
  {
    src: "/images/emlak-crm-pro/emlak-crm-pro-analys-2.png",
    caption: "RAPORLAR VE KPI",
    alt: "Emlak CRM Pro portföy raporu: satılık ve kiralık sayıları, mülk türü dağılımı grafiği ve statü dağılımı listesi",
  },
];
