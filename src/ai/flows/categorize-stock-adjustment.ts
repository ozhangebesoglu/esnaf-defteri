// src/ai/flows/categorize-stock-adjustment.ts
'use server';
/**
 * @fileOverview An AI agent for categorizing stock adjustments.
 *
 * - categorizeStockAdjustment - A function that categorizes stock adjustments.
 * - CategorizeStockAdjustmentInput - The input type for the categorizeStockAdjustment function.
 * - CategorizeStockAdjustmentOutput - The return type for the categorizeStockAdjustment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeStockAdjustmentInputSchema = z.object({
  description: z
    .string()
    .describe('The description of the stock adjustment.'),
});
export type CategorizeStockAdjustmentInput = z.infer<
  typeof CategorizeStockAdjustmentInputSchema
>;

const CategorizeStockAdjustmentOutputSchema = z.object({
  category: z
    .string()
    .describe(
      'The predicted category for the stock adjustment (e.g., spoilage, theft, data entry error, etc.).'
    ),
  confidence: z
    .number()
    .describe(
      'A confidence score (0-1) indicating the certainty of the category prediction.'
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
  prompt: `You are an expert inventory manager in a butcher shop. Based on the provided description, determine the most likely category for the stock adjustment and provide a confidence score (0-1). Respond in JSON format.

Description: {{{description}}}

Possible categories: Spoilage, Theft, Data Entry Error, Received Product Error, Discount, Other
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
