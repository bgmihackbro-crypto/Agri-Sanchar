
'use server';
/**
 * @fileOverview Predicts future crop prices and provides buy/sell/hold suggestions.
 *
 * - predictCropPrices - A function that takes current crop prices and returns predictions.
 */

import {ai} from '@/ai/genkit';
import { PredictCropPricesInputSchema, PredictCropPricesOutputSchema, type PredictCropPricesInput } from '@/ai/types';

export async function predictCropPrices(input: PredictCropPricesInput) {
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

    