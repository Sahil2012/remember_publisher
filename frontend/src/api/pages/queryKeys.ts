export const pageKeys = {
    all: ["pages"] as const,
    lists: () => [...pageKeys.all, "list"] as const,
    list: (chapterId: string) => [...pageKeys.lists(), { chapterId }] as const,
    details: () => [...pageKeys.all, "detail"] as const,
    detail: (id: string) => [...pageKeys.details(), id] as const,
}
