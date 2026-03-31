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

    publishBook(id: string): Promise<{ shareId: string }> {
        return this.client.post(`/books/${id}/publish`).then(r => r.data);
    }

    unpublishBook(id: string): Promise<{ success: boolean }> {
        return this.client.post(`/books/${id}/unpublish`).then(r => r.data);
    }

    getPublicBook(shareId: string): Promise<Book> {
        // Unauthenticated route, we might need a separate client if global client attaches auth headers that fail,
        // but Clerk typically ignores auth headers on public routes unless enforced.
        return this.client.get(`/public/books/${shareId}`).then(r => r.data);
    }

    deleteBook(id: string): Promise<void> {
        return this.client.delete(`/books/${id}`).then(r => r.data);
    }
}
