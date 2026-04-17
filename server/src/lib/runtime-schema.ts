import { prisma } from "./prisma";

async function getCurrentDatabaseName(): Promise<string | null> {
  const rows = await prisma.$queryRawUnsafe<Array<{ db: string | null }>>(
    "SELECT DATABASE() AS db",
  );
  return rows[0]?.db ?? null;
}

async function columnExists(tableName: string, columnName: string): Promise<boolean> {
  const dbName = await getCurrentDatabaseName();
  if (!dbName) return false;

  const rows = await prisma.$queryRawUnsafe<Array<{ count: number }>>(
    `
      SELECT COUNT(*) AS count
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
    `,
    dbName,
    tableName,
    columnName,
  );

  return Number(rows[0]?.count ?? 0) > 0;
}

async function tableExists(tableName: string): Promise<boolean> {
  const dbName = await getCurrentDatabaseName();
  if (!dbName) return false;

  const rows = await prisma.$queryRawUnsafe<Array<{ count: number }>>(
    `
      SELECT COUNT(*) AS count
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = ?
    `,
    dbName,
    tableName,
  );

  return Number(rows[0]?.count ?? 0) > 0;
}

async function ensureColumn(tableName: string, columnName: string, definitionSql: string) {
  if (await columnExists(tableName, columnName)) return;
  await prisma.$executeRawUnsafe(
    `ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${definitionSql}`,
  );
  console.log(`[schema] Added ${tableName}.${columnName}`);
}

async function ensureImageAssetTable() {
  if (await tableExists("ImageAsset")) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE \`ImageAsset\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`mimeType\` VARCHAR(128) NOT NULL,
      \`originalName\` VARCHAR(255) NULL,
      \`altText\` VARCHAR(255) NULL,
      \`fileSize\` INT NULL,
      \`width\` INT NULL,
      \`height\` INT NULL,
      \`data\` LONGBLOB NOT NULL,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`),
      INDEX \`ImageAsset_createdAt_idx\`(\`createdAt\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  console.log("[schema] Created ImageAsset table");
}

async function ensurePostSchema() {
  await ensureColumn("Post", "imageAssetId", "VARCHAR(191) NULL");
  await ensureColumn("Post", "tagsJson", "LONGTEXT NULL");
  await ensureColumn("Post", "published", "BOOLEAN NOT NULL DEFAULT true");
  await ensureColumn("Post", "featured", "BOOLEAN NOT NULL DEFAULT false");
  await ensureColumn("Post", "status", "VARCHAR(32) NOT NULL DEFAULT 'PUBLISHED'");
  await ensureColumn("Post", "metaTitle", "VARCHAR(255) NULL");
  await ensureColumn("Post", "metaDescription", "VARCHAR(320) NULL");
  await ensureColumn("Post", "canonicalUrl", "VARCHAR(512) NULL");
  await ensureColumn(
    "Post",
    "updatedAt",
    "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)",
  );
}

async function ensureProjectSchema() {
  await ensureColumn("Project", "slug", "VARCHAR(191) NULL");
  await ensureColumn("Project", "summary", "LONGTEXT NULL");
  await ensureColumn("Project", "imageAssetId", "VARCHAR(191) NULL");
  await ensureColumn("Project", "published", "BOOLEAN NOT NULL DEFAULT true");
  await ensureColumn("Project", "featured", "BOOLEAN NOT NULL DEFAULT false");
  await ensureColumn("Project", "status", "VARCHAR(32) NOT NULL DEFAULT 'PUBLISHED'");
  await ensureColumn("Project", "sortOrder", "INT NOT NULL DEFAULT 0");
  await ensureColumn("Project", "metaTitle", "VARCHAR(255) NULL");
  await ensureColumn("Project", "metaDescription", "VARCHAR(320) NULL");
  await ensureColumn("Project", "canonicalUrl", "VARCHAR(512) NULL");
  await ensureColumn(
    "Project",
    "updatedAt",
    "DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)",
  );
}

export async function ensureRuntimeSchema() {
  await ensureImageAssetTable();
  await ensurePostSchema();
  await ensureProjectSchema();
}
