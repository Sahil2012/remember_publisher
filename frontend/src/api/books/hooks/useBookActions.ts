import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAPIClient } from "../../useAPIClient";
import { BookClient } from "../client";
import type { CreateBookPayload, UpdateBookPayload } from "../types";
import { bookKeys } from "../queryKeys";

export const useBookActions = () => {
    const apiClient = useAPIClient();
    const bookClient = new BookClient(apiClient);
    const queryClient = useQueryClient();

    const createBook = useMutation({
        mutationFn: (payload: CreateBookPayload) => bookClient.createBook(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
        },
    });

    const updateBook = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateBookPayload }) =>
            bookClient.updateBook(id, payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: bookKeys.detail(data.id) });
            queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
        },
    });

    const deleteBook = useMutation({
        mutationFn: (id: string) => bookClient.deleteBook(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: bookKeys.lists() });
        },
    });

    return {
        createBook,
        updateBook,
        deleteBook,
    };
};
