/**
 * Hero'nun paylaşılan matematik yardımcıları.
 *
 * Şimdilik tek kalem: deterministik gürültü. İki ayrı yerde (faz 1'in kelime
 * saçılması ve faz 8'in küresi) aynı hash gerektiği için buraya alındı —
 * kopyalanmış bir gürültü fonksiyonu, iki yerde farklı ayarlanma riski taşır.
 */

/**
 * Deterministik 0..1 gürültü. Math.random DEĞİL: hem kelimelerin savrulma
 * yönü/hızı hem kürenin nokta dokusu her yüklemede AYNI olmalı — aksi halde
 * aynı sayfa her ziyarette başka türlü davranır ve hareket tasarlanmış değil
 * kazara görünür. Küre için ayrıca zorunlu: değerler SSR HTML'ine inline
 * yazıldığı için sunucu ve istemci birebir aynı diziyi üretmek zorunda.
 *
 * sin tabanlı bu hash klasik GLSL ideomu; girdi tamsayı olduğu sürece
 * platformlar arası da kararlı.
 */
export function hash01(n: number) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}
