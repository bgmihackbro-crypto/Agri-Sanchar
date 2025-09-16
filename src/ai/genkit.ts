import {genkit} from 'genkit';
import {googleAI, gemini} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY, // make sure this is in your .env file
    }),
  ],
  model: gemini('gemini-2.5-flash'),
});
