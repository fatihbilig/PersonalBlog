import { Router } from "express";
import {
  deleteAdminComment,
  getAdminStats,
  listAdminComments,
  patchAdminComment,
} from "../controllers/admin.controller";
import { authMiddleware } from "../middleware/auth.middleware";

export const adminRouter = Router();

adminRouter.get("/stats", authMiddleware, getAdminStats);
adminRouter.get("/comments", authMiddleware, listAdminComments);
adminRouter.patch("/comments/:id", authMiddleware, patchAdminComment);
adminRouter.delete("/comments/:id", authMiddleware, deleteAdminComment);

