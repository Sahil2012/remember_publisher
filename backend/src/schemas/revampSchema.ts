import { z } from 'zod';

export const revampSchema = z.object({
    text: z.string().min(1, "Input text cannot be empty"),
    category: z.enum(['Memoir', 'Business']).optional().default('Memoir'),
    tone: z.string().optional().default('Professional'), // Relaxing enum to string to allow flexibility, or we can list all possible tones.
});

export type RevampRequest = z.infer<typeof revampSchema>;
