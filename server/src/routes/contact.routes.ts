import { Router } from "express";
import { sendContactMail } from "../controllers/contact.controller";

export const contactRouter = Router();

contactRouter.post("/", sendContactMail);

