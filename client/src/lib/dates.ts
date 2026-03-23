/** Türkçe kısa tarih (18 Mart 2026) */
export function formatDisplayDate(
  input: string | null | undefined,
  options?: { withTime?: boolean },
): string | null {
  if (!input || !String(input).trim()) return null;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) {
    const s = String(input).trim();
    return s.length ? s : null;
  }
  return d.toLocaleString("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(options?.withTime
      ? { hour: "2-digit", minute: "2-digit" }
      : {}),
  });
}

/** Kartlar için: oluşturma + güncelleme metni */
export function formatCreatedUpdatedLine(
  created?: string | null,
  updated?: string | null,
  fallbackDate?: string | null,
  kind: "post" | "project" = "post",
): string | null {
  const createdLabel = kind === "project" ? "Oluşturuldu" : "Yazıldı";
  const cRaw = created ?? fallbackDate;
  const c = formatDisplayDate(cRaw);
  const u = formatDisplayDate(updated);
  if (!c && !u) return null;
  if (c && u && updated && created && new Date(updated).getTime() > new Date(created).getTime() + 60_000) {
    return `${createdLabel}: ${c} · Güncellendi: ${u}`;
  }
  if (c) return `${createdLabel}: ${c}`;
  if (u) return `Güncellendi: ${u}`;
  return null;
}
