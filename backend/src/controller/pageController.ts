import { Request, Response, NextFunction } from "express";
import { PageRequest, PageResponse, PageUpdateRequest } from "../schema/pageSchema";
import { createPage, deletePage, getPageById, getPagesByChapterId, updatePage, reorderPages } from "../services/pageService";
import { NotFoundError } from "../exception/HttpError";
import prisma from "../api/prismaClient";

// POST /chapters/:chapterId/pages
export const createPageHandler = async (
    req: Request<{ chapterId: string }, unknown, PageRequest>,
    res: Response<PageResponse>,
    next: NextFunction
) => {
    // TODO: Verify user owns the chapter/book
    const page = await createPage(req.params.chapterId, req.body, prisma);
    return res.status(201).json(page);
}

// GET /chapters/:chapterId/pages
export const fetchPagesHandler = async (
    req: Request<{ chapterId: string }, unknown, unknown>,
    res: Response<PageResponse[]>,
    next: NextFunction
) => {
    const pages = await getPagesByChapterId(req.params.chapterId, prisma);
    return res.status(200).json(pages);
}

// GET /pages/:id
export const fetchPageHandler = async (
    req: Request<{ id: string }, unknown, unknown>,
    res: Response<PageResponse>,
    next: NextFunction
) => {
    const page = await getPageById(req.params.id, prisma);
    if (!page) {
        throw new NotFoundError("Page not found");
    }
    return res.status(200).json(page);
}

// PATCH /pages/:id
export const updatePageHandler = async (
    req: Request<{ id: string }, unknown, PageUpdateRequest>,
    res: Response<PageResponse>,
    next: NextFunction
) => {
    const page = await updatePage(req.params.id, req.body, prisma);
    if (!page) {
        throw new NotFoundError("Page not found");
    }
    return res.status(200).json(page);
}

// DELETE /pages/:id
export const deletePageHandler = async (
    req: Request<{ id: string }, unknown, unknown>,
    res: Response<PageResponse>,
    next: NextFunction
) => {
    const page = await deletePage(req.params.id, prisma);
    if (!page) {
        throw new NotFoundError("Page not found");
    }
    return res.status(200).json(page);
}

// PATCH /chapters/:chapterId/pages/order
export const reorderPagesHandler = async (
    req: Request<{ chapterId: string }, unknown, { id: string, order: number }[]>,
    res: Response<unknown>,
    next: NextFunction
) => {
    // TODO: Verify ownership
    await reorderPages(req.params.chapterId, req.body, prisma);
    return res.status(200).json({ message: "Pages reordered successfully" });
}
