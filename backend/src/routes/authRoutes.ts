import { Router } from "express";
import { getMe } from "../controller/authController";
import { requireAuth } from "../middleware/requireAuth";
import { ensureProfileCreated } from "../middleware/userInception";

const authRoutes = Router();

authRoutes.get("/me", requireAuth, ensureProfileCreated, getMe);

export default authRoutes;
