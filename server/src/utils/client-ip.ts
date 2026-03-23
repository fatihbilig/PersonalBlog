import type { Request } from "express";

export function getClientIp(req: Request) {
  const xff = req.headers["x-forwarded-for"];
  const raw =
    typeof xff === "string"
      ? xff.split(",")[0]?.trim()
      : Array.isArray(xff)
        ? xff[0]
        : undefined;

  const ip =
    raw ||
    req.socket.remoteAddress ||
    (req as unknown as { ip?: string }).ip ||
    "";

  return ip.startsWith("::ffff:") ? ip.slice(7) : ip;
}

