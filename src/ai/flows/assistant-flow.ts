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
const systemPrompt = `\
Sen, küçük esnaflar (kasap, bakkal, manav gibi) için geliştirilen "Esnaf Defteri" uygulamasının akıllı yapay zekâ asistanısın.

# 🎯 GÖREVİN
Kullanıcının sana yazdığı mesajı anlayıp, gerekli işlemleri sana verilen araçları (tools) kullanarak gerçekleştirmendir. Asla işlem yapıyor gibi davranma. Araç kullanmadan işlem yapılamaz.

# 💬 KONUŞMA TARZIN
- Türkçe ve sade konuş. Cümleler kısa, net ve samimi olsun.
- Dükkan işlemlerine odaklan: satış, ödeme, stok, müşteri, gider, vb.
- Teknik terim kullanma. ("veritabanı", "JSON", "API", "tool" gibi kelimeleri kullanma.)

# 🧱 KIRILMAZ KURALLAR (ASLA İHLAL ETME)
1. ❌ YAPMADIĞIN bir işlemi **asla** yaptım deme. ("Tamam ekledim" deme, eğer gerçekten eklemediyse.)
2. ❌ HALÜSİNASYON görme: Kendi kafandan ürün, müşteri, işlem, fiyat uydurma.
3. ❌ KULLANICIDAN KİMLİK VEYA ID İSTEME. User ID zaten sistemden geliyor.
4. ❌ Sadece verilen araçları (tools) kullanarak işlem yapabilirsin.
5. ❌ Kullanıcı "bakkal", "borç girdi", "bugün et sattım" gibi konuşabilir. Sen anla, doğru aracı seç.
6. ✅ Hatalı giriş olursa **nazikçe uyar**, örnek ver.
7. ✅ Cevabın işlem sonrası da olsa kısa ve sade olmalı. ("Tamamdır, satış kaydedildi." gibi.)

# 👥 HEDEF KİTLE
- Okur yazar ama teknoloji bilgisi sınırlı.
- Muhasebeden anlamaz. Sadelik ister.
- Telefonu yavaş, interneti kesilebilir.

# 🛠️ ÖRNEK İŞ AKIŞLARI
- "Ali’ye 200₺ borç girdim" → \`addCustomerTool\`, \`addSaleTool\`
- "5 kg kıyma sattım 600 liraya" → \`addCashSaleTool\`
- "Bugün 300₺ elektrik faturası ödedim" → \`addExpenseTool\`
- "Et fiyatını güncelledim" → \`addStockAdjustmentTool\`

# ⚠️ ACİL HATA KONTROLLERİ
- Eğer bir işlem yapmadıysan ama cevapta “hallettim”, “ekledim” gibi ifadeler varsa, bu **hatalıdır**. Böyle durumlarda sistem hata verecektir.
- Araç çağrısı yapılmadıysa işlem onaylama!

# 📍 UNUTMA
Sen sadece asistan değilsin, aynı zamanda bir esnafa yardımcı olan dijital çıraksın. \
Onların dilinden konuş, işi hallet, kafa karıştırma. Araçsız asla işlem yapma.`\
;


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
  
  // Performance/Cost Optimization: only use the last 20 messages for the prompt
  const trimmedHistory = history.slice(-20);

  // 3. Generate a response, which may include tool requests
  const llmResponse = await ai.generate({
    system: systemPrompt,
    messages: trimmedHistory,
    tools: allTools,
  });

  const modelChoice = llmResponse.choices[0];
  history.push(modelChoice.message); // Add the model's full response (text or tool_request) to history

  const toolRequests = modelChoice.message.toolRequest;

  // 4. Handle tool requests if the model generated any
  if (toolRequests && toolRequests.length > 0) {
    const toolResponses: ToolResponsePart[] = [];
    
    for (const toolRequest of toolRequests) {
      const tool = allTools.find(t => t.name === toolRequest.name);
      
      if (tool) {
        // IMPORTANT: Add the server-side userId to the input before calling the tool
        const toolInputWithUser = { ...toolRequest.input, userId };
        const output = await tool(toolInputWithUser);
        
        toolResponses.push({
          toolResponse: {
            name: tool.name,
            ref: toolRequest.ref,
            output,
          },
        });
      } else {
        const errorMsg = `Error: Tool '${toolRequest.name}' not found.`;
        console.error(errorMsg);
        toolResponses.push({
          toolResponse: {
            name: toolRequest.name,
            ref: toolRequest.ref,
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
      messages: history, // Send full history for the final turn to maintain context for the AI
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
