import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { resolveUser } from "../middleware/resolveUser";
import { createChapterHandler, deleteChapterHandler, fetchChapterHandler, fetchChaptersHandler, updateChapterHandler } from "../controller/chapterController";
import { validate } from "../middleware/schemaValidator";
import { chapterUpdateSchema } from "../schema/chapterSchema";
import { pageReorderSchema } from "../schema/pageSchema";
import { reorderPagesHandler } from "../controller/pageController";
import z from "zod";
import { verifyBookOwner } from "../middleware/verifyBookOwner";

const chapterRoutes = Router();

chapterRoutes.use(requireAuth, resolveUser);

// GET /chapters/:bookId
chapterRoutes.get("/:bookId", validate({ params: z.object({ bookId: z.uuid() }) }), verifyBookOwner, fetchChaptersHandler);

// POST /chapters/:bookId
chapterRoutes.post("/:bookId", validate({ params: z.object({ bookId: z.uuid() }), body: chapterUpdateSchema }), verifyBookOwner, createChapterHandler);

// GET /chapters/:bookId/:id
chapterRoutes.get("/:bookId/:id", validate({ params: z.object({ id: z.uuid(), bookId: z.uuid() }) }), verifyBookOwner, fetchChapterHandler);

// PATCH /chapters/:bookId/:id
chapterRoutes.patch("/:bookId/:id", validate({ params: z.object({ id: z.uuid(), bookId: z.uuid() }), body: chapterUpdateSchema }), verifyBookOwner, updateChapterHandler);

// DELETE /chapters/:bookId/:id
chapterRoutes.delete("/:bookId/:id", validate({ params: z.object({ id: z.uuid(), bookId: z.uuid() }) }), verifyBookOwner, deleteChapterHandler);

// PATCH /chapters/:bookId/:chapterId/pages/order
chapterRoutes.patch("/:bookId/:chapterId/pages/order", validate({ params: z.object({ bookId: z.uuid(), chapterId: z.uuid() }), body: pageReorderSchema }), verifyBookOwner, reorderPagesHandler);

export default chapterRoutes;
