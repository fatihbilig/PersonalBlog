function cleanBase(raw?: string | null): string | null {
  const value = raw?.trim();
  if (!value) return null;
  return value.replace(/\/+$/, "");
}

export function getPublicBase(): string | null {
  return cleanBase(process.env.SERVER_URL) ?? null;
}

export function buildImageAssetUrl(id?: string | null): string | null {
  const value = id?.trim();
  const publicBase = getPublicBase();
  if (!value || !publicBase) return null;
  return `${publicBase}/api/images/${encodeURIComponent(value)}`;
}

export function extractImageAssetId(raw?: string | null): string | null {
  const value = raw?.trim();
  if (!value) return null;

  if (/^[a-z0-9]{20,}$/i.test(value) && !value.includes("/")) {
    return value;
  }

  try {
    const parsed = new URL(value, "http://placeholder.local");
    const match = parsed.pathname.match(/\/api\/images\/([^/?#]+)/i);
    if (!match?.[1]) return null;
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

export function normalizePublicImageUrl(raw?: string | null): string | null {
  const value = raw?.trim();
  if (!value) return null;

  const publicBase = getPublicBase();
  if (!publicBase) return value;

  if (value.startsWith("/uploads/") || value.startsWith("/api/images/")) {
    return `${publicBase}${value}`;
  }

  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase();
    const isLocalHost =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0";

    if (
      isLocalHost &&
      (parsed.pathname.startsWith("/uploads/") || parsed.pathname.startsWith("/api/images/"))
    ) {
      return `${publicBase}${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch {
    return value;
  }

  return value;
}
