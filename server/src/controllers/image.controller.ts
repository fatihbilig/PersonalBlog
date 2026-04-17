import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function getImageAsset(req: Request, res: Response) {
  const idParam = req.params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  if (!id?.trim()) {
    return res.status(400).json({ message: "image id is required" });
  }

  const asset = await prisma.imageAsset.findUnique({
    where: { id: id.trim() },
    select: {
      mimeType: true,
      originalName: true,
      data: true,
      createdAt: true,
    },
  });

  if (!asset) {
    return res.status(404).json({ message: "image not found" });
  }

  res.setHeader("Content-Type", asset.mimeType);
  res.setHeader("Content-Length", String(asset.data.length));
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  if (asset.originalName) {
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(asset.originalName)}"`);
  }

  return res.status(200).send(Buffer.from(asset.data));
}
