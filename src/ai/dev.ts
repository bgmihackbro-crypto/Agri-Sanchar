import { config } from 'dotenv';
config();

import '@/ai/flows/answer-farmer-question.ts';
import '@/ai/flows/predict-crop-prices.ts';
import '@/ai/flows/get-weather-forecast.ts';
import '@/ai/flows/get-farming-tips.ts';
import '@/ai/flows/analyze-soil-report.ts';
import '@/ai/flows/calculate-fertilizer.ts';
import '@/ai/flows/recommend-pesticide.ts';
