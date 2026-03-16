import { z } from 'zod';

export const revampSchema = z.object({
    text: z.string().min(1, "Input text cannot be empty"),
    category: z.string().optional().default('Memoir'),
    tone: z.string().optional().default('Professional'), 
});

export type RevampRequest = z.infer<typeof revampSchema>;
