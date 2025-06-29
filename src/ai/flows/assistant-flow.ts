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
import type { MessageData, ToolRequest, ToolRequestPart, ToolResponsePart } from 'genkit';


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
    if (messages.length > 0 && messages[0].role !== 'user') {
      console.warn(`Corrupt chat history for user ${userId}, starting fresh.`);
      await setDoc(historyRef, { userId, messages: [] }); // Clear corrupt history
      return [];
    }
    return messages;
  }
  
  return [];
}

const toGenkitMessages = (history: Message[]): MessageData[] => {
  const messages: MessageData[] = [];
  for (const m of history) {
    if (m.role === 'user') {
      messages.push({ role: 'user', content: [{ text: m.content as string }] });
    } else if (m.role === 'model') {
      const modelContent = m.content as any;
      if (modelContent?.toolRequests) {
        const parts: ToolRequestPart[] = modelContent.toolRequests.map((req: any) => ({ toolRequest: req }));
        messages.push({ role: 'model', content: parts });
      } else {
        messages.push({ role: 'model', content: [{ text: m.content as string }] });
      }
    } else if (m.role === 'tool') {
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

  const toolRequests = llmResponse.toolRequests;

  if (toolRequests && toolRequests.length > 0) {
    chatHistory.push({ role: 'model', content: { toolRequests } });

    const toolResponses = [];
    for (const toolRequest of toolRequests) {
      const tool = allTools.find(t => t.name === toolRequest.name);
      if (tool) {
        const toolInputWithUser = { ...(toolRequest.input as object), userId };
        const output = await tool.fn(toolInputWithUser);
        toolResponses.push({ toolCallId: toolRequest.toolCallId, output, name: tool.name });
      } else {
         console.error(`Tool not found: ${toolRequest.name}`);
         toolResponses.push({ toolCallId: toolRequest.toolCallId, output: `Error: Tool '${toolRequest.name}' not found.`, name: toolRequest.name });
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
