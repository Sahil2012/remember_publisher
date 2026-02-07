import { NextFunction, Request, Response } from "express";
import { NotFoundError, UnauthorizedError } from "../exception/HttpError";
import prisma from "../api/prismaClient";

export const verifyPageOwner = async (req: Request, res: Response, next: NextFunction) => {
    const pageId = req.params.id as string; // Usually mapped to :id
    const userId = req.user?.id;

    if (!pageId) {
        return next();
    }

    const page = await prisma.page.findUnique({
        where: {
            id: pageId,
        },
    });

    if (!page) {
        throw new NotFoundError("Page not found");
    }

    const chapter = await prisma.chapter.findUnique({
        where: {
            id: page.chapterId,
        },
    });

    if (!chapter) {
        throw new NotFoundError("Chapter not found for this page");
    }

    const book = await prisma.book.findUnique({
        where: {
            id: chapter.bookId,
        },
    });

    if (!book || book.userId !== userId) {
        throw new UnauthorizedError("User is not the owner of the book containing this page");
    }
    next();
}
