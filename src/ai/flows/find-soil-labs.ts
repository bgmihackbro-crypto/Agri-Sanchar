
'use server';
/**
 * @fileOverview Fetches soil testing laboratory data from data.gov.in.
 *
 * - findSoilLabs: A function that returns a list of labs for a given state/city.
 */

import { ai } from '@/ai/genkit';
import { SoilLab, SoilLabSchema } from '@/ai/types';
import { z } from 'zod';


const FindSoilLabsInputSchema = z.object({
    state: z.string(),
    city: z.string().optional(),
});
type FindSoilLabsInput = z.infer<typeof FindSoilLabsInputSchema>;

const FindSoilLabsOutputSchema = z.object({
    labs: z.array(SoilLabSchema),
    error: z.string().optional(),
});
type FindSoilLabsOutput = z.infer<typeof FindSoilLabsOutputSchema>;


export async function findSoilLabs(input: FindSoilLabsInput): Promise<FindSoilLabsOutput> {
  return findSoilLabsFlow(input);
}


const findSoilLabsFlow = ai.defineFlow(
  {
    name: 'findSoilLabsFlow',
    inputSchema: FindSoilLabsInputSchema,
    outputSchema: FindSoilLabsOutputSchema,
  },
  async ({ state, city }) => {
    const apiKey = process.env.GOV_DATA_API_KEY;
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      return { labs: [], error: 'The government data API is not configured. Please add an API key.' };
    }

    const filters = `filters[state_name]=${encodeURIComponent(state)}`;
    const cityFilter = city ? `&filters[district_name]=${encodeURIComponent(city)}` : '';
    const url = `https://api.data.gov.in/resource/20797314-5554-4f59-868a-b06216c478a5?api-key=${apiKey}&format=json&${filters}${cityFilter}&limit=100`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        const data = await response.json();
        
        if (!data.records || data.records.length === 0) {
            // If no labs found for city, try searching by state only as a fallback
            if (city) {
                 return findSoilLabsFlow({ state });
            }
            return { labs: [] };
        }

        const labs = data.records.map((rec: any) => ({
            id: rec.id.toString(),
            name: rec.lab_name,
            address: rec.address,
            city: rec.district_name,
            state: rec.state_name,
            phone: rec.contact_no,
        }));

        return { labs: labs };

    } catch (err: any) {
        console.error("Error fetching soil labs:", err);
        return { labs: [], error: "Sorry, I was unable to fetch the list of soil testing labs at this time." };
    }
  }
);
