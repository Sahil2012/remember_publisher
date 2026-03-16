import { useMutation } from "@tanstack/react-query";
import { useAPIClient } from "../useAPIClient";
import { RevampClient } from "./client";
import type { RevampRequest } from "./types";

export const useRevampText = () => {
    const apiClient = useAPIClient();
    const revampClient = new RevampClient(apiClient);

    return useMutation({
        mutationFn: ({ bookId, payload }: { bookId: string; payload: RevampRequest }) => 
            revampClient.revampText(bookId, payload),
    });
};
