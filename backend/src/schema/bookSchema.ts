import { z } from "zod";

// Shared Enums matching Prisma
export const BookStatusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const BookCategoryEnum = z.enum(["MEMOIR", "BUSINESS", "YEARBOOK", "OTHER"]);

export const bookSchema = z.object({
    title: z.string().min(1, "Title is required").max(255, "Title is too long"),
    description: z.string().max(2000, "Description is too long").nullable().optional(),
    category: BookCategoryEnum.default("OTHER"),
    coverImage: z.string().url("Invalid cover image URL").nullable().optional(),
    coverColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).nullable().optional(),
    status: BookStatusEnum.default("DRAFT"),
});

export const bookUpdateSchema = bookSchema.partial();
export const bookResponseSchema = bookSchema.extend({
    id: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    userId: z.string(),
});


export type BookRequest = z.infer<typeof bookSchema>;
export type BookUpdateRequest = z.infer<typeof bookUpdateSchema>;
export type BookResponse = z.infer<typeof bookResponseSchema>;
