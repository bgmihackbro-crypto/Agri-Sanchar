
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
  language: z.string().optional().describe("The language for the AI to respond in (e.g., 'English', 'Hindi')."),
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

The user is a farmer in that region. Keep the language simple and direct. Provide 2-3 numbered points.

**CRITICAL INSTRUCTION**: You MUST provide your entire response in the specified language: {{{language}}}. If it is 'Hindi', you MUST reply in Devanagari script.

Focus on practical advice related to irrigation, harvesting, planting schedules, pest control, and crop protection that is relevant to the given forecast.

**Current Weather:**
- Condition: {{current.condition}}
- Temperature: {{current.temp}}
- Humidity: {{current.humidity}}

**7-Day Forecast:**
{{#each weekly}}
- {{day}}: {{temp}}, {{condition}}
{{/each}}

Based on this, generate your tips as a numbered list. Each point must be on a new line, like this example:
1) Tip one.
2) Tip two.
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
