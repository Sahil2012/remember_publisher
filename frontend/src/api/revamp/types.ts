export interface RevampRequest {
    text: string;
    tone: string;
    category: "Life Story" | "Yearbook" | "Business";
}

export interface RevampResponse {
    revamped: string;
}
