'use server';
/**
 * @fileOverview Predicts future crop prices and provides buy/sell/hold suggestions.
 *
 * - predictCropPrices - A function that takes current crop prices and returns predictions.
 * - PredictCropPricesInput - The input type for the predictCropPrices function.
 * - PredictCropPricesOutput - The return type for the predictCropPrices function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PriceRecordSchema = z.object({
    commodity: z.string(),
    modal_price: z.string(),
});

export const PredictCropPricesInputSchema = z.object({
  city: z.string().describe('The city for which to predict prices.'),
  prices: z.array(PriceRecordSchema).describe('An array of current crop prices.'),
});
export type PredictCropPricesInput = z.infer<typeof PredictCropPricesInputSchema>;

const PricePredictionSchema = z.object({
    commodity: z.string().describe('The name of the crop.'),
    nextTwoWeeksPrice: z.number().describe('The predicted price for the next two weeks (per quintal).'),
    suggestion: z.enum(['Sell', 'Hold/Buy', 'Hold']).describe('The suggestion for the farmer.'),
});

export const PredictCropPricesOutputSchema = z.object({
    predictions: z.array(PricePredictionSchema),
});
export type PredictCropPricesOutput = z.infer<typeof PredictCropPricesOutputSchema>;


export async function predictCropPrices(input: PredictCropPricesInput): Promise<PredictCropPricesOutput> {
    return predictCropPricesFlow(input);
}

const prompt = ai.definePrompt({
    name: 'predictCropPricesPrompt',
    input: {schema: PredictCropPricesInputSchema},
    output: {schema: PredictCropPricesOutputSchema},
    prompt: `You are an expert agricultural market analyst. Your task is to predict crop prices for the next two weeks and provide a suggestion (Sell, Hold/Buy, or Hold) for each crop.

You will be given the current market prices for various commodities in a specific city.

Based on the current price, the crop type, the time of year, and your general knowledge of Indian agricultural markets, predict the 'modal_price' for two weeks from now.

Then, provide a suggestion:
- If you predict the price will increase, suggest "Hold/Buy".
- If you predict the price will decrease, suggest "Sell".
- If you predict the price will remain stable, suggest "Hold".

City: {{{city}}}

Current Prices (per quintal):
{{#each prices}}
- {{commodity}}: {{modal_price}}
{{/each}}

Provide your output in the requested JSON format with predictions for every single crop provided in the input.
`,
});


const predictCropPricesFlow = ai.defineFlow(
    {
        name: 'predictCropPricesFlow',
        inputSchema: PredictCropPricesInputSchema,
        outputSchema: PredictCropPricesOutputSchema,
    },
    async (input) => {
        if (input.prices.length === 0) {
            return { predictions: [] };
        }
        const {output} = await prompt(input);
        return output!;
    }
);
