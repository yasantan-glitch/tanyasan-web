/**
 * Portfolyo işlerinin TEK KAYNAĞI — `services.ts` ve `contact.ts` ile aynı
 * desen. Şu an tek tüketicisi anasayfanın "Öne Çıkanlar" bandı; brief §4'ün
 * site haritasındaki `/portfolyo` sayfası kurulduğunda aynı diziyi okuyacak
 * (kategori filtresi `category` alanından türer), liste iki yerde tutulmaz.
 *
 * Görseller `public/images/portfolyo/` altında ve MOCKUP/KAMPANYA KARELERİ —
 * yani kendi kadrajı olan, kompoze edilmiş işler. Bu yüzden hiçbiri
 * `object-fit: contain` ile küçültülmüyor, hepsi kendi karesinde duruyor
 * (bkz. .home-portfolio-frame, globals.css).
 *
 * Ölçüler dosyalardan okundu: yedisi kare/kareye yakın (1080×1080, 1125×1118,
 * 1000×1100, 1000×1050), yalnızca Wellness manzara (3000×1987). `wide` bu tek
 * istisnayı işaretliyor — grid'de iki sütun kaplıyor ve 8 iş 9 hücreye,
 * yani tam üç sıraya oturuyor (boş hücre kalmıyor).
 *
 * SIRA ÖNEMLİ: `wide` olan başta duruyor, editoryal bir açılış veriyor ve
 * 3 sütunlu grid'in ilk satırını (2 + 1) tamamlıyor.
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
  /** Yalnızca manzara oranlı iş: grid'de iki sütun (2/1 kadraj). */
  wide?: boolean;
}

export const PORTFOLIO_ITEMS: readonly PortfolioItem[] = [
  {
    // Dosya adındaki "Welsness" bir yazım hatası; markanın adı Wellness
    // Antalya. Dosya yeniden adlandırılmadı (public/ altındaki varlıklara
    // dokunulmuyor), etiket doğru yazılıyor.
    src: "/images/portfolyo/Welsness_Kurumsal.jpg",
    brand: "WELLNESS ANTALYA",
    category: "KURUMSAL KİMLİK",
    alt: "Wellness Antalya kurumsal kimlik çalışması: antetli kağıt, kartvizit, bloknot ve zarf takımı",
    wide: true,
  },
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
    alt: "Rixos Premium Bodrum Orange Fest konser duyurusu sosyal medya görseli",
  },
  {
    src: "/images/portfolyo/Rixos_Bodrum_Ozan.jpg",
    brand: "RIXOS PREMIUM BODRUM",
    category: "SOSYAL MEDYA",
    alt: "Rixos Premium Bodrum White Party etkinlik duyurusu sosyal medya görseli",
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
];
