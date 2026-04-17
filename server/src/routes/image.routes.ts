import { Router } from "express";
import { getImageAsset } from "../controllers/image.controller";

export const imageRouter = Router();

imageRouter.get("/:id", getImageAsset);
