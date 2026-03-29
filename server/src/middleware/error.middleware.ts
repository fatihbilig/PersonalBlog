import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";

type ErrorBody = {
  message: string;
};

function isPrismaKnownRequestError(
  err: unknown,
): err is Prisma.PrismaClientKnownRequestError {
  return err instanceof Prisma.PrismaClientKnownRequestError;
}

function isPrismaInitError(err: unknown): err is Prisma.PrismaClientInitializationError {
  return err instanceof Prisma.PrismaClientInitializationError;
}

function isPrismaRustPanicError(err: unknown): err is Prisma.PrismaClientRustPanicError {
  return err instanceof Prisma.PrismaClientRustPanicError;
}

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (res.headersSent) return;

  // Prisma known errors (e.g. unique constraint)
  if (isPrismaKnownRequestError(err)) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "unique constraint failed" } satisfies ErrorBody);
    }
    return res.status(400).json({ message: "database request error" } satisfies ErrorBody);
  }

  // Prisma init / connectivity errors
  if (isPrismaInitError(err)) {
    return res.status(500).json({ message: "database initialization error" } satisfies ErrorBody);
  }
  if (isPrismaRustPanicError(err)) {
    return res.status(500).json({ message: "database panic error" } satisfies ErrorBody);
  }

  // Custom status, if any
  const anyErr = err as { status?: number; message?: string };
  const status =
    typeof anyErr?.status === "number" && anyErr.status >= 400 && anyErr.status < 600
      ? anyErr.status
      : 500;

  const message =
    typeof anyErr?.message === "string" && anyErr.message.trim()
      ? anyErr.message
      : "internal server error";

  return res.status(status).json({ message } satisfies ErrorBody);
}

