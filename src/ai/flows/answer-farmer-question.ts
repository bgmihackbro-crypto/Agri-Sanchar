
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
  - Rice (Basmati): ₹3500/quintal
  - Cotton: ₹6000/quintal
  - Maize: ₹1820/quintal
`,
      delhi: `
Mandi Prices in Delhi:
- Narela Mandi:
  - Wheat: ₹2300/quintal
  - Rice (Basmati): ₹4100/quintal
  - Masoor Dal: ₹6400/quintal
`,
      mumbai: `
Mandi Prices in Mumbai:
- Vashi (APMC) Mandi:
  - Wheat: ₹2400/quintal
  - Rice (Kolam): ₹3850/quintal
  - Tur (Arhar): ₹9300/quintal
  - Onions: ₹1500/quintal
`,
      kolkata: `
Mandi Prices in Kolkata:
- Posta Bazar:
  - Wheat: ₹2350/quintal
  - Rice (Sona Masuri): ₹3400/quintal
  - Jute: ₹5000/quintal
  - Masoor Dal: ₹6500/quintal
`,
      chennai: `
Mandi Prices in Chennai:
- Koyambedu Market:
  - Wheat: ₹2500/quintal
  - Rice (Ponni): ₹3600/quintal
  - Turmeric: ₹7000/quintal
  - Urad Dal: ₹8900/quintal
`,
      indore: `
Mandi Prices in Indore:
- Indore Mandi:
  - Soyabean: ₹4500/quintal
  - Wheat: ₹2100/quintal
  - Chana (Gram): ₹5000/quintal
  - Tur (Arhar): ₹9100/quintal
`,
      jaipur: `
Mandi Prices in Jaipur:
- Jaipur (Fruits & Vegetables) Mandi:
  - Mustard: ₹5500/quintal
  - Wheat: ₹2150/quintal
  - Guar Seed: ₹5200/quintal
  - Bajra: ₹2300/quintal
`,
       bengaluru: `
Mandi Prices in Bengaluru:
- Yeshwanthpur (APMC) Mandi:
  - Ragi: ₹3300/quintal
  - Rice (Sona Masuri): ₹3700/quintal
  - Tur Dal: ₹9600/quintal
  - Maize: ₹1900/quintal
`,
      kanpur: `
Mandi Prices in Kanpur:
- Kanpur (Anaj Mandi):
  - Wheat: ₹2180/quintal
  - Potato: ₹1200/quintal
  - Mustard: ₹5400/quintal
  - Urad Dal: ₹8700/quintal
`,
      patna: `
Mandi Prices in Patna:
- Patna (Bazar Samiti):
  - Rice (Sona Masuri): ₹3300/quintal
  - Maize: ₹1850/quintal
  - Lentils (Masur): ₹6200/quintal
  - Wheat: ₹2150/quintal
`,
      ahmedabad: `
Mandi Prices in Ahmedabad:
- Jamalpur (APMC):
  - Cotton: ₹6200/quintal
  - Groundnut: ₹5800/quintal
  - Cumin: ₹25000/quintal
  - Castor Seed: ₹5600/quintal
`,
      hyderabad: `
Mandi Prices in Hyderabad:
- Bowenpally Market:
  - Turmeric: ₹7200/quintal
  - Maize: ₹1950/quintal
  - Red Chilli: ₹15000/quintal
  - Cotton: ₹6250/quintal
`,
      amritsar: `
Mandi Prices in Amritsar:
- Amritsar Mandi:
    - Wheat: ₹2180/quintal
    - Rice (Basmati): ₹3850/quintal
    - Maize: ₹1800/quintal
`,
    jalandhar: `
Mandi Prices in Jalandhar:
- Jalandhar Mandi:
    - Potato: ₹1150/quintal
    - Wheat: ₹2190/quintal
    - Sugarcane: ₹370/quintal
`,
    patiala: `
Mandi Prices in Patiala:
- Patiala Mandi:
    - Rice (Basmati): ₹3450/quintal
    - Wheat: ₹2210/quintal
    - Sunflower: ₹4800/quintal
`,
    bathinda: `
Mandi Prices in Bathinda:
- Bathinda Mandi:
    - Cotton: ₹6050/quintal
    - Wheat: ₹2170/quintal
    - Guar: ₹5100/quintal
`,
    pune: `
Mandi Prices in Pune:
- Pune (APMC):
    - Sugarcane: ₹3050/quintal
    - Onion: ₹1450/quintal
    - Chana Dal: ₹5600/quintal
    - Jowar: ₹2800/quintal
`,
    nagpur: `
Mandi Prices in Nagpur:
- Nagpur Mandi:
    - Oranges: ₹4200/quintal
    - Soyabean: ₹4400/quintal
    - Cotton: ₹6100/quintal
`,
    thane: `
Mandi Prices in Thane:
- Thane Mandi:
    - Rice (Kolam): ₹3750/quintal
    - Vegetables (Mixed): ₹1550/quintal
    - Nachni (Ragi): ₹3400/quintal
`,
    nashik: `
Mandi Prices in Nashik:
- Nashik Mandi:
    - Grapes: ₹65/kg
    - Onion: ₹1400/quintal
    - Tomato: ₹1000/quintal
`,
    bhopal: `
Mandi Prices in Bhopal:
- Bhopal Mandi:
    - Soyabean: ₹4450/quintal
    - Wheat: ₹2080/quintal
    - Masoor Dal: ₹6250/quintal
    - Coriander: ₹6500/quintal
`,
    jabalpur: `
Mandi Prices in Jabalpur:
- Jabalpur Mandi:
    - Wheat: ₹2090/quintal
    - Rice (Sona Masuri): ₹3250/quintal
    - Chana (Gram): ₹4950/quintal
    - Peas: ₹2500/quintal
`,
    gwalior: `
Mandi Prices in Gwalior:
- Gwalior Mandi:
    - Mustard: ₹5400/quintal
    - Wheat: ₹2100/quintal
    - Paddy: ₹3100/quintal
`,
    ujjain: `
Mandi Prices in Ujjain:
- Ujjain Mandi:
    - Soyabean: ₹4520/quintal
    - Wheat: ₹2110/quintal
    - Garlic: ₹12000/quintal
`,
    jodhpur: `
Mandi Prices in Jodhpur:
- Jodhpur Mandi:
    - Mustard: ₹5450/quintal
    - Cumin: ₹27500/quintal
    - Guar Gum: ₹10500/quintal
`,
    kota: `
Mandi Prices in Kota:
- Kota Mandi:
    - Soyabean: ₹4480/quintal
    - Mustard: ₹5520/quintal
    - Urad Dal: ₹8600/quintal
    - Coriander: ₹6800/quintal
`,
    bikaner: `
Mandi Prices in Bikaner:
- Bikaner Mandi:
    - Groundnut: ₹5700/quintal
    - Mustard: ₹5480/quintal
    - Moth Dal: ₹6000/quintal
`,
    udaipur: `
Mandi Prices in Udaipur:
- Udaipur Mandi:
    - Maize: ₹1880/quintal
    - Wheat: ₹2160/quintal
    - Soyabean: ₹4400/quintal
`,
    mysuru: `
Mandi Prices in Mysuru:
- Mysuru Mandi:
    - Ragi: ₹3250/quintal
    - Silk Cocoon: ₹620/kg
    - Tur Dal: ₹9500/quintal
`,
    "hubballi-dharwad": `
Mandi Prices in Hubballi-Dharwad:
- Hubballi APMC:
    - Jowar: ₹2550/quintal
    - Cotton: ₹6150/quintal
    - Groundnut: ₹5800/quintal
`,
    mangaluru: `
Mandi Prices in Mangaluru:
- Mangaluru APMC:
    - Areca nut: ₹51000/quintal
    - Coconut: ₹2550/quintal
    - Cashew: ₹800/kg
`,
    belagavi: `
Mandi Prices in Belagavi:
- Belagavi APMC:
    - Sugarcane: ₹3000/quintal
    - Maize: ₹1890/quintal
    - Soyabean: ₹4450/quintal
`,
    coimbatore: `
Mandi Prices in Coimbatore:
- Coimbatore Mandi:
    - Cotton: ₹6350/quintal
    - Turmeric: ₹6900/quintal
    - Coconut: ₹2600/quintal
`,
    madurai: `
Mandi Prices in Madurai:
- Madurai Mandi:
    - Jasmine: ₹1100/kg
    - Paddy (IR20): ₹1850/quintal
    - Chilli: ₹16000/quintal
`,
    tiruchirappalli: `
Mandi Prices in Tiruchirappalli:
- Tiruchirappalli Mandi:
    - Banana: ₹1300/quintal
    - Paddy (ADT 45): ₹1860/quintal
    - Groundnut: ₹5900/quintal
`,
    salem: `
Mandi Prices in Salem:
- Salem Mandi:
    - Turmeric: ₹6950/quintal
    - Mango: ₹55/kg
    - Tapioca: ₹2000/quintal
`,
    asansol: `
Mandi Prices in Asansol:
- Asansol Mandi:
    - Potato: ₹1120/quintal
    - Rice: ₹3350/quintal
    - Mustard: ₹5500/quintal
`,
    siliguri: `
Mandi Prices in Siliguri:
- Siliguri Mandi:
    - Tea: ₹210/kg
    - Pineapple: ₹32/piece
    - Ginger: ₹7000/quintal
`,
    durgapur: `
Mandi Prices in Durgapur:
- Durgapur Mandi:
    - Rice: ₹3370/quintal
    - Potato: ₹1130/quintal
    - Jute: ₹5000/quintal
`,
    lucknow: `
Mandi Prices in Lucknow:
- Lucknow Mandi:
    - Wheat: ₹2180/quintal
    - Sugarcane: ₹350/quintal
    - Arhar Dal: ₹9200/quintal
    - Potato: ₹1250/quintal
`,
    ghaziabad: `
Mandi Prices in Ghaziabad:
- Ghaziabad Mandi:
    - Wheat: ₹2200/quintal
    - Sugarcane: ₹355/quintal
    - Rice (Basmati): ₹4000/quintal
`,
    agra: `
Mandi Prices in Agra:
- Agra Mandi:
    - Potato: ₹1180/quintal
    - Mustard: ₹5420/quintal
    - Wheat: ₹2160/quintal
`,
    varanasi: `
Mandi Prices in Varanasi:
- Varanasi Mandi:
    - Wheat: ₹2170/quintal
    - Rice (Samba): ₹3300/quintal
    - Peas: ₹2600/quintal
`,
    meerut: `
Mandi Prices in Meerut:
- Meerut Mandi:
    - Sugarcane: ₹360/quintal
    - Wheat: ₹2210/quintal
    - Urad Dal: ₹8800/quintal
`,
    surat: `
Mandi Prices in Surat:
- Surat APMC:
    - Sugarcane: ₹2950/quintal
    - Banana: ₹1250/quintal
    - Cotton: ₹6250/quintal
`,
    vadodara: `
Mandi Prices in Vadodara:
- Vadodara APMC:
    - Cotton: ₹6150/quintal
    - Tur (Arhar): ₹9100/quintal
    - Groundnut: ₹5800/quintal
`,
    rajkot: `
Mandi Prices in Rajkot:
- Rajkot APMC:
    - Groundnut: ₹5850/quintal
    - Cotton: ₹6220/quintal
    - Cumin: ₹25500/quintal
`,
    bhavnagar: `
Mandi Prices in Bhavnagar:
- Bhavnagar APMC:
    - Onion: ₹1420/quintal
    - Cotton: ₹6170/quintal
    - Groundnut: ₹5750/quintal
`,
    gaya: `
Mandi Prices in Gaya:
- Gaya Mandi:
    - Rice: ₹3280/quintal
    - Wheat: ₹2120/quintal
    - Lentils (Masur): ₹6150/quintal
`,
    bhagalpur: `
Mandi Prices in Bhagalpur:
- Bhagalpur Mandi:
    - Maize: ₹1830/quintal
    - Rice: ₹3330/quintal
    - Wheat: ₹2140/quintal
`,
    muzaffarpur: `
Mandi Prices in Muzaffarpur:
- Muzaffarpur Mandi:
    - Litchi: ₹110/kg
    - Rice: ₹3310/quintal
    - Maize: ₹1840/quintal
`,
    purnia: `
Mandi Prices in Purnia:
- Purnia Mandi:
    - Maize: ₹1840/quintal
    - Jute: ₹4950/quintal
    - Wheat: ₹2130/quintal
`,
    warangal: `
Mandi Prices in Warangal:
- Warangal Mandi:
    - Cotton: ₹6300/quintal
    - Chilli: ₹14200/quintal
    - Paddy: ₹1950/quintal
`,
    nizamabad: `
Mandi Prices in Nizamabad:
- Nizamabad Mandi:
    - Turmeric: ₹7250/quintal
    - Maize: ₹1960/quintal
    - Soyabean: ₹4500/quintal
`,
    karimnagar: `
Mandi Prices in Karimnagar:
- Karimnagar Mandi:
    - Paddy (BPT 5204): ₹1920/quintal
    - Maize: ₹1970/quintal
    - Cotton: ₹6280/quintal
`
    };

    if (prices[lowerCity]) {
      return prices[lowerCity];
    }
    
    return `Sorry, I could not find mandi prices for ${city}. I am constantly expanding my data coverage.`;
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
  output: {schema: AnswerFarmerQuestionOutputSchema},
  tools: [analyzeCropIssue, getMandiPrices, getWeather],
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
The farmer is from '{{city}}'. If the question is about market prices, crop rates, or selling produce, use the 'getMandiPrices' tool with the farmer's city to provide local market information. If the question is about weather, use the 'getWeather' tool.
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

    
