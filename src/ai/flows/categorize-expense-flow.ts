'use server';
/**
 * @fileOverview Giderleri kategorize etmek için bir yapay zeka ajanı.
 *
 * - categorizeExpense - Giderleri kategorize eden bir fonksiyon.
 * - CategorizeExpenseInput - categorizeExpense fonksiyonu için giriş türü.
 * - CategorizeExpenseOutput - categorizeExpense fonksiyonu için dönüş türü.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeExpenseInputSchema = z.object({
  description: z
    .string()
    .describe('Gider açıklaması.'),
});
export type CategorizeExpenseInput = z.infer<
  typeof CategorizeExpenseInputSchema
>;

const CategorizeExpenseOutputSchema = z.object({
  category: z
    .string()
    .describe(
      'Gider için tahmin edilen kategori (örn. Kira, Fatura, Malzeme, Maaş, Diğer).'
    ),
  confidence: z
    .number()
    .describe(
      'Kategori tahmininin kesinliğini gösteren bir güven skoru (0-1).'
    ),
});
export type CategorizeExpenseOutput = z.infer<
  typeof CategorizeExpenseOutputSchema
>;

export async function categorizeExpense(
  input: CategorizeExpenseInput
): Promise<CategorizeExpenseOutput> {
  return categorizeExpenseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeExpensePrompt',
  input: {schema: CategorizeExpenseInputSchema},
  output: {schema: CategorizeExpenseOutputSchema},
  prompt: `Sen küçük bir işletme için uzman bir muhasebecisin. Sağlanan açıklamaya dayanarak, gider için en olası kategoriyi belirle ve bir güven puanı (0-1) sağla. JSON formatında yanıt ver.

Açıklama: {{{description}}}

Olası kategoriler: Kira, Fatura, Malzeme, Maaş, Diğer
`,
});

const categorizeExpenseFlow = ai.defineFlow(
  {
    name: 'categorizeExpenseFlow',
    inputSchema: CategorizeExpenseInputSchema,
    outputSchema: CategorizeExpenseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
