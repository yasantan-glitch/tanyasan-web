/**
 * Emlak CRM Pro'nun ekran görüntüleri ve metni — TEK KAYNAK. `portfolio.ts`
 * ve `partners.ts` ile aynı desen. Üç tüketicisi var: anasayfanın "Öne Çıkan
 * İş" bandı (bant 3), `/portfolyo`'nun öne çıkan satırı ve
 * `/portfolyo/emlak-crm-pro` vaka çalışması sayfası. Liste ve metin iki
 * yerde tutulmaz.
 *
 * BEŞ KARE VAR. ANASAYFA DÖRDÜNÜ kullanıyor; dışarıda kalan
 * `emlak-crm-pro-analys.png` (Raporlar — Danışmanlar) yalnızca vaka
 * sayfasında, "Danışman Performansı" modülünde duruyor (`CASE_ADVISOR_SHOT`).
 * Anasayfadaki gerekçe EDİTORYAL, teknik değil: `analys-2.png`
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

/**
 * Anasayfada kullanılmayan beşinci kare — yalnızca vaka sayfasının "Danışman
 * Performansı" modülü. Yukarıdaki dosya başlığı notu.
 */
export const CASE_ADVISOR_SHOT: CaseShot = {
  src: "/images/emlak-crm-pro/emlak-crm-pro-analys.png",
  caption: "DANIŞMAN PERFORMANSI",
  alt: "Emlak CRM Pro danışman raporu: danışman başına telefon, yüz yüze, sunum ve yetki temasları tablosu, altında komisyon geliri ve aktivite sayısı grafikleri",
};

/**
 * Bant metni — brief §5.2'den birebir. Eskiden `app/page.tsx`'te sayfa-yerel
 * bir const'tu; vaka sayfası ve `/portfolyo`'nun öne çıkan satırı da aynı
 * cümleleri okuyunca buraya taşındı. METİN DEĞİŞMEDİ.
 *
 * §5.2'nin konumlandırma notu: bu metin ÜRÜN SATMIYOR, yazılım yeteneğini
 * kanıtlıyor. emlakcrmpro.com bağlantısı yalnızca vaka sayfasının sonunda,
 * küçük bir bağlantı olarak yer alır (`CASE_EXTERNAL`).
 */
export const CASE_TITLE = "SADECE ANLATMIYORUZ, YAPIYORUZ.";

export const CASE_PARAGRAPHS: readonly string[] = [
  "Bir emlak ofisinin portföyünü, müşterilerini, danışman performansını ve muhasebesini tek sistemde topladık. Bugün gerçek bir ofis bu sistemle çalışıyor.",
  "Harita üzerinde portföy yönetimi, otomatik müşteri-ilan eşleştirme, danışman hakediş takibi, çok para birimli muhasebe — hepsi sıfırdan tasarlandı ve kodlandı.",
];

/**
 * Vaka sayfasının anlatı bölümleri — brief §6'nın tablosundan BİREBİR
 * (Problem / Yaklaşım / Sonuç). Brief bu bölümler için yalnızca tek
 * cümleler veriyor; uzatılmadı, uydurulmadı. Daha uzun metin gelirse
 * `paragraphs` dizisine eklenir, sayfa düzeni değişmez.
 */
export const CASE_PROBLEM: readonly string[] = [
  "Emlak ofisleri portföyü Excel'de, müşteriyi WhatsApp'ta, muhasebeyi defterde tutuyor. Hiçbiri konuşmuyor.",
];

export const CASE_APPROACH: readonly string[] = [
  "Önce bir emlak ofisinin gerçek gününü izledik, sonra kod yazdık.",
];

/** Brief §6 "Sonuç" — üç parça, BÜYÜK HARF (mono künye). */
export const CASE_RESULTS: readonly string[] = [
  "CANLI KULLANIMDA",
  "GERÇEK OFİS",
  "BİNLERCE PORTFÖY",
];

/** Brief §6 "Kapanış" cümlesi. */
export const CASE_CLOSING = "SİZİN İŞİNİZ İÇİN DE BENZER BİR SİSTEM KURABİLİRİZ.";

/**
 * Çözüm bölümünün modülleri — ad ve sıra brief §6'dan ("Modül modül, ekran
 * görüntüleriyle"). BÜYÜK HARF (Türkçe büyütme gerekçesi yukarıda).
 *
 * BİLİNÇLİ BOŞLUKLAR:
 * - `body` hiçbir modülde yok: brief modüller için yalnızca ad veriyor.
 *   Metin geldiğinde buraya yazılır, sayfa onu otomatik render eder.
 * - Üç modülün (`eslestirme`, `muhasebe`, `takvim`) ekran görüntüsü yok —
 *   `shots: []`. Sayfa bu modülleri yalnızca adıyla, görselsiz bir satır
 *   olarak basıyor; demo organizasyonundan kare alındığında (brief §6'nın
 *   "gerekli varlık" notu) `public/images/emlak-crm-pro/`e konup buraya
 *   eklenir.
 * - "Portföy & Harita" üç kareyi taşıyor: portföy listesi, coğrafi analiz
 *   ve portföy raporu (anasayfadaki üç destek karesinin tamamı).
 */
export interface CaseModule {
  id: string;
  title: string;
  body?: readonly string[];
  shots: readonly CaseShot[];
}

export const CASE_MODULES: readonly CaseModule[] = [
  {
    id: "portfoy-harita",
    title: "PORTFÖY & HARİTA",
    shots: CASE_SUPPORT_SHOTS,
  },
  {
    id: "eslestirme",
    title: "MÜŞTERİ-TALEP EŞLEŞTİRME",
    shots: [],
  },
  {
    id: "danisman-performansi",
    title: "DANIŞMAN PERFORMANSI",
    shots: [CASE_ADVISOR_SHOT],
  },
  {
    id: "muhasebe",
    title: "MUHASEBE & HAKEDİŞ",
    shots: [],
  },
  {
    id: "takvim",
    title: "TAKVİM & GÖREVLER",
    shots: [],
  },
];

/**
 * TEKNOLOJİ KÜNYESİ — BİLİNÇLİ OLARAK BOŞ (Eylül 2026 kullanıcı kararı:
 * stack bilgisi netleşince doldurulacak). Dizi boş kaldıkça vaka sayfası
 * künye bölümünü HİÇ render etmiyor — `socialLinks.ts`'teki "yer tutucu
 * yazılmaz" kuralının aynısı.
 *
 * Doldururken: BÜYÜK HARF, kısa mono etiketler (ör. "NEXT.JS"). Brief
 * §6'nın taslak listesi (Next.js, Supabase, Google Maps, çok kiracılı
 * mimari) referans olarak orada duruyor, kopyalanmadı.
 */
export const CASE_STACK: readonly string[] = [];

/**
 * Dış bağlantı — brief §5.2: YALNIZCA vaka sayfasının sonunda, küçük bir
 * bağlantı olarak. Başka hiçbir sayfa bunu import etmemeli.
 */
export const CASE_EXTERNAL = {
  href: "https://emlakcrmpro.com",
  label: "emlakcrmpro.com",
};
