# tanyasan.com — Yeniden Tasarım Brief'i

Bu doküman, tanyasan.com'un yeni sürümü için alınan tüm kararları,
metinleri ve teknik yönlendirmeleri içerir. Claude Code'a bu dosyayı
vererek geliştirmeye başlayabilirsin.

---

## 1. Projenin özeti

Tan Yasan Reklam ve Tasarım Ajansı'nın mevcut sitesi yenileniyor.
İki temel amaç var:

1. **Konumlandırma değişikliği** — Ajans artık sadece grafik tasarım ve
   dijital pazarlama yapmıyor; yazılım geliştirme de bir hizmet çizgisi.
   Site bunu yansıtmalı.
2. **Görsel sıçrama** — Mevcut site şablon hissi veriyor (stok fotoğraf
   hero, düz kart grid'leri). Yeni site, ajansın kendi işini
   satabilecek kalitede olmalı.

**Barındırma:** Vercel. Domain Hostinger'da kayıtlı kalır, DNS Vercel'e
yönlendirilir.

---

## 2. Marka ve görsel yön

### Palet

Mevcut kimlikten türetildi — logo aksanı ve buton renginden.

| Rol | Değer | Kullanım |
|---|---|---|
| Arka plan (koyu) | `#1C1C1C` civarı | Hero, header, footer |
| Aksan | Amber/turuncu (logodan alınacak kesin değer) | CTA, vurgu, hero ağ çizgileri |
| Metin (açık) | `#FFFFFF` / `#E8E8E8` | Koyu zemin üzeri |
| Arka plan (açık) | `#FAFAFA` | İçerik bölümleri |
| Metin (koyu) | `#1C1C1C` | Açık zemin üzeri |

> **Yapılacak:** Logo SVG'sinden aksan renginin kesin hex değeri alınmalı.

### Tipografi

Mevcut sitede geometrik sans (Poppins benzeri) kullanılıyor. Yeni sitede
başlık ve gövde ayrımı belirginleşmeli:

- **Display/başlık:** Karakterli, geniş ağırlık aralığı olan bir sans.
  Hero başlığı çok büyük kullanılacak, o boyutta iyi duran bir yüz seçilmeli.
- **Gövde:** Okunabilirlik öncelikli, nötr bir sans.
- **Utility:** Etiket, rakam, küçük metin için.

> Şablon hissinden kaçınmak için, hazır tema fontlarından uzak durulmalı.

---

## 3. Hero bölümü

### Metin

```
FARK YARATAN TASARIM,
İŞLEYEN SİSTEM

Markanızı görünür kılın, süreçlerinizi hızlandırın.

[ HİZMETLER ]   [ PROJELERİMİZ ]
```

İki CTA bilinçli: artık iki farklı kitle var — tasarım işi arayan ve
yazılım/sistem arayan.

### Görsel konsept

Soyut motion graphic: koyu zeminde dağınık amber noktalar, scroll
ilerledikçe birbirine bağlanarak bir ağ (mesh) oluşturuyor, sonda kamera
ağın içinden geçiyor.

**Anlatı:** dağınık dijital varlıklar → bağlantılı, yönetilen sistem.
Slogan ile birebir örtüşüyor: *fark yaratan tasarım* = görünürlük
(dağınık noktalar), *işleyen sistem* = birleşen ağ.

**Video:** Higgsfield ile üretildi (Kling 3.0, 10 saniye, 16:9).
Dosya projeye eklenecek.

### Scroll akışı

| Scroll | Ne olur |
|---|---|
| %0–20 | Video ilk karede. Noktalar dağınık. Sadece logo görünür. Alt köşede "kaydır" işareti. |
| %20–50 | Video karesi scroll'a bağlı ilerler. Noktalar yaklaşır, ilk çizgiler çizilir. Başlığın ilk satırı belirir. |
| %50–80 | Ağ yoğunlaşır. Başlığın ikinci satırı ve alt başlık girer. |
| %80–100 | Kamera ağın içinden geçer. CTA'lar sabitlenir. Hizmetler bölümü yukarı kayarak devralır. |

### Logo animasyonu — önemli teknik not

Logo dönüşümü **videoda değil, kod tarafında** yapılacak.

Higgsfield videosu arka planda scroll ile ilerlerken, üst katmanda
gerçek SVG logo durur. Scroll ilerledikçe logonun path'leri sırayla
çizilir (SVG stroke-dasharray animasyonu). Ağdaki çizgiler birleşirken
logo da çizilerek ortaya çıkar.

**Neden böyle:** AI video modelleri logo ve metni bozuk üretir. Vektör
logo kod tarafında birebir doğru, her ekranda keskin, sonradan
değiştirilebilir ve ek maliyet getirmez.

**Gereksinim:** SVG'nin path'leri temiz ve ayrıştırılabilir olmalı
(outline'a çevrilmiş, gereksiz gruplama olmadan). Geliştirme
aşamasında kontrol edilecek.

### Performans ve erişilebilirlik

- `prefers-reduced-motion` desteklenmeli — hareket kapalıysa video
  yerine durağan bir kare gösterilmeli.
- Mobilde scroll-scrubbing pahalı olabilir; düşük çözünürlüklü sürüm
  veya tamamen statik alternatif düşünülmeli.
- Video boyutu optimize edilmeli (WebM + MP4, poster görseli).
- Klavye ile gezinilebilir olmalı, focus göstergeleri görünür kalmalı.

---

## 4. Site haritası

```
/                        Anasayfa
/hizmetler               Tüm hizmetler
/portfolyo               Portfolyo (kategorili)
/portfolyo/emlak-crm-pro Vaka çalışması
/hakkimda                Hakkımda
/iletisim                İletişim
/blog                    Blog (altyapı şimdi, içerik sonra)
```

### Anasayfa bölüm sırası

1. Hero (scroll videolu)
2. Kısa tanıtım — kim olduğu, 20 yıllık deneyim
3. Hizmetler özeti — 6 kart
4. Öne çıkan iş: Emlak CRM Pro vitrini (tam genişlik)
5. Portfolyo teaser — seçilmiş 6-8 görsel + "Tümünü Gör"
6. Partner rozetleri (Meta / Google Ads / Yandex)
7. İletişim CTA

### URL yönlendirmesi

Mevcut `/grafik-tasarim` sayfası `/portfolyo`'ya **301** ile
yönlendirilmeli. `next.config.js` içinde tanımlanır. Eski adresin arama
motorlarında biriktirdiği değer korunur.

---

## 5. Metinler

### 5.1 Yazılım Geliştirme (yeni hizmet)

> **Yazılım Geliştirme**
>
> Hazır çözümler her işletmeye uymuyor. Süreçlerinizi bir yazılıma
> uydurmak yerine, yazılımı süreçlerinize göre kuruyoruz.
>
> 20 yıllık tasarım geçmişimiz, geliştirdiğimiz yazılımların yalnızca
> çalışmasını değil, kullanılmak istenmesini de sağlıyor. Çünkü çoğu
> kurumsal yazılımın asıl sorunu eksik özellik değil, kimsenin
> kullanmak istememesi.
>
> **Neler yapıyoruz:**
> - Özel web uygulamaları ve yönetim panelleri
> - Çok kullanıcılı SaaS platformları
> - Mevcut sistemlerinizle entegrasyon
> - Süreç otomasyonu ve raporlama
> - Bakım, geliştirme ve teknik destek
>
> Kullandığımız teknolojiler güncel ve kanıtlanmış: Next.js,
> PostgreSQL, bulut altyapı. Ürettiğimiz sistemler yıllarca ayakta
> kalacak şekilde kuruluyor.

### 5.2 Emlak CRM Pro — anasayfa vitrini

> **Sadece anlatmıyoruz, yapıyoruz.**
>
> Bir emlak ofisinin portföyünü, müşterilerini, danışman performansını
> ve muhasebesini tek sistemde topladık. Bugün gerçek bir ofis bu
> sistemle çalışıyor.
>
> Harita üzerinde portföy yönetimi, otomatik müşteri-ilan eşleştirme,
> danışman hakediş takibi, çok para birimli muhasebe — hepsi sıfırdan
> tasarlandı ve kodlandı.
>
> `[ Projeyi İncele → ]`

**Konumlandırma notu:** Bu bölüm ürün satmıyor, yazılım yeteneğini
kanıtlıyor. "Emlak CRM Pro'yu satın alın" demiyor. emlakcrmpro.com'a
yönlendiren bağlantı sadece vaka çalışması sayfasının sonunda, küçük
bir bağlantı olarak yer alacak.

### 5.3 Grafik Tasarım

> **Grafik Tasarım**
>
> Bir markanın ilk izlenimi genellikle bir logodur. İkincisi bir
> kartvizit, bir ambalaj, bir sosyal medya gönderisi. Bunların hepsi
> aynı şeyi söylemeli.
>
> Kurumsal kimlik çalışmalarımızda önce markanın ne olduğunu
> konuşuyoruz, sonra çiziyoruz. Ortaya çıkan iş yıllarca kullanılacak
> şekilde, kullanım kılavuzuyla birlikte teslim ediliyor.
>
> - Kurumsal kimlik tasarımı
> - Logo ve logotype
> - Broşür, katalog, poster
> - Ambalaj ve etiket
> - Sosyal medya görselleri

### 5.4 Dijital Pazarlama

> **Dijital Pazarlama**
>
> Reklam bütçesi harcamak kolay, geri kazanmak zor. Kampanyaları
> kurarken ilk sorduğumuz soru şu: bu para geri döndüğünde nereden
> anlayacağız?
>
> Meta ve Google Ads tarafında sertifikalı iş ortağıyız. Kurduğumuz
> kampanyalar ölçülebilir hedeflerle çalışır, raporlar anlaşılır
> dilde gelir.
>
> - Google Ads ve Meta reklam yönetimi
> - Sosyal medya hesap yönetimi
> - SEO ve içerik pazarlaması
> - E-posta kampanyaları
> - Raporlama ve analiz

### 5.5 Web Tasarım

> **Web Tasarım**
>
> Web sitesi bir katalog değil, bir araçtır. Ziyaretçinin ne yapmasını
> istediğinizi bilmiyorsak, tasarıma başlamıyoruz.
>
> Kurduğumuz siteler mobilde hızlı açılır, arama motorlarında
> bulunur ve siz içeriği kendiniz güncelleyebilirsiniz.
>
> - Kurumsal web siteleri
> - E-ticaret platformları
> - Açılış sayfaları ve kampanya siteleri
> - Mevcut sitelerin yenilenmesi

### 5.6 Fotoğraf & Video Çekimi

> **Fotoğraf & Video**
>
> İyi bir ürün fotoğrafı, iyi bir reklamdan daha çok satar. Kötü bir
> fotoğraf ise en iyi kampanyayı bile durdurur.
>
> Ürün ve mekân çekimlerini reklamda nasıl kullanılacağını bilerek
> yapıyoruz — çekim planı, kampanya planıyla birlikte çıkıyor.
>
> - Ürün çekimleri
> - Mekân ve kurumsal çekimler
> - Sosyal medya için kısa videolar
> - Reklam filmleri

### 5.7 Danışmanlık & Eğitim

> **Danışmanlık & Eğitim**
>
> Bazı işletmelerin ajansa değil, yön bulmaya ihtiyacı var. Bazılarının
> ise kendi ekibini yetiştirmeye.
>
> Dijital pazarlama stratejinizi birlikte kuruyoruz ya da ekibinize
> işi öğretiyoruz. İkisi de olur.
>
> - Dijital pazarlama stratejisi danışmanlığı
> - Marka konumlandırma
> - Grafik tasarım eğitimi
> - Sosyal medya yönetimi eğitimi

### 5.8 Hakkımda sayfası

> **Ben Tan Yasan.**
>
> Güzel Sanatlar okudum. Yirmi yıldır tasarım ve pazarlama yapıyorum.
> Grafik tasarımcı olarak başladım, pazarlama müdürlüğüne kadar geldim,
> sonra kendi ajansımı kurdum.
>
> Bu yolun bana öğrettiği tek bir şey varsa o da şu: iyi görünen bir iş,
> işe yaramıyorsa iyi bir iş değildir. Bir logo beğenilmek için değil,
> tanınmak için vardır. Bir kampanya izlenmek için değil, satmak için
> kurulur.
>
> Son yıllarda bu bakışı yazılıma da taşıdım. Müşterilerimin çoğunun
> asıl sorunu tanıtım değil, dağınıklıktı — bilgi bir yerde, müşteri
> başka yerde, hesap bambaşka yerde. Bunun üzerine kendi yazılımımı
> geliştirdim ve bugün gerçek bir işletme onunla çalışıyor.
>
> Artık markaların hem görünen yüzünü hem arkada çalışan sistemini
> kuruyorum. İkisini ayrı düşünmemek, işin en değerli tarafı.
>
> Antalya'da çalışıyorum, Türkiye'nin her yerinden projeler alıyorum.

**Not:** Bu metin, mevcut sitedeki "Hakkımda" bölümünün yerini alacak.
Yanına bir portre fotoğrafı konması öneriliyor — kişisel ajanslarda
güven kurmanın en hızlı yolu.

---

## 6. Vaka çalışması sayfası

`/portfolyo/emlak-crm-pro`

| # | Bölüm | İçerik |
|---|---|---|
| 1 | Problem | Emlak ofisleri portföyü Excel'de, müşteriyi WhatsApp'ta, muhasebeyi defterde tutuyor. Hiçbiri konuşmuyor. |
| 2 | Yaklaşım | Önce bir emlak ofisinin gerçek gününü izledik, sonra kod yazdık. |
| 3 | Çözüm | Modül modül, ekran görüntüleriyle: Portföy & Harita · Müşteri-Talep Eşleştirme · Danışman Performansı · Muhasebe & Hakediş · Takvim & Görevler |
| 4 | Teknoloji | Next.js, Supabase, Google Maps, çok kiracılı mimari |
| 5 | Sonuç | Canlı kullanımda, gerçek ofis, binlerce portföy |
| 6 | Kapanış | "Sizin işiniz için de benzer bir sistem kurabiliriz." → İletişim |

> **Gerekli varlık:** Emlak CRM Pro'dan temiz ekran görüntüleri.
> Demo organizasyonundan alınmalı — gerçek müşteri verisi görünmemeli.

---

## 7. Mevcut siteden taşınacaklar

**Korunacak:**
- Logo (SVG mevcut)
- Tüm portfolyo görselleri — Kurumsal Kimlik, Logo & Logotype,
  Web Tasarım, Sosyal Medya kategorileri
- Partner rozetleri: Meta Business Partner, Google Ads Partner,
  Yandex Direct
- İletişim bilgileri: tan@tanyasan.com · +90 530 691 3612 ·
  Hurma Mh. 255 Sk. No:37/7, 07130 Konyaaltı / Antalya
- "20 yıla yakın deneyim" vurgusu
- "Dijitalde Fark Yaratın" ifadesi — meta açıklamada veya alt bölümde
  korunabilir (SEO değeri var)

**Atılacak:**
- Stok fotoğraf hero
- Şablon hissi veren kart grid'leri

**Düzeltilecek:**
- Mevcut sitede "20 yıla yakın tec**br**übeyle" yazım hatası var →
  "tecrübeyle"
- Footer'daki "Copyright 2021" güncellenmeli

---

## 8. Blog

Altyapı şimdi kurulacak, içerik sonra üretilecek. Sonradan blog
eklemek, baştan planlanmış yapıya eklemekten çok daha zahmetli.

emlakcrmpro.com'daki Markdown tabanlı blog altyapısı (gray-matter +
remark) buraya taşınabilir — neredeyse maliyetsiz gelir.

---

## 9. Teknik notlar

- **Framework:** Next.js (App Router)
- **Barındırma:** Vercel
- **Scroll animasyonu:** GSAP ScrollTrigger veya benzeri; video
  `currentTime`'ı scroll pozisyonuna bağlanacak
- **SEO:** Next.js metadata API, dinamik sitemap, OG görselleri.
  Türkçe içerik, `lang="tr"`
- **Analytics:** Mevcut GA4/GTM kurulumu taşınacak

### İlgili Claude Code plugin'leri

```
/plugin marketplace add nateherkai/scroll-craft
/plugin install nateherk-design@nateherk

/plugin marketplace add zanwei/design-dna
/plugin install design-dna@zanwei

/plugin marketplace add anthropics/skills
/plugin install frontend-design@anthropics-skills

/plugin marketplace add Leonxlnx/taste-skill
/plugin install taste-skill@taste-skill
```

---

## 10. Sıradaki adımlar

1. Logo SVG'sinden kesin aksan rengini al
2. Higgsfield videosunu indir, projeye ekle
3. Portfolyo görsellerini topla ve optimize et
4. Emlak CRM Pro demo ekran görüntülerini al
5. Claude Code'da projeyi kur, plugin'leri yükle
6. Hero'yu kodla ve test et
7. Kalan sayfaları kur
8. Vercel'e deploy, Hostinger DNS'ini yönlendir
