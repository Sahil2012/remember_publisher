export interface RevampRequest {
    text: string;
    tone: string;
    category: "Memoir" | "Business";
}

export interface RevampResponse {
    revamped: string;
}
