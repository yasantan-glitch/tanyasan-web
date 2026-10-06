/**
 * ANASAYFA galerisinin (bant 4) işleri — `wide` olmayanlar sırayla gösterilir,
 * her kare kendi kategorisinin /portfolyo kartına gider (kategori adı
 * `portfolioCategories`'in başlığıyla BİREBİR aynı olmalı).
 *
 * /portfolyo'nun işleri artık buradan DEĞİL, `public/images/portfolyo/`
 * altındaki kategori klasörlerinden okunuyor (bkz. portfolioFolders.ts). Bu
 * dosyadaki görseller klasörlerin dışındaki düz dosyalar; kalan tüketici
 * `serviceMedia.ts` (Wellness ve Rixos Ozan'ı `src` ile arıyor — silmeyin).
 *
 * Görseller MOCKUP/KAMPANYA KARELERİ — kendi kadrajı olan, kompoze edilmiş
 * işler. `wide` (manzara) işler galeriden süzülür; Wellness bunun tek
 * örneği ve yalnızca `serviceMedia` için duruyor. Mavi Akdeniz uygulama
 * karesi 3000×1987 manzara olduğu halde bilerek `wide` işaretlenmedi:
 * galeride kare kadraja kırpılıyor (kullanıcı kararı, Ekim 2026).
 *
 * Wellness'in görsel zayıflığı `.home-portfolio-media--boost` ile telafi
 * ediliyor (bkz. globals.css) — yalnızca ona `boost` verilir.
 */
/**
 * DİKKAT — `brand` ve `category` BÜYÜK HARFLE yazılır, `.eyebrow`in
 * `text-transform: uppercase`ine bırakılmaz. Sebep: <html lang="tr"> altında
 * tarayıcı Türkçe büyütme kuralını uygular ve her "i" harfi "İ" olur. Türkçe
 * sözcüklerde doğru ("kimlik" → "KİMLİK") ama yabancı özel adlarda değil:
 * "Rixos Premium" → "RİXOS PREMİUM", "City" → "CİTY". Metin zaten büyükse
 * dönüşümün değiştireceği bir şey kalmıyor; doğru yazım burada sabitleniyor.
 * Doğal yazım gerektiğinde `alt` metinlerinde duruyor.
 */
export interface PortfolioItem {
  /** `public/` köküne göre yol. */
  src: string;
  /** Künyenin üst satırı. BÜYÜK HARF — yukarıdaki nota bakın. */
  brand: string;
  /** Künyenin alt satırı. Brief §7'nin kategorileri, BÜYÜK HARF. */
  category: string;
  /** Türkçe, betimleyici alt metin — dosya adı tekrarı DEĞİL. */
  alt: string;
  /**
   * AYIRT EDİCİ ALT ETİKET — yalnızca aynı `brand` + `category` çifti
   * dizide birden fazla kez geçtiğinde doldurulur. Künye bugün iki satır
   * basıyor (marka / kategori); aynı müşterinin aynı kategorideki iki işi
   * yan yana geldiğinde iki ÖZDEŞ etiket okunuyor ve iş yanlışlıkla
   * kopyalanmış gibi görünüyor (Rixos Premium Bodrum'un iki etkinlik
   * kampanyası). Bu alan ikinci satıra `KATEGORİ · ETKİNLİK` olarak
   * ekleniyor.
   *
   * NEDEN `category`NİN İÇİNE YAZILMIYOR: `category`, brief §7'nin
   * fasetidir ve `/portfolyo`'nun filtresi ondan türüyor (bkz.
   * dosya başlığı). Etkinlik adını oraya karıştırmak faseti kirletir.
   *
   * BÜYÜK HARF — `brand`/`category` ile aynı Türkçe büyütme gerekçesi.
   */
  event?: string;
  /** Yalnızca manzara oranlı iş: grid'de iki sütun (2/1 kadraj). */
  wide?: boolean;
  /** Vaka sayfası olan iş (yalnızca /portfolyo detayında): kare bu adrese gider. */
  href?: string;
  /** Piksel boyutu (yalnızca klasör işleri) — tam ekran görünümde `next/image`. */
  width?: number;
  height?: number;
  /**
   * `.home-portfolio-media--boost` (scale 1.14 + doygunluk/kontrast artışı)
   * — YALNIZCA Wellness Antalya için, kendi görsel zayıflığını (küçük/soluk
   * okunması) telafi etmek üzere. `wide` İLE AYNI ALAN DEĞİL: beş yeni WEB
   * TASARIM işi de `wide` ama zaten yüksek kontrastlı ekran görüntüleri,
   * onlara boost YOK — `wide` olan her işe otomatik uygulanmaz.
   */
  boost?: boolean;
}

export const PORTFOLIO_ITEMS: readonly PortfolioItem[] = [
  {
    src: "/images/portfolyo/GR_Terra_City.jpg",
    brand: "GOLDEN ROSE TERRA CITY",
    category: "SOSYAL MEDYA",
    alt: "Golden Rose Terra City için hazırlanan yılbaşı kampanyası sosyal medya görseli",
  },
  {
    src: "/images/portfolyo/Nur_Pastaneleri.jpeg",
    brand: "NUR PASTANELERİ",
    category: "SOSYAL MEDYA",
    alt: "Nur Pastaneleri için hazırlanan ürün tanıtımı sosyal medya görseli",
  },
  {
    src: "/images/portfolyo/Rixos_Bodrum_Chealse.jpeg",
    brand: "RIXOS PREMIUM BODRUM",
    category: "SOSYAL MEDYA",
    event: "ORANGE FEST",
    alt: "Rixos Premium Bodrum Orange Fest konser duyurusu sosyal medya görseli",
  },
  {
    src: "/images/portfolyo/Rixos_Bodrum_Ozan.jpg",
    brand: "RIXOS PREMIUM BODRUM",
    category: "SOSYAL MEDYA",
    event: "WHITE PARTY",
    alt: "Rixos Premium Bodrum White Party etkinlik duyurusu sosyal medya görseli",
  },
  {
    // Dosya adındaki "Welsness" bir yazım hatası; markanın adı Wellness
    // Antalya. Dosya yeniden adlandırılmadı (public/ altındaki varlıklara
    // dokunulmuyor), etiket doğru yazılıyor.
    src: "/images/portfolyo/Welsness_Kurumsal.jpg",
    brand: "WELLNESS ANTALYA",
    category: "KURUMSAL KİMLİK",
    alt: "Wellness Antalya kurumsal kimlik çalışması: antetli kağıt, kartvizit, bloknot ve zarf takımı",
    wide: true,
    boost: true,
  },
  {
    src: "/images/portfolyo/mavi_akdeniz.jpg",
    brand: "MAVİ AKDENİZ ALÜMİNYUM & PVC",
    category: "KURUMSAL KİMLİK",
    alt: "Mavi Akdeniz Alüminyum & PVC kurumsal kimlik çalışması: antetli kağıt ve kartvizit",
  },
  {
    src: "/images/portfolyo/Yuner_Hali.jpg",
    brand: "YÜNER HALI",
    category: "KURUMSAL KİMLİK",
    alt: "Yüner Halı logo ve kurumsal kimlik çalışması: kartvizit ve renk varyasyonları",
  },
  {
    src: "/images/portfolyo/Zenges_Logo.jpg",
    brand: "ZENGES ENERJİ",
    category: "LOGO",
    alt: "Zenges Enerji logo tasarımı ve baskı uygulaması",
  },

  {
    src: "/images/portfolyo/Gizemerdem_Logo.jpg",
    brand: "GİZEMERDEM",
    category: "LOGO",
    alt: "Gizemerdem Medikal Estetik & Güzellik logo tasarımı ve renk varyasyonları",
  },
  {
    src: "/images/portfolyo/Poyraz_Gayrimenkul_Kurumsal.jpg",
    brand: "POYRAZ GAYRİMENKUL",
    category: "KURUMSAL KİMLİK",
    alt: "Poyraz Gayrimenkul Kiralık Hizmetleri kurumsal kimlik çalışması: logo ve renk varyasyonları",
  },
  {
    src: "/images/portfolyo/Suufle_Kurumsal.jpg",
    brand: "SUUFLE",
    category: "KURUMSAL KİMLİK",
    alt: "Suufle marka kimliği kılavuzu: renk paleti ve logo kullanım varyasyonları",
  },
  {
    src: "/images/portfolyo/Alvis_Sosyal.jpg",
    brand: "ALVİS PURE BEAUTY",
    category: "SOSYAL MEDYA",
    alt: "Alvis Pure Beauty gül suyu serisi için ürün tanıtımı sosyal medya görseli",
  },
  {
    src: "/images/portfolyo/Anemon_Dental_Sosyal.jpg",
    brand: "ANEMON DENTAL CLINIC",
    category: "SOSYAL MEDYA",
    alt: "Anemon Dental Clinic diş tedavileri için hazırlanan reklam sosyal medya görseli",
  },
  {
    src: "/images/portfolyo/Gizemerdem_Sosyal.jpg",
    brand: "GİZEMERDEM",
    category: "SOSYAL MEDYA",
    alt: "Gizemerdem açılış kampanyası için hazırlanan indirim duyurusu sosyal medya görseli",
  },
  {
    src: "/images/portfolyo/Maxiumu_Sosyal.jpg",
    brand: "MAXIUMU",
    category: "SOSYAL MEDYA",
    alt: "Maxiumu hukuk danışmanlığı için hazırlanan tanıtım reklamı sosyal medya görseli",
  },

  // — Ekim 2026: anasayfa galerisine eklenen altı iş —

  {
    // 3000×1987 manzara; `wide` DEĞİL (galeriden süzülmesin) — kare kadraja
    // `object-fit: cover` ile kırpılıyor.
    src: "/images/portfolyo/Mavi_Akdeniz_Kurumsal_Uygulama.jpg",
    brand: "MAVİ AKDENİZ ALÜMİNYUM & PVC",
    category: "KURUMSAL KİMLİK",
    event: "KURUMSAL KİMLİK · UYGULAMA",
    alt: "Mavi Akdeniz Alüminyum & PVC kurumsal kimlik uygulamaları",
  },
  {
    src: "/images/portfolyo/Suufle_Kurumsal_Kimlik-1.jpg",
    brand: "SUUFLE",
    category: "KURUMSAL KİMLİK",
    event: "KURUMSAL KİMLİK · UYGULAMA",
    alt: "Suufle kurumsal kimlik uygulaması",
  },
  {
    src: "/images/portfolyo/aggik-logo.webp",
    brand: "AGGİK",
    category: "LOGO",
    alt: "Aggik logo tasarımı",
  },
  {
    src: "/images/portfolyo/Emor-Logo.jpg",
    brand: "EMOR",
    category: "LOGO",
    alt: "Emor logo tasarımı",
  },
  {
    src: "/images/portfolyo/Hoop-Vize-Görsel.jpg",
    brand: "HOOP VİZE HİZMETLERİ",
    category: "SOSYAL MEDYA",
    event: "SOSYAL MEDYA · VİZE DANIŞMANLIĞI",
    alt: "Hoop Vize Hizmetleri için hazırlanan sosyal medya görseli",
  },
  {
    src: "/images/portfolyo/SCHENGEN-Hikaye.jpg",
    brand: "HOOP VİZE HİZMETLERİ",
    category: "SOSYAL MEDYA",
    event: "SOSYAL MEDYA · SCHENGEN HİKAYESİ",
    alt: "Schengen vizesi için hazırlanan dikey hikaye formatında sosyal medya görseli",
  },
];
