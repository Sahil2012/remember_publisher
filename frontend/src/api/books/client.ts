import type { AxiosInstance } from "axios";
import type { Book, BookParams, CreateBookPayload, UpdateBookPayload } from "./types";

export class BookClient {
    private client: AxiosInstance;

    constructor(client: AxiosInstance) {
        this.client = client;
    }

    getBooks(params?: BookParams): Promise<Book[]> {
        return this.client.get("/books", { params }).then(r => r.data);
    }

    getBook(id: string): Promise<Book> {
        return this.client.get(`/books/${id}`).then(r => r.data);
    }

    createBook(payload: CreateBookPayload): Promise<Book> {
        return this.client.post("/books", payload).then(r => r.data);
    }

    updateBook(id: string, payload: UpdateBookPayload): Promise<Book> {
        return this.client.patch(`/books/${id}`, payload).then(r => r.data);
    }

    deleteBook(id: string): Promise<void> {
        return this.client.delete(`/books/${id}`).then(r => r.data);
    }
}
