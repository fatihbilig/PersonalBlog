import "dotenv/config";
import path from "path";
import cors from "cors";
import express from "express";

import { ensureUploadsDir, getUploadsDir } from "./lib/upload";
import { ensureRuntimeSchema } from "./lib/runtime-schema";
import { errorMiddleware } from "./middleware/error.middleware";
import { authRouter } from "./routes/auth.routes";
import { adminRouter } from "./routes/admin.routes";
import { contactRouter } from "./routes/contact.routes";
import { imageRouter } from "./routes/image.routes";
import { postRouter } from "./routes/post.routes";
import { projectRouter } from "./routes/project.routes";
import { uploadRouter } from "./routes/upload.routes";

const app = express();

/** Nginx / Traefik arkasında doğru IP (geo / log için) */
if (process.env.TRUST_PROXY === "1" || process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

function corsOrigins(): string[] {
  const raw = process.env.CORS_ORIGINS?.trim();
  if (raw) {
    return raw.split(/[,;\s]+/).map(s => s.trim()).filter(Boolean);
  }
  return ["http://localhost:3000", "http://localhost:3001"];
}

app.use(
  cors({
    origin: corsOrigins(),
    credentials: true,
  }),
);
app.use(express.json());

ensureUploadsDir();

app.use(
  "/uploads",
  express.static(getUploadsDir(), {
    maxAge: "7d",
  }),
);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/posts", postRouter);
app.use("/api/projects", projectRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/images", imageRouter);
app.use("/api/contact", contactRouter);

app.use((_req, res) => res.status(404).json({ message: "not found" }));
app.use(errorMiddleware);

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

async function start() {
  await ensureRuntimeSchema();

  app.listen(port, () => {
    const origins = corsOrigins().join(", ");
    console.log(`[server] http://localhost:${port}  (CORS: ${origins})`);
  });
}

start().catch(err => {
  console.error("[server] startup failed", err);
  process.exit(1);
});
