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
  addCustomerTool,
  addCashSaleTool,
  deleteCustomerTool,
  deleteProductTool,
  deleteSaleTool,
  deleteExpenseTool,
  deleteStockAdjustmentTool,
} from '@/ai/tools/esnaf-tools';
import type {Customer, Product, Order, Expense, StockAdjustment} from '@/lib/types';

// Helper to find a resource by name
const findByName = <T extends {name: string}>(
  name: string,
  items: T[]
): T | undefined => {
  const lowerCaseName = name.toLowerCase();
  return items.find(i => i.name.toLowerCase() === lowerCaseName);
};

const ChatWithAssistantInputSchema = z.object({
  chatHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        content: z.string(),
      })
    )
    .describe('The history of the conversation so far, including the latest user message.'),
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
      'addCustomer',
      'addCashSale',
      'deleteCustomer',
      'deleteProduct',
      'deleteSale',
      'deleteExpense',
      'deleteStockAdjustment',
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
Kullanıcı bir işlem yapmak istediğinde (örneğin, "Ahmet Yılmaz'a 500 liralık satış ekle", "Ayşe Kaya'dan 100 lira ödeme aldım", "Ekim ayı kirası 5000 lira gider ekle", "Yeni müşteri ekle: Adı Canan Güneş, e-postası canan@ornek.com", "Tezgahtan 200 liralık peşin satış yaptım"), uygun aracı çağır.
"addSale" aracını sadece veresiye (borç) satışlar için kullan. Peşin satışlar için "addCashSale" aracını kullan.
Sadece kullanıcı açıkça bir işlem yapmanı istediğinde araçları kullan. Bilgi soruyorsa, sadece metinle cevap ver.
İşlem başarılı olursa kullanıcıyı bilgilendir. Bir müşteri veya ürün adı belirsizse veya bulunamazsa, kullanıcıdan netleştirmesini iste. Yeni bir müşteri eklerken isim bilgisi zorunludur, e-posta ise isteğe bağlıdır. Eksik bilgi varsa kullanıcıdan iste. Yeni bir ürün eklerken ise tüm gerekli bilgiler (isim, tip, fiyat, maliyet vb.) eksikse, kullanıcıdan bu bilgileri iste.
ÖNEMLİ: Bir satış, gider veya stok hareketini silmek için kullanıcıdan işlem numarasını (ID) isteyebilirsin veya konuşma geçmişindeki verilerden bu ID'yi bulabilirsin. Örneğin, "ORD001 numaralı satışı sil".`;

export async function chatWithAssistant(
  input: ChatWithAssistantInput
): Promise<ChatWithAssistantOutput> {
  const {chatHistory, appData} = input;

  // The Gemini API requires the conversation history to start with a 'user' role.
  // We filter out the initial welcome message from the model if it exists.
  const validChatHistory =
    chatHistory.length > 0 && chatHistory[0].role === 'model'
      ? chatHistory.slice(1)
      : chatHistory;

  const messages = validChatHistory.map(m => ({
      role: m.role,
      content: [{text: m.content}],
    }));

  const llmResponse = await ai.generate({
    model: ai.model,
    messages: messages,
    system: `${systemPrompt}\n\nMevcut Uygulama Verileri (JSON):\n\`\`\`json\n${JSON.stringify(
      appData
    )}\n\`\`\``,
    tools: [
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
    ],
  });

  const toolCalls = llmResponse.toolRequest?.calls;

  if (toolCalls && toolCalls.length > 0) {
    const toolCall = toolCalls[0]; // Assuming one tool call at a time for simplicity
    const toolInput = toolCall.input;
    let action: z.infer<typeof ChatActionSchema>;
    let textResponse = llmResponse.text;

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

      case 'addCashSale':
        action = {
          type: 'addCashSale',
          payload: toolInput,
        };
        if (!textResponse) {
          textResponse = `${toolInput.total} TL tutarında peşin satış başarıyla eklendi.`;
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

      case 'addCustomer':
        action = {
          type: 'addCustomer',
          payload: {
            name: toolInput.customerName,
            email: toolInput.email,
            initialDebt: toolInput.initialDebt
          },
        };
        if (!textResponse) {
          textResponse = `${toolInput.customerName} adlı yeni müşteri eklendi.`;
          if (toolInput.initialDebt) {
            textResponse += ` ${toolInput.initialDebt} TL borç ile.`
          }
        }
        break;
      
      case 'deleteCustomer':
        const customerToDelete = findByName(
          toolInput.customerName,
          appData.customers as Customer[]
        );
        if (customerToDelete) {
          action = {
            type: 'deleteCustomer',
            payload: customerToDelete.id,
          };
          if (!textResponse) {
            textResponse = `${customerToDelete.name} adlı müşteri silindi.`;
          }
        } else {
          textResponse = `"${toolInput.customerName}" adında bir müşteri bulamadım.`;
        }
        break;

      case 'deleteProduct':
        const productToDelete = findByName(
          toolInput.productName,
          appData.products as Product[]
        );
        if (productToDelete) {
          action = {
            type: 'deleteProduct',
            payload: productToDelete.id,
          };
          if (!textResponse) {
            textResponse = `${productToDelete.name} adlı ürün silindi.`;
          }
        } else {
          textResponse = `"${toolInput.productName}" adında bir ürün bulamadım.`;
        }
        break;

      case 'deleteSale':
        const saleToDelete = (appData.orders as Order[]).find(o => o.id === toolInput.saleId);
        if (saleToDelete) {
            action = { type: 'deleteSale', payload: toolInput.saleId };
             if (!textResponse) {
                textResponse = `${toolInput.saleId} numaralı işlem silindi.`;
             }
        } else {
            textResponse = `"${toolInput.saleId}" numaralı bir satış veya ödeme bulamadım.`;
        }
        break;

      case 'deleteExpense':
         const expenseToDelete = (appData.expenses as Expense[]).find(e => e.id === toolInput.expenseId);
        if (expenseToDelete) {
            action = { type: 'deleteExpense', payload: toolInput.expenseId };
            if (!textResponse) {
                textResponse = `${toolInput.expenseId} numaralı gider silindi.`;
            }
        } else {
            textResponse = `"${toolInput.expenseId}" numaralı bir gider bulamadım.`;
        }
        break;

      case 'deleteStockAdjustment':
         const adjToDelete = (appData.stockAdjustments as StockAdjustment[]).find(a => a.id === toolInput.adjustmentId);
        if (adjToDelete) {
            action = { type: 'deleteStockAdjustment', payload: toolInput.adjustmentId };
             if (!textResponse) {
                textResponse = `${toolInput.adjustmentId} numaralı stok hareketi silindi.`;
             }
        } else {
            textResponse = `"${toolInput.adjustmentId}" numaralı bir stok hareketi bulamadım.`;
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
    textResponse: llmResponse.text,
    action: undefined,
  };
}
