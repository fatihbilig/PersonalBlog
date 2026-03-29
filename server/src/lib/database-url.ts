/**
 * Railway MySQL exposes MYSQL_URL; apps often expect DATABASE_URL.
 * Also builds a URL from MYSQLHOST, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE, MYSQLPORT.
 */
export function getDatabaseUrlOrNull(): string | null {
  const direct =
    process.env.DATABASE_URL?.trim() ||
    process.env.MYSQL_URL?.trim() ||
    process.env.MYSQL_PUBLIC_URL?.trim();
  if (direct) return direct;

  const host = process.env.MYSQLHOST?.trim();
  const port = process.env.MYSQLPORT?.trim() || "3306";
  const user = process.env.MYSQLUSER?.trim();
  const password = process.env.MYSQLPASSWORD ?? "";
  const database = process.env.MYSQLDATABASE?.trim();
  if (!host || !user || !database) return null;

  const encUser = encodeURIComponent(user);
  const encPass = encodeURIComponent(password);
  const auth = password.length > 0 ? `${encUser}:${encPass}` : encUser;
  return `mysql://${auth}@${host}:${port}/${database}`;
}

export function requireDatabaseUrl(): string {
  const url = getDatabaseUrlOrNull();
  if (url) return url;

  throw new Error(
    "Database URL missing: set DATABASE_URL, or Railway MySQL variables (MYSQL_URL or MYSQLHOST/MYSQLUSER/MYSQLDATABASE/...). " +
      "In Railway: link the MySQL service to this app, then add e.g. DATABASE_URL=${{ YourMysqlService.MYSQL_URL }} in Variables.",
  );
}

/** Placeholder when no URL (client generate); migrations/runtime need real credentials. */
export function getDatabaseUrlForPrismaConfig(): string {
  return getDatabaseUrlOrNull() ?? "mysql://127.0.0.1:3306/prisma_placeholder";
}
