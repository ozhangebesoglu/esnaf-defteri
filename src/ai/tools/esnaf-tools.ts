/**
 * @fileOverview AI tools for the Esnaf Defteri application.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';

export const addSaleTool = ai.defineTool(
  {
    name: 'addSale',
    description:
      'Bir müşteriye veresiye (borç) satış ekler. Örneğin: "Ahmet Yılmaz\'a 2kg kıyma satışı ekle, tutarı 500 lira." Bu işlem müşterinin borcunu artırır.',
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
    description: 'Müşteriye bağlı olmayan, tezgahtan yapılan peşin satışları ekler. Örneğin: "Tezgahtan 200 liralık peşin satış yaptım." Bu işlem müşteri borçlarını etkilemez.',
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
      'Bir müşteriden gelen ödemeyi kaydeder. Örneğin: "Ayşe Kaya\'dan 100 lira ödeme aldım." Bu işlem müşterinin borcunu azaltır.',
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
    description: 'Dükkan için yeni bir masraf (gider) ekler. Örneğin: "Elektrik faturası için 300 lira gider ekle." Kategori otomatik olarak tahmin edilir.',
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
    description: 'Bir ürünün stok miktarını elle değiştirir. Örneğin: "Bozulduğu için 2kg kıymayı stoktan düş." Stok eklemek için pozitif, azaltmak için negatif sayı kullan.',
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
    description: 'Sisteme yeni bir müşteri kaydeder. Örneğin: "Yeni müşteri ekle: Adı Canan Güneş, telefonu 5551234567, başlangıç borcu 150 lira."',
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
    description: 'Bir müşteriyi ve ona ait tüm borç/ödeme kayıtlarını sistemden kalıcı olarak siler.',
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
    description: 'Bir ürünü ürün listesinden kalıcı olarak siler.',
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
    description: 'Belirli bir satış veya ödeme işlemini siler. İşlem kimliğini (ID) kullanır. Örneğin: "ORD001 numaralı satışı sil."',
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
    description: 'Belirli bir gider kaydını siler. İşlem kimliğini (ID) kullanır.',
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
    description: 'Belirli bir stok hareketini siler. İşlem kimliğini (ID) kullanır.',
    inputSchema: z.object({
      adjustmentId: z
        .string()
        .describe('Silinecek stok hareketinin IDsi, örn., "ADJ001".'),
    }),
    outputSchema: z.any(),
  },
  async input => input
);
