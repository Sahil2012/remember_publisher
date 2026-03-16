import { Router } from "express";
import { revampText } from "../controller/revampController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { resolveUser } from "../middleware/resolveUser.js";
import { verifyBookOwner } from "../middleware/verifyBookOwner.js";

const router = Router();

router.post("/:bookId", requireAuth, resolveUser, verifyBookOwner, revampText);

export default router;
