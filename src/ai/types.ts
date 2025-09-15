
import {z} from 'genkit';

export const PriceRecordSchema = z.object({
    commodity: z.string(),
    modal_price: z.string(),
});
export type PriceRecord = z.infer<typeof PriceRecordSchema>;

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
export type PricePrediction = z.infer<typeof PricePredictionSchema>;

export const PredictCropPricesOutputSchema = z.object({
    predictions: z.array(PricePredictionSchema),
});
export type PredictCropPricesOutput = z.infer<typeof PredictCropPricesOutputSchema>;

    