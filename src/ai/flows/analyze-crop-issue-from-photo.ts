'use server';
/**
 * @fileOverview Analyzes a photo of a crop to identify potential issues such as diseases or pests.
 *
 * - analyzeCropIssueFromPhoto - A function that handles the analysis of crop issues from a photo.
 * - AnalyzeCropIssueFromPhotoInput - The input type for the analyzeCropIssueFromPhoto function.
 * - AnalyzeCropIssueFromPhotoOutput - The return type for the analyzeCropIssueFromPhoto function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCropIssueFromPhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a crop, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
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
  prompt: `You are an expert in plant pathology and entomology.

You will analyze the provided photo of a crop and identify potential issues such as diseases or pests. Provide a detailed analysis of the image and suggest potential causes or remedies.

Photo: {{media url=photoDataUri}}`,
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
