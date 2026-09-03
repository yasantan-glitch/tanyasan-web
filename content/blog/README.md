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

### `category` için geçerli değerler

- `grafik` — Grafik Tasarım
- `dijital` — Dijital Pazarlama
- `web` — Web Tasarımı
- `yazilim` — Yazılım ve Uygulama
- `foto` — Fotoğraf & Video Çekimi
- `danismanlik` — Danışmanlık & Eğitim

## Gövde

Frontmatter'dan sonraki kısım normal Markdown'dır: `##` alt başlık,
`**kalın**`, `_italik_`, `[bağlantı](url)`, `-` ile liste, boş satırla yeni
paragraf. Görsel eklenmez — sayfanın tasarımı bilinçli olarak medyasız
(bkz. `docs/design-system.md` §9).

## Yayınlama

Dosyayı bu klasöre eklemek (ya da GitHub üzerinden yüklemek) ve `main`'e
almak yeterli — Vercel otomatik olarak yeniden derler, ayrı bir yayınlama
adımı yok.
