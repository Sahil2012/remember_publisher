import { PromptTemplate } from '@langchain/core/prompts';

export const revampPrompt = PromptTemplate.fromTemplate(`
TASK: Rewrite the following text.
CONTEXT: This is for a "{category}" book.
TONE: {tone}

INSTRUCTIONS:
1.  **Output ONLY the rewritten text.**
2.  Do NOT include any intro or outro.
3.  Do NOT add any suggestions.
4.  Keep the meaning the same; do not invent facts.
5.  If "Memoir": Focus on personal narrative, emotion, and vivid imagery.
6.  If "Business": Focus on clarity, authority, utility, and persuasive arguments.

{context_section}

INPUT TEXT:
"{text}"

REWRITTEN TEXT:
`);
