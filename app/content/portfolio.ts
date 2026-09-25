/**
 * Portfolyo işlerinin TEK KAYNAĞI — `services.ts` ve `contact.ts` ile aynı
 * desen. İki tüketicisi var: anasayfanın "Öne Çıkanlar" bandı (bant 4, yatay
 * ray — TÜM işleri sırayla gösterir, filtresiz) ve `/portfolyo` (tam liste;
 * kategori filtresi `category` alanından türüyor — bkz.
 * app/portfolyo/PortfolioFilter.tsx). Liste iki yerde tutulmaz.
 *
 * Görseller `public/images/portfolyo/` altında ve MOCKUP/KAMPANYA KARELERİ —
 * yani kendi kadrajı olan, kompoze edilmiş işler. Bu yüzden hiçbiri
 * `object-fit: contain` ile küçültülmüyor, hepsi kendi karesinde duruyor
 * (bkz. .home-portfolio-frame, globals.css).
 *
 * Eylül 2026: kullanıcının kendi kaynak klasöründen (bkz. sohbet geçmişi)
 * 16 iş eklendi ve brief §7'nin o güne dek boş kalan "WEB TASARIM"
 * kategorisi ilk kez dolduruldu — 8'den 24 işe, 4'ten 5 kategoriye çıkıldı.
 *
 * `wide` (grid'de 2 sütun / 2:1 kadraj) İKİ FARKLI SEBEPLE işaretleniyor:
 * kurumsal kimlik mockup'ı manzara olduğu için (Wellness, tek istisna,
 * 3000×1987) ve web tasarım ekran görüntüleri 16:9 olduğu için (5 yeni
 * WEB TASARIM işinin tamamı, 1920×1080 — bir site ekranını 1:1'e sıkıştırıp
 * üst/alt kırpmak yerine kendi oranına yakın 2:1 çerçeve kullanılıyor).
 * Geri kalan tüm işler kare/kareye yakın (1080×1080, 1125×1118, 1000×1100,
 * 1000×1050, 1200×1200).
 *
 * SIRA'nın kesin bir 3×3 hücre matematiğiyle ilişkisi YOK (bu, 8 işlik eski
 * listenin özel bir durumuydu — bkz. git geçmişi). `wide` kaçıncı sırada
 * olursa olsun `grid-auto-flow` bunu otomatik dolduruyor (CSS grid
 * auto-placement, hem /portfolyo'nun taban grid'inde hem anasayfanın
 * `@supports` desteklemediği/`reduced-motion` taban halinde) — sıra artık
 * yalnızca okunabilirlik için: aynı marka art arda gelmiyor, kategoriler
 * gruplanmıyor (TÜMÜ görünümü karışık kalsın diye, bkz. PortfolioFilter).
 * Wellness'in kendi görsel zayıflığı (küçük/soluk okunması)
 * `.home-portfolio-media--boost` ile ayrıca telafi ediliyor (bkz.
 * globals.css, `.home-portfolio-frame` yorumunun altında) — bu boost SADECE
 * Wellness'e `className` ile veriliyor, yeni `wide` işlere DEĞİL (web
 * tasarım ekran görüntüleri zaten yüksek kontrastlı, telafi gerekmiyor).
 *
 * Anasayfanın yatay rayı (`.home-portfolio-rail`, gated blok) `wide`
 * işleri GİZLER (Eylül 2026 kararı, `--home-portfolio-units` bunları
 * saymıyor) — yani 6 `wide` iş (Wellness + 5 web tasarım) yalnızca
 * /portfolyo'da görünür, anasayfa rayında değil. Bu davranış DEĞİŞMEDİ,
 * yalnızca gizlenen iş sayısı arttı.
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
  /**
   * `.home-portfolio-media--boost` (scale 1.14 + doygunluk/kontrast artışı)
   * — YALNIZCA Wellness Antalya için, kendi görsel zayıflığını (küçük/soluk
   * okunması) telafi etmek üzere. `wide` İLE AYNI ALAN DEĞİL: beş yeni WEB
   * TASARIM işi de `wide` ama zaten yüksek kontrastlı ekran görüntüleri,
   * onlara boost YOK — `wide` olan her işe otomatik uygulanmaz.
   */
  boost?: boolean;
}

/**
 * TARİHÇE — WebP kodlayıcı bug'ı (Eylül 2026). Beş yeni WEB TASARIM işi
 * ilk yüklendiğinde kaynak PNG (1920×1080, alfa kanallı) sharp/libvips'in
 * WebP kodlayıcısında belirli genişliklerde DETERMİNİSTİK olarak asılıyordu
 * — `Accept: image/webp` gönderen her tarayıcıda (Chrome/Edge varsayılanı)
 * gerçek kullanıcı için sonsuz yüklenen bir kareye denk gelirdi. Kaynağı
 * temiz sRGB JPEG'e çevirmek (bu dosya `public/images/portfolyo/*.jpg`
 * olarak duruyor, alfa YOK) sorunu ortadan kaldırdı — sharp'ın PNG→WebP
 * yolu bu beş dosyanın piksel içeriğiyle ilgili bir performans ucundan
 * düşüyordu, JPEG→WebP'de aynı uç yok. Ara geçici çözüm olarak eklenen
 * `PortfolioItem.unoptimized` alanı bu yüzden KALDIRILDI — yeniden
 * eklemeden önce önce kaynağı JPEG'e çevirmeyi deneyin, genelde yeterli.
 */

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
    category: "LOGO & LOGOTYPE",
    alt: "Zenges Enerji logo tasarımı ve baskı uygulaması",
  },

  // — Eylül 2026 genişlemesi (16 iş, bkz. dosya başlığı) —

  {
    src: "/images/portfolyo/Poyraz_Emlak_Web.jpg",
    brand: "POYRAZ EMLAK",
    category: "WEB TASARIM",
    alt: "Poyraz Emlak Gayrimenkul için sıfırdan tasarlanan ve kodlanan kurumsal web sitesi",
    wide: true,
  },
  {
    src: "/images/portfolyo/Poyraz_Global_Web.jpg",
    brand: "POYRAZ GLOBAL",
    category: "WEB TASARIM",
    alt: "Poyraz Global proje pazarlama ve satış sitesi: proje vitrini ve portföy filtreleri",
    wide: true,
  },
  {
    src: "/images/portfolyo/Evim_Door_Web.jpg",
    brand: "EVİM DOOR",
    category: "WEB TASARIM",
    alt: "Evim Door çelik kapı markası için kurumsal tanıtım sitesi",
    wide: true,
  },
  {
    src: "/images/portfolyo/Hoop_Vize_Web.jpg",
    brand: "HOOP VİZE HİZMETLERİ",
    category: "WEB TASARIM",
    alt: "Hoop Vize Hizmetleri danışmanlık sitesi: başvuru formu ve süreç anlatımı",
    wide: true,
  },
  {
    src: "/images/portfolyo/Kemer_MasterCup_Web.jpg",
    brand: "KEMER MASTER CUP",
    category: "WEB TASARIM",
    alt: "Kemer Master Cup uluslararası basketbol turnuvası için etkinlik ve istatistik sitesi",
    wide: true,
  },
  {
    src: "/images/portfolyo/Anemon_Dental_Logo.webp",
    brand: "ANEMON DENTAL CLINIC",
    category: "LOGO & LOGOTYPE",
    alt: "Anemon Dental Clinic logo tasarımı ve renk varyasyonları",
  },
  {
    src: "/images/portfolyo/Trio_Akademi_Logo.jpg",
    brand: "TRIO AKADEMİ",
    category: "LOGO & LOGOTYPE",
    alt: "Trio Akademi (Ecz. Özlem Çölkesen) logo tasarımı",
  },
  {
    src: "/images/portfolyo/Gizemerdem_Logo.jpg",
    brand: "GİZEMERDEM",
    category: "LOGO & LOGOTYPE",
    alt: "Gizemerdem Medikal Estetik & Güzellik logo tasarımı ve renk varyasyonları",
  },
  {
    src: "/images/portfolyo/Hedef_Spor_Logo.webp",
    brand: "HEDEF SPOR KULÜBÜ",
    category: "LOGO & LOGOTYPE",
    alt: "Hedef 33 Spor Kulübü basketbol takımı forma arması logo tasarımı",
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
    src: "/images/portfolyo/Turksoy_Kurumsal.jpg",
    brand: "TÜRKSOY",
    category: "KURUMSAL KİMLİK",
    alt: "Türksoy için hazırlanan kartvizit kurumsal kimlik mockup'ı",
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
];
