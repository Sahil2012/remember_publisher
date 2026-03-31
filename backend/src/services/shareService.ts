import { Prisma, PrismaClient } from "@prisma/client";
import prisma from "../api/prismaClient.js";
import logger from "../utils/logger.js";
import { NotFoundError } from "../exception/HttpError.js";

export const publishBookSnapshot = async (
    bookId: string,
    userId: string
) => {
    logger.info(`Publishing snapshot for book: ${bookId} by user: ${userId}`);

    // 1. Fetch the full, populated book to freeze its current state
    const fullBook = await prisma.book.findFirst({
        where: { id: bookId, userId },
        include: {
            chapters: {
                where: { order: { gte: 0 } },
                orderBy: { order: 'asc' },
                include: {
                    pages: { orderBy: { order: 'asc' } }
                }
            }
        }
    });

    if (!fullBook) throw new NotFoundError("Book not found or unauthorized");

    // 2. Wrap the upsert in a transaction
    return await prisma.$transaction(async (tx) => {
        // Upsert the snapshot (replaces existing if already published)
        const snapshot = await tx.publishedSnapshot.upsert({
            where: { bookId: bookId },
            update: {
                snapshotData: fullBook as any,
                updatedAt: new Date()
            },
            create: {
                bookId: bookId,
                snapshotData: fullBook as any
            }
        });

        // Toggle the public flag on the Book
        await tx.book.update({
            where: { id: bookId },
            data: { isPublic: true }
        });

        logger.info(`Published snapshot generated: ${snapshot.shareId}`);
        return snapshot;
    });
};

export const unpublishBookSnapshot = async (
    bookId: string,
    userId: string
) => {
    logger.info(`Unpublishing book: ${bookId}`);

    const book = await prisma.book.findFirst({ where: { id: bookId, userId } });
    if (!book) throw new NotFoundError("Book not found or unauthorized");

    return await prisma.$transaction(async (tx) => {
        await tx.book.update({
            where: { id: bookId },
            data: { isPublic: false }
        });
        
        // Optional: We can delete the snapshot to save space, or just keep it hidden
        // Let's delete it to strictly enforce unpublishing and save DB space
        await tx.publishedSnapshot.deleteMany({
            where: { bookId: bookId }
        });

        logger.info(`Unpublished book successfully.`);
        return { success: true };
    });
};

export const getPublicSnapshot = async (shareId: string) => {
    logger.info(`Fetching public snapshot for shareId: ${shareId}`);
    
    const snapshot = await prisma.publishedSnapshot.findUnique({
        where: { shareId },
        include: {
            book: {
                select: { isPublic: true }
            }
        }
    });

    if (!snapshot || !snapshot.book.isPublic) {
        throw new NotFoundError("This book is not public or does not exist.");
    }

    return snapshot.snapshotData;
};
