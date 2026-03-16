import type { AxiosInstance } from "axios";
import type { RevampRequest, RevampResponse } from "./types";

export class RevampClient {
    private client: AxiosInstance;

    constructor(client: AxiosInstance) {
        this.client = client;
    }

    revampText(bookId: string, payload: RevampRequest): Promise<string> {
        return this.client.post<RevampResponse>(`/revamp/${bookId}`, payload)
            .then(r => r.data.revamped);
    }
}
