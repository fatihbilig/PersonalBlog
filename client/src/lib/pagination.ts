/** Blog ve projeler sayfalama çubuğunda ortak: en fazla `max` adet sayfa numarası gösterilir */
export function visiblePageNumbers(current: number, total: number, max = 7): number[] {
  if (total <= max) return Array.from({ length: total }, (_, i) => i + 1);
  const half = Math.floor(max / 2);
  let start = Math.max(1, current - half);
  let end = Math.min(total, start + max - 1);
  start = Math.max(1, end - max + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
