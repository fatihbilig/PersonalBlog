import { Router } from "express";
import { getAdminStats } from "../controllers/admin.controller";
import { authMiddleware } from "../middleware/auth.middleware";

export const adminRouter = Router();

adminRouter.get("/stats", authMiddleware, getAdminStats);

