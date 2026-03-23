import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { slugify } from "../utils/slugify";

type ProjectDto = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  tech: string[] | null;
  imageUrl: string | null;
  links: { label: string; href: string }[] | null;
  highlights: string[] | null;
};

function toProjectDto(p: {
  id: number;
  title: string;
  description: string;
  techStack: string;
  imageUrl: string | null;
  githubLink: string | null;
  liveLink: string | null;
}): ProjectDto {
  const tech = p.techStack
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  const links = [
    ...(p.githubLink ? [{ label: "GitHub", href: p.githubLink }] : []),
    ...(p.liveLink ? [{ label: "Live", href: p.liveLink }] : []),
  ];

  return {
    id: String(p.id),
    title: p.title,
    slug: slugify(p.title),
    summary: p.description || null,
    tech: tech.length ? tech : null,
    imageUrl: p.imageUrl ?? null,
    links: links.length ? links : null,
    highlights: null,
  };
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

export async function getAllProjects(_req: Request, res: Response) {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json(projects.map(toProjectDto));
}

export async function createProject(req: Request, res: Response) {
  const {
    title,
    description,
    techStack,
    githubLink,
    liveLink,
    imageUrl,
    summary,
    tech,
  } = req.body as {
    title?: string;
    description?: string;
    techStack?: string;
    githubLink?: string;
    liveLink?: string;
    imageUrl?: string;
    summary?: string;
    tech?: string[];
  };

  const t = title?.trim();
  const d = (description ?? summary)?.trim();
  const ts =
    techStack?.trim() ??
    (Array.isArray(tech) ? tech.map((x) => String(x).trim()).filter(Boolean).join(", ") : "");
  const img = imageUrl?.trim();
  const gh = githubLink?.trim();
  const live = liveLink?.trim();

  if (!t || !d || !ts) {
    return res
      .status(400)
      .json({ message: "title, description and techStack are required" });
  }

  const created = await prisma.project.create({
    data: {
      title: t,
      description: d,
      techStack: ts,
      imageUrl: img || null,
      githubLink: gh || null,
      liveLink: live || null,
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

  const { title, description, techStack, githubLink, liveLink, imageUrl, summary, tech } =
    req.body as {
      title?: string;
      description?: string;
      techStack?: string;
      githubLink?: string;
      liveLink?: string;
      imageUrl?: string;
      summary?: string;
      tech?: string[];
    };

  const t = title?.trim();
  const d = (description ?? summary)?.trim();
  const ts =
    techStack?.trim() ??
    (Array.isArray(tech)
      ? tech.map((x) => String(x).trim()).filter(Boolean).join(", ")
      : undefined);
  const img = imageUrl === undefined ? undefined : imageUrl?.trim() || null;
  const gh = githubLink === undefined ? undefined : githubLink?.trim() || null;
  const live = liveLink === undefined ? undefined : liveLink?.trim() || null;

  const updated = await prisma.project.update({
    where: { id },
    data: {
      ...(t !== undefined ? { title: t } : {}),
      ...(d !== undefined ? { description: d } : {}),
      ...(ts !== undefined ? { techStack: ts } : {}),
      ...(img !== undefined ? { imageUrl: img } : {}),
      ...(gh !== undefined ? { githubLink: gh } : {}),
      ...(live !== undefined ? { liveLink: live } : {}),
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

