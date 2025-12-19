import { RevampRequest } from '../schemas/revampSchema.js';
import { IRevampService } from '../interfaces/IRevampService.js';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { PromptTemplate } from '@langchain/core/prompts';
import { llmModel } from '../config/llm.js';
import { revampPrompt } from '../prompts/revampPrompt.js';

export class RevampService implements IRevampService {
    private chain: RunnableSequence;

    constructor(
        private model: BaseChatModel = llmModel,
        private prompt: PromptTemplate = revampPrompt
    ) {
        const outputParser = new StringOutputParser();
        this.chain = RunnableSequence.from([
            this.prompt,
            this.model,
            outputParser
        ]);
    }

    async revampText(data: RevampRequest): Promise<string> {
        const { text, context, tone } = data;
        const contextSection = context ? `CONTEXT: ${context}` : '';

        try {
            const result = await this.chain.invoke({
                text: text,
                tone: tone || 'professional',
                context_section: contextSection
            });
            return result.trim();
        } catch (error) {
            console.error("RevampService Error:", error);
            throw new Error("Failed to process text revamp request.");
        }
    }
}
