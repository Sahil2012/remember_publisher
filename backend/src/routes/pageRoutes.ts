import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { resolveUser } from "../middleware/resolveUser";
import { createPageHandler, deletePageHandler, fetchPageHandler, fetchPagesHandler, updatePageHandler } from "../controller/pageController";
import { validate } from "../middleware/schemaValidator";
import { pageSchema, pageUpdateSchema } from "../schema/pageSchema";
import z from "zod";
import { verifyChapterOwner } from "../middleware/verifyChapterOwner";
import { verifyPageOwner } from "../middleware/verifyPageOwner";

const pageRoutes = Router();

pageRoutes.use(requireAuth, resolveUser);

// GET /pages/chapter/:chapterId (List pages for chapter)
pageRoutes.get(
    "/chapter/:chapterId",
    validate({ params: z.object({ chapterId: z.uuid() }) }),
    verifyChapterOwner,
    fetchPagesHandler
);

// POST /pages/chapter/:chapterId (Create page in chapter)
pageRoutes.post(
    "/chapter/:chapterId",
    validate({ params: z.object({ chapterId: z.uuid() }), body: pageSchema }),
    verifyChapterOwner,
    createPageHandler
);

// GET /pages/:id (Get single page)
pageRoutes.get(
    "/:id",
    validate({ params: z.object({ id: z.uuid() }) }),
    verifyPageOwner,
    fetchPageHandler
);

// PATCH /pages/:id (Update page)
pageRoutes.patch(
    "/:id",
    validate({ params: z.object({ id: z.uuid() }), body: pageUpdateSchema }),
    verifyPageOwner,
    updatePageHandler
);

// DELETE /pages/:id (Delete page)
pageRoutes.delete(
    "/:id",
    validate({ params: z.object({ id: z.uuid() }) }),
    verifyPageOwner,
    deletePageHandler
);

export default pageRoutes;
