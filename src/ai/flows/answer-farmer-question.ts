'use server';

/**
 * @fileOverview This file defines a Genkit flow for answering farmer questions related to farming practices,
 * crop management, and government schemes. It includes a tool for analyzing crop issues from images.
 *
 * - answerFarmerQuestion - A function that takes a question and an optional image and returns an answer.
 * - AnswerFarmerQuestionInput - The input type for the answerFarmerQuestion function.
 * - AnswerFarmerQuestionOutput - The return type for the answerFarmerQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerFarmerQuestionInputSchema = z.object({
  question: z.string().describe('The question the farmer is asking.'),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "A photo related to the question, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnswerFarmerQuestionInput = z.infer<typeof AnswerFarmerQuestionInputSchema>;

const AnswerFarmerQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the farmer question.'),
});
export type AnswerFarmerQuestionOutput = z.infer<typeof AnswerFarmerQuestionOutputSchema>;

const analyzeCropIssue = ai.defineTool(
  {
    name: 'analyzeCropIssue',
    description: 'Analyzes a crop issue from an image and provides a diagnosis and solution.',
    inputSchema: z.object({
      photoDataUri: z
        .string()
        .describe(
          "A photo of a crop issue, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
    }),
    outputSchema: z.string().describe('A diagnosis of the crop issue and potential solutions.'),
  },
  async input => {
    // TODO: Implement the crop issue analysis logic here using an image analysis service or model.
    // This is a placeholder implementation.
    console.log('Analyzing crop issue from image:', input.photoDataUri);
    return 'Crop issue analysis and solutions based on the image.';
  }
);

const answerFarmerQuestionPrompt = ai.definePrompt({
  name: 'answerFarmerQuestionPrompt',
  input: {schema: AnswerFarmerQuestionInputSchema},
  output: {schema: AnswerFarmerQuestionOutputSchema},
  tools: [analyzeCropIssue],
  prompt: `You are an AI chatbot designed to help farmers with their questions.

  The farmer has asked the following question: {{{question}}}

  {{#if photoDataUri}}
  The farmer has also provided a photo.  You can use the analyzeCropIssue tool to analyze it.
  {{/if}}

  Answer the question to the best of your ability, using the provided tool if necessary.
  `,
});

export async function answerFarmerQuestion(input: AnswerFarmerQuestionInput): Promise<AnswerFarmerQuestionOutput> {
  return answerFarmerQuestionFlow(input);
}

const answerFarmerQuestionFlow = ai.defineFlow(
  {
    name: 'answerFarmerQuestionFlow',
    inputSchema: AnswerFarmerQuestionInputSchema,
    outputSchema: AnswerFarmerQuestionOutputSchema,
  },
  async input => {
    const {output} = await answerFarmerQuestionPrompt(input);
    return output!;
  }
);
