export const PROJECT_PAGE_SIZE = 9;

function getParam(
  sp: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const v = sp[key];
  return Array.isArray(v) ? v[0] : v;
}

export function parseProjectSearchParams(
  sp: Record<string, string | string[] | undefined>,
): { sayfa: number; ara: string } {
  const sayfaRaw = getParam(sp, "sayfa");
  const sayfa = Math.max(1, parseInt(sayfaRaw || "1", 10) || 1);
  const ara = (getParam(sp, "ara") ?? "").trim();
  return { sayfa, ara };
}

export function projectListHref(q: { sayfa?: number; ara?: string }): string {
  const sp = new URLSearchParams();
  if (q.sayfa != null && q.sayfa > 1) sp.set("sayfa", String(q.sayfa));
  if (q.ara?.trim()) sp.set("ara", q.ara.trim());
  const s = sp.toString();
  return s ? `/projects?${s}` : "/projects";
}
