import { Request, Response, NextFunction } from "express";
import { BookRequest, BookResponse } from "../schema/bookSchema";
import { createBook, getBookById, getBooksByUserId } from "../services/bookService";
import prisma from "../api/prismaClient";

// POST /books
export const createBookHandler = async (
    req: Request<{ userId: string }, unknown, BookRequest>,
    res: Response<BookResponse>,
    next: NextFunction
) => {
    const book = await createBook(req.body, req.user?.id || "", prisma);
    return res.status(200).json(book);
}

// GET /books
export const fetchBooksHandler = async (
    req: Request<{ userId: string }, unknown, unknown>,
    res: Response<BookResponse[]>,
    next: NextFunction
) => {
    const books = await getBooksByUserId(req.user?.id || "", prisma);
    return res.status(200).json(books);
}


// GET /books/:id
export const fetchBookHandler = async (
    req: Request<{ userId: string, id: string }, unknown, unknown>,
    res: Response<BookResponse>,
    next: NextFunction
) => {
    const book = await getBookById(req.params.id, req.user?.id || "", prisma);
    return res.status(200).json(book);
}

// export const updateBookHandler = async (
//     req: Request<{ userId: string }, unknown, BookUpdateRequest>,
//     res: Response<BookResponse>,
//     next: NextFunction
// ) => {
//     const book = await updateBook(req.params.id, req.body, prisma);
//     return res.status(200).json(book);
// }

// export const deleteBookHandler = async (
//     req: Request<{ userId: string }, unknown, unknown>,
//     res: Response<BookResponse>,
//     next: NextFunction
// ) => {
//     const book = await deleteBook(req.params.id, prisma);
//     return res.status(200).json(book);
// }
