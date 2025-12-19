import { z } from 'zod';

export const revampSchema = z.object({
    text: z.string().min(1, "Input text cannot be empty"),
    context: z.string().optional(),
    tone: z.enum(['formal', 'casual', 'professional', 'creative']).optional().default('professional'),
});

export type RevampRequest = z.infer<typeof revampSchema>;
