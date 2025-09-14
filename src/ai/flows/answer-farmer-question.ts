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
import {analyzeCropIssueFromPhoto, AnalyzeCropIssueFromPhotoInput} from './analyze-crop-issue-from-photo';

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
    const {analysisResult} = await analyzeCropIssueFromPhoto(input);
    return analysisResult;
  }
);

const answerFarmerQuestionPrompt = ai.definePrompt({
  name: 'answerFarmerQuestionPrompt',
  input: {schema: AnswerFarmerQuestionInputSchema},
  output: {schema: AnswerFarmerQuestionOutputSchema},
  tools: [analyzeCropIssue],
  prompt: `You are a powerful, helpful, and friendly AI assistant for farmers, like a farming-focused Gemini. Your name is Agri-Sanchar. You have access to a wealth of agricultural knowledge.

Your goal is to provide comprehensive, expert-level answers to questions from farmers. Do not give simple or superficial answers. Always provide detailed explanations, actionable advice, and if relevant, discuss potential causes, solutions, and preventive measures.

The farmer has asked the following question:
"{{{question}}}"

{{#if photoDataUri}}
The farmer has also provided a photo. Use the 'analyzeCropIssue' tool to analyze the image if the question is about a potential crop disease, pest, or other visual problem. Interpret the tool's output and integrate it into your comprehensive answer.
{{/if}}

Provide a thorough and well-structured answer.
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
