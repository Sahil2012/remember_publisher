import { Prisma, PrismaClient } from "@prisma/client";
import { PageReorderRequest, PageRequest, PageUpdateRequest } from "../schema/pageSchema";
import prisma from "../api/prismaClient.js";
import logger from "../utils/logger.js";

export const createPage = async (
    chapterId: string,
    pageData: PageRequest,
    tx?: Prisma.TransactionClient | PrismaClient
) => {
    logger.info(`Creating page for chapter: ${chapterId}`);
    const db = tx || prisma;

    // Get the highest order for this chapter to append to the end
    const lastPage = await db.page.findFirst({
        where: { chapterId },
        orderBy: { order: 'desc' },
        select: { order: true }
    });

    const nextOrder = (lastPage?.order ?? 0) + 1;

    const page = await db.page.create({
        data: {
            ...pageData,
            chapterId,
            order: pageData.order ?? nextOrder,
            content: pageData.content ?? Prisma.JsonNull, // Ensure content is properly handled even if null
        }
    });
    logger.info(`Page created successfully with ID: ${page.id}`);
    return page;
}

export const getPagesByChapterId = async (
    chapterId: string,
    tx?: Prisma.TransactionClient | PrismaClient
) => {
    logger.info(`Fetching pages for chapter: ${chapterId}`);
    const db = tx || prisma;
    const pages = await db.page.findMany({
        where: {
            chapterId,
        },
        orderBy: {
            order: 'asc',
        },
    });
    logger.info(`Fetched ${pages.length} pages for chapter: ${chapterId}`);
    return pages;
}

export const getPageById = async (
    pageId: string,
    tx?: Prisma.TransactionClient | PrismaClient
) => {
    logger.info(`Fetching page with ID: ${pageId}`);
    const db = tx || prisma;
    const page = await db.page.findUnique({
        where: {
            id: pageId,
        },
    });
    logger.info(`Fetched page with ID: ${pageId}`);
    return page;
}

export const updatePage = async (
    pageId: string,
    pageData: PageUpdateRequest,
    tx?: Prisma.TransactionClient | PrismaClient
) => {
    logger.info(`Updating page with ID: ${pageId}`);
    const db = tx || prisma;

    // If content is undefined, don't update it. If null, update to JsonNull.
    const updateData: any = { ...pageData };
    if (pageData.content === undefined) {
        delete updateData.content;
    } else if (pageData.content === null) {
        updateData.content = Prisma.JsonNull;
    }

    const page = await db.page.update({
        where: {
            id: pageId,
        },
        data: updateData,
    });
    logger.info(`Page updated successfully with ID: ${page.id}`);
    return page;
}

export const deletePage = async (
    pageId: string,
    tx?: Prisma.TransactionClient | PrismaClient
) => {
    logger.info(`Deleting page with ID: ${pageId}`);
    const db = tx || prisma;
    const page = await db.page.delete({
        where: {
            id: pageId,
        },
    });
    logger.info(`Page deleted successfully with ID: ${page.id}`);
    return page;
}

export const reorderPages = async (
    chapterId: string,
    pages: PageReorderRequest,
    tx?: Prisma.TransactionClient | PrismaClient
) => {
    logger.info(`Reordering pages for chapter: ${chapterId}`);
    const db = tx || prisma;

    const executeReorder = async (client: Prisma.TransactionClient | PrismaClient) => {
        // 1. Temporarily move to negative
        const tempUpdates = pages.map((page) =>
            client.page.update({
                where: { id: page.id, chapterId },
                data: { order: -page.order },
            })
        );
        await Promise.all(tempUpdates);

        // 2. Set to final
        const finalUpdates = pages.map((page) =>
            client.page.update({
                where: { id: page.id, chapterId },
                data: { order: page.order },
            })
        );
        return await Promise.all(finalUpdates);
    };

    const results = tx
        ? await executeReorder(tx)
        : await prisma.$transaction((txClient) => executeReorder(txClient));

    logger.info(`Reordered ${results.length} pages for chapter: ${chapterId}`);
    return results;
};
