export interface UpdateChapterPayload {
    title?: string;
    description?: string;
    order?: number;
}

export interface CreateChapterPayload {
    title: string;
    description?: string;
    order?: number;
}
