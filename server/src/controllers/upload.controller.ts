import type { Request, Response } from "express";
import { uploadImageBuffer } from "../lib/upload";

export async function uploadImage(req: Request, res: Response) {
  const file = (req as unknown as { file?: Express.Multer.File }).file;
  if (!file) return res.status(400).json({ message: "image file is required" });

  try {
    const uploaded = await uploadImageBuffer({
      buffer: file.buffer,
      filename: file.originalname,
      mimetype: file.mimetype,
    });

    return res.status(201).json(uploaded);
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.message
        : typeof err === "string"
          ? err
          : JSON.stringify(err);
    return res
      .status(500)
      .json({ message: process.env.NODE_ENV === "production" ? "upload failed" : msg });
  }
}

