import { z } from "zod";

export const chapterSchema = z.object({
    title: z.string().min(1, "Title is required").max(255, "Title is too long"),
    description: z.string().max(2000, "Description is too long").nullable().optional(),
    order: z.number().int().min(0).optional(),
});

export const chapterUpdateSchema = chapterSchema.partial();

export const chapterResponseSchema = chapterSchema.extend({
    id: z.string(),
    bookId: z.string(),
    createdAt: z.date(),
    updatedAt: z.date()
});

export type ChapterRequest = z.infer<typeof chapterSchema>;
export type ChapterUpdateRequest = z.infer<typeof chapterUpdateSchema>;
export type ChapterResponse = z.infer<typeof chapterResponseSchema>;