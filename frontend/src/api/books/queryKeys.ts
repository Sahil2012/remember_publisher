import type { BookParams } from "./types";

export const bookKeys = {
    all: ["books"] as const,
    lists: () => [...bookKeys.all, "list"] as const,
    list: (params?: BookParams) => [...bookKeys.lists(), { filters: params }] as const,
    details: () => [...bookKeys.all, "detail"] as const,
    detail: (id: string) => [...bookKeys.details(), id] as const,
}
