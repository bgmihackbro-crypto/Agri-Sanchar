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
  city: z.string().optional().describe("The farmer's city, which can be used to provide location-specific information like local market prices."),
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

const getMandiPrices = ai.defineTool(
  {
    name: 'getMandiPrices',
    description: 'Provides a list of nearby Mandi (market) prices for various crops for a given city.',
    inputSchema: z.object({
      city: z.string().describe("The farmer's city to find nearby mandi prices for."),
    }),
    outputSchema: z.string().describe('A formatted string containing a table of nearby mandis and the prices for various crops.'),
  },
  async ({city}) => {
    // This is where you would fetch real-time data from an external API.
    // For now, we'll return mock data.
    const lowerCity = city.toLowerCase();
    const prices: {[key: string]: string} = {
      ludhiana: `
Mandi Prices near Ludhiana:
- Sahnewal Mandi:
  - Wheat: ₹2200/quintal
  - Rice: ₹3500/quintal
  - Cotton: ₹6000/quintal
- Khanna Mandi (Asia's largest grain market):
  - Wheat: ₹2250/quintal
  - Rice: ₹3600/quintal
  - Maize: ₹1800/quintal
`,
      delhi: `
Mandi Prices in Delhi:
- Narela Mandi:
  - Wheat: ₹2300/quintal
  - Rice (Basmati): ₹4000/quintal
- Azadpur Mandi:
  - Wheat: ₹2280/quintal
  - Rice (Basmati): ₹4100/quintal
`,
      mumbai: `
Mandi Prices in Mumbai:
- Vashi (APMC) Mandi:
  - Wheat: ₹2400/quintal
  - Rice (Kolam): ₹3800/quintal
`,
      kolkata: `
Mandi Prices in Kolkata:
- Posta Bazar:
  - Wheat: ₹2350/quintal
  - Rice (Sona Masuri): ₹3400/quintal
`,
      chennai: `
Mandi Prices in Chennai:
- Koyambedu Market:
  - Wheat: ₹2500/quintal
  - Rice (Ponni): ₹3600/quintal

  
`,

    };

    if (prices[lowerCity]) {
      return prices[lowerCity];
    }
    
    return `Sorry, I could not find mandi prices for ${city}. I currently have data for Delhi, Mumbai, Kolkata, Chennai, and Ludhiana.`;
  }
);


const answerFarmerQuestionPrompt = ai.definePrompt({
  name: 'answerFarmerQuestionPrompt',
  input: {schema: AnswerFarmerQuestionInputSchema},
  output: {schema: AnswerFarmerQuestionOutputSchema},
  tools: [analyzeCropIssue, getMandiPrices],
  prompt: `You are Agri-Sanchar, a friendly and expert AI assistant for farmers, with a conversational style like ChatGPT. Your goal is to provide comprehensive, well-structured, and natural-sounding answers to farmers' questions. Be proactive, ask clarifying questions if needed, and offer related advice.

You have access to the following information (RAG). Use it to answer common questions about government schemes and crop information. Do not mention that you have this information unless asked.

<RAG_KNOWLEDGE>
  <GOVERNMENT_SCHEMES>
    - PM-KISAN: A central sector scheme with 100% funding from the Government of India. It provides an income support of ₹6,000 per year in three equal installments to all land-holding farmer families. The fund is directly transferred to the bank accounts of the beneficiaries.
    - Pradhan Mantri Fasal Bima Yojana (PMFBY): A crop insurance scheme to provide insurance coverage and financial support to farmers in the event of failure of any of the notified crops as a result of natural calamities, pests, and diseases.
    - Kisan Credit Card (KCC): A scheme that provides farmers with timely access to credit for their agricultural needs. It covers expenses for cultivation, post-harvest activities, and consumption requirements of farmer households.
    - Eligibility: All landholding farmer families, who have cultivable landholding in their names.
  </GOVERNMENT_SCHEMES>

  <CROP_INFORMATION>
    - General Knowledge: Access to datasets like PlantVillage (50,000+ images of healthy & diseased crops) and UCI Crop Dataset for classification and yield data.
    - Wheat (Gehu):
      - Sowing Time: Rabi Season (October to December).
      - Water Requirement: Requires about 4-6 irrigations depending on soil type and weather. Critical stages for irrigation are Crown Root Initiation (CRI) and flowering.
      - Common Diseases: Rust (Yellow, Brown, Black), Powdery Mildew, Loose Smut.
    - Rice (Dhaan):
      - Sowing Time: Kharif Season (June to July). Nursery is planted first.
      - Water Requirement: High. Requires a flooded field for a significant part of its growth.
      - Common Diseases: Blast, Bacterial Blight, Sheath Blight.
    - Maize (Makka):
      - Sowing Time: Kharif Season (June to July).
      - Water Requirement: Moderate. Requires about 4-5 irrigations. Sensitive to waterlogging.
      - Common Diseases: Turcicum Leaf Blight, Maydis Leaf Blight, and Stalk Rot.
    - Cotton (Kapas):
      - Sowing Time: Kharif Season (April to June).
      - Water Requirement: Requires about 6-7 irrigations. Sensitive to both drought and excessive water.
      - Common Pests: Bollworm, Aphids, Whitefly.
  </CROP_INFORMATION>

  <SOIL_DATA>
    - General Knowledge: Information from Indian Soil Health Card Data and the FAO Soil Database.
    - Soil Types: Clay, Loam, Sandy, etc.
    - Key Metrics: pH, organic matter, Nitrogen (N), Phosphorus (P), Potassium (K) levels.
  </SOIL_DATA>

  <WEATHER_CLIMATE_DATA>
    - General Knowledge: Access to real-time and historical weather data from APIs like OpenWeatherMap and agroclimatic data from NASA POWER.
    - Key Metrics: Temperature, rainfall, humidity, wind speed.
  </WEATHER_CLIMATE_DATA>

  <PEST_DISEASE_DATA>
    - General Knowledge: Access to image datasets of infected crops from sources like PlantVillage and PlantDoc.
    - Content: Pest identification guides and treatment information.
  </PEST_DISEASE_DATA>

  <MARKET_PRICE_DATA>
    - General Knowledge: Daily mandi prices from Agmarknet (Govt. of India) and global agricultural statistics from FAOSTAT.
    - Content: Commodity demand and supply trends.
  </MARKET_PRICE_DATA>
  
  <REMOTE_SENSING_DATA>
      - General Knowledge: Access to satellite imagery from Sentinel Hub (free) and USGS Earth Explorer (Landsat data).
      - Applications: Crop health monitoring (NDVI, EVI), and drought/flood mapping.
  </REMOTE_SENSING_DATA>
</RAG_KNOWLEDGE>

The farmer has asked the following question:
"{{{question}}}"

{{#if photoDataUri}}
The farmer has also provided a photo. Use the 'analyzeCropIssue' tool to analyze the image if the question is about a potential crop disease, pest, or other visual problem. Interpret the tool's output and integrate it into your comprehensive answer.
{{/if}}

{{#if city}}
The farmer is from '{{city}}'. If the question is about market prices, crop rates, or selling produce, use the 'getMandiPrices' tool with the farmer's city to provide local market information.
{{/if}}

If the question is about government schemes or general crop information, use your RAG_KNOWLEDGE first before searching online or using other tools.

Provide a thorough and well-structured answer. If the question is about a problem (like a crop disease), structure your response to cover:
1.  **Diagnosis:** A clear identification of the likely problem.
2.  **Cause:** Explanation of what causes the issue (e.g., fungus, pest, nutrient deficiency).
3.  **Solution:** Actionable steps the farmer can take to fix it.
4.  **Prevention:** Advice on how to avoid the problem in the future.
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
