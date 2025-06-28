/**
 * @fileOverview AI tools for the Esnaf Defteri application.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';

export const addSaleTool = ai.defineTool(
  {
    name: 'addSale',
    description:
      'Müşteriye yeni bir satış (veresiye/borç) ekle. Bu işlem müşterinin borcunu artırır.',
    inputSchema: z.object({
      customerName: z
        .string()
        .describe('Satışın yapıldığı müşterinin tam adı.'),
      description: z
        .string()
        .describe('Satılan ürünlerin veya hizmetin açıklaması.'),
      total: z.number().describe('Satışın toplam tutarı (Türk Lirası).'),
    }),
    outputSchema: z.any(),
  },
  async input => input
);

export const addPaymentTool = ai.defineTool(
  {
    name: 'addPayment',
    description:
      'Bir müşteriden alınan ödemeyi kaydet. Bu işlem müşterinin borcunu azaltır.',
    inputSchema: z.object({
      customerName: z
        .string()
        .describe('Ödemeyi yapan müşterinin tam adı.'),
      description: z
        .string()
        .describe("Ödeme için bir açıklama, örn. 'Nakit Ödeme', 'Elden ödeme'.")
        .optional(),
      total: z.number().describe('Ödenen toplam tutar (Türk Lirası).'),
    }),
    outputSchema: z.any(),
  },
  async input => input
);

export const addExpenseTool = ai.defineTool(
  {
    name: 'addExpense',
    description: 'Yeni bir işletme gideri ekle.',
    inputSchema: z.object({
      description: z.string().describe('Giderin açıklaması.'),
      amount: z.number().describe('Giderin tutarı (Türk Lirası).'),
      category: z
        .enum(['Kira', 'Fatura', 'Malzeme', 'Maaş', 'Diğer'])
        .describe('Giderin kategorisi.'),
    }),
    outputSchema: z.any(),
  },
  async input => input
);

export const addStockAdjustmentTool = ai.defineTool(
  {
    name: 'addStockAdjustment',
    description: 'Bir ürünün stoğunu manuel olarak ayarla (arttır veya azalt).',
    inputSchema: z.object({
      productName: z.string().describe('Stoğu ayarlanacak ürünün adı.'),
      quantity: z
        .number()
        .int()
        .describe(
          'Stoktaki değişim miktarı. Stok eklemek için pozitif, azaltmak için negatif bir değer girin.'
        ),
      description: z.string().describe('Stok hareketinin nedeni.'),
      category: z
        .enum([
          'Bozulma',
          'Hırsızlık',
          'Veri Giriş Hatası',
          'Hatalı Ürün Alımı',
          'İndirim',
          'Diğer',
        ])
        .describe('Stok hareketinin kategorisi.'),
    }),
    outputSchema: z.any(),
  },
  async input => input
);
