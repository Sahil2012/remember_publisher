import { Prisma, PrismaClient } from "@prisma/client";
import { BookRequest, BookUpdateRequest } from "../schema/bookSchema";
import prisma from "../api/prismaClient.js";
import logger from "../utils/logger.js";

export const createBook = async (
    bookData: BookRequest,
    userId: string,
    tx?: Prisma.TransactionClient | PrismaClient
) => {
    logger.info(`Creating book for user: ${userId}`);
    const db = tx || prisma;
    const book = await db.book.create({
        data: {
            ...bookData,
            userId,
        }
    });
    logger.info(`Book created successfully with ID: ${book.id}`);
    return book;
}

export const getBooksByUserId = async (
    userId: string,
    tx?: Prisma.TransactionClient | PrismaClient
) => {
    logger.info(`Fetching books for user: ${userId}`);
    const db = tx || prisma;
    const books = await db.book.findMany({
        where: {
            userId,
        },
    });
    logger.info(`Fetched ${books.length} books for user: ${userId}`);
    return books;
}

export const getBookById = async (
    bookId: string,
    userId: string,
    tx?: Prisma.TransactionClient | PrismaClient
) => {
    logger.info(`Fetching book with ID: ${bookId}`);
    const db = tx || prisma;
    const book = await db.book.findUnique({
        where: {
            userId,
            id: bookId,
        },
    });
    logger.info(`Fetched book with ID: ${bookId}`);
    return book;
}

export const updateBook = async (
    bookId: string,
    bookData: BookUpdateRequest,
    userId: string,
    tx?: Prisma.TransactionClient | PrismaClient
) => {
    logger.info(`Updating book with ID: ${bookId}`);
    const db = tx || prisma;
    const book = await db.book.update({
        where: {
            userId,
            id: bookId,
        },
        data: bookData,
    });
    logger.info(`Book updated successfully with ID: ${book.id}`);
    return book;
}

export const deleteBook = async (
    bookId: string,
    userId: string,
    tx?: Prisma.TransactionClient | PrismaClient
) => {
    logger.info(`Deleting book with ID: ${bookId}`);
    const db = tx || prisma;
    const book = await db.book.delete({
        where: {
            userId,
            id: bookId,
        },
    });
    logger.info(`Book deleted successfully with ID: ${book.id}`);
    return book;
}