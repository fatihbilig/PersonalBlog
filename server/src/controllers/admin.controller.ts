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

