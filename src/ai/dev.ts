import { config } from 'dotenv';
config();

import '@/ai/flows/answer-farmer-question.ts';
import '@/ai/flows/predict-crop-prices.ts';
import '@/ai/flows/get-weather-forecast.ts';
import '@/ai/flows/get-farming-tips.ts';
