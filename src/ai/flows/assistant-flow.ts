'use server';

/**
 * @fileOverview A stateful conversational AI assistant for the Esnaf Defteri app that can understand and execute commands by calling tools that interact with the database. It remembers conversation history.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
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
import type { MessageData, ToolResponsePart } from 'genkit';
import { adminDb } from '@/lib/firebase-admin';
import type { ChatHistory } from '@/lib/types';

// All available tools
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

// Input and Output type definitions
const ChatWithAssistantInputSchema = z.object({
  newMessage: z.string().describe('The latest message from the user.'),
  userId: z.string().describe("The user's Firebase UID."),
});
export type ChatWithAssistantInput = z.infer<typeof ChatWithAssistantInputSchema>;

const ChatWithAssistantOutputSchema = z.object({
  textResponse: z.string().describe("The AI's textual response to the user."),
});
export type ChatWithAssistantOutput = z.infer<typeof ChatWithAssistantOutputSchema>;

// System prompt for the AI
const systemPrompt = `Sen, bir kasap dükkanı için geliştirilmiş "Esnaf Defteri" uygulamasının zeki ve yardımsever yapay zeka asistanısın. Esas görevin, kullanıcıların komutlarını anlayıp, bu komutları yerine getirmek için sana sağlanan araçları (tools) kullanarak veritabanı işlemlerini gerçekleştirmektir. Cevapların her zaman Türkçe, kısa, net ve bir esnafın kolayca anlayacağı, samimi bir dilde olmalı.

**KIRILMASI İMKANSIZ, KRİTİK KURALLAR:**
1. YAPMADIĞIN BİR İŞLEMİ ONAYLAMA.
2. HALÜSİNASYON GÖRME.
3. ÖNCE BİLGİ TOPLA.
4. HATALARI BİLDİR.
5. BİLGİ SINIRLARI.
6. KULLANICI ID'Sİ İSTEME: Kullanıcı ID'si sana sistem tarafından otomatik olarak veriliyor. Kullanıcıdan asla ve asla ID, kimlik veya benzeri bir bilgi isteme.
7. ASIL AMACIN ARAÇ KULLANMAK.`;

// Helper functions to get and save chat history
async function getChatHistory(userId: string): Promise<MessageData[]> {
  if (!userId) return [];
  const historyRef = adminDb.collection('chatHistories').doc(userId);
  const historySnap = await historyRef.get();

  if (historySnap.exists) {
    const data = historySnap.data() as ChatHistory;
    // Basic validation to prevent crash on corrupted data
    if (data && Array.isArray(data.history)) {
       return data.history;
    }
  }
  return []; // Return empty history if not found or corrupted
}

async function saveChatHistory(userId: string, history: MessageData[]): Promise<void> {
  if (!userId) return;
  const historyRef = adminDb.collection('chatHistories').doc(userId);
  await historyRef.set({ userId, history });
}


// Main AI chat handler (stateful version)
export async function chatWithAssistant(input: ChatWithAssistantInput): Promise<ChatWithAssistantOutput> {
  const { newMessage, userId } = input;

  // 1. Get existing history from Firestore
  const history = await getChatHistory(userId);

  // 2. Add the new user message to the history for this turn
  history.push({ role: 'user', content: [{ text: newMessage }] });

  // 3. Generate a response, which may include tool requests
  const llmResponse = await ai.generate({
    system: systemPrompt,
    messages: history,
    tools: allTools,
  });

  const modelChoice = llmResponse.choices[0];
  history.push(modelChoice.message); // Add the model's full response (text or tool_request) to history

  const toolRequests = llmResponse.toolRequests;

  // 4. Handle tool requests if the model generated any
  if (toolRequests && toolRequests.length > 0) {
    const toolResponses: ToolResponsePart[] = [];
    
    for (const toolRequestPart of toolRequests) {
      const toolRequest = toolRequestPart.toolRequest;
      const tool = allTools.find(t => t.name === toolRequest.name);
      
      if (tool) {
        // IMPORTANT: Add the server-side userId to the input before calling the tool
        const toolInputWithUser = { ...toolRequest.input, userId };
        const output = await tool(toolInputWithUser as any);
        
        toolResponses.push({
          toolResponse: {
            name: tool.name,
            toolCallId: toolRequest.toolCallId,
            output,
          },
        });
      } else {
        const errorMsg = `Error: Tool '${toolRequest.name}' not found.`;
        console.error(errorMsg);
        toolResponses.push({
          toolResponse: {
            name: toolRequest.name,
            toolCallId: toolRequest.toolCallId,
            output: { error: errorMsg },
          },
        });
      }
    }
    
    // 5. Add tool execution results to history
    history.push({ role: 'tool', content: toolResponses });

    // 6. Call the model again with the tool results to get a final natural language response
    const finalLlmResponse = await ai.generate({
      system: systemPrompt,
      messages: history,
      tools: allTools,
    });
    
    history.push(finalLlmResponse.choices[0].message); // Add the final text response to history
    
    const finalResponseText = finalLlmResponse.text;

    // 7. Save the complete, updated history and return the response
    await saveChatHistory(userId, history);
    return { textResponse: finalResponseText };

  } else {
    // No tools were called. The model's response is the final response.
    const finalResponseText = llmResponse.text;
    
    // Save the history (user message + model response) and return
    await saveChatHistory(userId, history);
    return { textResponse: finalResponseText };
  }
}
