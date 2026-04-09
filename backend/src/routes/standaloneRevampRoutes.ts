import { Router } from "express";
import { standaloneRevampText } from "../controller/revampController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { resolveUser } from "../middleware/resolveUser.js";

const router = Router();

router.post("/", requireAuth, resolveUser, standaloneRevampText);

export default router;
