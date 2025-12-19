import { PromptTemplate } from '@langchain/core/prompts';

export const revampPrompt = PromptTemplate.fromTemplate(`
TASK: Rewrite the following text to be more descriptive, interesting, and exciting.

TONE: {tone}

INSTRUCTIONS:
1.  **Output ONLY the rewritten text.**
2.  Do NOT include any intro (e.g., "Here is the rewritten text") or outro.
3.  Do NOT add any suggestions or notes.
4.  Keep the meaning the same; do not invent facts.

{context_section}

INPUT TEXT:
"{text}"

REWRITTEN TEXT:
`);
