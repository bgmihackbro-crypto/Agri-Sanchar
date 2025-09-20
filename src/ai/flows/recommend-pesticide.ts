'use server';
/**
 * @fileOverview Recommends a pesticide based on crop type and problem description.
 *
 * - recommendPesticide - A function that provides a pesticide recommendation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const PesticideRecommendationInputSchema = z.object({
  crop: z.string().describe('The crop that has the problem (e.g., "Cotton", "Rice").'),
  problem: z.string().describe('A description of the pest, disease, or problem observed.'),
  pesticideData: z.string().describe('A JSON string of available pesticide data to use as context.'),
});

const PesticideRecommendationOutputSchema = z.object({
  recommendation: z.string().describe('The name of the recommended pesticide.'),
  reasoning: z.string().describe('A detailed explanation for why this pesticide was recommended.'),
  usage: z.string().describe('Instructions on how to use the recommended pesticide.'),
});
export type PesticideRecommendationOutput = z.infer<typeof PesticideRecommendationOutputSchema>;

export async function recommendPesticide(
  input: z.infer<typeof PesticideRecommendationInputSchema>
): Promise<PesticideRecommendationOutput> {
  return recommendPesticideFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendPesticidePrompt',
  input: { schema: PesticideRecommendationInputSchema },
  output: { schema: PesticideRecommendationOutputSchema },
  prompt: `You are an agricultural expert specializing in pest and disease management for Indian farming conditions. Your task is to recommend the most suitable pesticide from a given list.

**Farmer's Problem:**
- **Crop:** {{{crop}}}
- **Problem Description:** "{{{problem}}}"

**Available Pesticides (JSON context):**
\`\`\`json
{{{pesticideData}}}
\`\`\`

**Your Task:**
1.  Analyze the farmer's problem and the list of available pesticides.
2.  Choose the single BEST pesticide from the list to solve the problem. Consider the crop, the type of problem (pest, fungus, etc.), and whether an organic or chemical solution is more appropriate. Prioritize organic options if they are effective for the described problem.
3.  Provide a clear recommendation in the required JSON format. For the 'recommendation' field, provide the exact name of the pesticide. For 'reasoning', explain why you chose this pesticide. For 'usage', briefly explain how to apply the pesticide, referencing its dosage from the data.
`,
});

const recommendPesticideFlow = ai.defineFlow(
  {
    name: 'recommendPesticideFlow',
    inputSchema: PesticideRecommendationInputSchema,
    outputSchema: PesticideRecommendationOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      return output!;
    } catch (error) {
      console.error("Error recommending pesticide:", error);
      throw new Error("The AI model could not generate a recommendation at this time. Please try again later.");
    }
  }
);
