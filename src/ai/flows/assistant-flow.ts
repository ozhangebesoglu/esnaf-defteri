'use server';
/**
 * @fileOverview A conversational AI assistant for the Esnaf Defteri app.
 *
 * - chatWithAssistant - A function that handles the conversation.
 * - ChatWithAssistantInput - The input type for the chatWithAssistant function.
 * - ChatWithAssistantOutput - The return type for the chatWithAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatWithAssistantInputSchema = z.object({
  userMessage: z.string().describe('The latest message from the user.'),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).describe('The history of the conversation so far.'),
  appData: z.any().describe('A JSON object containing the current state of the application data (customers, products, orders, etc.).'),
});
export type ChatWithAssistantInput = z.infer<typeof ChatWithAssistantInputSchema>;

export type ChatWithAssistantOutput = string;

export async function chatWithAssistant(
  input: ChatWithAssistantInput
): Promise<ChatWithAssistantOutput> {
  const {output} = await assistantPrompt(input);
  return output!;
}

const assistantPrompt = ai.definePrompt({
  name: 'esnafAssistantPrompt',
  input: {schema: ChatWithAssistantInputSchema},
  output: {schema: z.string()},
  prompt: `Sen bir kasap dükkanı için geliştirilmiş "Esnaf Defteri" uygulamasının yardımcı yapay zeka asistanısın. Kullanıcının sorularını, sağlanan JSON verilerini kullanarak yanıtla. Cevapların kısa, net ve bir esnafın anlayacağı dilde olsun.

Mevcut Uygulama Verileri (JSON):
\`\`\`json
{{{json appData}}}
\`\`\`

Sohbet Geçmişi:
{{#each chatHistory}}
**{{role}}**: {{content}}
{{/each}}

Kullanıcının Son Mesajı:
**user**: {{{userMessage}}}

Senin Cevabın:
**model**:`,
});
