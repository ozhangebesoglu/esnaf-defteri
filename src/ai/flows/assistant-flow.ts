'use server';
/**
 * @fileOverview A conversational AI assistant for the Esnaf Defteri app that can understand and execute commands.
 *
 * - chatWithAssistant - A function that handles the conversation and tool execution.
 * - ChatWithAssistantInput - The input type for the chatWithAssistant function.
 * - ChatWithAssistantOutput - The return type for the chatWithAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {
  addPaymentTool,
  addSaleTool,
  addExpenseTool,
  addStockAdjustmentTool,
} from '@/ai/tools/esnaf-tools';
import type {Customer, Product} from '@/lib/types';

// Helper to find a resource by name
const findByName = <T extends {name: string}>(
  name: string,
  items: T[]
): T | undefined => {
  const lowerCaseName = name.toLowerCase();
  return items.find(i => i.name.toLowerCase() === lowerCaseName);
};

const ChatWithAssistantInputSchema = z.object({
  userMessage: z.string().describe('The latest message from the user.'),
  chatHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        content: z.string(),
      })
    )
    .describe('The history of the conversation so far.'),
  appData: z
    .any()
    .describe(
      'A JSON object containing the current state of the application data (customers, products, orders, etc.).'
    ),
});
export type ChatWithAssistantInput = z.infer<typeof ChatWithAssistantInputSchema>;

const ChatActionSchema = z
  .object({
    type: z.enum([
      'addSale',
      'addPayment',
      'addExpense',
      'addStockAdjustment',
    ]),
    payload: z.any(),
  })
  .optional();

const ChatWithAssistantOutputSchema = z.object({
  textResponse: z
    .string()
    .describe("The AI's textual response to the user."),
  action: ChatActionSchema,
});
export type ChatWithAssistantOutput = z.infer<
  typeof ChatWithAssistantOutputSchema
>;

const systemPrompt = `Sen bir kasap dükkanı için geliştirilmiş "Esnaf Defteri" uygulamasının yardımcı yapay zeka asistanısın. Kullanıcının sorularını, sağlanan JSON verilerini kullanarak yanıtla. Cevapların kısa, net ve bir esnafın anlayacağı dilde olsun.
Kullanıcı bir işlem yapmak istediğinde (örneğin, "Ahmet Yılmaz'a 500 liralık satış ekle" veya "Ayşe Kaya'dan 100 lira ödeme aldım" veya "Ekim ayı kirası 5000 lira gider ekle"), uygun aracı çağır.
Sadece kullanıcı açıkça bir işlem yapmanı istediğinde araçları kullan. Bilgi soruyorsa, sadece metinle cevap ver.
İşlem başarılı olursa kullanıcıyı bilgilendir. Bir müşteri veya ürün adı belirsizse veya bulunamazsa, kullanıcıdan netleştirmesini iste.`;

export async function chatWithAssistant(
  input: ChatWithAssistantInput
): Promise<ChatWithAssistantOutput> {
  const {userMessage, chatHistory, appData} = input;

  const messages = [
    ...chatHistory.map(m => ({role: m.role, content: [{text: m.content}]})),
    {role: 'user', content: [{text: userMessage}]},
  ];

  const llmResponse = await ai.generate({
    model: ai.model,
    prompt: messages,
    system: `${systemPrompt}\n\nMevcut Uygulama Verileri (JSON):\n\`\`\`json\n${JSON.stringify(
      appData
    )}\n\`\`\``,
    tools: [
      addSaleTool,
      addPaymentTool,
      addExpenseTool,
      addStockAdjustmentTool,
    ],
  });

  const toolCalls = llmResponse.candidates[0]?.message.toolRequest?.calls;

  if (toolCalls && toolCalls.length > 0) {
    const toolCall = toolCalls[0]; // Assuming one tool call at a time for simplicity
    const toolInput = toolCall.input;
    let action: z.infer<typeof ChatActionSchema>;
    let textResponse = llmResponse.text();

    switch (toolCall.name) {
      case 'addSale':
        const customerForSale = findByName(
          toolInput.customerName,
          appData.customers as Customer[]
        );
        if (customerForSale) {
          action = {
            type: 'addSale',
            payload: {
              customerId: customerForSale.id,
              description: toolInput.description,
              total: toolInput.total,
            },
          };
          if (!textResponse) {
            textResponse = `${customerForSale.name} için ${toolInput.total} TL tutarında satış eklendi.`;
          }
        } else {
          textResponse = `"${toolInput.customerName}" adında bir müşteri bulamadım. Lütfen müşterinin tam adını kontrol edin.`;
        }
        break;

      case 'addPayment':
        const customerForPayment = findByName(
          toolInput.customerName,
          appData.customers as Customer[]
        );
        if (customerForPayment) {
          action = {
            type: 'addPayment',
            payload: {
              customerId: customerForPayment.id,
              description: toolInput.description || 'Nakit Ödeme',
              total: toolInput.total,
            },
          };
          if (!textResponse) {
            textResponse = `${customerForPayment.name} adlı müşteriden ${toolInput.total} TL ödeme alındı.`;
          }
        } else {
          textResponse = `"${toolInput.customerName}" adında bir müşteri bulamadım. Lütfen müşterinin tam adını kontrol edin.`;
        }
        break;

      case 'addExpense':
        action = {type: 'addExpense', payload: toolInput};
        if (!textResponse) {
          textResponse = `"${toolInput.description}" açıklamasıyla ${toolInput.amount} TL tutarında yeni bir gider eklendi.`;
        }
        break;

      case 'addStockAdjustment':
        const productForAdjustment = findByName(
          toolInput.productName,
          appData.products as Product[]
        );
        if (productForAdjustment) {
          action = {
            type: 'addStockAdjustment',
            payload: {
              productId: productForAdjustment.id,
              quantity: toolInput.quantity,
              description: toolInput.description,
              category: toolInput.category,
            },
          };
          if (!textResponse) {
            textResponse = `${productForAdjustment.name} ürünü için stok hareketi eklendi.`;
          }
        } else {
          textResponse = `"${toolInput.productName}" adında bir ürün bulamadım. Lütfen ürünün tam adını kontrol edin.`;
        }
        break;
    }

    return {
      textResponse: textResponse,
      action: action,
    };
  }

  // If no tool was called, just return the text response
  return {
    textResponse: llmResponse.text(),
    action: undefined,
  };
}
