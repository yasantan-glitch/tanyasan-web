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
 * SIRA ÖNEMLİ. Eylül 2026'dan önce `wide` (Wellness Antalya) baştaydı;
 * kullanıcı geri bildirimi bu kareyi diğerlerine göre "küçük ve soluk"
 * buldu — rayın AÇILIŞ karesi olması sorunu büyütüyordu, çünkü ilk izlenim
 * en düşük kontrastlı işle kuruluyordu (ölçüldü: dört doygun kampanya
 * afişinin yanında tek düşük kontrastlı flat-lay). Wellness artık 5. sırada
 * (index 4): ray dört doygun sosyal medya işiyle açılıyor, Wellness ikinci
 * satırda tek bir normal kareyle birlikte duruyor. Grid geometrisi
 * DEĞİŞMEDİ — 3 sütun × 3 satır, 9 hücre: satır 1 üç normal iş, satır 2 bir
 * normal iş + `wide` (2 birim), satır 3 üç normal iş. `wide` kaçıncı
 * sırada olursa olsun `grid-auto-flow` bunu otomatik dolduruyor (CSS grid
 * auto-placement); tek şart öncesinde tam olarak BİR normal işin durması
 * (aksi halde satır kayar, boş hücre kalır). Wellness'in kendi görsel
 * zayıflığı (küçük/soluk okunması) `.home-portfolio-media--boost`
 * ile ayrıca telafi ediliyor (bkz. globals.css, `.home-portfolio-frame`
 * yorumunun altında).
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
   * fasetidir ve `/portfolyo` kurulduğunda filtre ondan türeyecek (bkz.
   * dosya başlığı). Etkinlik adını oraya karıştırmak faseti kirletir.
   *
   * BÜYÜK HARF — `brand`/`category` ile aynı Türkçe büyütme gerekçesi.
   */
  event?: string;
  /** Yalnızca manzara oranlı iş: grid'de iki sütun (2/1 kadraj). */
  wide?: boolean;
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
