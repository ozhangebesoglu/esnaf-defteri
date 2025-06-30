'use server';

/**
 * @fileOverview A stateless conversational AI assistant for the Esnaf Defteri app that can understand and execute commands by calling tools that interact with the database. This version does not persist conversation history.
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


// Main AI chat handler (stateless version)
export async function chatWithAssistant(input: ChatWithAssistantInput): Promise<ChatWithAssistantOutput> {
  const { newMessage, userId } = input;

  // This is a stateless flow, so we only use the current message.
  // We build a message history for this turn only to support multi-step tool calling.
  const messages: MessageData[] = [
    { role: 'user', content: [{ text: newMessage }] },
  ];

  const llmResponse = await ai.generate({
    system: systemPrompt,
    messages: messages,
    tools: allTools,
  });

  const toolRequests = llmResponse.toolRequests;

  if (toolRequests && toolRequests.length > 0) {
    // Add the model's request to use tools to our turn's history
    messages.push({ role: 'model', content: toolRequests });

    const toolResponses: ToolResponsePart[] = [];
    
    for (const toolRequestPart of toolRequests) {
      const toolRequest = toolRequestPart.toolRequest;
      const tool = allTools.find(t => t.name === toolRequest.name);
      
      if (tool) {
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
            output: { error: errorMsg }, // Return structured error
          },
        });
      }
    }
    
    // Add the results of the tool calls to our turn's history
    messages.push({ role: 'tool', content: toolResponses });

    // Call the model again with the tool results to get a final natural language response
    const finalLlmResponse = await ai.generate({
      system: systemPrompt,
      messages: messages,
      tools: allTools,
    });

    const finalResponseText = finalLlmResponse.text;
    return { textResponse: finalResponseText };
  } else {
    // No tools were called, just return the model's direct response.
    const finalResponseText = llmResponse.text;
    return { textResponse: finalResponseText };
  }
}
