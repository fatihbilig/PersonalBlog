import fs from "fs";
import path from "path";
import { prisma } from "./prisma";

/** Canlıda kalıcı disk (Docker volume vb.): UPLOADS_DIR=/data/uploads */
export function getUploadsDir(): string {
  const fromEnv = process.env.UPLOADS_DIR?.trim();
  if (fromEnv) return path.resolve(fromEnv);
  return path.join(__dirname, "../../public/uploads");
}

export function ensureUploadsDir(): void {
  const dir = getUploadsDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getExtFromMime(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "image/avif": "avif",
  };
  return map[mime] ?? "jpg";
}

export async function uploadImageBuffer(params: {
  buffer: Buffer;
  filename?: string;
  mimetype?: string;
}) {
  const { buffer, filename, mimetype = "image/jpeg" } = params;
  const asset = await prisma.imageAsset.create({
    data: {
      mimeType: mimetype,
      originalName: filename?.trim() || null,
      fileSize: buffer.length,
      data: Uint8Array.from(buffer),
    },
    select: { id: true },
  });

  /**
   * Canlıda mutlaka ayarla: https://api.senindomainin.com (path ve sonda / olmadan)
   * Aksi halde dönen URL localhost kalır; Post/Project.imageUrl alanına yanlış adres yazılır.
   */
  const base = (process.env.SERVER_URL?.trim() || "http://localhost:4000").replace(/\/+$/, "");
  const url = `${base}/api/images/${asset.id}`;

  return { url, publicId: asset.id };
}

