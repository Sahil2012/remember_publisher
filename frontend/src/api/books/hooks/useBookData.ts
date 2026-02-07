import { useQuery } from "@tanstack/react-query";
import { useAPIClient } from "../../useAPIClient";
import { BookClient } from "../client";
import { bookKeys } from "../queryKeys";
import type { BookParams } from "../types";


export const useBook = (id: string, enabled = true) => {
    const apiClient = useAPIClient();
    const bookClient = new BookClient(apiClient);

    return useQuery({
        queryKey: bookKeys.detail(id),
        queryFn: () => bookClient.getBook(id),
        enabled: !!id && enabled,
        staleTime: 5 * 60 * 1000,
    });
};

export const useBooks = (params: BookParams = {}) => {
    const apiClient = useAPIClient();
    const bookClient = new BookClient(apiClient);

    return useQuery({
        queryKey: bookKeys.list(params),
        queryFn: () => bookClient.getBooks(params),
        staleTime: 5 * 60 * 1000,
    });
};
