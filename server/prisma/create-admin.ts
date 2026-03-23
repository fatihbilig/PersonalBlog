import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../src/lib/prisma";

async function main() {
  const username = (process.env.ADMIN_USERNAME ?? "fatih").trim();
  const plainPassword = (process.env.ADMIN_PASSWORD ?? "fatih123").trim();

  if (!username || !plainPassword) {
    throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD must be set (or use defaults).");
  }

  try {
    const password = await bcrypt.hash(plainPassword, 10);

    const admin = await prisma.admin.upsert({
      where: { username },
      update: { password },
      create: { username, password },
    });

    console.log("Admin user is ready:");
    console.log(`- id: ${admin.id}`);
    console.log(`- username: ${admin.username}`);
    console.log(`- password: ${plainPassword}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("Create admin failed:", e);
  process.exit(1);
});

