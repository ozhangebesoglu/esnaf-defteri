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

export const addCashSaleTool = ai.defineTool(
  {
    name: 'addCashSale',
    description: 'Veresiye olmayan, peşin (restoran/tezgah) satışı ekle. Bu işlem bir müşterinin borcunu etkilemez.',
    inputSchema: z.object({
      description: z.string().describe('Satılan ürünlerin veya hizmetin açıklaması.'),
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

export const addCustomerTool = ai.defineTool(
  {
    name: 'addCustomer',
    description: 'Yeni bir müşteri oluştur ve sisteme kaydet. Müşterinin başlangıç borcu varsa, bunu da belirtebilirsin.',
    inputSchema: z.object({
      customerName: z
        .string()
        .describe('Yeni müşterinin tam adı.'),
      email: z
        .string()
        .email()
        .describe("Yeni müşterinin e-posta adresi. Bu alan zorunlu değildir.")
        .optional(),
      initialDebt: z.number().describe("Müşterinin başlangıç borç tutarı. Yoksa belirtme.").optional(),
    }),
    outputSchema: z.any(),
  },
  async input => input
);

export const deleteCustomerTool = ai.defineTool(
  {
    name: 'deleteCustomer',
    description: 'Bir müşteriyi ve tüm ilgili verilerini sistemden sil.',
    inputSchema: z.object({
      customerName: z
        .string()
        .describe('Silinecek müşterinin tam adı.'),
    }),
    outputSchema: z.any(),
  },
  async input => input
);

export const deleteProductTool = ai.defineTool(
  {
    name: 'deleteProduct',
    description: 'Bir ürünü sistemden sil.',
    inputSchema: z.object({
      productName: z.string().describe('Silinecek ürünün adı.'),
    }),
    outputSchema: z.any(),
  },
  async input => input
);

export const deleteSaleTool = ai.defineTool(
  {
    name: 'deleteSale',
    description: 'Bir satış veya ödeme işlemini sil. İşlem numarasını (ID) kullanın.',
    inputSchema: z.object({
      saleId: z.string().describe('Silinecek satış veya ödeme işleminin IDsi, örn., "ORD001" veya "PAY001".'),
    }),
    outputSchema: z.any(),
  },
  async input => input
);

export const deleteExpenseTool = ai.defineTool(
  {
    name: 'deleteExpense',
    description: 'Bir gider kaydını sil. İşlem numarasını (ID) kullanın.',
    inputSchema: z.object({
      expenseId: z.string().describe('Silinecek gider kaydının IDsi, örn., "EXP001".'),
    }),
    outputSchema: z.any(),
  },
  async input => input
);

export const deleteStockAdjustmentTool = ai.defineTool(
  {
    name: 'deleteStockAdjustment',
    description: 'Bir stok hareketini sil. İşlem numarasını (ID) kullanın.',
    inputSchema: z.object({
      adjustmentId: z
        .string()
        .describe('Silinecek stok hareketinin IDsi, örn., "ADJ001".'),
    }),
    outputSchema: z.any(),
  },
  async input => input
);
