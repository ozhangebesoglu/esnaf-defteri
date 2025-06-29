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
// Import correct Genkit types for robust type checking
import type { MessageData, ToolRequestPart, ToolResponsePart } from 'genkit';


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

const systemPrompt = `Sen, bir kasap dükkanı için geliştirilmiş "Esnaf Defteri" uygulamasının zeki ve yardımsever yapay zeka asistanısın. Esas görevin, kullanıcıların komutlarını anlayıp, bu komutları yerine getirmek için sana sağlanan araçları (tools) kullanarak veritabanı işlemlerini gerçekleştirmektir. Cevapların her zaman Türkçe, kısa, net ve bir esnafın kolayca anlayacağı, samimi bir dilde olmalı.

**KIRILMASI İMKANSIZ, KRİTİK KURALLAR:**
1.  **YAPMADIĞIN BİR İŞLEMİ ONAYLAMA.** Kullanıcı senden bir eylem gerçekleştirmeni istediğinde (örneğin, "yeni müşteri ekle", "gider kaydet"), sadece sözlü olarak onaylamakla YETİNME. İsteği yerine getirmek için MUTLAKA uygun aracı çağırmalısın.
2.  **HALÜSİNASYON GÖRME.** Bir aracı çağırmadan ve o araçtan başarılı bir sonuç mesajı almadan, ASLA "eklendi," "silindi," "güncellendi" veya "işlem tamamlandı" gibi bir eylemin gerçekleştiğini onaylayan bir yanıt VERME. Eğer bir eylem gerçekleştirdiğini söylüyorsan, bu yanıtın MUTLAKA aracın döndürdüğü gerçek sonuca dayanmalıdır. Eğer bir eylem gerçekleştirdiysen, konuşma geçmişinde bunu kanıtlayan bir araç çağrısı ve araç yanıtı OLMALIDIR.
3.  **ÖNCE BİLGİ TOPLA.** Bir aracı çağırmak için gereken bilgi eksikse (örneğin müşterinin tam adı), kullanıcıdan bu eksik bilgiyi iste. Bilgiyi aldıktan sonra, işlemi tamamlamak için aracı çağır.
4.  **HATALARI BİLDİR.** Bir aracı çağıramıyorsan veya araç bir hata döndürürse, durumu kullanıcıya net bir şekilde açıkla.
5.  **BİLGİ SINIRLARI.** Kullanıcı senden bir bilgi isterse (örneğin, "Ahmet'in ne kadar borcu var?") ve bu bilgiye erişim aracın yoksa, şu an için bu bilgiye erişimin olmadığını, ancak gelecekte bu özelliğin ekleneceğini belirt.
6.  **KULLANICI ID'Sİ İSTEME.** Araçları kullanmak için gerekli olan 'userId' sistem tarafından otomatik olarak sağlanacaktır; bunu ASLA kullanıcıdan isteme.
7.  **ASIL AMACIN ARAÇ KULLANMAK.** Senin temel amacın araç kullanmaktır. Kullanıcının isteğini yerine getirmek için her zaman bir araç kullanma fırsatı kolla. Basit sohbet, eylemleri gerçekleştirmekten sonra gelir.`;

export async function getChatHistory(userId: string): Promise<Message[]> {
  if (!userId) {
    return [];
  }
  const historyRef = doc(db, 'chatHistories', userId);
  const historySnap = await getDoc(historyRef);

  if (historySnap.exists()) {
    const messages = (historySnap.data() as ChatHistory).messages;
    if (messages.length > 0 && messages[0].role !== 'user' && messages[0].role !== 'model') {
      console.warn(`Corrupt chat history for user ${userId}, starting fresh.`);
      await setDoc(historyRef, { userId, messages: [] }); // Clear corrupt history
      return [];
    }
    return messages;
  }
  
  return [];
}

// Rewritten for clarity and type safety
const toGenkitMessages = (history: Message[]): MessageData[] => {
  const messages: MessageData[] = [];
  for (const m of history) {
    if (m.role === 'user') {
      messages.push({ role: 'user', content: [{ text: m.content as string }] });
    } else if (m.role === 'model') {
      const modelContent = m.content as any;
      // Check if the content is a model's request to use tools
      if (modelContent?.toolRequests) {
        // The content is already an array of ToolRequestPart, no mapping needed.
        const parts: ToolRequestPart[] = modelContent.toolRequests;
        messages.push({ role: 'model', content: parts });
      } else {
        // This is a standard text response from the model
        messages.push({ role: 'model', content: [{ text: m.content as string }] });
      }
    } else if (m.role === 'tool') {
      // The content is an array of our custom tool response shape
      const toolContent = m.content as Array<{ toolCallId: string; output: any; name: string; }>;
      const parts: ToolResponsePart[] = toolContent.map(tc => ({ 
          toolResponse: {
              name: tc.name,
              toolCallId: tc.toolCallId,
              output: tc.output,
          }
      }));
      messages.push({ role: 'tool', content: parts });
    }
  }
  return messages;
};

export async function chatWithAssistant(
  input: ChatWithAssistantInput
): Promise<ChatWithAssistantOutput> {
  const { newMessage, userId } = input;
  const historyRef = doc(db, 'chatHistories', userId);

  let chatHistory = await getChatHistory(userId);
  chatHistory.push({ role: 'user', content: newMessage });
  
  const llmResponse = await ai.generate({
    messages: toGenkitMessages(chatHistory),
    system: systemPrompt,
    tools: allTools,
  });

  const toolRequests = llmResponse.toolRequests; // This is an array of ToolRequestPart

  if (toolRequests && toolRequests.length > 0) {
    // Save the model's request to use tools to our history
    chatHistory.push({ role: 'model', content: { toolRequests } });

    const toolResponses = [];
    // Loop through each part of the tool request from the LLM
    for (const toolRequest of toolRequests) {
      // Find the corresponding tool from our list of available tools
      const tool = allTools.find(t => t.name === toolRequest.toolRequest.name);
      if (tool) {
        // Add the userId to the tool's input arguments
        const toolInputWithUser = { ...(toolRequest.toolRequest.input as object), userId };
        const output = await tool(toolInputWithUser);
        // Prepare the response to send back to the LLM
        toolResponses.push({ toolCallId: toolRequest.toolRequest.toolCallId, output, name: tool.name });
      } else {
         const errorMsg = `Error: Tool '${toolRequest.toolRequest.name}' not found.`;
         console.error(errorMsg);
         // Inform the LLM that the tool was not found
         toolResponses.push({ toolCallId: toolRequest.toolRequest.toolCallId, output: errorMsg, name: toolRequest.toolRequest.name });
      }
    }

    // Save the results of the tool executions to our history
    chatHistory.push({ role: 'tool', content: toolResponses });

    // Send the tool results back to the LLM to get a final, user-facing response
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
    // The LLM responded with text directly, no tools needed
    const finalResponseText = llmResponse.text;
    chatHistory.push({ role: 'model', content: finalResponseText });
    await setDoc(historyRef, { userId, messages: chatHistory });
    return { textResponse: finalResponseText };
  }
}
