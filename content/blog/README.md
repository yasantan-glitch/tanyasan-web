# Blog yazısı ekleme

Bu klasördeki her `.md` dosyası `/blog` sayfasında bir yazı olur. Dosya adı
yazının adresini belirler: `deneme-yazisi.md` → `/blog/deneme-yazisi`.

Başlamak için `_sablon.md`'yi kopyalayın (`_` ile başlayan dosyalar listeye
girmez, örnek olarak kalır), kopyanın adını yazının konusuna göre değiştirin
ve alanları doldurun.

## Frontmatter alanları

Dosyanın en üstündeki `---` ile çevrili bölüm:

| Alan | Zorunlu | Açıklama |
|---|---|---|
| `title` | evet | Yazının başlığı. Liste sayfasında ve yazının kendisinde görünür. |
| `date` | evet | `YYYY-AA-GG` formatında (örn. `2026-03-14`). Sayfada "14 Mart 2026" olarak gösterilir. |
| `excerpt` | evet | Liste sayfasında başlığın altında görünen 1-2 cümlelik özet. |
| `category` | evet | Aşağıdaki altı değerden biri — serbest metin değil, `app/content/services.ts`'teki hizmetlerle birebir eşleşir. |
| `draft` | hayır | `true` yazılırsa yazı yayında **görünmez** (yarım bırakılan yazılar için). Yazı hazır olunca satırı silin ya da `false` yapın. |
| `updated` | hayır | Yazıyı sonradan anlamlı biçimde güncellediyseniz `YYYY-AA-GG`. Yazının üstünde "Güncellendi …" olarak görünür, Google'a da son değişiklik tarihi olarak gider. Küçük yazım düzeltmeleri için eklemeyin. |

Liste en yeniden en eskiye `date`'e göre sıralanır; **aynı gün** yayınlanan
yazılar dosya adına göre (A→Z) sıralanır. Listenin ilk yazısı büyük
gösterilir.

### `category` için geçerli değerler

- `grafik` — Grafik Tasarım
- `dijital` — Dijital Pazarlama
- `web` — Web Tasarımı
- `yazilim` — Yazılım ve Uygulama
- `foto` — Fotoğraf & Video Çekimi
- `danismanlik` — Danışmanlık & Eğitim

## Gövde

Frontmatter'dan sonraki kısım normal Markdown'dır: `##` bölüm başlığı,
`###` alt başlık, `**kalın**`, `_italik_`, `[bağlantı](url)`, `-` ya da
`1.` ile liste, `>` ile alıntı, `|` ile tablo, `` `kod` ``, `---` ile ayraç,
boş satırla yeni paragraf. Görsel eklenmez — sayfanın tasarımı bilinçli
olarak medyasız (bkz. `docs/design-system.md` §9).

Kendiliğinden oluşanlar — elle bir şey yazmayın:

- **İçindekiler:** `##` başlıklarından. Yazıda 4'ten az `##` varsa `###`'ler
  de listeye girer. Başlıklar kısa ve tarif edici olsun; listede aynen görünür.
- **Okuma süresi:** kelime sayısından (dakikada ~200 kelime).
- **Diğer yazılar:** yazının altında, önce aynı kategoriden iki yazı.

Yazı içinde başka bir bölüme bağlantı vermek için başlığın çapası
kullanılabilir: "İki platform nasıl çalışır?" → `#iki-platform-nasil-calisir`
(küçük harf, Türkçe harfler sadeleşir, boşluklar `-`).

## Yayınlama

Dosyayı bu klasöre eklemek (ya da GitHub üzerinden yüklemek) ve `main`'e
almak yeterli — Vercel otomatik olarak yeniden derler, ayrı bir yayınlama
adımı yok.
