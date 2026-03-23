import fs from "fs";
import path from "path";
import crypto from "crypto";

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
  ensureUploadsDir();
  const { buffer, filename, mimetype = "image/jpeg" } = params;
  const UPLOADS_DIR = getUploadsDir();

  const ext = filename
    ? path.extname(filename).replace(".", "") || getExtFromMime(mimetype)
    : getExtFromMime(mimetype);

  const hash = crypto.randomBytes(12).toString("hex");
  const saveName = `${hash}.${ext}`;
  const savePath = path.join(UPLOADS_DIR, saveName);

  fs.writeFileSync(savePath, buffer);

  /**
   * Canlıda mutlaka ayarla: https://api.senindomainin.com (path ve sonda / olmadan)
   * Aksi halde dönen URL localhost kalır; DB'ye yanlış adres yazılır.
   */
  const base = (process.env.SERVER_URL?.trim() || "http://localhost:4000").replace(/\/+$/, "");
  const url = `${base}/uploads/${saveName}`;

  return { url, publicId: saveName };
}

