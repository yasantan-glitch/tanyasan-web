/**
 * /hizmetler yatay rayının ZAMANLAMA TEK KAYNAĞI.
 *
 * Ray eskiden tek bir doğrusal kayma idi: dikey scroll ilerledikçe track
 * sabit hızla sola kayıyordu, hiçbir panel "durmuyordu". Ekim 2026
 * (kullanıcı kararı): her hizmet tam ortalandığında ray BİR SÜRE DURSUN,
 * sonra bir sonrakine geçsin — ve geçiş sırasında başlık yerinde çakılı
 * kalıp altından açıklama + görsel sıyrılsın, ardından başlık da ekrandan
 * çıksın.
 *
 * NEDEN BURADA (CSS'te değil): duraklar ve geçişler zaman çizgisinde panel
 * SAYISINA bağlı yüzdelere düşüyor. `--rail-panels` içerikten geliyor
 * (SERVICES.length) ve hizmet eklenince CSS'e dokunulmaması projenin
 * kuralı. Çözüm: yüzdeleri burada ÜRETİP custom property ile veriyoruz.
 * Sunucu bileşeninde, render anında çalışır — istemciye JS gitmez.
 *
 * (İlk sürüm burada bir de track'i süren `linear()` eğrisi üretiyordu;
 * track artık kaymıyor — paneller üst üste, gerekçe globals.css'te.)
 *
 * İKİ ÇIKTI, TEK HESAP:
 * 1. `windows`   → panel başına `animation-range` değerleri (her panel
 *                  KENDİ geliş ve çıkış penceresini biliyor)
 * 2. `hold`/`move` → ServiceRail.tsx'in klavye köprüsü aynı haritayı
 *                  okusun diye (sayı ikinci kez yazılmıyor; aynı kalıp
 *                  `--home-rail-arrive-share`te de var)
 */

/**
 * Bir duraklamanın, bir geçişe oranı. 0.8 = duraklar geçişlerin %80'i kadar
 * sürer. Büyütmek okumayı rahatlatır ama rayı ağırlaştırır; küçültmek
 * hizmetleri "geçiliyor" gibi gösterir — eski doğrusal hâlin sorunu buydu.
 */
export const RAIL_HOLD_RATIO = 0.8;

export type RailWindow = {
  /** Panelin GELİŞ geçişi (bir önceki panelden bu panele). */
  inFrom: string;
  inTo: string;
  /** Panelin ÇIKIŞ geçişi (bu panelden bir sonrakine). */
  outFrom: string;
  outTo: string;
};

export type RailTiming = {
  /** Bir duraklamanın tüm zaman çizgisine oranı (0–1). */
  hold: number;
  /** Bir geçişin tüm zaman çizgisine oranı (0–1). */
  move: number;
  /** Panel başına geliş/çıkış menzilleri, yüzde string'i olarak. */
  windows: RailWindow[];
};

const pct = (value: number) => `${(value * 100).toFixed(4)}%`;

/**
 * Zaman çizgisi düzeni (n panel, n durak + n-1 geçiş, toplam 1):
 *
 *   |--hold0--|--move0--|--hold1--|--move1--| … |--hold(n-1)--|
 *   0                                                        1
 *
 * Durak i:  [ i*(h+m) , i*(h+m)+h ]   — panel i ekranda, hiçbir şey kıpırdamaz
 * Geçiş i:  [ i*(h+m)+h , (i+1)*(h+m) ] — panel i çıkar, i+1 gelir
 */
export function railTiming(
  panels: number,
  holdRatio: number = RAIL_HOLD_RATIO,
): RailTiming {
  const moves = Math.max(panels - 1, 0);
  // n*h + (n-1)*m = 1 ve h = holdRatio * m
  const move = moves > 0 ? 1 / (panels * holdRatio + moves) : 0;
  const hold = moves > 0 ? holdRatio * move : 1;
  const cycle = hold + move;

  const windows: RailWindow[] = [];
  for (let i = 0; i < panels; i += 1) {
    // Geliş = bir önceki geçiş, çıkış = kendi geçişi. İlk panelin gelişi ve
    // son panelin çıkışı YOK: CSS o iki animasyonu `:first-child` /
    // `:last-child` ile `none`a çekiyor, aşağıdaki değerler kullanılmıyor
    // (yine de geçerli bir menzil yazılıyor ki tanımsız custom property
    // kalmasın).
    const inFrom = i > 0 ? (i - 1) * cycle + hold : 0;
    const inTo = i > 0 ? i * cycle : 0;
    const outFrom = i < panels - 1 ? i * cycle + hold : 1;
    const outTo = i < panels - 1 ? (i + 1) * cycle : 1;

    windows.push({
      inFrom: pct(inFrom),
      inTo: pct(inTo),
      outFrom: pct(outFrom),
      outTo: pct(outTo),
    });
  }

  return {
    hold,
    move,
    windows,
  };
}
