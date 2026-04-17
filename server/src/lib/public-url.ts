function cleanBase(raw?: string | null): string | null {
  const value = raw?.trim();
  if (!value) return null;
  return value.replace(/\/+$/, "");
}

function getPublicBase(): string | null {
  return cleanBase(process.env.SERVER_URL) ?? null;
}

export function normalizePublicImageUrl(raw?: string | null): string | null {
  const value = raw?.trim();
  if (!value) return null;

  const publicBase = getPublicBase();
  if (!publicBase) return value;

  if (value.startsWith("/uploads/")) {
    return `${publicBase}${value}`;
  }

  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase();
    const isLocalHost =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0";

    if (isLocalHost && parsed.pathname.startsWith("/uploads/")) {
      return `${publicBase}${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch {
    return value;
  }

  return value;
}
