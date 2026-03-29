import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function getAdminStats(_req: Request, res: Response) {
  const [postCount, projectCount] = await Promise.all([
    prisma.post.count(),
    prisma.project.count(),
  ]);

  const totalViewsAgg = await prisma.post.aggregate({
    _sum: { viewCount: true },
  });
  const totalViews = totalViewsAgg._sum.viewCount ?? 0;

  const topPosts = await prisma.post.findMany({
    orderBy: { viewCount: "desc" },
    take: 7,
    select: { id: true, title: true, slug: true, viewCount: true, createdAt: true },
  });

  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const countryGroups = await prisma.visitorLog.groupBy({
    by: ["country"],
    where: { createdAt: { gte: since } },
    _count: { country: true },
    orderBy: { _count: { country: "desc" } },
    take: 8,
  });

  return res.status(200).json({
    counts: { posts: postCount, projects: projectCount, totalViews },
    topPosts,
    visitorsByCountry: countryGroups.map((g) => ({
      country: g.country ?? "Unknown",
      count: g._count.country,
    })),
  });
}

export async function listAdminComments(_req: Request, res: Response) {
  const rows = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
    include: {
      post: { select: { id: true, title: true, slug: true } },
    },
  });

  return res.json(
    rows.map((c) => ({
      id: String(c.id),
      authorName: c.authorName,
      body: c.body,
      reactions: {
        thumb: c.reactionThumb,
        bulb: c.reactionBulb,
        heart: c.reactionHeart,
      },
      authorReply: c.authorReply,
      authorRepliedAt: c.authorRepliedAt?.toISOString() ?? null,
      createdAt: c.createdAt.toISOString(),
      postId: String(c.postId),
      postTitle: c.post.title,
      postSlug: c.post.slug,
    })),
  );
}

const AUTHOR_REPLY_MAX = 4000;

export async function patchAdminComment(req: Request, res: Response) {
  const idRaw = req.params.id;
  const idStr = Array.isArray(idRaw) ? idRaw[0] : idRaw;
  const id = Number(idStr);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "invalid id" });
  }

  const raw = req.body as { authorReply?: unknown };
  if (typeof raw.authorReply !== "string") {
    return res.status(400).json({ message: "authorReply (string) required" });
  }

  const trimmed = raw.authorReply.trim();
  if (trimmed.length > AUTHOR_REPLY_MAX) {
    return res.status(400).json({
      message: `authorReply must be at most ${AUTHOR_REPLY_MAX} characters`,
    });
  }

  const existing = await prisma.comment.findUnique({
    where: { id },
    include: { post: { select: { id: true, title: true, slug: true } } },
  });
  if (!existing) return res.status(404).json({ message: "comment not found" });

  const data =
    trimmed.length === 0
      ? { authorReply: null, authorRepliedAt: null }
      : { authorReply: trimmed, authorRepliedAt: new Date() };

  const updated = await prisma.comment.update({
    where: { id },
    data,
    include: { post: { select: { id: true, title: true, slug: true } } },
  });

  return res.json({
    id: String(updated.id),
    authorName: updated.authorName,
    body: updated.body,
    reactions: {
      thumb: updated.reactionThumb,
      bulb: updated.reactionBulb,
      heart: updated.reactionHeart,
    },
    authorReply: updated.authorReply,
    authorRepliedAt: updated.authorRepliedAt?.toISOString() ?? null,
    createdAt: updated.createdAt.toISOString(),
    postId: String(updated.postId),
    postTitle: updated.post.title,
    postSlug: updated.post.slug,
  });
}

export async function deleteAdminComment(req: Request, res: Response) {
  const idRaw = req.params.id;
  const idStr = Array.isArray(idRaw) ? idRaw[0] : idRaw;
  const id = Number(idStr);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "invalid id" });
  }

  try {
    await prisma.comment.delete({ where: { id } });
    return res.status(204).send();
  } catch {
    return res.status(404).json({ message: "comment not found" });
  }
}

