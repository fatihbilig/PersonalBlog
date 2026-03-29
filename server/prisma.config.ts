import "dotenv/config";
import { defineConfig } from "@prisma/config";

/**
 * Prisma 7: bağlantı adresi şemada değil, burada.
 * Generate sırasında DATABASE_URL yoksa geçerli biçimde placeholder kullanılır (client üretimi);
 * migrate / runtime için gerçek .env veya Railway değişkeni şarttır.
 */
const databaseUrl =
  process.env.DATABASE_URL?.trim() ||
  "mysql://127.0.0.1:3306/prisma_placeholder";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
