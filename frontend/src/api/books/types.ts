export interface Book {
    id: string;
    title: string;
    description: string;
    authorName: string;
    coverImage?: string;
    coverColor?: string;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    userId: string;
    createdAt: string;
    updatedAt: string;
    chapters?: unknown[];
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
