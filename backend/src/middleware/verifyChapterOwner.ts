import { NextFunction, Request, Response } from "express";
import { NotFoundError, UnauthorizedError } from "../exception/HttpError";
import prisma from "../api/prismaClient";

export const verifyChapterOwner = async (req: Request, res: Response, next: NextFunction) => {
    const chapterId = req.params.chapterId as string;
    const userId = req.user?.id;

    if (!chapterId) {
        return next();
    }

    const chapter = await prisma.chapter.findUnique({
        where: {
            id: chapterId,
        },
    });

    if (!chapter) {
        throw new NotFoundError("Chapter not found");
    }

    const book = await prisma.book.findUnique({
        where: {
            id: chapter.bookId,
        },
    });

    if (!book || book.userId !== userId) {
        throw new UnauthorizedError("User is not the owner of the book containing this chapter");
    }
    next();
}
