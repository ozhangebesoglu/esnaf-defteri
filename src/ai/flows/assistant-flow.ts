'use server';

/**
 * @fileOverview A stateless conversational AI assistant for the Esnaf Defteri app that can understand and execute commands by calling tools. It does not remember conversation history.
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


// Main AI chat handler (stateless version)
export async function chatWithAssistant(input: ChatWithAssistantInput): Promise<ChatWithAssistantOutput> {
  const { newMessage, userId } = input;

  const history: MessageData[] = [{ role: 'user', content: [{ text: newMessage }] }];

  const llmResponse = await ai.generate({
    system: systemPrompt,
    messages: history,
    tools: allTools,
  });

  if (!llmResponse.choices || llmResponse.choices.length === 0) {
    console.error("AI response invalid or blocked", llmResponse);
    return { textResponse: "Üzgünüm, bir sorun oluştu ve isteğinizi işleyemedim. Lütfen daha sonra tekrar deneyin." };
  }

  const modelChoice = llmResponse.choices[0];
  const toolRequests = modelChoice.toolRequests;

  if (toolRequests && toolRequests.length > 0) {
    const toolResponses: ToolResponsePart[] = [];
    
    for (const toolRequest of toolRequests) {
      const tool = allTools.find(t => t.name === toolRequest.name);
      
      if (tool) {
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
    
    history.push(modelChoice.message);
    history.push({ role: 'tool', content: toolResponses });

    const finalLlmResponse = await ai.generate({
      system: systemPrompt,
      messages: history,
      tools: allTools,
    });
    
    if (!finalLlmResponse.choices || finalLlmResponse.choices.length === 0) {
        console.error("Final AI response invalid or blocked", finalLlmResponse);
        return { textResponse: "Araçları kullandıktan sonra bir yanıt oluşturamadım. Lütfen tekrar deneyin." };
    }

    return { textResponse: finalLlmResponse.text };

  } else {
    return { textResponse: llmResponse.text };
  }
}
