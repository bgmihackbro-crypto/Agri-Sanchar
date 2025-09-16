
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
import {analyzeCropIssueFromPhoto} from './analyze-crop-issue-from-photo';
import { PriceRecordSchema } from '@/ai/types';

const AnswerFarmerQuestionInputSchema = z.object({
  question: z.string().describe('The question the farmer is asking.'),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "A photo related to the question, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  city: z.string().optional().describe("The farmer's city, which can be used to provide location-specific information like local market prices."),
  returnJson: z.boolean().optional().describe("Set to true to get a direct JSON output from tools if applicable.")
});
export type AnswerFarmerQuestionInput = z.infer<typeof AnswerFarmerQuestionInputSchema>;

const AnswerFarmerQuestionOutputSchema = z.object({
  answer: z.string().describe('The text answer to the farmer question.'),
  priceData: z.array(PriceRecordSchema).optional().describe("Structured JSON data for market prices if requested."),
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


const MandiPriceOutputSchema = z.object({
    records: z.array(PriceRecordSchema).optional(),
    error: z.string().optional(),
});

const getMandiPrices = ai.defineTool(
  {
    name: 'getMandiPrices',
    description: 'Provides a list of nearby Mandi (market) prices for various crops for a given city.',
    inputSchema: z.object({
      city: z.string().describe("The farmer's city to find nearby mandi prices for."),
    }),
    outputSchema: MandiPriceOutputSchema,
  },
  async ({city}) => {
    const apiKey = process.env.GOV_DATA_API_KEY;
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      return { error: `Sorry, the real-time market data API is not configured. Please add the API key to the .env file.` };
    }

    const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&filters[market]=${city}&limit=20`;

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
          modal_price: rec.modal_price
      }));

      return { records: priceRecords };

    } catch (error) {
      console.error("Error fetching mandi prices:", error);
      return { error: `Sorry, I was unable to fetch real-time market data for ${city}. There might be a connection issue.` };
    }
  }
);

const getWeather = ai.defineTool(
  {
    name: 'getWeather',
    description: "Provides the 7-day weather forecast for a given city.",
    inputSchema: z.object({
      city: z.string().describe("The city for which to get the weather forecast."),
    }),
    outputSchema: z.string().describe("The weather forecast formatted as a string."),
  },
  async ({ city }) => {
    // In a real application, you would fetch this data from a weather API.
    // For now, we'll return mock data for a few cities.
    const lowerCity = city.toLowerCase();
    const weatherData: { [key: string]: string } = {
      indore: `
Weather forecast for Indore:
- Today: 28°C, Partly Cloudy
- Tomorrow: 29°C, Sunny
- Day 3: 27°C, Light Showers
- Day 4: 30°C, Sunny
- Day 5: 28°C, Cloudy
- Day 6: 26°C, Rain
- Day 7: 29°C, Partly Cloudy
`,
      ludhiana: `
Weather forecast for Ludhiana:
- Today: 25°C, Partly Cloudy
- Tomorrow: 26°C, Sunny
- Day 3: 24°C, Showers
- Day 4: 27°C, Sunny
- Day 5: 23°C, Cloudy
- Day 6: 22°C, Rain
- Day 7: 25°C, Partly Cloudy
`,
      delhi: `
Weather forecast for Delhi:
- Today: 30°C, Hazy Sunshine
- Tomorrow: 31°C, Sunny
- Day 3: 29°C, Hazy
- Day 4: 32°C, Sunny
- Day 5: 28°C, Cloudy
- Day 6: 27°C, Light Rain
- Day 7: 30°C, Sunny
`,
    };

    if (weatherData[lowerCity]) {
      return weatherData[lowerCity];
    }
    
    return `Sorry, I don't have weather information for ${city} right now. I currently have forecasts for Indore, Ludhiana, and Delhi.`;
  }
);


const answerFarmerQuestionPrompt = ai.definePrompt({
  name: 'answerFarmerQuestionPrompt',
  input: {schema: AnswerFarmerQuestionInputSchema},
  output: {schema: z.object({ answer: z.string() }) },
  tools: [analyzeCropIssue, getMandiPrices, getWeather],
  prompt: `You are Agri-Sanchar, a friendly and expert AI assistant for farmers, with a conversational style like ChatGPT. Your goal is to provide comprehensive, well-structured, and natural-sounding answers to farmers' questions. Be proactive, ask clarifying questions if needed, and offer related advice.

When you use the 'getMandiPrices' tool, you receive JSON data. You must format this data into a human-readable table within your response. For example: "Here are the prices for [City]: - Crop: Price/quintal". Do not output raw JSON.

When you use the 'analyzeCropIssue' tool, you will receive a structured Markdown response. You must present this information clearly to the farmer, perhaps summarizing the key points and then providing the full, structured analysis.

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
  </PEST_DISEASE_DATA>

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
IMPORTANT: A photo has been provided. You MUST use the 'analyzeCropIssue' tool and you MUST pass the 'photoDataUri' to it. Your primary goal is to provide a diagnosis based on this photo. Interpret the tool's output and integrate it into your comprehensive answer. If the farmer's question is simple, like "what is this?", the full analysis from the tool is the answer.
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
        if (priceData.error) {
            return { answer: priceData.error };
        }
        return { answer: '', priceData: priceData.records };
    }

    // Otherwise, proceed with the normal conversational flow.
    const llmResponse = await answerFarmerQuestionPrompt(input);
    return llmResponse.output!;
  }
);

    