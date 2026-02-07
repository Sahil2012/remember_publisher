import { NextFunction, Request, Response } from "express";
import { NotFoundError, UnauthorizedError } from "../exception/HttpError";
import prisma from "../api/prismaClient";

export const verifyPageOwner = async (req: Request, res: Response, next: NextFunction) => {
    const pageId = req.params.id; // Usually mapped to :id
    const userId = req.user?.id;

    if (!pageId) {
        return next();
    }

    const page = await prisma.page.findUnique({
        where: {
            id: pageId,
        },
        include: {
            chapter: {
                include: {
                    book: true
                }
            }
        }
    });

    if (!page) {
        throw new NotFoundError("Page not found");
    }

    if (page.chapter.book.userId !== userId) {
        throw new UnauthorizedError("User is not the owner of the book containing this page");
    }
    next();
}
