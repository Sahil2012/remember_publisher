import { useQuery } from "@tanstack/react-query";
import { useAPIClient } from "../../useAPIClient";
import { ChapterClient } from "../client";
import { chapterKeys } from "../queryKeys";

export const useChapters = (bookId: string) => {
    const apiClient = useAPIClient();
    const chapterClient = new ChapterClient(apiClient);

    return useQuery({
        queryKey: chapterKeys.list(bookId),
        queryFn: () => chapterClient.getChapters(bookId),
        enabled: !!bookId,
        staleTime: 5 * 60 * 1000,
    });
};

export const useChapter = (bookId: string, id: string) => {
    const apiClient = useAPIClient();
    const chapterClient = new ChapterClient(apiClient);

    return useQuery({
        queryKey: chapterKeys.detail(id),
        queryFn: () => chapterClient.getChapter(bookId, id),
        enabled: !!bookId && !!id,
        staleTime: 5 * 60 * 1000,
    });
};
