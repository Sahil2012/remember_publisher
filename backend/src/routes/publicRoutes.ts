import { Router } from "express";
import { fetchPublicBookHandler } from "../controller/shareController.js";
import z from "zod";
import { validate } from "../middleware/schemaValidator.js";

const publicRoutes = Router();

// GET /public/books/:shareId
publicRoutes.get("/books/:shareId", validate({ params: z.object({ shareId: z.string() }) }), fetchPublicBookHandler);

export default publicRoutes;
