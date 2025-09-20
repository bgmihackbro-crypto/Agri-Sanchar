
import {z} from 'zod';

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

// Weather Schemas
const DailyForecastSchema = z.object({
  time: z.string(),
  temp: z.string(),
  condition: z.string(),
});

const WeeklyForecastSchema = z.object({
  day: z.string(),
  temp: z.string(),
  condition: z.string(),
});

const CurrentWeatherSchema = z.object({
    temp: z.string(),
    condition: z.string(),
    realFeel: z.string(),
    humidity: z.string(),
    windSpeed: z.string(),
    pressure: z.string(),
});

export const WeatherForecastInputSchema = z.object({
  city: z.string().describe('The city for which to fetch the weather forecast.'),
});
export type WeatherForecastInput = z.infer<typeof WeatherForecastInputSchema>;

export const WeatherForecastOutputSchema = z.object({
  current: CurrentWeatherSchema.optional(),
  daily: z.array(DailyForecastSchema).optional(),
  weekly: z.array(WeeklyForecastSchema).optional(),
  farmingTips: z.string().optional(),
  error: z.string().optional(),
});
export type WeatherForecastOutput = z.infer<typeof WeatherForecastOutputSchema>;
    
// Soil Lab Schemas
export const SoilLabSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  phone: z.string().optional(),
});
export type SoilLab = z.infer<typeof SoilLabSchema>;
    
