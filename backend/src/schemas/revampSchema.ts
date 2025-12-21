import { z } from 'zod';

export const revampSchema = z.object({
    text: z.string().min(1, "Input text cannot be empty"),
    context: z.string().optional(),
    tone: z.enum([
        'Professional', 'Casual', 'Enthusiastic', 'Witty', 'Persuasive',
        'professional', 'casual', 'enthusiastic', 'witty', 'persuasive', // Keeping lowercase just in case
        'formal', 'creative' // Legacy support
    ]).optional().default('Professional'),
});

export type RevampRequest = z.infer<typeof revampSchema>;
