// src/ai/flows/categorize-stock-adjustment.ts
'use server';
/**
 * @fileOverview Stok hareketlerini kategorize etmek için bir yapay zeka ajanı.
 *
 * - categorizeStockAdjustment - Stok hareketlerini kategorize eden bir fonksiyon.
 * - CategorizeStockAdjustmentInput - categorizeStockAdjustment fonksiyonu için giriş türü.
 * - CategorizeStockAdjustmentOutput - categorizeStockAdjustment fonksiyonu için dönüş türü.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeStockAdjustmentInputSchema = z.object({
  description: z
    .string()
    .describe('Stok hareketi açıklaması.'),
});
export type CategorizeStockAdjustmentInput = z.infer<
  typeof CategorizeStockAdjustmentInputSchema
>;

const CategorizeStockAdjustmentOutputSchema = z.object({
  category: z
    .string()
    .describe(
      'Stok hareketi için tahmin edilen kategori (örn. Bozulma, Hırsızlık, Veri Giriş Hatası, vb.).'
    ),
  confidence: z
    .number()
    .describe(
      'Kategori tahmininin kesinliğini gösteren bir güven skoru (0-1).'
    ),
});
export type CategorizeStockAdjustmentOutput = z.infer<
  typeof CategorizeStockAdjustmentOutputSchema
>;

export async function categorizeStockAdjustment(
  input: CategorizeStockAdjustmentInput
): Promise<CategorizeStockAdjustmentOutput> {
  return categorizeStockAdjustmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeStockAdjustmentPrompt',
  input: {schema: CategorizeStockAdjustmentInputSchema},
  output: {schema: CategorizeStockAdjustmentOutputSchema},
  prompt: `Sen bir kasap dükkanında uzman bir envanter yöneticisisin. Sağlanan açıklamaya dayanarak, stok hareketi için en olası kategoriyi belirle ve bir güven puanı (0-1) sağla. JSON formatında yanıt ver.

Açıklama: {{{description}}}

Olası kategoriler: Bozulma, Hırsızlık, Veri Giriş Hatası, Hatalı Ürün Alımı, İndirim, Diğer
`,
});

const categorizeStockAdjustmentFlow = ai.defineFlow(
  {
    name: 'categorizeStockAdjustmentFlow',
    inputSchema: CategorizeStockAdjustmentInputSchema,
    outputSchema: CategorizeStockAdjustmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
