
'use server';
/**
 * @fileOverview Generates farming tips based on weather data.
 * 
 * - getFarmingTips: A function that takes weather data and returns AI-generated farming tips.
 */

import { ai } from '@/ai/genkit';
import { WeatherForecastOutputSchema } from '@/ai/types';
import { z } from 'zod';

const FarmingTipsInputSchema = z.object({
  city: z.string(),
  current: WeatherForecastOutputSchema.shape.current,
  weekly: WeatherForecastOutputSchema.shape.weekly,
});
type FarmingTipsInput = z.infer<typeof FarmingTipsInputSchema>;

const FarmingTipsOutputSchema = z.object({
  tips: z.string().describe('The AI-generated farming tips.'),
});


export async function getFarmingTips(input: FarmingTipsInput) {
    return getFarmingTipsFlow(input);
}

const prompt = ai.definePrompt({
    name: 'getFarmingTipsPrompt',
    input: { schema: FarmingTipsInputSchema },
    output: { schema: FarmingTipsOutputSchema },
    prompt: `You are an expert agricultural advisor. Your goal is to provide actionable, concise farming tips based on the provided weather forecast for {{city}}.

The user is a farmer in that region. Keep the language simple and direct. Provide 2-3 bullet points.

Focus on practical advice related to irrigation, harvesting, planting schedules, pest control, and crop protection that is relevant to the given forecast.

**Current Weather:**
- Condition: {{current.condition}}
- Temperature: {{current.temp}}
- Humidity: {{current.humidity}}

**7-Day Forecast:**
{{#each weekly}}
- {{day}}: {{temp}}, {{condition}}
{{/each}}

Based on this, generate your tips. For example, if you see high heat and no rain, suggest increased irrigation. If you see upcoming rain, suggest holding off on watering.
`,
});

const getFarmingTipsFlow = ai.defineFlow(
    {
        name: 'getFarmingTipsFlow',
        inputSchema: FarmingTipsInputSchema,
        outputSchema: FarmingTipsOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
