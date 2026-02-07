import { z } from "zod";

// Schema for Page content
// We use z.any() because the structure depends on the frontend editor (e.g. Slate, Quill, Editor.js)
// But we could refine this later if we settle on a specific format.
export const pageSchema = z.object({
    content: z.any().optional(), // JSON content
    textContent: z.string().nullable().optional(), // Plain text representation for search/preview
    order: z.number().int().min(0).optional(),
});

export const pageUpdateSchema = pageSchema.partial();

export const pageResponseSchema = pageSchema.extend({
    id: z.string(),
    chapterId: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type PageRequest = z.infer<typeof pageSchema>;
export type PageUpdateRequest = z.infer<typeof pageUpdateSchema>;
export type PageResponse = z.infer<typeof pageResponseSchema>;

export const pageReorderSchema = z.array(z.object({
    id: z.string(),
    order: z.number().int().min(0),
}));

export type PageReorderRequest = z.infer<typeof pageReorderSchema>;
