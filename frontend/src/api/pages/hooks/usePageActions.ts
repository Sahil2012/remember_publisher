import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAPIClient } from "../../useAPIClient";
import { PageClient } from "../client";
import type { CreatePagePayload, UpdatePagePayload } from "../types";
import { pageKeys } from "../queryKeys";
import { bookKeys } from "../../books/queryKeys";

export const usePageActions = () => {
    const apiClient = useAPIClient();
    const pageClient = new PageClient(apiClient);
    const queryClient = useQueryClient();

    const createPage = useMutation({
        mutationFn: ({ chapterId, payload }: { chapterId: string; payload: CreatePagePayload }) =>
            pageClient.createPage(chapterId, payload),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: pageKeys.list(variables.chapterId) });
            queryClient.invalidateQueries({ queryKey: bookKeys.all });
        },
    });

    const updatePage = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdatePagePayload }) =>
            pageClient.updatePage(id, payload),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: pageKeys.detail(data.id) });
            if (variables.payload.chapterId) {
                queryClient.invalidateQueries({ queryKey: pageKeys.lists() });
            } else {
                queryClient.invalidateQueries({ queryKey: pageKeys.list(data.chapterId) });
            }
            queryClient.invalidateQueries({ queryKey: bookKeys.all });
        },
    });

    const deletePage = useMutation({
        mutationFn: (id: string) => pageClient.deletePage(id),
        onSuccess: (data) => {
            if (data?.chapterId) {
                queryClient.invalidateQueries({ queryKey: pageKeys.list(data.chapterId) });
            }
            queryClient.invalidateQueries({ queryKey: bookKeys.all });
        },
    });

    const reorderPages = useMutation({
        mutationFn: ({ bookId, chapterId, pages }: { bookId: string; chapterId: string; pages: { id: string; order: number }[] }) =>
            pageClient.reorderPages(bookId, chapterId, pages),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: pageKeys.list(variables.chapterId) });
        },
    });

    return {
        createPage,
        updatePage,
        deletePage,
        reorderPages,
    };
};
