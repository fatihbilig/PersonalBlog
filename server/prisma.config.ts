import "dotenv/config";
import { defineConfig } from "@prisma/config";
import { getDatabaseUrlForPrismaConfig } from "./src/lib/database-url";

/**
 * Prisma 7: datasource URL lives here, not in schema.
 * Uses DATABASE_URL, MYSQL_URL, or split MYSQL* vars; falls back to placeholder for generate only.
 */
const databaseUrl = getDatabaseUrlForPrismaConfig();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
