import { Router } from "express";
import {
  createProject,
  deleteProject,
  getAllProjects,
  getProjectById,
  updateProject,
} from "../controllers/project.controller";
import { authMiddleware } from "../middleware/auth.middleware";

export const projectRouter = Router();

projectRouter.get("/", getAllProjects);
projectRouter.get("/:id", getProjectById);
projectRouter.post("/", authMiddleware, createProject);
projectRouter.patch("/:id", authMiddleware, updateProject);
projectRouter.delete("/:id", authMiddleware, deleteProject);
