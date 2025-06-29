
'use server';

/**
 * @fileOverview A conversational AI assistant for the Esnaf Defteri app that can understand and execute commands by calling tools that interact with the database. It maintains a persistent memory of the conversation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
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
6. KULLANICI ID'Sİ İSTEME.
7. ASIL AMACIN ARAÇ KULLANMAK.`;

// Geçmiş sohbeti Firestore’dan çek
export async function getChatHistory(userId: string): Promise<Message[]> {
  if (!userId) return [];
  const historyRef = doc(db, 'chatHistories', userId);
  const historySnap = await getDoc(historyRef);

  if (historySnap.exists()) {
    const messages = (historySnap.data() as ChatHistory).messages;
    if (messages.length > 0 && messages[0].role !== 'user' && messages[0].role !== 'model') {
      console.warn(`Corrupt chat history for user ${userId}, starting fresh.`);
      await setDoc(historyRef, { userId, messages: [] });
      return [];
    }
    return messages;
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
  const historyRef = doc(db, 'chatHistories', userId);

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
      const tool = allTools.find(t => t.name === toolRequest.toolRequest.name);
      if (tool) {
        const toolInputWithUser = { ...(toolRequest.toolRequest.input as object), userId };
        const output = await tool(toolInputWithUser); // Hata buradaydı, fn yok
        toolResponses.push({
          toolCallId: toolRequest.toolRequest.toolCallId,
          output,
          name: toolRequest.toolRequest.name,
        });
      } else {
        const errorMsg = `Error: Tool '${toolRequest.toolRequest.name}' not found.`;
        console.error(errorMsg);
        toolResponses.push({
          toolCallId: toolRequest.toolRequest.toolCallId,
          output: errorMsg,
          name: toolRequest.toolRequest.name,
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
    await setDoc(historyRef, { userId, messages: chatHistory });
    return { textResponse: finalResponseText };
  } else {
    const finalResponseText = llmResponse.text;
    chatHistory.push({ role: 'model', content: finalResponseText });
    await setDoc(historyRef, { userId, messages: chatHistory });
    return { textResponse: finalResponseText };
  }
}
