import { api } from "@/lib/api";

export interface RevampResponse {
    revamped: string;
}

export const RevampService = {
    revampText: async (text: string, tone: string, category: "Memoir" | "Business"): Promise<string> => {
        try {
            const response = await api.post<RevampResponse>("/revamp", {
                text,
                tone,
                category,
            });
            return response.data.revamped;
        } catch (error) {
            console.error("Revamp API Error:", error);
            throw error;
        }
    },
};
