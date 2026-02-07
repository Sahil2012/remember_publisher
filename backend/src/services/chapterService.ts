import { Prisma, PrismaClient } from "@prisma/client";
import { ChapterRequest, ChapterUpdateRequest } from "../schema/chapterSchema";
import prisma from "../api/prismaClient.js";
import logger from "../utils/logger.js";

export const createChapter = async (
    bookId: string,
    chapterData: ChapterRequest,
    tx?: Prisma.TransactionClient | PrismaClient
) => {
    logger.info(`Creating chapter for book: ${bookId}`);
    const db = tx || prisma;

    // Get the highest order for this book to append to the end
    const lastChapter = await db.chapter.findFirst({
        where: { bookId },
        orderBy: { order: 'desc' },
        select: { order: true }
    });

    const nextOrder = (lastChapter?.order ?? 0) + 1;

    const chapter = await db.chapter.create({
        data: {
            ...chapterData,
            bookId,
            order: chapterData.order ?? nextOrder,
        }
    });
    logger.info(`Chapter created successfully with ID: ${chapter.id}`);
    return chapter;
}

export const getChaptersByBookId = async (
    bookId: string,
    tx?: Prisma.TransactionClient | PrismaClient
) => {
    logger.info(`Fetching chapters for book: ${bookId}`);
    const db = tx || prisma;
    const chapters = await db.chapter.findMany({
        where: {
            bookId,
        },
        orderBy: {
            order: 'asc',
        },
        include: {
            pages: {
                select: { id: true } // Just to get count if needed, or lightweight check
            }
        }
    });
    logger.info(`Fetched ${chapters.length} chapters for book: ${bookId}`);
    return chapters;
}

export const getChapterById = async (
    chapterId: string,
    tx?: Prisma.TransactionClient | PrismaClient
) => {
    logger.info(`Fetching chapter with ID: ${chapterId}`);
    const db = tx || prisma;
    const chapter = await db.chapter.findUnique({
        where: {
            id: chapterId,
        },
        include: {
            pages: {
                orderBy: { order: 'asc' }
            }
        }
    });
    logger.info(`Fetched chapter with ID: ${chapterId}`);
    return chapter;
}

export const updateChapter = async (
    chapterId: string,
    chapterData: ChapterUpdateRequest,
    tx?: Prisma.TransactionClient | PrismaClient
) => {
    logger.info(`Updating chapter with ID: ${chapterId}`);
    const db = tx || prisma;
    const chapter = await db.chapter.update({
        where: {
            id: chapterId,
        },
        data: chapterData,
    });
    logger.info(`Chapter updated successfully with ID: ${chapter.id}`);
    return chapter;
}

export const deleteChapter = async (
    chapterId: string,
    tx?: Prisma.TransactionClient | PrismaClient
) => {
    logger.info(`Deleting chapter with ID: ${chapterId}`);
    const db = tx || prisma;
    const chapter = await db.chapter.delete({
        where: {
            id: chapterId,
        },
    });
    logger.info(`Chapter deleted successfully with ID: ${chapter.id}`);
    return chapter;
}
