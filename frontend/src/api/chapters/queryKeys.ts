export const chapterKeys = {
    all: ["chapters"] as const,
    lists: () => [...chapterKeys.all, "list"] as const,
    list: (bookId: string) => [...chapterKeys.lists(), { bookId }] as const,
    details: () => [...chapterKeys.all, "detail"] as const,
    detail: (id: string) => [...chapterKeys.details(), id] as const,
}
