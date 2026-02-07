import { NextFunction, Request, Response } from "express";
import { NotFoundError, UnauthorizedError } from "../exception/HttpError";
import prisma from "../api/prismaClient";

export const verifyBookOwner = async (req: Request, res: Response, next: NextFunction) => {
    const bookId = req.params.bookId;
    const userId = req.user?.id;
    const book = await prisma.book.findUnique({
        where: {
            userId,
            id: bookId,
        },
    });

    if (!book) {
        throw new NotFoundError("Book not found");
    }
    if (book.userId !== userId) {
        throw new UnauthorizedError("User is not the owner of the book");
    }
    next();
}