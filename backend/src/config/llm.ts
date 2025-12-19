import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { config } from 'dotenv';

config();

export const llmModel = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GEMINI_API_KEY,
    temperature: 0.7,
});
