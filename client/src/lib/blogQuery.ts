import type { PostCategory } from "@/lib/api";

export const BLOG_PAGE_SIZE = 9;

export type BlogListTab = "ALL" | PostCategory;

export type BlogListState = {
  sayfa: number;
  kategori: BlogListTab;
  ara: string;
};

function getParam(
  sp: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const v = sp[key];
  return Array.isArray(v) ? v[0] : v;
}

export function parseBlogSearchParams(
  sp: Record<string, string | string[] | undefined>,
): BlogListState {
  const sayfaRaw = getParam(sp, "sayfa");
  const sayfa = Math.max(1, parseInt(sayfaRaw || "1", 10) || 1);

  const kr = (getParam(sp, "kategori") ?? "").trim();
  const kategori: BlogListTab = (
    kr === "TECH" || kr === "ACADEMIC" || kr === "GÜNLÜK" ? kr : "ALL"
  ) as BlogListTab;

  const ara = (getParam(sp, "ara") ?? "").trim();

  return { sayfa, kategori, ara };
}

export function blogListHref(q: {
  sayfa?: number;
  kategori?: BlogListTab;
  ara?: string;
}): string {
  const sp = new URLSearchParams();
  if (q.sayfa != null && q.sayfa > 1) sp.set("sayfa", String(q.sayfa));
  if (q.kategori && q.kategori !== "ALL") sp.set("kategori", q.kategori);
  if (q.ara?.trim()) sp.set("ara", q.ara.trim());
  const s = sp.toString();
  return s ? `/blog?${s}` : "/blog";
}
