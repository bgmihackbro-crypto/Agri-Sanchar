
'use server';

/**
 * @fileOverview Analyzes a soil test report, extracts key metrics, and provides recommendations.
 *
 * - analyzeSoilReport: A function that takes a soil report image and returns a structured analysis.
 * - SoilReportAnalysisInput: The input type for the analysis function.
 * - SoilReportAnalysisOutput: The return type for the analysis function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';


const SoilMetricSchema = z.object({
    name: z.string().describe('The name of the metric (e.g., "pH", "Organic Carbon").'),
    value: z.string().describe('The value of the metric (e.g., "7.2", "0.8%").'),
    status: z.enum(['Low', 'Medium', 'High', 'Normal', 'Slightly Alkaline', 'Neutral']).describe('The status of the metric (e.g., Low, Medium, High).'),
});

const SoilReportAnalysisInputSchema = z.object({
  reportDataUri: z
    .string()
    .describe(
      "A photo of the soil test report, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SoilReportAnalysisInput = z.infer<typeof SoilReportAnalysisInputSchema>;


const SoilReportAnalysisOutputSchema = z.object({
    keyMetrics: z.array(SoilMetricSchema).describe('A list of key soil metrics extracted from the report.'),
    cropSuitability: z.string().describe('Suggestions for suitable crops based on the soil analysis.'),
    fertilizerRecommendation: z.string().describe('Recommendations for fertilizer and soil amendments.'),
});
export type SoilReportAnalysisOutput = z.infer<typeof SoilReportAnalysisOutputSchema>;


export async function analyzeSoilReport(input: SoilReportAnalysisInput): Promise<SoilReportAnalysisOutput> {
  return analyzeSoilReportFlow(input);
}


const prompt = ai.definePrompt({
  name: 'analyzeSoilReportPrompt',
  input: { schema: SoilReportAnalysisInputSchema },
  output: { schema: SoilReportAnalysisOutputSchema },
  prompt: `You are an expert soil scientist. Your task is to analyze the provided image of a soil health report and extract key information.

The report is for a farmer in India. Analyze the image and perform the following tasks:

1.  **Extract Key Metrics**: Identify and extract the following metrics. If a metric is not present, omit it.
    - pH
    - Electrical Conductivity (EC) (in dS/m)
    - Organic Carbon (OC) (in %)
    - Nitrogen (N) (in kg/ha)
    - Phosphorus (P) (in kg/ha)
    - Potassium (K) (in kg/ha)
    For each metric, determine if its value is "Low", "Medium", or "High" based on standard Indian agricultural ranges. For pH, use terms like "Neutral", "Slightly Alkaline", etc.

2.  **Suggest Suitable Crops**: Based on the overall soil profile, provide a list of 2-3 crops that would be suitable for this soil. Briefly explain why (e.g., "Good for pulses like Chickpea due to low Nitrogen").

3.  **Provide Fertilizer Recommendations**: Based on the nutrient levels (N, P, K), provide a clear, actionable fertilizer and soil amendment recommendation. Mention both chemical and organic options. For example: "The soil is low in Nitrogen. Apply 40kg of Urea per acre. You can also supplement with 5 tons of farmyard manure."

Here is the soil report image:
{{media url=reportDataUri}}

Provide the output in the requested JSON format.
`,
});

const analyzeSoilReportFlow = ai.defineFlow(
  {
    name: 'analyzeSoilReportFlow',
    inputSchema: SoilReportAnalysisInputSchema,
    outputSchema: SoilReportAnalysisOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      return output!;
    } catch (error) {
        console.error("Error analyzing soil report:", error);
        throw new Error("The AI model could not analyze the soil report. The report may be unclear or the service is temporarily down.");
    }
  }
);
