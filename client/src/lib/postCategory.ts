import type { PostCategory } from "@/lib/api";

const CANONICAL = new Set<string>(["TECH", "ACADEMIC", "GÜNLÜK"]);

/** API / URL / DB'den gelen kategori string'ini kanonik forma çevirir (geçersizse TECH). */
export function normalizePostCategory(raw: string | null | undefined): PostCategory {
  if (!raw || typeof raw !== "string") return "TECH";
  const t = raw.trim();
  if (CANONICAL.has(t)) return t as PostCategory;

  const tr = t.toLocaleUpperCase("tr-TR");
  if (CANONICAL.has(tr)) return tr as PostCategory;

  const ascii = tr
    .normalize("NFKC")
    .replace(/Ü/g, "U")
    .replace(/Ğ/g, "G")
    .replace(/Ş/g, "S")
    .replace(/İ/g, "I")
    .replace(/İ/g, "I")
    .replace(/Ö/g, "O")
    .replace(/Ç/g, "C");
  if (ascii === "GUNLUK") return "GÜNLÜK";
  if (ascii === "TECH") return "TECH";
  if (ascii === "ACADEMIC") return "ACADEMIC";

  return "TECH";
}

/** `?category=` parametresini güvenle oku; tanınmazsa null (varsayılan kategoriyi ezme). */
export function parseCategoryFromQuery(raw: string | null): PostCategory | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw).trim();
    if (!decoded) return null;
    const tr = decoded.toLocaleUpperCase("tr-TR");
    if (CANONICAL.has(decoded)) return decoded as PostCategory;
    if (CANONICAL.has(tr)) return tr as PostCategory;

    const ascii = tr
      .normalize("NFKC")
      .replace(/Ü/g, "U")
      .replace(/Ğ/g, "G")
      .replace(/Ş/g, "S")
      .replace(/İ/g, "I")
      .replace(/İ/g, "I")
      .replace(/Ö/g, "O")
      .replace(/Ç/g, "C");
    if (ascii === "GUNLUK") return "GÜNLÜK";

    const lower = decoded.toLocaleLowerCase("tr-TR");
    if (lower === "günlük" || lower === "gunluk") return "GÜNLÜK";

    return null;
  } catch {
    return null;
  }
}
