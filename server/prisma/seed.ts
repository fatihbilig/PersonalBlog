import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../src/lib/prisma";

async function main() {
  try {
    const count = await prisma.admin.count();
    if (count > 0) {
      console.log("Seed skipped: admin already exists.");
      return;
    }

    const username = "fatih";
    const plainPassword = "fatih123";
    const password = await bcrypt.hash(plainPassword, 10);

    await prisma.admin.create({
      data: { username, password },
    });

    console.log("Seeded initial admin:");
    console.log(`- username: ${username}`);
    console.log(`- password: ${plainPassword}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});

