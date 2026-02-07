import { NextFunction, Request, Response } from "express";
import { NotFoundError, UnauthorizedError } from "../exception/HttpError";
import prisma from "../api/prismaClient";

export const verifyChapterOwner = async (req: Request, res: Response, next: NextFunction) => {
    const chapterId = req.params.chapterId;
    const userId = req.user?.id;

    if (!chapterId) {
        // Fallback if chapterId is not in params directly, but maybe we can find it via pageId?
        // For now, assume this middleware is used on routes WITH :chapterId
        return next();
    }

    const chapter = await prisma.chapter.findUnique({
        where: {
            id: chapterId,
        },
        include: {
            book: true
        }
    });

    if (!chapter) {
        throw new NotFoundError("Chapter not found");
    }

    if (chapter.book.userId !== userId) {
        throw new UnauthorizedError("User is not the owner of the book containing this chapter");
    }
    next();
}
