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
 * NEDEN BURADA (CSS'te değil): duraklamalı kayma, `@keyframes` yüzdeleri
 * panel SAYISINA bağlı olan bir eğri demek — altı hizmet için altı düzlük.
 * `--rail-panels` içerikten geliyor (SERVICES.length) ve hizmet eklenince
 * CSS'e dokunulmaması projenin kuralı. Çözüm: eğriyi `linear()` olarak
 * burada ÜRETİP custom property ile veriyoruz. Sunucu bileşeninde, render
 * anında çalışır — istemciye tek bir JS satırı gitmez.
 *
 * ÜÇ ÇIKTI, TEK HESAP:
 * 1. `ease`      → `.rail-track`in `rail-slide` eğrisi (düzlükler = duraklar)
 * 2. `windows`   → panel başına `animation-range` değerleri (başlık/gövde
 *                  koreografisi; her panel KENDİ geçişini biliyor)
 * 3. `hold`/`move` → ServiceRail.tsx'in klavye köprüsü aynı haritayı
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
  /** `.rail-track`in `animation-timing-function` değeri. */
  ease: string;
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
 * Durak i:  [ i*(h+m) , i*(h+m)+h ]   — track kıpırdamaz, panel ortalı
 * Geçiş i:  [ i*(h+m)+h , (i+1)*(h+m) ] — track tam 100vw kayar
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

  // `linear()` eğrisi: her durak için ÇIFT giriş konumlu bir durak noktası —
  // aynı çıkış değeri iki giriş yüzdesi arasında sabit kalır, yani track o
  // aralıkta hiç kıpırdamaz. Aradaki segmentler doğrusal: geçişler sabit
  // hızda olur (başlık koreografisi bu doğrusallığa dayanıyor — karşı
  // öteleme ancak sabit hızı iptal edebilir).
  const stops: string[] = [];
  for (let i = 0; i < panels; i += 1) {
    const value = moves > 0 ? i / moves : 0;
    const from = i * cycle;
    stops.push(`${Number(value.toFixed(6))} ${pct(from)} ${pct(from + hold)}`);
  }

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
    ease: panels > 1 ? `linear(${stops.join(", ")})` : "linear",
    hold,
    move,
    windows,
  };
}
