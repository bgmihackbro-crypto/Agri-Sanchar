
'use server';
/**
 * @fileOverview Calculates a specific fertilizer dosage based on soil metrics, area, and crop type.
 *
 * - calculateFertilizer: A function that takes soil metrics and returns a dosage calculation.
 * - FertilizerCalculationInput: The input type for the function.
 * - FertilizerCalculationOutput: The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SoilMetricSchema = z.object({
    name: z.string(),
    value: z.string(),
    status: z.string(),
});

const FertilizerCalculationInputSchema = z.object({
  soilMetrics: z.array(SoilMetricSchema).describe('The key metrics from the soil report.'),
  areaInAcres: z.number().describe('The area of the farm in acres.'),
  cropType: z.string().describe('The type of crop to be planted (e.g., Wheat, Rice).'),
});
export type FertilizerCalculationInput = z.infer<typeof FertilizerCalculationInputSchema>;

const DosageRecommendationSchema = z.object({
    fertilizer: z.string().describe('The name of the fertilizer (e.g., Urea, DAP, Muriate of Potash, Farmyard Manure).'),
    quantity: z.string().describe('The recommended quantity with units (e.g., "50 kg", "5 tonnes").'),
});

const FertilizerCalculationOutputSchema = z.object({
    recommendations: z.array(DosageRecommendationSchema).describe('A list of specific fertilizer dosages.'),
    notes: z.string().optional().describe('Any additional notes or instructions for the application.'),
});
export type FertilizerCalculationOutput = z.infer<typeof FertilizerCalculationOutputSchema>;


export async function calculateFertilizer(input: FertilizerCalculationInput): Promise<FertilizerCalculationOutput> {
  return calculateFertilizerFlow(input);
}


const prompt = ai.definePrompt({
  name: 'calculateFertilizerPrompt',
  input: { schema: FertilizerCalculationInputSchema },
  output: { schema: FertilizerCalculationOutputSchema },
  prompt: `You are an expert agricultural scientist specializing in soil nutrition for Indian farms. Your task is to provide a precise fertilizer dosage calculation based on a farmer's soil test results, farm area, and chosen crop.

**Inputs:**
- **Soil Metrics**:
  {{#each soilMetrics}}
  - {{name}}: {{value}} (Status: {{status}})
  {{/each}}
- **Farm Area**: {{areaInAcres}} acres
- **Crop**: {{cropType}}

**Task:**
1.  Analyze the provided soil metrics (N, P, K, Organic Carbon, pH).
2.  Based on the nutrient status ("Low", "Medium", "High") and the specific requirements for the chosen crop ({{cropType}}), calculate the total amount of common fertilizers needed for the given farm area ({{areaIn-acres}} acres).
3.  Provide a list of recommendations for at least 2-3 common fertilizers (e.g., Urea for Nitrogen, DAP/SSP for Phosphorus, MOP for Potassium).
4.  If Organic Carbon is low, always include a recommendation for an organic amendment like Farmyard Manure (FYM) or Vermicompost.
5.  The quantity for each fertilizer must be specific for the total area (e.g., "125 kg", not "50 kg/acre").
6.  You can add a brief, important note if necessary (e.g., regarding application timing or methods).

Generate the output in the requested JSON format.
`,
});

const calculateFertilizerFlow = ai.defineFlow(
  {
    name: 'calculateFertilizerFlow',
    inputSchema: FertilizerCalculationInputSchema,
    outputSchema: FertilizerCalculationOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (!output || !output.recommendations || output.recommendations.length === 0) {
        throw new Error("The AI model could not generate a fertilizer calculation based on the provided data.");
      }
      return output;
    } catch (error) {
        console.error("Error calculating fertilizer dosage:", error);
        throw new Error("The AI model failed to calculate the fertilizer dosage. Please check the soil report data or try again later.");
    }
  }
);
