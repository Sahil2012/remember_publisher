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
5.  If category is "Life Story" or "Memoir": Focus on personal narrative, emotion, and vivid imagery.
6.  If category is "Business": Focus on clarity, authority, utility, and persuasive arguments.
7.  If category is "Yearbook": Focus on community, celebration, milestones, and shared experiences.

{context_section}

INPUT TEXT:
"{text}"

REWRITTEN TEXT:
`);
