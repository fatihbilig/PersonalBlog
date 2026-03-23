import { Router } from "express";
import {
  createPost,
  deletePost,
  getAllPosts,
  getPostById,
  getPostBySlug,
  registerPostView,
  updatePost,
} from "../controllers/post.controller";
import { authMiddleware } from "../middleware/auth.middleware";

export const postRouter = Router();

postRouter.get("/", getAllPosts);
/* Spesifik rotalar önce: aksi halde :slug "by-id" ile çakışır */
postRouter.get("/by-id/:id", getPostById);
postRouter.post("/", authMiddleware, createPost);
postRouter.patch("/:id", authMiddleware, updatePost);
postRouter.delete("/:id", authMiddleware, deletePost);
postRouter.post("/:slug/view", registerPostView);
postRouter.get("/:slug", getPostBySlug);
