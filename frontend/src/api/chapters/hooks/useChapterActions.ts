import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAPIClient } from "../../useAPIClient";
import { ChapterClient } from "../client";
import type { CreateChapterPayload, UpdateChapterPayload } from "../types";
import { chapterKeys } from "../queryKeys";

export const useChapterActions = () => {
    const apiClient = useAPIClient();
    const chapterClient = new ChapterClient(apiClient);
    const queryClient = useQueryClient();

    const createChapter = useMutation({
        mutationFn: ({ bookId, payload }: { bookId: string; payload: CreateChapterPayload }) =>
            chapterClient.createChapter(bookId, payload),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: chapterKeys.list(variables.bookId) });
        },
    });

    const updateChapter = useMutation({
        mutationFn: ({ bookId, id, payload }: { bookId: string; id: string; payload: UpdateChapterPayload }) =>
            chapterClient.updateChapter(bookId, id, payload),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: chapterKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: chapterKeys.list(variables.bookId) });
        },
    });

    const deleteChapter = useMutation({
        mutationFn: ({ bookId, id }: { bookId: string; id: string }) =>
            chapterClient.deleteChapter(bookId, id),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: chapterKeys.list(variables.bookId) });
        },
    });

    return {
        createChapter,
        updateChapter,
        deleteChapter,
    };
};
