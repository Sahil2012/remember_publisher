import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { resolveUser } from "../middleware/resolveUser";
import { createBookHandler, fetchBookHandler, fetchBooksHandler } from "../controller/bookController";
import { validate } from "../middleware/schemaValidator";
import { bookSchema } from "../schema/bookSchema";
import z from "zod";

const bookRoutes = Router();

// POST /books
bookRoutes.post("/", requireAuth, resolveUser, validate({ body: bookSchema }), createBookHandler);
// GET /books
bookRoutes.get("/", requireAuth, resolveUser, fetchBooksHandler);
// GET /books/:id
bookRoutes.get("/:id", requireAuth, resolveUser, validate({ params: z.object({ id: z.uuid() }) }), fetchBookHandler);
// PATCH /books/:id
// DELETE /books/:id

export default bookRoutes;