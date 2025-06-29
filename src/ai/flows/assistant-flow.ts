'use server';
/**
 * @fileOverview A conversational AI assistant for the Esnaf Defteri app that can understand and execute commands by calling tools that interact with the database. It maintains a persistent memory of the conversation.
 *
 * - chatWithAssistant - A function that handles the stateful conversation and tool execution.
 * - ChatWithAssistantInput - The input type for the chatWithAssistant function.
 * - ChatWithAssistantOutput - The return type for the chatWithAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  addPaymentTool,
  addSaleTool,
  addExpenseTool,
  addStockAdjustmentTool,
  addCustomerTool,
  addCashSaleTool,
  deleteCustomerTool,
  deleteProductTool,
  deleteSaleTool,
  deleteExpenseTool,
  deleteStockAdjustmentTool,
} from '@/ai/tools/esnaf-tools';
import type { Message, ChatHistory } from '@/lib/types';

const allTools = [
    addSaleTool,
    addPaymentTool,
    addExpenseTool,
    addStockAdjustmentTool,
    addCustomerTool,
    addCashSaleTool,
    deleteCustomerTool,
    deleteProductTool,
    deleteSaleTool,
    deleteExpenseTool,
    deleteStockAdjustmentTool,
];

const ChatWithAssistantInputSchema = z.object({
  newMessage: z.string().describe('The latest message from the user.'),
  userId: z.string().describe("The user's Firebase UID.")
});
export type ChatWithAssistantInput = z.infer<typeof ChatWithAssistantInputSchema>;

const ChatWithAssistantOutputSchema = z.object({
  textResponse: z
    .string()
    .describe("The AI's textual response to the user."),
});
export type ChatWithAssistantOutput = z.infer<
  typeof ChatWithAssistantOutputSchema
>;

const systemPrompt = `Sen, bir kasap dükkanı için geliştirilmiş "Esnaf Defteri" uygulamasının zeki ve yardımsever yapay zeka asistanısın. Görevin, kullanıcıların işlemlerini kolaylaştırmak ve sorularını hızlıca yanıtlamaktır. Cevapların her zaman kısa, net ve bir esnafın kolayca anlayacağı, samimi bir dilde olmalı.
Kullanıcı bir işlem yapmak istediğinde (örneğin, "Ahmet Yılmaz'a 500 liralık satış ekle", "Ayşe Kaya'dan 100 lira ödeme aldım", "Yeni müşteri ekle: Adı Canan Güneş"), uygun aracı kullan.
Eğer bir müşteri veya ürün adı belirsizse ya da bulunamazsa, kibarca kullanıcıdan ismi kontrol etmesini veya yeni bir kayıt eklemek isteyip istemediğini sor.
"addSale" aracını sadece veresiye (borç) satışlar için kullanmalısın. Peşin satışlar için "addCashSale" aracını kullan.
Kullanıcı senden bilgi istiyorsa (örneğin, "Ahmet'in ne kadar borcu var?"), şu an için bu bilgiye erişimin olmadığını, ancak gelecekte bu özelliğin ekleneceğini belirt.
Bir aracı çalıştırdıktan sonra, aracın döndürdüğü sonucu temel alarak kullanıcıyı mutlaka doğal bir dilde bilgilendir. Örneğin, "Elbette, Ahmet Yılmaz için 250 TL'lik satış başarıyla eklendi." gibi.
Unutma, her araç 'userId' parametresine ihtiyaç duyar, bu bilgiyi her zaman sağla.`;

export async function getChatHistory(userId: string): Promise<Message[]> {
  if (!userId) {
    return [];
  }
  const historyRef = doc(db, 'chatHistories', userId);
  const historySnap = await getDoc(historyRef);

  if (historySnap.exists()) {
    const messages = (historySnap.data() as ChatHistory).messages;
    // Defensive check: If history is not empty and doesn't start with a user message,
    // it's corrupt. Return an empty array to start fresh.
    if (messages.length > 0 && messages[0].role !== 'user') {
      console.warn(`Corrupt chat history for user ${userId}, starting fresh.`);
      return [];
    }
    return messages;
  }
  
  return [];
}

const toGenkitMessages = (history: Message[]) => {
  return history.map(m => {
    if (m.role === 'user') return { role: 'user' as const, content: [{ text: m.content as string }] };
    if (m.role === 'model') {
        const modelContent = m.content as any;
        if (modelContent && typeof modelContent === 'object' && modelContent.toolRequests) {
            const parts = modelContent.toolRequests.map((req: any) => ({ toolRequest: req }));
            return { role: 'model' as const, content: parts };
        }
        return { role: 'model' as const, content: [{ text: m.content as string }] };
    }
    if (m.role === 'tool') {
        const toolContent = m.content as Array<{ toolCallId: string; output: any }>;
        return { role: 'tool' as const, content: toolContent.map(tc => ({ toolResponse: tc })) };
    }
    // Should not happen, but filter it out just in case
    return null;
  }).filter((m): m is NonNullable<typeof m> => m !== null);
}

export async function chatWithAssistant(
  input: ChatWithAssistantInput
): Promise<ChatWithAssistantOutput> {
  const { newMessage, userId } = input;
  const historyRef = doc(db, 'chatHistories', userId);

  // 1. Load history using the new defensive function.
  let chatHistory = await getChatHistory(userId);

  // 2. Append new user message. Now we are certain history either is empty or starts with 'user'.
  chatHistory.push({ role: 'user', content: newMessage });
  
  // 3. Generate response from the model
  const llmResponse = await ai.generate({
    messages: toGenkitMessages(chatHistory),
    system: systemPrompt,
    tools: allTools,
  });

  let finalResponseText = '';
  const toolRequests = llmResponse.toolRequests;

  if (toolRequests && toolRequests.length > 0) {
    // A tool has been requested
    chatHistory.push({ role: 'model', content: { toolRequests } });

    const toolResponses = [];
    for (const toolRequest of toolRequests) {
        for (const call of toolRequest.calls) {
          const tool = allTools.find(t => t.name === call.name);
          if (tool) {
            const toolInputWithUser = { ...call.input, userId };
            const output = await tool.fn(toolInputWithUser);
            toolResponses.push({ toolCallId: call.toolCallId, output });
          }
        }
    }

    chatHistory.push({ role: 'tool', content: toolResponses });

    // Call the model again with the tool responses
    const finalLlmResponse = await ai.generate({
        messages: toGenkitMessages(chatHistory),
        system: systemPrompt,
        tools: allTools,
    });
    
    finalResponseText = finalLlmResponse.text;
    chatHistory.push({ role: 'model', content: finalResponseText });
  } else {
    // No tool call, just a text response
    finalResponseText = llmResponse.text;
    chatHistory.push({ role: 'model', content: finalResponseText });
  }

  // 4. Save updated history
  await setDoc(historyRef, { userId, messages: chatHistory });

  // 5. Return final response
  return { textResponse: finalResponseText };
}
