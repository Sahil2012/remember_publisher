import axios from "axios";

// Default to localhost:3000 if not specified in env
const BASE_url = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
    baseURL: BASE_url,
    headers: {
        "Content-Type": "application/json",
    },
});
