import { Router } from "express";
import multer from "multer";
import { uploadImage } from "../controllers/upload.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter(_req, file, cb) {
    const ok = /^image\/(jpeg|png|gif|webp|svg\+xml|avif)$/i.test(file.mimetype);
    if (ok) return cb(null, true);
    cb(
      new Error("Sadece görsel dosyaları (jpeg, png, gif, webp, svg, avif) kabul edilir."),
    );
  },
});

export const uploadRouter = Router();

uploadRouter.post(
  "/image",
  authMiddleware,
  upload.single("image"),
  uploadImage,
);

