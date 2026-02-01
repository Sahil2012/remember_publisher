import { Router } from "express";
import { getMe } from "../controller/authController";
import { requireAuth } from "../middleware/requireAuth";
import { ensureUserExists } from "../middleware/resolveUser";

const authRoutes = Router();

authRoutes.get("/me", requireAuth, ensureUserExists, getMe);

export default authRoutes;
