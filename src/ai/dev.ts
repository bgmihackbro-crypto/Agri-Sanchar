import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-crop-issue-from-photo.ts';
import '@/ai/flows/answer-farmer-question.ts';
import '@/ai/flows/predict-crop-prices.ts';
