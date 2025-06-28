'use server';
/**
 * @fileOverview A conversational AI assistant for the Esnaf Defteri app that can understand and execute commands by calling tools that interact with the database.
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
  chatHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'model', 'tool']),
        content: z.any(),
      })
    )
    .describe('The history of the conversation so far, including the latest user message.'),
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

const systemPrompt = `Sen, bir kasap dükkanı için geliştirilmiş "Esnaf Defteri" uygulamasının zeki ve yardımsever yapay zeka asistanısın. Görevin, kullanıcıların işlemlerini kolaylaştırmak ve sorularını hızlıca yanıtlamaktır. Cevapların her zaman kısa, net ve bir esnafın kolayca anlayacağı, samimi bir dilde olmalı.
Kullanıcı bir işlem yapmak istediğinde (örneğin, "Ahmet Yılmaz'a 500 liralık satış ekle", "Ayşe Kaya'dan 100 lira ödeme aldım", "Yeni müşteri ekle: Adı Canan Güneş"), uygun aracı kullan.
Eğer bir müşteri veya ürün adı belirsizse ya da bulunamazsa, kibarca kullanıcıdan ismi kontrol etmesini veya yeni bir kayıt eklemek isteyip istemediğini sor.
"addSale" aracını sadece veresiye (borç) satışlar için kullanmalısın. Peşin satışlar için "addCashSale" aracını kullan.
Kullanıcı senden bilgi istiyorsa (örneğin, "Ahmet'in ne kadar borcu var?"), şu an için bu bilgiye erişimin olmadığını, ancak gelecekte bu özelliğin ekleneceğini belirt.
İşlem başarılı olduğunda veya bir hata oluştuğunda, aracın döndürdüğü mesajı temel alarak kullanıcıyı mutlaka bilgilendir.
Unutma, her araç 'userId' parametresine ihtiyaç duyar, bu bilgiyi her zaman sağla.`;

export async function chatWithAssistant(
  input: ChatWithAssistantInput
): Promise<ChatWithAssistantOutput> {
  const {chatHistory, userId} = input;

  // The Gemini API requires the conversation history to start with a 'user' role.
  const validChatHistory =
    chatHistory.length > 0 && chatHistory[0].role === 'model'
      ? chatHistory.slice(1)
      : chatHistory;
      
  const messages = validChatHistory.map(m => {
    if (m.role === 'user' || m.role === 'model') {
        return { role: m.role, content: [{ text: m.content as string }] };
    }
    // Handle tool role if needed, though for this simple flow, we might not pass it back
    return m;
  }) as any;


  const llmResponse = await ai.generate({
    model: ai.model,
    messages: messages,
    system: systemPrompt,
    tools: allTools,
  });

  const toolRequest = llmResponse.toolRequest;

  if (toolRequest) {
    // The model wants to call a tool.
    const toolCall = toolRequest.calls[0]; // Assuming one tool call for simplicity
    const tool = allTools.find(t => t.name === toolCall.name);

    if (tool) {
      // Inject the userId into the tool's input
      const toolInputWithUser = { ...toolCall.input, userId };
      
      // Execute the tool. The tool itself now contains all logic and returns a user-facing string.
      const toolResult = await tool.fn(toolInputWithUser);
      
      // For this simplified flow, we will return the tool's result directly to the user
      // instead of re-prompting the LLM with the tool's output.
      // This is efficient and sufficient for action-oriented tools.
      return {
        textResponse: toolResult,
      };
    } else {
        return { textResponse: `İstenen araç bulunamadı: ${toolCall.name}` };
    }
  }

  // If no tool was called, just return the text response
  return {
    textResponse: llmResponse.text,
  };
}
