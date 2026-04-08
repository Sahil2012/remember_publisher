import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { ensureUserExists, resolveUser } from "../middleware/resolveUser.js";
import { createBookHandler, deleteBookHandler, fetchBookHandler, fetchBooksHandler, updateBookHandler, fetchFullBookHandler } from "../controller/bookController.js";
import { publishBookHandler, unpublishBookHandler } from "../controller/shareController.js";
import { validate } from "../middleware/schemaValidator";
import { requireSubscription } from "../middleware/requireSubscription";
import { bookSchema } from "../schema/bookSchema";
import z from "zod";

const bookRoutes = Router();

// POST /books
bookRoutes.post("/", requireAuth, resolveUser, validate({ body: bookSchema }), createBookHandler);

// GET /books
//TODO: remove ensureUserExists
bookRoutes.get("/", requireAuth, ensureUserExists, resolveUser, fetchBooksHandler);

// GET /books/:id
bookRoutes.get("/:id", requireAuth, resolveUser, validate({ params: z.object({ id: z.uuid() }) }), fetchBookHandler);

// GET /books/:id/full
bookRoutes.get("/:id/full", requireAuth, resolveUser, validate({ params: z.object({ id: z.uuid() }) }), fetchFullBookHandler);

// POST /books/:id/publish
bookRoutes.post("/:id/publish", requireAuth, resolveUser, requireSubscription, validate({ params: z.object({ id: z.uuid() }) }), publishBookHandler);

// POST /books/:id/unpublish
bookRoutes.post("/:id/unpublish", requireAuth, resolveUser, requireSubscription, validate({ params: z.object({ id: z.uuid() }) }), unpublishBookHandler);

// PATCH /books/:id
bookRoutes.patch("/:id", requireAuth, resolveUser, validate({ params: z.object({ id: z.uuid() }), body: bookSchema }), updateBookHandler);

// DELETE /books/:id
bookRoutes.delete("/:id", requireAuth, resolveUser, validate({ params: z.object({ id: z.uuid() }) }), deleteBookHandler);

export default bookRoutes;