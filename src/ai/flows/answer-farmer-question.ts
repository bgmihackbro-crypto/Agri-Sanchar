'use server';

/**
 * Genkit flow for answering farmer questions related to farming practices,
 * crop management, and government schemes. It includes tools for analyzing
 * crop issues from images, fetching mandi prices, and returning weather info.
 *
 * This file is written in TypeScript and expects the following packages to be
 * installed in your project: genkit (or your local ai wrapper), @genkit-ai/googleai,
 * and zod.
 */

import { z } from 'zod';
import { ai } from '@/ai/genkit'; // your ai wrapper (make sure this exports a genkit instance)
import { analyzeCropIssueFromPhoto } from './analyze-crop-issue-from-photo';
import { PriceRecordSchema } from '@/ai/types';

// ---------- Input / Output Schemas ----------
const AnswerFarmerQuestionInputSchema = z.object({
  question: z.string().describe('The question the farmer is asking.'),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "A photo related to the question, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  city: z.string().optional().describe("The farmer's city, used to provide location-specific information like local market prices."),
  returnJson: z.boolean().optional().describe('Set to true to get a direct JSON output from tools if applicable.'),
});
export type AnswerFarmerQuestionInput = z.infer<typeof AnswerFarmerQuestionInputSchema>;

const AnswerFarmerQuestionOutputSchema = z.object({
  answer: z.string().describe('The text answer to the farmer question.'),
  priceData: z.array(PriceRecordSchema).optional().describe('Structured JSON data for market prices if requested.'),
});
export type AnswerFarmerQuestionOutput = z.infer<typeof AnswerFarmerQuestionOutputSchema>;

const AnalyzeCropIssueFromPhotoOutputSchema = z.object({
  analysisResult: z.string().describe('The analysis result of the crop issue from the photo.'),
});

// ---------- Tools ----------
const analyzeCropIssue = ai.defineTool(
  {
    name: 'analyzeCropIssue',
    description: 'Analyzes a crop issue from an image and provides a diagnosis and solution.',
    inputSchema: z.object({
      photoDataUri: z.string().describe("A photo of a crop issue as a data URI: 'data:<mimetype>;base64,<encoded_data>'."),
    }),
    outputSchema: AnalyzeCropIssueFromPhotoOutputSchema,
  },
  async (input) => {
    // The helper analyzeCropIssueFromPhoto is expected to accept the same input
    // shape or the photo data URI directly. Adjust if your helper has a
    // different signature.
    const analysis = await analyzeCropIssueFromPhoto(input.photoDataUri);
    return { analysisResult: analysis } as z.infer<typeof AnalyzeCropIssueFromPhotoOutputSchema>;
  }
);

const MandiPriceOutputSchema = z.object({
  records: z.array(PriceRecordSchema).optional(),
  error: z.string().optional(),
});

const getMandiPrices = ai.defineTool(
  {
    name: 'getMandiPrices',
    description: 'Provides a list of nearby mandi (market) prices for various crops for a given city.',
    inputSchema: z.object({ city: z.string().describe("The farmer's city to find nearby mandi prices for.") }),
    outputSchema: MandiPriceOutputSchema,
  },
  async ({ city }) => {
    const apiKey = process.env.GOV_DATA_API_KEY;
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      return { error: 'Sorry, the real-time market data API is not configured. Please add the API key to the .env file.' };
    }

    const encodedCity = encodeURIComponent(city);
    const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&filters[market]=${encodedCity}&limit=20`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      const data = await response.json();

      if (!data.records || data.records.length === 0) {
        return { error: `Sorry, I could not find real-time mandi prices for ${city} at the moment. Please try another nearby city.` };
      }

      const priceRecords = data.records.map((rec: any) => ({
        commodity: rec.commodity,
        modal_price: rec.modal_price,
      }));

      return { records: priceRecords };

    } catch (error) {
      console.error('Error fetching mandi prices:', error);
      return { error: `Sorry, I was unable to fetch real-time market data for ${city}. There might be a connection or configuration issue.` };
    }
  }
);

const getWeather = ai.defineTool(
  {
    name: 'getWeather',
    description: 'Provides the 7-day weather forecast for a given city.',
    inputSchema: z.object({ city: z.string().describe('The city for which to get the weather forecast.') }),
    outputSchema: z.string(),
  },
  async ({ city }) => {
    // Simple mock/stub implementation — replace with real API calls as needed.
    const lowerCity = city.toLowerCase();
    const weatherData: Record<string, string> = {
      indore: `Weather forecast for Indore:\n- Today: 28°C, Partly Cloudy\n- Tomorrow: 29°C, Sunny\n- Day 3: 27°C, Light Showers\n- Day 4: 30°C, Sunny\n- Day 5: 28°C, Cloudy\n- Day 6: 26°C, Rain\n- Day 7: 29°C, Partly Cloudy`,
      ludhiana: `Weather forecast for Ludhiana:\n- Today: 25°C, Partly Cloudy\n- Tomorrow: 26°C, Sunny\n- Day 3: 24°C, Showers\n- Day 4: 27°C, Sunny\n- Day 5: 23°C, Cloudy\n- Day 6: 22°C, Rain\n- Day 7: 25°C, Partly Cloudy`,
      delhi: `Weather forecast for Delhi:\n- Today: 30°C, Hazy Sunshine\n- Tomorrow: 31°C, Sunny\n- Day 3: 29°C, Hazy\n- Day 4: 32°C, Sunny\n- Day 5: 28°C, Cloudy\n- Day 6: 27°C, Light Rain\n- Day 7: 30°C, Sunny`,
    };

    if (weatherData[lowerCity]) return weatherData[lowerCity];

    return `Sorry, I don't have weather information for ${city} right now. I currently have forecasts for Indore, Ludhiana, and Delhi.`;
  }
);

// ---------- Prompt / Flow ----------
const answerFarmerQuestionPrompt = ai.definePrompt({
  name: 'answerFarmerQuestionPrompt',
  input: { schema: AnswerFarmerQuestionInputSchema },
  output: { schema: z.object({ answer: z.string() }) },
  tools: [analyzeCropIssue, getMandiPrices, getWeather],
  prompt: `You are Agri-Sanchar, a friendly and expert AI assistant for farmers, with a conversational style like ChatGPT. Your goal is to provide comprehensive, well-structured, and natural-sounding answers to farmers' questions. Be proactive, ask clarifying questions if needed, and offer related advice.

When you use the 'getMandiPrices' tool, you receive JSON data. You must format this data into a human-readable table within your response. For example: "Here are the prices for [City]: - Crop: Price/quintal". Do not output raw JSON.

IMPORTANT: You should ONLY use the 'analyzeCropIssue' tool if the user provides an image and asks a question about identifying a problem with it (e.g., "what's wrong with my plant?"). If the user simply asks for something else while providing an image, you do not need to use the tool. The 'analyzeCropIssue' tool's output is handled by the system and you do not need to process it.

You have access to the following information (RAG). Use it to answer common questions about government schemes and crop information. Do not mention that you have this information unless asked.

<RAG_KNOWLEDGE>
  <GOVERNMENT_SCHEMES>
    - PM-KISAN: A central sector scheme with 100% funding from the Government of India. It provides an income support of \u20B96,000 per year in three equal installments to all land-holding farmer families. The fund is directly transferred to the bank accounts of the beneficiaries.
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
A photo has been provided. If the question is about identifying an issue in the photo, use the 'analyzeCropIssue' tool. The system will handle the output.
{{/if}}

{{#if city}}
The farmer is from '{{city}}'. If the question is about market prices, crop rates, or selling produce, use the 'getMandiPrices' tool with the farmer's city to provide local market information. If the question is about weather, use the 'getWeather' tool.
{{/if}}

If the question is about government schemes or general crop information, use your RAG_KNOWLEDGE first before searching online or using other tools.
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
  async (input) => {
    // If the request is for JSON price data, call the tool directly and return.
    if (input.returnJson && input.city) {
      const priceData = await getMandiPrices({ city: input.city });
      if ('error' in priceData && priceData.error) {
        return { answer: priceData.error } as AnswerFarmerQuestionOutput;
      }
      return { answer: '', priceData: priceData.records } as AnswerFarmerQuestionOutput;
    }

    // Otherwise, proceed with the normal conversational flow.
    const llmResponse = await answerFarmerQuestionPrompt(input);

    // If prompt suggested calling a tool, find that call and process the tool output.
    const analysisToolCall = llmResponse.toolCalls?.find((call: any) => call.tool === 'analyzeCropIssue');

    if (analysisToolCall) {
      // Extract the tool output using the helper. Different SDK versions expose tool results differently;
      // this code tries a few common patterns in a safe way.
      let toolOutput: any = undefined;
      try {
        if (typeof llmResponse.toolOutput === 'function') {
          toolOutput = llmResponse.toolOutput(analysisToolCall);
        } else if (analysisToolCall.output) {
          toolOutput = analysisToolCall.output;
        }
      } catch (e) {
        console.warn('Could not extract tool output using helper, attempting to read call.output', e);
        toolOutput = analysisToolCall.output;
      }

      if (toolOutput && toolOutput.analysisResult) {
        return { answer: toolOutput.analysisResult } as AnswerFarmerQuestionOutput;
      }
    }

    // Fallback: try to return the direct LLM output mapped to our schema
    const possibleAnswer =
      (llmResponse.output && (llmResponse.output.answer || llmResponse.outputText?.() || (llmResponse.output as any).text)) ||
      (typeof llmResponse === 'string' ? llmResponse : undefined);

    if (possibleAnswer) {
      return { answer: String(possibleAnswer) } as AnswerFarmerQuestionOutput;
    }

    // If nothing matched, return a safe default message
    return { answer: "Sorry, I couldn't generate an answer right now. Please try again or provide more details." } as AnswerFarmerQuestionOutput;
  }
);
