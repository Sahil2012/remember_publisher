import type { AxiosInstance } from "axios";
import type { Chapter } from "../books/types";
import type { CreateChapterPayload, UpdateChapterPayload } from "./types";

export class ChapterClient {
    private client: AxiosInstance;

    constructor(client: AxiosInstance) {
        this.client = client;
    }

    // LIST chapters for a book
    getChapters(bookId: string): Promise<Chapter[]> {
        return this.client.get(`/chapters/${bookId}`).then(r => r.data);
    }

    // CREATE a chapter in a book
    createChapter(bookId: string, payload: CreateChapterPayload): Promise<Chapter> {
        return this.client.post(`/chapters/${bookId}`, payload).then(r => r.data);
    }

    // GET a single chapter
    getChapter(bookId: string, id: string): Promise<Chapter> {
        return this.client.get(`/chapters/${bookId}/${id}`).then(r => r.data);
    }

    // UPDATE a chapter
    updateChapter(bookId: string, id: string, payload: UpdateChapterPayload): Promise<Chapter> {
        return this.client.patch(`/chapters/${bookId}/${id}`, payload).then(r => r.data);
    }

    // DELETE a chapter
    deleteChapter(bookId: string, id: string): Promise<Chapter> {
        return this.client.delete(`/chapters/${bookId}/${id}`).then(r => r.data);
    }
}
