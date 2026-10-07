/**
 * Emlak CRM Pro'nun ekran görüntüleri ve metni — TEK KAYNAK. İki tüketici:
 * `/portfolyo/emlak-crm-pro` vaka sayfası ve (yalnızca metin) /portfolyo'nun
 * "Yazılım & Uygulama" kartı. Anasayfanın "Öne Çıkan İş" bandı Ekim 2026'da
 * kaldırıldı.
 *
 * EKİM 2026 — KARELER YENİLENDİ: her ekranın AÇIK ve KOYU tema hâli var
 * (`public/images/emlak-crm-pro/crm-<ekran>-<n>.png` ve `…-koyu.png`).
 * Vaka sayfası ikisini üst üste basıyor, sayfadaki tema anahtarı aralarında
 * geçiş yapıyor. Dosya adı kalıbı sabit — yeni bir ekran eklemek için iki
 * dosyayı klasöre koyup aşağıdaki modüle `shot("<ad>", …)` eklemek yeterli.
 * Dosyası henüz olmayan kare (ör. `crm-dashboard-1`) sayfada derleme
 * anında elenir (bkz. sayfadaki `existing`), boş çerçeve basılmaz.
 *
 * ÖLÇÜLER: hepsi ≈1910 × 990 (≈1.93:1). Çerçeve oranı CSS'te sabit
 * (`.home-case-frame`), kadraj `object-fit: cover` + üstten hizalı — uygulama
 * kabuğunun üst barı hep görünür kalıyor.
 *
 * DİKKAT — `caption` BÜYÜK HARFLE yazılır (Türkçe büyütme notu,
 * `portfolio.ts`).
 */
export interface CaseShot {
  /** Açık tema — `public/` köküne göre yol. */
  light: string;
  /** Koyu tema. */
  dark: string;
  /** Çerçevenin altındaki mono künye. BÜYÜK HARF. */
  caption: string;
  /** Türkçe, betimleyici alt metin — dosya adı tekrarı DEĞİL. */
  alt: string;
}

const DIR = "/images/emlak-crm-pro";
const shot = (name: string, caption: string, alt: string): CaseShot => ({
  light: `${DIR}/${name}.png`,
  dark: `${DIR}/${name}-koyu.png`,
  caption,
  alt,
});

/**
 * Vaka sayfasının başlık görseli — dizüstü / tablet / telefon mockup'ı
 * (/portfolyo'nun "Yazılım & Uygulama" kartıyla aynı kare). Tema anahtarına
 * bağlı değil.
 */
export const CASE_LEAD_SHOT = {
  // Ekim 2026: kullanıcının verdiği JPEG — PNG'nin (1.7 MB) yerine. sRGB'ye
  // çevrildi, 2400×1350, ~317 KB. /portfolyo'daki kart da AYNI dosyayı
  // okuyor (portfolioCategories.ts); eski .png silinmişti ama kart hâlâ onu
  // istiyordu — canlıda 404.
  src: "/images/hizmetler/yazilim-uygulama.jpg",
  caption: "EMLAK CRM PRO — MASAÜSTÜ, TABLET VE MOBİL",
  alt: "Emlak CRM Pro'nun portföy ekranı dizüstü bilgisayar, tablet ve telefonda açık",
};

/**
 * Bant metni — brief §5.2'den birebir. METİN DEĞİŞMEDİ.
 *
 * §5.2'nin konumlandırma notu: bu metin ÜRÜN SATMIYOR, yazılım yeteneğini
 * kanıtlıyor.
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

/** Sonuç bölümünün dibindeki not + "Sahada kullanılıyor" bandı (Ekim 2026,
 * kullanıcının metni ve refs/emlakcrmpro-1.png düzeni). Logo dosyası olan
 * ofis görselle, olmayan adla basılır. Realty World dosyası "POYRAZ
 * GAYRİMENKUL" yazısını zaten içeriyor — Poyraz için ayrı satır yok. */
export const CASE_FIELD_NOTE =
  "Gayrimenkul ofislerinin saha ihtiyaçlarına göre tasarlandı. Kurulum ve eğitim desteğiyle birlikte sunulur.";

export const CASE_FIELD_USERS: readonly {
  name: string;
  logo?: { src: string; width: number; height: number };
}[] = [
  {
    name: "Realty World Poyraz Gayrimenkul",
    logo: {
      src: "/images/emlak-crm-pro/Realty_World_Logo_Yatay.png",
      width: 729,
      height: 171,
    },
  },
];

/**
 * Çözüm bölümünün modülleri — ad ve sıra brief §6'dan ("Modül modül, ekran
 * görüntüleriyle"). BÜYÜK HARF.
 *
 * Ekim 2026 eşlemesi (yeni kareler):
 * - Yönetim Paneli: `crm-dashboard-*` — dosyalar henüz yok; gelince
 *   kendiliğinden görünür, gelene dek modül hiç basılmaz (`optional`).
 * - Portföy & Harita: portföy listesi (2 kare) + Coğrafi Analiz
 *   haritası (`crm-harita`, kümeli portföy işaretleri ve fiyat özeti).
 * - Müşteri-Talep Eşleştirme: müşteri listesi, müşteri kartı, eşleştirme.
 * - Raporlar & Danışman Performansı: danışman teması raporu + müşteri
 *   kaynakları raporu (ikisi de "Raporlar" ekranının sekmeleri).
 * - Muhasebe & Hakediş: muhasebe özeti + satış/kiralık işlem detayı.
 * - Takvim & Görevler: karesi YOK — görselsiz satır (`.case-module--bare`).
 *
 * `body` hiçbir modülde yok: brief modüller için yalnızca ad veriyor.
 */
export interface CaseModule {
  id: string;
  title: string;
  body?: readonly string[];
  shots: readonly CaseShot[];
  /** Karesi yoksa modülü hiç basma (görselsiz satır yerine). */
  optional?: boolean;
}

export const CASE_MODULES: readonly CaseModule[] = [
  {
    id: "yonetim-paneli",
    title: "YÖNETİM PANELİ",
    optional: true,
    shots: [
      shot("crm-dashboard-1", "YÖNETİM PANELİ", "Emlak CRM Pro yönetim paneli: portföy, müşteri ve talep özetleri"),
      shot("crm-dashboard-2", "YÖNETİM PANELİ — DETAY", "Emlak CRM Pro yönetim paneli detay görünümü"),
    ],
  },
  {
    id: "portfoy-harita",
    title: "PORTFÖY & HARİTA",
    shots: [
      shot(
        "crm-portfoy-1",
        "PORTFÖY YÖNETİMİ",
        "Emlak CRM Pro portföy ekranı: üstte portföy sayaçları, solda filtreler, sağda fotoğraflı ilan kartları"
      ),
      shot(
        "crm-portfoy-2",
        "PORTFÖY — FİLTRE VE KAPANAN İŞLER",
        "Emlak CRM Pro portföy listesi: kira ve satış durumuna göre filtrelenmiş ilan kartları ve kapanan portföyler"
      ),
      shot(
        "crm-harita",
        "HARİTA GÖRÜNÜMÜ",
        "Emlak CRM Pro coğrafi analiz ekranı: Google haritası üzerinde konumlandırılmış portföyler, kümeleme işaretleri ve sağda portföy sayısı ile ortalama, en düşük, en yüksek fiyat kartları"
      ),
    ],
  },
  {
    id: "eslestirme",
    title: "MÜŞTERİ-TALEP EŞLEŞTİRME",
    shots: [
      shot(
        "crm-musteriler-1",
        "MÜŞTERİLER",
        "Emlak CRM Pro müşteri listesi: telefon, danışman ve görüşme bilgileriyle müşteri kartları"
      ),
      shot(
        "crm-musteriler-2",
        "MÜŞTERİ KARTI",
        "Emlak CRM Pro müşteri detayı: iletişim bilgileri, danışman, belgeler ve görüşme notları"
      ),
      shot(
        "crm-talep-eslestirme",
        "TALEP EŞLEŞTİRME",
        "Emlak CRM Pro eşleştirme ekranı: müşteri talepleri ile portföylerin uyum yüzdesiyle listelendiği tablo"
      ),
    ],
  },
  {
    id: "danisman-performansi",
    title: "RAPORLAR & DANIŞMAN PERFORMANSI",
    shots: [
      shot(
        "crm-raporlar-1",
        "RAPORLAR — DANIŞMANLAR",
        "Emlak CRM Pro danışman raporu: danışman başına temas tablosu, komisyon geliri ve aktivite grafikleri"
      ),
      shot(
        "crm-raporlar-2",
        "RAPORLAR — MÜŞTERİ KAYNAKLARI",
        "Emlak CRM Pro müşteri kaynakları raporu: kaynak dağılımı pasta grafiği ve kaynak detayı listesi"
      ),
    ],
  },
  {
    id: "muhasebe",
    title: "MUHASEBE & HAKEDİŞ",
    shots: [
      shot(
        "crm-muhasebe-1",
        "MUHASEBE",
        "Emlak CRM Pro muhasebe ekranı: toplam ciro, ofis payı ve danışman hakedişi kartları, son işlemler tablosu"
      ),
      shot(
        "crm-muhasebe-2",
        "SATIŞ / KİRALIK İŞLEMİ",
        "Emlak CRM Pro işlem detayı: işlem bedeli, komisyon, ofis ve danışman payları ile taraf bilgileri"
      ),
    ],
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
 * Uygulamanın canlı adresi. Ekim 2026 kullanıcı kararı: brief §5.2'nin "yalnızca
 * sayfanın sonunda, küçük" kuralı gevşetildi — vaka sayfasının başlığında da
 * görünür bir bağlantı olarak duruyor (sonundaki küçük bağlantı da kaldı).
 * Başka sayfa import etmemeli.
 */
export const CASE_EXTERNAL = {
  href: "https://emlakcrmpro.com",
  label: "emlakcrmpro.com",
};
