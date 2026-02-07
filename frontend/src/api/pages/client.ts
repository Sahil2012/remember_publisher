import type { AxiosInstance } from "axios";
import type { Page } from "../books/types";
import type { CreatePagePayload, UpdatePagePayload } from "./types";

export class PageClient {
    private client: AxiosInstance;

    constructor(client: AxiosInstance) {
        this.client = client;
    }

    // LIST pages for a chapter
    getPages(chapterId: string): Promise<Page[]> {
        return this.client.get(`/pages/chapter/${chapterId}`).then(r => r.data);
    }

    // CREATE a page in a chapter
    createPage(chapterId: string, payload: CreatePagePayload): Promise<Page> {
        return this.client.post(`/pages/chapter/${chapterId}`, payload).then(r => r.data);
    }

    // GET a single page
    getPage(id: string): Promise<Page> {
        return this.client.get(`/pages/${id}`).then(r => r.data);
    }

    // UPDATE a page
    updatePage(id: string, payload: UpdatePagePayload): Promise<Page> {
        return this.client.patch(`/pages/${id}`, payload).then(r => r.data);
    }

    // DELETE a page
    deletePage(id: string): Promise<Page> {
        return this.client.delete(`/pages/${id}`).then(r => r.data);
    }

    // REORDER pages in a chapter
    reorderPages(bookId: string, chapterId: string, pages: { id: string; order: number }[]): Promise<void> {
        return this.client.patch(`/chapters/${bookId}/${chapterId}/pages/order`, pages).then(r => r.data);
    }
}
