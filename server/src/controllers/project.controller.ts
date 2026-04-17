import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import {
  buildImageAssetUrl,
  extractImageAssetId,
  normalizePublicImageUrl,
} from "../lib/public-url";
import { slugify } from "../utils/slugify";

type ProjectDto = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  tech: string[] | null;
  imageUrl: string | null;
  imageAssetId: string | null;
  links: { label: string; href: string }[] | null;
  highlights: string[] | null;
  published: boolean;
  featured: boolean;
  status: string;
  sortOrder: number;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

function toProjectDto(p: {
  id: number;
  title: string;
  slug: string | null;
  description: string;
  summary: string | null;
  techStack: string;
  imageUrl: string | null;
  imageAssetId: string | null;
  githubLink: string | null;
  liveLink: string | null;
  published: boolean;
  featured: boolean;
  status: string;
  sortOrder: number;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ProjectDto {
  const tech = p.techStack
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  const links = [
    ...(p.githubLink ? [{ label: "GitHub", href: p.githubLink }] : []),
    ...(p.liveLink ? [{ label: "Live", href: p.liveLink }] : []),
  ];

  const resolvedImageUrl =
    buildImageAssetUrl(p.imageAssetId) ??
    normalizePublicImageUrl(p.imageUrl);

  return {
    id: String(p.id),
    title: p.title,
    slug: p.slug || slugify(p.title),
    summary: p.summary || p.description || null,
    tech: tech.length ? tech : null,
    imageUrl: resolvedImageUrl,
    imageAssetId: p.imageAssetId,
    links: links.length ? links : null,
    highlights: null,
    published: p.published,
    featured: p.featured,
    status: p.status,
    sortOrder: p.sortOrder,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    canonicalUrl: p.canonicalUrl,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

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

function parseSortOrder(raw: unknown): number | undefined {
  if (raw === undefined || raw === null || raw === "") return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n)) return undefined;
  return Math.trunc(n);
}

export async function getProjectById(req: Request, res: Response) {
  const idParam = req.params.id;
  const idRaw = Array.isArray(idParam) ? idParam[0] : idParam;
  const id = Number(idRaw);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "invalid id" });
  }

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return res.status(404).json({ message: "project not found" });

  return res.status(200).json(toProjectDto(project));
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

export async function getAllProjects(req: Request, res: Response) {
  const rawSearch = req.query.search;
  const search = (firstQueryString(rawSearch) ?? "").trim();

  const rawPage = req.query.page;
  const wantsPagination =
    firstQueryString(rawPage) !== undefined && firstQueryString(rawPage) !== "";

  const where = search
    ? {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
          { techStack: { contains: search } },
        ],
      }
    : {};

  if (!wantsPagination) {
    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(projects.map(toProjectDto));
  }

  const page = parsePageIndex(rawPage);
  const pageSize = parsePageSize(req.query.pageSize ?? req.query.limit, 9);

  const [total, rows] = await prisma.$transaction([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);

  return res.status(200).json({
    projects: rows.map(toProjectDto),
    total,
    page,
    pageSize,
    totalPages,
  });
}

export async function createProject(req: Request, res: Response) {
  const {
    title,
    slug,
    description,
    techStack,
    githubLink,
    liveLink,
    imageUrl,
    summary,
    tech,
    published,
    featured,
    status,
    sortOrder,
    metaTitle,
    metaDescription,
    canonicalUrl,
  } = req.body as {
    title?: string;
    slug?: string;
    description?: string;
    techStack?: string;
    githubLink?: string;
    liveLink?: string;
    imageUrl?: string;
    summary?: string;
    tech?: string[];
    published?: boolean | string;
    featured?: boolean | string;
    status?: string;
    sortOrder?: number | string;
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
  };

  const t = title?.trim();
  const d = (description ?? summary)?.trim();
  const summaryValue = summary?.trim() || d || null;
  const ts =
    techStack?.trim() ??
    (Array.isArray(tech) ? tech.map((x) => String(x).trim()).filter(Boolean).join(", ") : "");
  const img = imageUrl?.trim();
  const imageAssetId = extractImageAssetId(img);
  const gh = githubLink?.trim();
  const live = liveLink?.trim();
  const explicitSlug = slug?.trim();
  const publishedValue = parseBooleanish(published);
  const featuredValue = parseBooleanish(featured);
  const statusValue = parseStatus(status);
  const sortOrderValue = parseSortOrder(sortOrder);
  const metaTitleValue = parseOptionalText(metaTitle);
  const metaDescriptionValue = parseOptionalText(metaDescription);
  const canonicalUrlValue = parseOptionalText(canonicalUrl);

  if (!t || !d || !ts) {
    return res
      .status(400)
      .json({ message: "title, description and techStack are required" });
  }

  let finalSlug = explicitSlug || slugify(t);
  const slugConflict = await prisma.project.findFirst({ where: { slug: finalSlug } });
  if (slugConflict) finalSlug = `${finalSlug}-${Date.now()}`;

  const created = await prisma.project.create({
    data: {
      title: t,
      slug: finalSlug,
      description: d,
      summary: summaryValue,
      techStack: ts,
      imageUrl: img || null,
      imageAssetId: imageAssetId ?? null,
      githubLink: gh || null,
      liveLink: live || null,
      published: publishedValue ?? true,
      featured: featuredValue ?? false,
      status: statusValue ?? "PUBLISHED",
      sortOrder: sortOrderValue ?? 0,
      metaTitle: metaTitleValue ?? null,
      metaDescription: metaDescriptionValue ?? null,
      canonicalUrl: canonicalUrlValue ?? null,
    },
  });

  return res.status(201).json(toProjectDto(created));
}

export async function updateProject(req: Request, res: Response) {
  const idParam = req.params.id;
  const idRaw = Array.isArray(idParam) ? idParam[0] : idParam;
  const id = Number(idRaw);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "invalid id" });
  }

  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: "project not found" });

  const {
    title,
    slug,
    description,
    techStack,
    githubLink,
    liveLink,
    imageUrl,
    summary,
    tech,
    published,
    featured,
    status,
    sortOrder,
    metaTitle,
    metaDescription,
    canonicalUrl,
  } =
    req.body as {
      title?: string;
      slug?: string;
      description?: string;
      techStack?: string;
      githubLink?: string;
      liveLink?: string;
      imageUrl?: string;
      summary?: string;
      tech?: string[];
      published?: boolean | string;
      featured?: boolean | string;
      status?: string | null;
      sortOrder?: number | string;
      metaTitle?: string | null;
      metaDescription?: string | null;
      canonicalUrl?: string | null;
    };

  const t = title?.trim();
  const d = (description ?? summary)?.trim();
  const summaryValue = summary === undefined ? undefined : summary?.trim() || d || null;
  const ts =
    techStack?.trim() ??
    (Array.isArray(tech)
      ? tech.map((x) => String(x).trim()).filter(Boolean).join(", ")
      : undefined);
  const img = imageUrl === undefined ? undefined : imageUrl?.trim() || null;
  const imageAssetId = img === undefined ? undefined : extractImageAssetId(img);
  const gh = githubLink === undefined ? undefined : githubLink?.trim() || null;
  const live = liveLink === undefined ? undefined : liveLink?.trim() || null;
  const explicitSlug = slug?.trim();
  const publishedValue = parseBooleanish(published);
  const featuredValue = parseBooleanish(featured);
  const statusValue = parseStatus(status);
  const sortOrderValue = parseSortOrder(sortOrder);
  const metaTitleValue = parseOptionalText(metaTitle);
  const metaDescriptionValue = parseOptionalText(metaDescription);
  const canonicalUrlValue = parseOptionalText(canonicalUrl);

  let finalSlug: string | undefined;
  if (explicitSlug !== undefined || t !== undefined) {
    const slugBase = explicitSlug || (t ? slugify(t) : existing.slug || slugify(existing.title));
    const slugConflict = await prisma.project.findFirst({ where: { slug: slugBase } });
    finalSlug =
      slugConflict && slugConflict.id !== id
        ? `${slugBase}-${Date.now()}`
        : slugBase;
  }

  const updated = await prisma.project.update({
    where: { id },
    data: {
      ...(t !== undefined ? { title: t } : {}),
      ...(finalSlug !== undefined ? { slug: finalSlug } : {}),
      ...(d !== undefined ? { description: d } : {}),
      ...(summaryValue !== undefined ? { summary: summaryValue } : {}),
      ...(ts !== undefined ? { techStack: ts } : {}),
      ...(img !== undefined ? { imageUrl: img } : {}),
      ...(img !== undefined ? { imageAssetId: imageAssetId ?? null } : {}),
      ...(gh !== undefined ? { githubLink: gh } : {}),
      ...(live !== undefined ? { liveLink: live } : {}),
      ...(publishedValue !== undefined ? { published: publishedValue } : {}),
      ...(featuredValue !== undefined ? { featured: featuredValue } : {}),
      ...(statusValue !== undefined ? { status: statusValue } : {}),
      ...(sortOrderValue !== undefined ? { sortOrder: sortOrderValue } : {}),
      ...(metaTitleValue !== undefined ? { metaTitle: metaTitleValue } : {}),
      ...(metaDescriptionValue !== undefined ? { metaDescription: metaDescriptionValue } : {}),
      ...(canonicalUrlValue !== undefined ? { canonicalUrl: canonicalUrlValue } : {}),
    },
  });

  return res.status(200).json(toProjectDto(updated));
}

export async function deleteProject(req: Request, res: Response) {
  const idParam = req.params.id;
  const idRaw = Array.isArray(idParam) ? idParam[0] : idParam;
  const id = Number(idRaw);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "invalid id" });
  }

  try {
    await prisma.project.delete({ where: { id } });
    return res.status(204).send();
  } catch {
    return res.status(404).json({ message: "project not found" });
  }
}
