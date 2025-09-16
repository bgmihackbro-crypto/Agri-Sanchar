'use server';
/**
 * @fileOverview Analyzes a photo of a crop to identify potential issues such as diseases or pests.
 *
 * - analyzeCropIssueFromPhoto - A function that handles the analysis of crop issues from a photo.
 * - AnalyzeCropIssueFromPhotoInput - The input type for the analyzeCropIssueFromPhoto function.
 * - AnalyzeCropIssueFromPhotoOutput - The return type for the analyzeCropIssueFromPhoto function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const AnalyzeCropIssueFromPhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a crop, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type AnalyzeCropIssueFromPhotoInput = z.infer<typeof AnalyzeCropIssueFromPhotoInputSchema>;

const AnalyzeCropIssueFromPhotoOutputSchema = z.object({
  analysisResult: z.string().describe('The analysis result of the crop issue from the photo.'),
});
export type AnalyzeCropIssueFromPhotoOutput = z.infer<typeof AnalyzeCropIssueFromPhotoOutputSchema>;

export async function analyzeCropIssueFromPhoto(input: AnalyzeCropIssueFromPhotoInput): Promise<AnalyzeCropIssueFromPhotoOutput> {
  return analyzeCropIssueFromPhotoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCropIssueFromPhotoPrompt',
  input: {schema: AnalyzeCropIssueFromPhotoInputSchema},
  output: {schema: AnalyzeCropIssueFromPhotoOutputSchema},
  prompt: `You are a world-class expert in plant pathology and agricultural diagnostics. Your analysis is sharp, accurate, and incredibly helpful to farmers.

You will be provided with a photo of a crop. Perform a step-by-step diagnosis.

1.  **OBSERVATION**: Describe exactly what you see in the image. Note the crop type, the part of the plant affected (leaf, stem, fruit), the symptoms (e.g., "yellow spots with brown edges," "powdery white substance," "insects clustered on the underside of the leaf").
2.  **DIAGNOSIS**: Based on your observation, provide the most likely diagnosis. Name the specific disease, pest, or nutrient deficiency. Be confident in your assessment.
3.  **RECOMMENDED ACTION**: Provide clear, actionable steps the farmer should take immediately. This could include specific organic or chemical treatments, cultivation practices, or nutrient applications.
4.  **PREVENTION**: Give advice on how to prevent this issue from happening again in the future.

Format your entire response using Markdown with the following structure. Do not add any conversational text outside of this structure.

**Observation**:
(Your detailed description of the image)

**Diagnosis**:
(Your specific diagnosis)

**Recommended Action**:
(Your list of actionable steps)

**Prevention**:
(Your preventative advice)

Here is the photo to analyze:
{{media url=photoDataUri}}`,
});

const analyzeCropIssueFromPhotoFlow = ai.defineFlow(
  {
    name: 'analyzeCropIssueFromPhotoFlow',
    inputSchema: AnalyzeCropIssueFromPhotoInputSchema,
    outputSchema: AnalyzeCropIssueFromPhotoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
