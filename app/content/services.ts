import {
  Camera,
  CodeXml,
  Globe,
  GraduationCap,
  Megaphone,
  Palette,
  type LucideIcon,
} from "lucide-react";

/**
 * Altı hizmet ailesinin TEK KAYNAĞI: sıra, ikon, başlık, kalemler ve uzun
 * metinler burada durur.
 *
 * İki tüketicisi var ve daha da olacak:
 *  - `app/components/hero/heroPhases.ts` — hero'nun 8 fazlı anlatısı; buradan
 *    yalnızca ikon/başlık/kalemleri okur, scroll bütçesi payını (`weight`) ve
 *    faz klibini kendi içinde tutar.
 *  - `app/hizmetler/page.tsx` — aynı altı kalemi, brief §5'in tam metniyle.
 *
 * Sıra = sitenin kanonik hizmet sırası; hero'daki faz sırasıyla birebir aynı
 * olmak zorunda (heroPhases.ts bu diziyi map'liyor). Brief §5 metinleri
 * Yazılım'ı önce listeliyor ama bu yalnızca "yeni hizmet" vurgusudur, sıra
 * değil.
 *
 * Kalem listeleri brief'in bullet'larının ÜST KÜMESİ (ör. Grafik'te
 * "Outdoor, Tabela & Totem"); hero'da kullanılan hâlleri kanonik kabul edildi.
 */
export interface Service {
  /** Hem hero fazının id'si hem /hizmetler'deki #çapa. */
  id: string;
  icon: LucideIcon;
  title: string;
  items: string[];
  /** Brief §5'in açılış paragrafı — /hizmetler'de lead ölçüsünde. */
  lead: string;
  /** Kalan paragraflar. */
  body: string[];
  /**
   * Yalnızca yazılım kaleminde. Brief §5.2 net: emlakcrmpro.com bağlantısı
   * SADECE vaka çalışması sayfasının sonunda, küçük bir bağlantı olarak yer
   * alacak — bu yüzden buradaki hedef iç rota, dış domain değil.
   */
  cta?: { href: string; label: string };
}

export const SERVICES: readonly Service[] = [
  {
    id: "grafik",
    icon: Palette,
    title: "GRAFİK TASARIM",
    lead: "Bir markanın ilk izlenimi genellikle bir logodur. İkincisi bir kartvizit, bir ambalaj, bir sosyal medya gönderisi. Bunların hepsi aynı şeyi söylemeli.",
    body: [
      "Kurumsal kimlik çalışmalarımızda önce markanın ne olduğunu konuşuyoruz, sonra çiziyoruz. Ortaya çıkan iş yıllarca kullanılacak şekilde, kullanım kılavuzuyla birlikte teslim ediliyor.",
    ],
    items: [
      "Kurumsal Kimlik Tasarımı",
      "Logo Tasarımı",
      "Broşür, Katalog & Poster",
      "Sosyal Medya Görselleri",
      "Ambalaj & Etiket",
      "Outdoor, Tabela & Totem",
    ],
  },
  {
    id: "dijital",
    icon: Megaphone,
    title: "DİJİTAL PAZARLAMA",
    lead: "Reklam bütçesi harcamak kolay, geri kazanmak zor. Kampanyaları kurarken ilk sorduğumuz soru şu: bu para geri döndüğünde nereden anlayacağız?",
    body: [
      "Meta ve Google Ads tarafında sertifikalı iş ortağıyız. Kurduğumuz kampanyalar ölçülebilir hedeflerle çalışır, raporlar anlaşılır dilde gelir.",
    ],
    items: [
      "Sosyal Medya Hesap Yönetimi",
      "Meta (Facebook & Instagram) Reklamları",
      "Google Ads Yönetimi",
      "İçerik Pazarlama & Strateji",
      "E-posta Pazarlama",
    ],
  },
  {
    id: "web",
    icon: Globe,
    title: "WEB TASARIMI",
    lead: "Web sitesi bir katalog değil, bir araçtır. Ziyaretçinin ne yapmasını istediğinizi bilmiyorsak, tasarıma başlamıyoruz.",
    body: [
      "Kurduğumuz siteler mobilde hızlı açılır, arama motorlarında bulunur ve siz içeriği kendiniz güncelleyebilirsiniz.",
    ],
    items: ["Kurumsal Web Sitesi", "E-ticaret Sitesi", "Mobil Uygulama Tasarımı"],
  },
  {
    id: "yazilim",
    icon: CodeXml,
    title: "YAZILIM VE UYGULAMA",
    lead: "Hazır çözümler her işletmeye uymuyor. Süreçlerinizi bir yazılıma uydurmak yerine, yazılımı süreçlerinize göre kuruyoruz.",
    body: [
      "20 yıllık tasarım geçmişimiz, geliştirdiğimiz yazılımların yalnızca çalışmasını değil, kullanılmak istenmesini de sağlıyor. Çünkü çoğu kurumsal yazılımın asıl sorunu eksik özellik değil, kimsenin kullanmak istememesi.",
      "Kullandığımız teknolojiler güncel ve kanıtlanmış: Next.js, PostgreSQL, bulut altyapı. Ürettiğimiz sistemler yıllarca ayakta kalacak şekilde kuruluyor.",
    ],
    items: [
      "Özel Web Uygulamaları & Yönetim Panelleri",
      "Çok Kullanıcılı SaaS Platformları",
      "Sistem Entegrasyonu",
      "Süreç Otomasyonu & Raporlama",
      "Bakım, Geliştirme ve Teknik Destek",
    ],
    cta: { href: "/portfolyo/emlak-crm-pro", label: "Vaka Çalışmasını İncele" },
  },
  {
    id: "foto",
    icon: Camera,
    title: "FOTOĞRAF & VİDEO ÇEKİMİ",
    lead: "İyi bir ürün fotoğrafı, iyi bir reklamdan daha çok satar. Kötü bir fotoğraf ise en iyi kampanyayı bile durdurur.",
    body: [
      "Ürün ve mekân çekimlerini reklamda nasıl kullanılacağını bilerek yapıyoruz — çekim planı, kampanya planıyla birlikte çıkıyor.",
    ],
    items: [
      "Ürün ve Mekân Çekimleri",
      "Sosyal Medya İçin Kısa Videolar",
      "Reklam & Tanıtım Filmleri",
    ],
  },
  {
    id: "danismanlik",
    icon: GraduationCap,
    title: "DANIŞMANLIK & EĞİTİM",
    lead: "Bazı işletmelerin ajansa değil, yön bulmaya ihtiyacı var. Bazılarının ise kendi ekibini yetiştirmeye.",
    body: [
      "Dijital pazarlama stratejinizi birlikte kuruyoruz ya da ekibinize işi öğretiyoruz. İkisi de olur.",
    ],
    items: [
      "Dijital Pazarlama Stratejisi Danışmanlığı",
      "Grafik Tasarım Eğitimi",
      "Sosyal Medya Yönetimi Eğitimi",
    ],
  },
];
