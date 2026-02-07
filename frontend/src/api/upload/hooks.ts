import { useMutation } from "@tanstack/react-query";
import { useAPIClient } from "../useAPIClient";
import { UploadClient } from "./client";

export const useUploadFile = () => {
    const apiClient = useAPIClient();
    const uploadClient = new UploadClient(apiClient);

    return useMutation({
        mutationFn: (file: File) => uploadClient.uploadFile(file),
    });
};
