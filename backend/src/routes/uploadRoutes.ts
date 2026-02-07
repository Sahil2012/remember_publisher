import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { uploadFileHandler } from "../controller/uploadController";

const uploadRoutes = Router();

// POST /upload - Protected route
uploadRoutes.post("/", requireAuth, uploadFileHandler);

export default uploadRoutes;
