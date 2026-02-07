import { Request, Response, NextFunction } from "express";
import { ChapterRequest, ChapterResponse, ChapterUpdateRequest } from "../schema/chapterSchema";
import { createChapter, deleteChapter, getChapterById, getChaptersByBookId, updateChapter } from "../services/chapterService";
import { NotFoundError } from "../exception/HttpError";
import prisma from "../api/prismaClient";

// POST /books/:bookId/chapters
export const createChapterHandler = async (
    req: Request<{ bookId: string }, unknown, ChapterRequest>,
    res: Response<ChapterResponse>,
    next: NextFunction
) => {
    // TODO: Verify user owns the book (maybe via middleware or service check)
    // For now, assuming requireAuth + resolveUser ensures valid user, but we should strictly check ownership
    const chapter = await createChapter(req.params.bookId, req.body, prisma);
    return res.status(201).json(chapter);
}

// GET /books/:bookId/chapters
export const fetchChaptersHandler = async (
    req: Request<{ bookId: string }, unknown, unknown>,
    res: Response<ChapterResponse[]>,
    next: NextFunction
) => {
    const chapters = await getChaptersByBookId(req.params.bookId, prisma);
    return res.status(200).json(chapters);
}

// GET /chapters/:bookId/:id
export const fetchChapterHandler = async (
    req: Request<{ id: string, bookId: string }, unknown, unknown>,
    res: Response<ChapterResponse>,
    next: NextFunction
) => {
    const chapter = await getChapterById(req.params.id, prisma);
    if (!chapter) {
        throw new NotFoundError("Chapter not found");
    }
    return res.status(200).json(chapter);
}

// PATCH /chapters/:bookId/:id
export const updateChapterHandler = async (
    req: Request<{ id: string, bookId: string }, unknown, ChapterUpdateRequest>,
    res: Response<ChapterResponse>,
    next: NextFunction
) => {
    const chapter = await updateChapter(req.params.id, req.body, prisma);
    if (!chapter) {
        throw new NotFoundError("Chapter not found");
    }
    return res.status(200).json(chapter);
}

// DELETE /chapters/:bookId/:id
export const deleteChapterHandler = async (
    req: Request<{ id: string, bookId: string }, unknown, unknown>,
    res: Response<ChapterResponse>,
    next: NextFunction
) => {
    const chapter = await deleteChapter(req.params.id, prisma);
    if (!chapter) {
        throw new NotFoundError("Chapter not found");
    }
    return res.status(200).json(chapter);
}
