import { useQuery } from "@tanstack/react-query";
import { useAPIClient } from "../../useAPIClient";
import { PageClient } from "../client";
import { pageKeys } from "../queryKeys";

export const usePages = (chapterId: string) => {
    const apiClient = useAPIClient();
    const pageClient = new PageClient(apiClient);

    return useQuery({
        queryKey: pageKeys.list(chapterId),
        queryFn: () => pageClient.getPages(chapterId),
        enabled: !!chapterId,
        staleTime: 5 * 60 * 1000,
    });
};

export const usePage = (id: string, enabled = true) => {
    const apiClient = useAPIClient();
    const pageClient = new PageClient(apiClient);

    return useQuery({
        queryKey: pageKeys.detail(id),
        queryFn: () => pageClient.getPage(id),
        enabled: !!id && enabled,
        staleTime: 5 * 60 * 1000,
    });
};
