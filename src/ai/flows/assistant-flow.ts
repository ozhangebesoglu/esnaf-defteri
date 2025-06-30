'use server';

/**
 * @fileOverview A conversational AI assistant for the Esnaf Defteri app that can understand and execute commands by calling tools that interact with the database. It maintains a persistent memory of the conversation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
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
import type { MessageData, ToolRequestPart, ToolResponsePart } from 'genkit';

// Tüm tool fonksiyonlarını listele
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

// Input ve Output tip tanımları
const ChatWithAssistantInputSchema = z.object({
  newMessage: z.string().describe('The latest message from the user.'),
  userId: z.string().describe("The user's Firebase UID."),
});
export type ChatWithAssistantInput = z.infer<typeof ChatWithAssistantInputSchema>;

const ChatWithAssistantOutputSchema = z.object({
  textResponse: z.string().describe("The AI's textual response to the user."),
});
export type ChatWithAssistantOutput = z.infer<typeof ChatWithAssistantOutputSchema>;

// AI'ye verilecek sistem prompt'u
const systemPrompt = `Sen, bir kasap dükkanı için geliştirilmiş "Esnaf Defteri" uygulamasının zeki ve yardımsever yapay zeka asistanısın. Esas görevin, kullanıcıların komutlarını anlayıp, bu komutları yerine getirmek için sana sağlanan araçları (tools) kullanarak veritabanı işlemlerini gerçekleştirmektir. Cevapların her zaman Türkçe, kısa, net ve bir esnafın kolayca anlayacağı, samimi bir dilde olmalı.

**KIRILMASI İMKANSIZ, KRİTİK KURALLAR:**
1. YAPMADIĞIN BİR İŞLEMİ ONAYLAMA.
2. HALÜSİNASYON GÖRME.
3. ÖNCE BİLGİ TOPLA.
4. HATALARI BİLDİR.
5. BİLGİ SINIRLARI.
6. KULLANICI ID'Sİ İSTEME: Kullanıcı ID'si sana sistem tarafından otomatik olarak veriliyor. Kullanıcıdan asla ve asla ID, kimlik veya benzeri bir bilgi isteme.
7. ASIL AMACIN ARAÇ KULLANMAK.`;

// Geçmiş sohbeti Firestore’dan çek
export async function getChatHistory(userId: string): Promise<Message[]> {
  if (!userId) return [];
  const historyRef = adminDb.collection('chatHistories').doc(userId);
  const historySnap = await historyRef.get();

  if (historySnap.exists) {
    const data = historySnap.data() as ChatHistory;
    if (data && Array.isArray(data.messages)) {
        return data.messages;
    }
     console.warn(`Corrupt chat history for user ${userId}, starting fresh.`);
     await historyRef.set({ userId, messages: [] });
     return [];
  }

  return [];
}

// Geçmiş mesajları Genkit formatına dönüştür
const toGenkitMessages = (history: Message[]): MessageData[] => {
  const messages: MessageData[] = [];
  for (const m of history) {
    if (m.role === 'user') {
      messages.push({ role: 'user', content: [{ text: m.content as string }] });
    } else if (m.role === 'model') {
      const modelContent = m.content as any;
      if (modelContent?.toolRequests) {
        const parts: ToolRequestPart[] = modelContent.toolRequests;
        messages.push({ role: 'model', content: parts });
      } else {
        messages.push({ role: 'model', content: [{ text: m.content as string }] });
      }
    } else if (m.role === 'tool') {
      const toolContent = m.content as Array<{ toolCallId: string; output: any; name: string }>;
      const parts: ToolResponsePart[] = toolContent.map(tc => ({
        toolResponse: {
          name: tc.name,
          toolCallId: tc.toolCallId,
          output: tc.output,
        },
      }));
      messages.push({ role: 'tool', content: parts });
    }
  }
  return messages;
};

// Ana AI chat işleyicisi
export async function chatWithAssistant(input: ChatWithAssistantInput): Promise<ChatWithAssistantOutput> {
  const { newMessage, userId } = input;
  const historyRef = adminDb.collection('chatHistories').doc(userId);

  let chatHistory = await getChatHistory(userId);
  chatHistory.push({ role: 'user', content: newMessage });

  const llmResponse = await ai.generate({
    messages: toGenkitMessages(chatHistory),
    system: systemPrompt,
    tools: allTools,
  });

  const toolRequests = llmResponse.toolRequests;

  if (toolRequests && toolRequests.length > 0) {
    chatHistory.push({ role: 'model', content: { toolRequests } });

    const toolResponses = [];
    
    for (const toolRequest of toolRequests) {
      // The entire inner toolRequest object is cast to 'any' to resolve the chain of type errors.
      const req: any = toolRequest.toolRequest;
      const tool = allTools.find(t => t.name === req.name);
      
      if (tool) {
        const toolInputWithUser = { ...(req.input as object), userId };
        const output = await tool(toolInputWithUser as any);
        
        toolResponses.push({
          toolCallId: req.toolCallId,
          output,
          name: tool.name, 
        });
      } else {
        const req: any = toolRequest.toolRequest;
        const errorMsg = `Error: Tool '${req.name}' not found.`;
        console.error(errorMsg);
        toolResponses.push({
          toolCallId: req.toolCallId,
          output: errorMsg,
          name: req.name,
        });
      }
    }

    chatHistory.push({ role: 'tool', content: toolResponses });

    const finalLlmResponse = await ai.generate({
      messages: toGenkitMessages(chatHistory),
      system: systemPrompt,
      tools: allTools,
    });

    const finalResponseText = finalLlmResponse.text;
    chatHistory.push({ role: 'model', content: finalResponseText });
    await historyRef.set({ userId, messages: chatHistory });
    return { textResponse: finalResponseText };
  } else {
    const finalResponseText = llmResponse.text;
    chatHistory.push({ role: 'model', content: finalResponseText });
    await historyRef.set({ userId, messages: chatHistory });
    return { textResponse: finalResponseText };
  }
}
