import { PORTFOLIO_ITEMS } from "@/app/content/portfolio";

/**
 * /hizmetler'deki hizmet başına GÖRSEL — `services.ts`'in kardeşi, ikizi
 * değil. Ayrı dosya olmasının sebebi bundle: `services.ts`'i hero'nun
 * `heroPhases.ts`'i (client component) de okuyor. Görsel eşlemesi oraya
 * konsaydı portfolyo verisi de hero'nun bundle'ına girerdi; oysa bu tablonun
 * tek tüketicisi `app/hizmetler/page.tsx`.
 *
 * `yazilim` ANAHTARI BİLİNÇLİ OLARAK YOK: o hizmet zaten anasayfadaki Emlak
 * CRM Pro vitrinine ve bölüm içindeki `/portfolyo/emlak-crm-pro` CTA'sına
 * bağlı. İkinci bir görsel aynı kanıtı tekrar ederdi. Bkz. design-system §9.
 *
 * İki kaynak var:
 *  - GERÇEK İŞ (grafik, dijital): `portfolio.ts`'ten geliyor, `alt` metni de
 *    oradan okunuyor — aynı görselin alt metni iki yerde yazılmıyor.
 *  - TEMSİLİ (web, foto, danismanlik): `public/images/hizmetler/` altındaki
 *    Unsplash kareleri. Bu üçünde vitrine çıkacak bir portfolyo işi yok;
 *    görsel iddia değil, atmosfer taşıyor.
 */
export interface ServiceMedia {
  /** `public/` köküne göre yol. */
  src: string;
  /** Türkçe, betimleyici alt metin. */
  alt: string;
  /**
   * Çerçevenin kadrajı. Kaynak oranına EN YAKIN değer seçiliyor ki
   * `object-fit: cover` neredeyse hiç kırpmasın. `.service-media--*`
   * kurallarına karşılık gelir (globals.css).
   */
  ratio: "3/2" | "1/1" | "16/9";
  /** next/image `sizes`. Sağ sütun en fazla 44rem = 704px. */
  sizes: string;
}

/** Portfolyo işinin alt metnini tek kaynaktan okur; yol yanlışsa build'de patlar. */
function fromPortfolio(src: string): string {
  const item = PORTFOLIO_ITEMS.find((entry) => entry.src === src);
  if (!item) throw new Error(`serviceMedia: portfolyoda yok — ${src}`);
  return item.alt;
}

const WELLNESS = "/images/portfolyo/Welsness_Kurumsal.jpg";
const RIXOS_OZAN = "/images/portfolyo/Rixos_Bodrum_Ozan.jpg";

/** Anahtar = `services.ts`'teki `Service.id`. */
export const SERVICE_MEDIA: Readonly<Record<string, ServiceMedia>> = {
  // Portfolyodaki tek manzara oranlı iş ve kategorisi KURUMSAL KİMLİK —
  // kalemin ilk maddesi. Antetli + kartvizit + bloknot + zarf tek karede:
  // "logo tek başına değil, sistem" cümlesinin görsel karşılığı.
  grafik: {
    src: WELLNESS,
    alt: fromPortfolio(WELLNESS),
    ratio: "3/2",
    sizes: "(max-width: 860px) 100vw, 704px",
  },
  // SOSYAL MEDYA kategorisinden, kampanya kurgusu en okunur kare: tarihli
  // etkinlik duyurusu, net marka kilidi.
  dijital: {
    src: RIXOS_OZAN,
    alt: fromPortfolio(RIXOS_OZAN),
    ratio: "1/1",
    sizes: "(max-width: 860px) 100vw, 480px",
  },
  web: {
    src: "/images/hizmetler/web-tasarimi.jpg",
    alt: "Çalışma masasında masaüstü ve dizüstü ekranda açık bir web sitesi ve istatistik paneli",
    ratio: "3/2",
    sizes: "(max-width: 860px) 100vw, 704px",
  },
  foto: {
    src: "/images/hizmetler/foto-video.jpg",
    alt: "Gün batımında omuz rig'ine takılı sinema kamerasıyla çekim yapan kameraman",
    ratio: "16/9",
    sizes: "(max-width: 860px) 100vw, 704px",
  },
  danismanlik: {
    src: "/images/hizmetler/danismanlik-egitim.jpg",
    alt: "Ahşap bir masa etrafında not alarak toplantı yapan küçük ekip",
    ratio: "3/2",
    sizes: "(max-width: 860px) 100vw, 704px",
  },
};
