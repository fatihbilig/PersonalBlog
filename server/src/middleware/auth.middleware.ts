import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

type JwtPayload = {
  adminId: number;
  username: string;
};

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) return res.status(401).json({ message: "missing token" });

  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ message: "JWT_SECRET not set" });

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    (req as unknown as { admin?: JwtPayload }).admin = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: "invalid token" });
  }
}

