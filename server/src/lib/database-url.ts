/**
 * Resolve MySQL/MariaDB URL for Prisma adapter. Railway / Docker use many naming styles.
 */

function t(key: string): string | undefined {
  const v = process.env[key]?.trim();
  return v ? v : undefined;
}

/** Single env var that already holds a mysql:// or mysqls:// URL (or Prisma-style). */
function firstUrlFromKeys(keys: readonly string[]): string | null {
  for (const k of keys) {
    const v = t(k);
    if (v) return v;
  }
  return null;
}

function buildFromParts(): string | null {
  const host = t("MYSQLHOST") ?? t("MYSQL_HOST");
  const port = t("MYSQLPORT") ?? t("MYSQL_PORT") ?? "3306";
  const user = t("MYSQLUSER") ?? t("MYSQL_USER") ?? t("MYSQL_USERNAME");
  const password =
    t("MYSQLPASSWORD") ?? t("MYSQL_PASSWORD") ?? t("MYSQL_ROOT_PASSWORD") ?? "";
  const database = t("MYSQLDATABASE") ?? t("MYSQL_DATABASE") ?? t("MYSQL_DB");

  if (!host || !database) return null;
  const effectiveUser = user ?? "root";
  const encUser = encodeURIComponent(effectiveUser);
  const encPass = encodeURIComponent(password);
  const auth = password.length > 0 ? `${encUser}:${encPass}` : encUser;
  return `mysql://${auth}@${host}:${port}/${database}`;
}

export function getDatabaseUrlOrNull(): string | null {
  const direct = firstUrlFromKeys([
    "DATABASE_URL",
    "MYSQL_URL",
    "MYSQL_DATABASE_URL",
    "MYSQL_PUBLIC_URL",
    "MYSQL_PRIVATE_URL",
    "MYSQLURL",
    "DIRECT_URL",
    "DATABASE_PRIVATE_URL",
    "DATABASE_PUBLIC_URL",
  ]);
  if (direct) return direct;

  return buildFromParts();
}

export function requireDatabaseUrl(): string {
  const url = getDatabaseUrlOrNull();
  if (url) return url;

  const hint =
    "No database URL found. In Railway: open your API service → Variables → New variable " +
    "Name: DATABASE_URL, Value: reference your MySQL plugin (e.g. ${{ MySQL.MYSQL_URL }} — use your actual MySQL service name). " +
    "Or paste the full mysql://… string from the MySQL service’s Connect tab.";

  throw new Error(hint);
}

/** Placeholder when no URL (client generate); migrations/runtime need real credentials. */
export function getDatabaseUrlForPrismaConfig(): string {
  return getDatabaseUrlOrNull() ?? "mysql://127.0.0.1:3306/prisma_placeholder";
}
