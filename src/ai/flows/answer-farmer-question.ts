
'use server';

/**
 * Genkit flow for answering farmer questions related to farming practices,
 * crop management, and government schemes. It includes tools for fetching 
 * mandi prices and returning weather info. It can also analyze images.
 *
 * This file is written in TypeScript and expects the following packages to be
 * installed in your project: genkit (or your local ai wrapper), @genkit-ai/googleai,
 * and zod.
 */

import { z } from 'zod';
import { ai } from '@/ai/genkit'; // your ai wrapper (make sure this is exports a genkit instance)
import { PriceRecordSchema } from '@/ai/types';
import { getWeatherForecast } from './get-weather-forecast';


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
  language: z.string().optional().describe("The language for the AI to respond in (e.g., 'English', 'Hindi'). This is a hint, but the AI should prioritize the user's question language."),
});
export type AnswerFarmerQuestionInput = z.infer<typeof AnswerFarmerQuestionInputSchema>;

const AnswerFarmerQuestionOutputSchema = z.object({
  answer: z.string().describe('The text answer to the farmer question.'),
  priceData: z.array(PriceRecordSchema).optional().describe('Structured JSON data for market prices if requested.'),
});
export type AnswerFarmerQuestionOutput = z.infer<typeof AnswerFarmerQuestionOutputSchema>;

// ---------- Tools ----------
const MandiPriceOutputSchema = z.object({
  records: z.array(PriceRecordSchema).optional(),
  error: z.string().optional(),
});

const getMandiPrices = ai.defineTool(
  {
    name: 'getMandiPrices',
    description: 'Provides a list of mandi (market) prices for various crops. Can be filtered by city.',
    inputSchema: z.object({ city: z.string().optional().describe("The city to find mandi prices for. If omitted, returns prices from across India.") }),
    outputSchema: MandiPriceOutputSchema,
  },
  async ({ city }) => {
    const apiKey = process.env.GOV_DATA_API_KEY;
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      return { error: 'API_KEY_MISSING' };
    }

    let url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=100`;

    if (city) {
      const encodedCity = encodeURIComponent(city);
      url += `&filters[market]=${encodedCity}`;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      const data = await response.json();

      if (!data.records || data.records.length === 0) {
        return { error: `NO_DATA_FOUND` };
      }

      const priceRecords = data.records.map((rec: any) => ({
        commodity: rec.commodity,
        modal_price: rec.modal_price,
        market: rec.market, // Include market name in the response
      }));

      return { records: priceRecords };

    } catch (error) {
      console.error('Error fetching mandi prices:', error);
      return { error: `FETCH_FAILED` };
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
    try {
      const forecast = await getWeatherForecast({ city });
      if (forecast.error) {
        return forecast.error;
      }
      
      // Format the structured data into a readable string for the chatbot.
      let weatherString = `Here is the 7-day forecast for ${city}:\n`;
      forecast.weekly?.forEach(day => {
        weatherString += `- ${day.day}: ${day.temp}, ${day.condition}\n`;
      });
      return weatherString;

    } catch (error) {
      console.error("Error getting weather for chatbot:", error);
      return `Sorry, I was unable to fetch the weather forecast for ${city} at this time.`;
    }
  }
);

// ---------- Prompt / Flow ----------
const answerFarmerQuestionPrompt = ai.definePrompt({
  name: 'answerFarmerQuestionPrompt',
  input: { schema: AnswerFarmerQuestionInputSchema.extend({ currentDate: z.string() }) },
  tools: [getMandiPrices, getWeather],
  prompt: `You are Agri-Sanchar, a friendly and expert AI assistant for farmers, with a conversational style like ChatGPT. Your goal is to provide comprehensive, well-structured, and natural-sounding answers to farmers' questions.

**CRITICAL INSTRUCTION**: You MUST detect the language of the user's question ("{{{question}}}") and provide your entire response in that same language. If the question is in Hindi, you MUST reply in Devanagari script. If it's in English, reply in English.

When you use the 'getMandiPrices' tool, you receive JSON data. You must format this data into a human-readable table within your response. For example: "Here are the prices for [City]: - Crop: Price/quintal". Do not output raw JSON unless the user has explicitly requested JSON output. If the data includes the market, include that in the table.

If asked for the current date, day, or time, use this: {{{currentDate}}}.

{{#if photoDataUri}}
A photo has been provided. You MUST analyze this photo in the context of the user's question. If the user is asking to identify a problem (like a disease or pest), perform a step-by-step diagnosis.

1.  **Observation**: Describe what you see in the image (crop type, symptoms).
2.  **Diagnosis**: Provide the most likely diagnosis.
3.  **Recommended Action**: Give clear, actionable steps.
4.  **Prevention**: Give advice on how to prevent this issue in the future.

Format your diagnosis using Markdown. If the question is not about a problem, use the image as context to answer the question. Here is the photo: {{media url=photoDataUri}}
{{/if}}

You have access to the following information (RAG). Use it to answer common questions about government schemes and crop information. Do not mention that you have this information unless asked.

<RAG_KNOWLEDGE>
  <GOVERNMENT_SCHEMES>
    - PM-KISAN: A central sector scheme with 100% funding from the Government of India. It provides an income support of \u20B96,000 per year in three equal installments to all land-holding farmer families. The fund is directly transferred to the bank accounts of the beneficiaries.
    - Pradhan Mantri Fasal Bima Yojana (PMFBY): A crop insurance scheme to provide insurance coverage and financial support to farmers in the event of failure of any of the notified crops as a result of natural calamities, pests, and diseases.
    - Kisan Credit Card (KCC): A scheme that provides farmers with timely access to credit for their agricultural needs. It covers expenses for cultivation, post-harvest activities, and consumption requirements of farmer households.
    - Eligibility: All landholding farmer families, who have cultivable landholding in their names.
  </GOVERNMENT_SCHEMES>

  <CROP_INFORMATION>
    - General Knowledge: India is the world's largest producer of milk, pulses, and jute, and ranks as the second-largest producer of rice, wheat, sugarcane, groundnut, vegetables, fruit, and cotton.
    - Wheat (Gehu):
      - Sowing Time: Rabi Season (October to December).
      - Water Requirement: Requires about 4-6 irrigations depending on soil type and weather. Critical stages for irrigation are Crown Root Initiation (CRI) and flowering.
      - Common Diseases: Rust (Yellow, Brown, Black), Powdery Mildew, Loose Smut.
      - Major Producing States: Uttar Pradesh, Punjab, Haryana, Madhya Pradesh, Rajasthan.
    - Rice (Dhaan):
      - Sowing Time: Kharif Season (June to July). Nursery is planted first.
      - Water Requirement: High. Requires a flooded field for a significant part of its growth.
      - Common Diseases: Blast, Bacterial Blight, Sheath Blight.
      - Major Producing States: West Bengal, Uttar Pradesh, Punjab, Tamil Nadu, Andhra Pradesh.
    - Maize (Makka):
      - Sowing Time: Kharif Season (June to July).
      - Water Requirement: Moderate. Requires about 4-5 irrigations. Sensitive to waterlogging.
      - Common Diseases: Turcicum Leaf Blight, Maydis Leaf Blight, and Stalk Rot.
      - Major Producing States: Karnataka, Madhya Pradesh, Maharashtra, Rajasthan, Uttar Pradesh.
    - Cotton (Kapas):
      - Sowing Time: Kharif Season (April to June).
      - Water Requirement: Requires about 6-7 irrigations. Sensitive to both drought and excessive water.
      - Common Pests: Bollworm, Aphids, Whitefly.
      - Major Producing States: Gujarat, Maharashtra, Telangana, Andhra Pradesh, Rajasthan.
  </CROP_INFORMATION>

  <ORGANIC_FARMING>
    - Principles: A system of farming that avoids the use of synthetic fertilizers, pesticides, and genetically modified organisms (GMOs). It focuses on soil health, biodiversity, and ecological balance.
    - Certification: In India, organic farming is certified under the National Programme for Organic Production (NPOP).
    - Organic Fertilizers:
      - Compost: Decomposed organic matter. Improves soil structure and nutrient content.
      - Farmyard Manure (FYM): Decomposed mixture of dung and urine with litter.
      - Vermicompost: Compost made by earthworms. Rich in nutrients.
      - Jeevamrut: A fermented microbial culture made from cow dung, cow urine, jaggery, gram flour, and water. It enhances soil microbial activity.
    - Organic Pest Control:
      - Neem Oil: A natural pesticide and fungicide. Effective against many pests.
      - Crop Rotation: Changing the type of crops grown in the same area in sequenced seasons to disrupt pest and disease cycles.
      - Intercropping: Growing two or more crops in proximity to promote interaction that benefits one or both.
      - Beneficial Insects: Introducing or encouraging natural predators like ladybugs (for aphids) and Trichogramma wasps.
      - Pheromone Traps: Used to monitor and trap specific insect pests.
  </ORGANIC_FARMING>

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

  <AGRI_ECONOMICS>
    <MSP>
      - Definition: The Minimum Support Price (MSP) is a form of market intervention by the Government of India to insure agricultural producers against any sharp fall in farm prices.
      - Announcement: MSP is announced by the Government of India at the beginning of the sowing season for certain crops on the basis of the recommendations of the Commission for Agricultural Costs and Prices (CACP).
      - Objective: It is to protect the farmers from distress sales and to procure food grains for public distribution. If the market price for the commodity falls below the announced minimum price, government agencies purchase the entire quantity offered by the farmers at the announced minimum price.
    </MSP>
    <AGRI_MARKET>
      - e-NAM: The Electronic National Agriculture Market (e-NAM) is a pan-India electronic trading portal which networks the existing APMC mandis to create a unified national market for agricultural commodities.
      - APMC: Agricultural Produce Market Committees (APMCs) are marketing boards established by state governments in India to ensure farmers are not exploited by large retailers. They ensure that farm-to-retail price spread does not operate at the cost of farmers.
    </AGRI_MARKET>
    <SUPPLY_CHAIN>
      - Definition: The sequence of processes involved in the production and distribution of a commodity. In agriculture, it involves farmers, processors, distributors, retailers, and consumers.
      - Challenges: Lack of storage, inefficient transportation, involvement of multiple middlemen, and information asymmetry.
      - Improvement: Technology like blockchain is being explored for better traceability and efficiency.
    </SUPPLY_CHAIN>
    <AGRI_TRADING>
      - Futures Contracts: A futures contract is a legal agreement to buy or sell a particular commodity at a predetermined price at a specified time in the future. It is used for hedging against price risk.
      - Commodity Exchanges: In India, exchanges like the National Commodity and Derivatives Exchange (NCDEX) and Multi Commodity Exchange (MCX) facilitate trading in agricultural commodity futures.
    </AGRI_TRADING>
    <COLD_STORAGE>
      - Importance: Crucial for perishable commodities like fruits, vegetables, and flowers to reduce post-harvest losses and extend market availability.
      - Government Schemes: The government provides subsidies and support for the establishment of cold storage facilities through schemes like the Mission for Integrated Development of Horticulture (MIDH).
    </COLD_STORAGE>
    <EXPORT_CROPS>
      - Major Exports: India is a major exporter of rice (especially Basmati), spices, cotton, marine products, and buffalo meat.
      - APEDA: The Agricultural and Processed Food Products Export Development Authority (APEDA) is the apex body that promotes the export of agricultural and processed food products from India.
    </EXPORT_CROPS>
    <DEMAND_FORECASTING>
      - Definition: The process of predicting the future demand for a product. In agriculture, it helps in planning production and managing inventory.
      - Factors: Based on historical sales data, weather forecasts, market trends, and consumer behavior.
      - Importance: Helps in preventing price volatility and ensures food security.
    </DEMAND_FORECASTING>
  </AGRI_ECONOMICS>
</RAG_KNOWLEDGE>

The farmer has asked the following question:
"{{{question}}}"

{{#if city}}
The farmer is from '{{city}}'. If the question is about market prices, crop rates, or selling produce, use the 'getMandiPrices' tool with the farmer's city to provide local market information. If the question is about weather, use the 'getWeather' tool.
{{else}}
If the question is about market prices, crop rates, or selling produce, use the 'getMandiPrices' tool to provide market information. You can ask for a city if more specific information is needed.
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
    if (input.returnJson) {
      const priceData = await getMandiPrices({ city: input.city });
      if (priceData.error) {
        return { answer: priceData.error };
      }
      return { answer: '', priceData: priceData.records };
    }

    const currentDate = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
    
    const requestData = {
      ...input,
      currentDate,
    };

    const llmResponse = await answerFarmerQuestionPrompt(requestData);
    const answer = llmResponse.text;

    if (answer) {
      return { answer: answer };
    }

    return { answer: "Sorry, I couldn't generate an answer right now. Please try again or provide more details." };
  }
);

    
