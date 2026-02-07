export interface Page {
    id: string;
    content: any; // Json type in Prisma
    textContent?: string;
    order: number;
    chapterId: string;
    createdAt: string;
    updatedAt: string;
}

export interface Chapter {
    id: string;
    title: string;
    description?: string;
    order: number;
    bookId: string;
    pages: Page[];
    createdAt: string;
    updatedAt: string;
}

export interface Book {
    id: string;
    title: string;
    description: string;
    authorName: string;
    coverImage?: string;
    coverColor?: string;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    userId: string;
    wordCount?: number;
    createdAt: string;
    updatedAt: string;
    chapters: Chapter[];
}

export interface CreateBookPayload {
    title: string;
    description: string;
    authorName: string;
    coverImage: string;
    coverColor: string;
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

export interface UpdateBookPayload {
    title?: string;
    description?: string;
    authorName?: string;
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    coverImage?: string;
    coverColor?: string;
}

export interface BookParams {
    status?: string;
}
