import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

const NAME_MIN = 1;
const NAME_MAX = 120;
const BODY_MIN = 1;
const BODY_MAX = 8000;

export const REACTION_TYPES = ["THUMB", "BULB", "HEART"] as const;
export type ReactionType = (typeof REACTION_TYPES)[number];

function slugParam(req: Request): string | null {
  const s = req.params.slug;
  const v = Array.isArray(s) ? s[0] : s;
  const t = v?.trim();
  return t || null;
}

function parseReaction(raw: unknown): ReactionType | undefined {
  if (typeof raw !== "string") return undefined;
  const u = raw.trim().toUpperCase();
  return REACTION_TYPES.includes(u as ReactionType) ? (u as ReactionType) : undefined;
}

type CommentRow = {
  id: number;
  authorName: string;
  body: string;
  reactionThumb: number;
  reactionBulb: number;
  reactionHeart: number;
  authorReply: string | null;
  authorRepliedAt: Date | null;
  createdAt: Date;
};

export function formatComment(c: CommentRow) {
  return {
    id: String(c.id),
    name: c.authorName,
    text: c.body,
    reactions: {
      thumb: c.reactionThumb,
      bulb: c.reactionBulb,
      heart: c.reactionHeart,
    },
    authorReply: c.authorReply,
    authorRepliedAt: c.authorRepliedAt?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
  };
}

function getCount(c: CommentRow, r: ReactionType): number {
  if (r === "THUMB") return c.reactionThumb;
  if (r === "BULB") return c.reactionBulb;
  return c.reactionHeart;
}

function setCount(c: CommentRow, r: ReactionType, n: number) {
  if (r === "THUMB") c.reactionThumb = n;
  else if (r === "BULB") c.reactionBulb = n;
  else c.reactionHeart = n;
}

export async function getCommentsForPost(req: Request, res: Response) {
  const slug = slugParam(req);
  if (!slug) return res.status(400).json({ message: "slug is required" });

  const post = await prisma.post.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!post) return res.status(404).json({ message: "post not found" });

  const rows = await prisma.comment.findMany({
    where: { postId: post.id },
    orderBy: { createdAt: "asc" },
  });

  return res.json(rows.map(formatComment));
}

export async function createCommentForPost(req: Request, res: Response) {
  const slug = slugParam(req);
  if (!slug) return res.status(400).json({ message: "slug is required" });

  const raw = req.body as { name?: string; text?: string };
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const text = typeof raw.text === "string" ? raw.text.trim() : "";

  if (name.length < NAME_MIN || name.length > NAME_MAX) {
    return res.status(400).json({
      message: `name must be between ${NAME_MIN} and ${NAME_MAX} characters`,
    });
  }
  if (text.length < BODY_MIN || text.length > BODY_MAX) {
    return res.status(400).json({
      message: `text must be between ${BODY_MIN} and ${BODY_MAX} characters`,
    });
  }

  const post = await prisma.post.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!post) return res.status(404).json({ message: "post not found" });

  const created = await prisma.comment.create({
    data: {
      postId: post.id,
      authorName: name,
      body: text,
    },
  });

  return res.status(201).json(formatComment(created));
}

/** Body: { type: THUMB|BULB|HEART, previousType?: same | omit } — önceki seçimi değiştir veya aynısına tekrar basınca kaldır */
export async function reactToComment(req: Request, res: Response) {
  const slug = slugParam(req);
  if (!slug) return res.status(400).json({ message: "slug is required" });

  const idRaw = req.params.commentId;
  const idStr = Array.isArray(idRaw) ? idRaw[0] : idRaw;
  const commentId = Number(idStr);
  if (!Number.isInteger(commentId) || commentId <= 0) {
    return res.status(400).json({ message: "invalid comment id" });
  }

  const body = req.body as { type?: unknown; previousType?: unknown };
  const type = parseReaction(body.type);
  if (!type) {
    return res.status(400).json({
      message: `type must be one of: ${REACTION_TYPES.join(", ")}`,
    });
  }
  const previousType = body.previousType === null || body.previousType === undefined
    ? undefined
    : parseReaction(body.previousType);

  const row = await prisma.comment.findFirst({
    where: { id: commentId, post: { slug } },
  });
  if (!row) return res.status(404).json({ message: "comment not found" });

  const c: CommentRow = { ...row };

  if (previousType === undefined) {
    setCount(c, type, getCount(c, type) + 1);
  } else if (previousType === type) {
    setCount(c, type, Math.max(0, getCount(c, type) - 1));
  } else {
    setCount(c, previousType, Math.max(0, getCount(c, previousType) - 1));
    setCount(c, type, getCount(c, type) + 1);
  }

  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: {
      reactionThumb: c.reactionThumb,
      reactionBulb: c.reactionBulb,
      reactionHeart: c.reactionHeart,
    },
  });

  return res.json(formatComment(updated));
}
