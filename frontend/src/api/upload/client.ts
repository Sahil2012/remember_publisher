import { useAPIClient } from "../useAPIClient";

export class UploadClient {
    private client;

    constructor(client: ReturnType<typeof useAPIClient>) {
        this.client = client;
    }

    async uploadFile(file: File): Promise<string> {
        const formData = new FormData();
        formData.append("file", file);

        const response = await this.client.post<{ url: string }>("/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data.url;
    }
}
