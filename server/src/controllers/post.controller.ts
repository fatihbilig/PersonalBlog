import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import {
  buildImageAssetUrl,
  extractImageAssetId,
  normalizePublicImageUrl,
} from "../lib/public-url";
import { slugify } from "../utils/slugify";
import { getClientIp } from "../utils/client-ip";
import geoip from "geoip-lite";

const VALID_CATEGORIES = ["TECH", "ACADEMIC", "GÜNLÜK"] as const;
type PostCategory = (typeof VALID_CATEGORIES)[number];

function isValidCategory(v: unknown): v is PostCategory {
  return VALID_CATEGORIES.includes(v as PostCategory);
}

/** Türkçe "günlük" / ASCII "GUNLUK" / büyük-küçük harf — hepsini kabul et */
function parseCategory(raw: unknown): PostCategory | undefined {
  if (typeof raw !== "string") return undefined;
  const t = raw.trim();
  if (isValidCategory(t)) return t;
  const upperTr = t.toLocaleUpperCase("tr-TR");
  if (isValidCategory(upperTr)) return upperTr;

  const ascii = upperTr
    .normalize("NFKC")
    .replace(/Ü/g, "U")
    .replace(/Ğ/g, "G")
    .replace(/Ş/g, "S")
    .replace(/İ/g, "I")
    .replace(/İ/g, "I")
    .replace(/Ö/g, "O")
    .replace(/Ç/g, "C");
  if (ascii === "GUNLUK") return "GÜNLÜK";

  const lower = t.toLocaleLowerCase("tr-TR");
  if (lower === "günlük" || lower === "gunluk") return "GÜNLÜK";

  return undefined;
}

/**
 * MySQL'de sık görülen ENUM: ('TECH','ACADEMIC','GUNLUK') — Türkçe Ü ile "GÜNLÜK" truncate hatası verir.
 * DB'de ASCII GUNLUK saklanır; API yanıtlarında her zaman GÜNLÜK döner.
 */
function categoryToDatabase(c: PostCategory): string {
  return c === "GÜNLÜK" ? "GUNLUK" : c;
}

function categoryFromDatabase(raw: string): PostCategory {
  const s = raw.trim();
  if (s === "GUNLUK") return "GÜNLÜK";
  if (isValidCategory(s)) return s;
  const again = parseCategory(s);
  if (again) return again;
  return "TECH";
}

type RawPost = {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  imageUrl: string | null;
  imageAssetId: string | null;
  tagsJson: string | null;
  viewCount: number;
  category: string;
  published: boolean;
  featured: boolean;
  status: string;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function parseBooleanish(raw: unknown): boolean | undefined {
  if (typeof raw === "boolean") return raw;
  if (typeof raw === "string") {
    const value = raw.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(value)) return true;
    if (["false", "0", "no", "off"].includes(value)) return false;
  }
  return undefined;
}

function parseOptionalText(raw: unknown): string | null | undefined {
  if (raw === undefined) return undefined;
  if (raw === null) return null;
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  return value || null;
}

function parseStatus(raw: unknown): string | undefined {
  const value = parseOptionalText(raw);
  if (value === undefined || value === null) return value ?? undefined;
  return value.toUpperCase();
}

function parseTagsJson(raw: unknown): string | null | undefined {
  if (raw === undefined) return undefined;
  if (raw === null) return null;
  if (Array.isArray(raw)) {
    const tags = raw.map(v => String(v).trim()).filter(Boolean);
    return tags.length ? JSON.stringify(tags) : null;
  }
  if (typeof raw === "string") {
    const value = raw.trim();
    if (!value) return null;
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        const tags = parsed.map(v => String(v).trim()).filter(Boolean);
        return tags.length ? JSON.stringify(tags) : null;
      }
    } catch {
      const tags = value.split(",").map(v => v.trim()).filter(Boolean);
      return tags.length ? JSON.stringify(tags) : null;
    }
  }
  return null;
}

function parseTags(tagsJson: string | null): string[] | null {
  if (!tagsJson?.trim()) return null;
  try {
    const parsed = JSON.parse(tagsJson) as unknown;
    if (!Array.isArray(parsed)) return null;
    const tags = parsed.map(v => String(v).trim()).filter(Boolean);
    return tags.length ? tags : null;
  } catch {
    return null;
  }
}

function formatPost(p: RawPost) {
  const resolvedImageUrl =
    buildImageAssetUrl(p.imageAssetId) ??
    normalizePublicImageUrl(p.imageUrl);

  return {
    id: String(p.id),
    title: p.title,
    slug: p.slug,
    content: p.content,
    excerpt: p.excerpt,
    imageUrl: resolvedImageUrl,
    imageAssetId: p.imageAssetId,
    tags: parseTags(p.tagsJson),
    viewCount: p.viewCount,
    category: categoryFromDatabase(p.category),
    published: p.published,
    featured: p.featured,
    status: p.status,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    canonicalUrl: p.canonicalUrl,
    date: p.createdAt.toISOString().slice(0, 10),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

function firstQueryString(v: unknown): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  return undefined;
}

function parsePageSize(raw: unknown, fallback: number): number {
  const s = firstQueryString(raw);
  const n = s !== undefined ? parseInt(s, 10) : NaN;
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(n, 50);
}

function parsePageIndex(raw: unknown): number {
  const s = firstQueryString(raw);
  const n = s !== undefined ? parseInt(s, 10) : NaN;
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, 10_000);
}

export async function getAllPosts(req: Request, res: Response) {
  const rawCategory = req.query.category;
  const catStr = firstQueryString(rawCategory);
  const category = catStr ? parseCategory(catStr) : undefined;

  const rawSearch = req.query.search;
  const search = (firstQueryString(rawSearch) ?? "").trim();

  const rawPage = req.query.page;
  const wantsPagination =
    firstQueryString(rawPage) !== undefined && firstQueryString(rawPage) !== "";

  const where = {
    ...(category ? { category: categoryToDatabase(category) } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search } },
            { excerpt: { contains: search } },
          ],
        }
      : {}),
  };

  if (!wantsPagination) {
    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return res.json(posts.map(formatPost));
  }

  const page = parsePageIndex(rawPage);
  const pageSize = parsePageSize(
    req.query.pageSize ?? req.query.limit,
    9,
  );

  const [total, rows] = await prisma.$transaction([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);

  return res.json({
    posts: rows.map(formatPost),
    total,
    page,
    pageSize,
    totalPages,
  });
}

/** Düzenleme sayfası için: GET /api/posts/by-id/:id (/:slug ile karışmaz) */
export async function getPostById(req: Request, res: Response) {
  const idParam = req.params.id;
  const idRaw = Array.isArray(idParam) ? idParam[0] : idParam;
  const id = Number(idRaw);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "invalid id" });
  }

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return res.status(404).json({ message: "post not found" });

  return res.json(formatPost(post));
}

export async function getPostBySlug(req: Request, res: Response) {
  const slugParam = req.params.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  if (!slug) return res.status(400).json({ message: "slug is required" });

  // Sayısal ID ile de aranabilsin (edit sayfası için)
  const numId = Number(slug);
  if (Number.isInteger(numId) && numId > 0) {
    const byId = await prisma.post.findUnique({ where: { id: numId } });
    if (byId) return res.json(formatPost(byId));
  }

  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) return res.status(404).json({ message: "post not found" });

  return res.json(formatPost(post));
}

export async function createPost(req: Request, res: Response) {
  const {
    title,
    slug,
    content,
    excerpt,
    category,
    imageUrl,
    tags,
    published,
    featured,
    status,
    metaTitle,
    metaDescription,
    canonicalUrl,
  } = req.body as {
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    category?: string;
    imageUrl?: string;
    tags?: string[] | string;
    published?: boolean | string;
    featured?: boolean | string;
    status?: string;
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
  };

  const t = title?.trim();
  const c = content?.trim();
  const ex = excerpt?.trim();
  const img = imageUrl?.trim();
  const imageAssetId = extractImageAssetId(img);
  const cat = parseCategory(category);
  const tagsJson = parseTagsJson(tags);
  const publishedValue = parseBooleanish(published);
  const featuredValue = parseBooleanish(featured);
  const statusValue = parseStatus(status);
  const metaTitleValue = parseOptionalText(metaTitle);
  const metaDescriptionValue = parseOptionalText(metaDescription);
  const canonicalUrlValue = parseOptionalText(canonicalUrl);

  if (!t || !c || !cat) {
    return res.status(400).json({
      message: `title, content and category (${VALID_CATEGORIES.join(", ")}) are required`,
    });
  }

  let finalSlug = slug?.trim() || slugify(t);
  const exists = await prisma.post.findUnique({ where: { slug: finalSlug } });
  if (exists) finalSlug = `${finalSlug}-${Date.now()}`;

  const created = await prisma.post.create({
    data: {
      title: t,
      slug: finalSlug,
      content: c,
      excerpt: ex || null,
      imageUrl: img || null,
      imageAssetId: imageAssetId ?? null,
      tagsJson: tagsJson ?? null,
      category: categoryToDatabase(cat),
      published: publishedValue ?? true,
      featured: featuredValue ?? false,
      status: statusValue ?? "PUBLISHED",
      metaTitle: metaTitleValue ?? null,
      metaDescription: metaDescriptionValue ?? null,
      canonicalUrl: canonicalUrlValue ?? null,
    },
  });

  return res.status(201).json(formatPost(created));
}

export async function updatePost(req: Request, res: Response) {
  const idParam = req.params.id;
  const idRaw = Array.isArray(idParam) ? idParam[0] : idParam;
  const id = Number(idRaw);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "invalid id" });
  }

  const {
    title,
    slug,
    content,
    excerpt,
    category,
    imageUrl,
    tags,
    published,
    featured,
    status,
    metaTitle,
    metaDescription,
    canonicalUrl,
  } = req.body as {
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    category?: string;
    imageUrl?: string;
    tags?: string[] | string | null;
    published?: boolean | string;
    featured?: boolean | string;
    status?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    canonicalUrl?: string | null;
  };

  const t = title?.trim();
  const c = content?.trim();
  const ex = excerpt?.trim();
  const img = imageUrl === undefined ? undefined : imageUrl?.trim() || null;
  const imageAssetId = img === undefined ? undefined : extractImageAssetId(img);
  const tagsJson = parseTagsJson(tags);
  const publishedValue = parseBooleanish(published);
  const featuredValue = parseBooleanish(featured);
  const statusValue = parseStatus(status);
  const metaTitleValue = parseOptionalText(metaTitle);
  const metaDescriptionValue = parseOptionalText(metaDescription);
  const canonicalUrlValue = parseOptionalText(canonicalUrl);
  let cat: PostCategory | undefined;
  if (category !== undefined) {
    const parsed = parseCategory(category);
    if (parsed === undefined) {
      return res.status(400).json({
        message: `Geçersiz kategori. İzin verilen: ${VALID_CATEGORIES.join(", ")}`,
      });
    }
    cat = parsed;
  }

  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: "post not found" });

  // Slug yeniden üret (title değiştiyse)
  let finalSlug = existing.slug;
  if (t && t !== existing.title) {
    const baseSlug = slug?.trim() || slugify(t);
    const conflict = await prisma.post.findUnique({ where: { slug: baseSlug } });
    finalSlug = conflict && conflict.id !== id
      ? `${baseSlug}-${Date.now()}`
      : baseSlug;
  }

  const updated = await prisma.post.update({
    where: { id },
    data: {
      ...(t !== undefined ? { title: t, slug: finalSlug } : {}),
      ...(c !== undefined ? { content: c } : {}),
      ...(ex !== undefined ? { excerpt: ex || null } : {}),
      ...(img !== undefined ? { imageUrl: img } : {}),
      ...(img !== undefined ? { imageAssetId: imageAssetId ?? null } : {}),
      ...(tagsJson !== undefined ? { tagsJson } : {}),
      ...(cat !== undefined ? { category: categoryToDatabase(cat) } : {}),
      ...(publishedValue !== undefined ? { published: publishedValue } : {}),
      ...(featuredValue !== undefined ? { featured: featuredValue } : {}),
      ...(statusValue !== undefined ? { status: statusValue } : {}),
      ...(metaTitleValue !== undefined ? { metaTitle: metaTitleValue } : {}),
      ...(metaDescriptionValue !== undefined ? { metaDescription: metaDescriptionValue } : {}),
      ...(canonicalUrlValue !== undefined ? { canonicalUrl: canonicalUrlValue } : {}),
    },
  });

  return res.status(200).json(formatPost(updated));
}

export async function deletePost(req: Request, res: Response) {
  const idParam = req.params.id;
  const idRaw = Array.isArray(idParam) ? idParam[0] : idParam;
  const id = Number(idRaw);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "invalid id" });
  }

  try {
    await prisma.post.delete({ where: { id } });
    return res.status(204).send();
  } catch {
    return res.status(404).json({ message: "post not found" });
  }
}

export async function registerPostView(req: Request, res: Response) {
  const slugParam = req.params.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  if (!slug) return res.status(400).json({ message: "slug is required" });

  const numId = Number(slug);
  const resolved =
    Number.isInteger(numId) && numId > 0
      ? await prisma.post.findUnique({ where: { id: numId } })
      : await prisma.post.findUnique({ where: { slug } });
  if (!resolved) {
    return res.status(404).json({ message: "post not found" });
  }

  const ip = getClientIp(req);
  const ua = req.headers["user-agent"];
  const lookup = ip ? geoip.lookup(ip) : null;
  const country = lookup?.country ?? null;

  try {
    const updated = await prisma.post.update({
      where: { id: resolved.id },
      data: {
        viewCount: { increment: 1 },
        visitorLogs: {
          create: {
            ip: ip || "unknown",
            country,
            userAgent: typeof ua === "string" ? ua : null,
          },
        },
      },
      select: { viewCount: true },
    });

    return res.status(200).json(updated);
  } catch {
    return res.status(404).json({ message: "post not found" });
  }
}
