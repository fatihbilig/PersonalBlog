import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { prisma } from "../lib/prisma";

export async function login(req: Request, res: Response) {
  const { username, password } = req.body as {
    username?: string;
    password?: string;
  };

  const u = username?.trim();
  const p = password ?? "";

  if (!u || !p.trim()) {
    return res.status(400).json({ message: "username and password are required" });
  }

  const admin = await prisma.admin.findUnique({ where: { username: u } });
  if (!admin) return res.status(401).json({ message: "invalid credentials" });

  const ok = await bcrypt.compare(p, admin.password);
  if (!ok) return res.status(401).json({ message: "invalid credentials" });

  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ message: "JWT_SECRET not set" });

  const token = jwt.sign(
    { adminId: admin.id, username: admin.username },
    secret,
    { expiresIn: "7d" },
  );

  return res.json({ token });
}

