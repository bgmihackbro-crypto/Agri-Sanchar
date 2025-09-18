'use server';
/**
 * @fileOverview A Genkit flow that fetches real-time weather data.
 *
 * - getWeatherForecast - Fetches a 7-day forecast for a given city.
 * - WeatherForecastInput - The input type for the flow.
 * - WeatherForecastOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import {
  WeatherForecastInputSchema,
  WeatherForecastOutputSchema,
  type WeatherForecastInput,
  type WeatherForecastOutput,
} from '@/ai/types';
import { z } from 'zod';

// ---------- Flow ----------

export async function getWeatherForecast(
  input: WeatherForecastInput
): Promise<WeatherForecastOutput> {
  return getWeatherForecastFlow(input);
}

const getWeatherForecastFlow = ai.defineFlow(
  {
    name: 'getWeatherForecastFlow',
    inputSchema: WeatherForecastInputSchema,
    outputSchema: WeatherForecastOutputSchema,
  },
  async ({ city }) => {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      return { error: 'The weather service is not configured. Please add an API key.' };
    }

    try {
      // 1. Get coordinates for the city
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
        city
      )},IN&limit=1&appid=${apiKey}`;
      const geoResponse = await fetch(geoUrl);
      if (!geoResponse.ok) throw new Error('Failed to fetch coordinates.');
      const geoData = await geoResponse.json();
      if (geoData.length === 0) {
        return { error: `Could not find weather data for ${city}.` };
      }
      const { lat, lon } = geoData[0];

      // 2. Get 7-day forecast using coordinates
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
      const forecastResponse = await fetch(forecastUrl);
      if (!forecastResponse.ok) throw new Error('Failed to fetch forecast.');
      const forecastData = await forecastResponse.json();
      
      // Process data for the UI
      const dailyForecasts: z.infer<typeof WeatherForecastOutputSchema.shape.daily.element>[] = [];
      const weeklyForecasts: z.infer<typeof WeatherForecastOutputSchema.shape.weekly.element>[] = [];

      // Create daily forecast (next 4 timestamps)
      for (let i = 0; i < 4 && i < forecastData.list.length; i++) {
         const item = forecastData.list[i];
         const date = new Date(item.dt * 1000);
         dailyForecasts.push({
             time: date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
             temp: `${Math.round(item.main.temp)}°C`,
             condition: item.weather[0].main,
         });
      }

      // Create weekly forecast (one per day for 7 days)
      const dailyData: { [key: string]: any } = {};
      forecastData.list.forEach((item: any) => {
          const day = new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
          if (!dailyData[day]) {
              dailyData[day] = item;
          }
      });
      
      const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      let today = new Date().getDay();
      
      for(let i=0; i<7; i++){
          const dayOfWeek = weekdays[(today + i) % 7];
          const item = Object.values(dailyData).find((d: any) => new Date(d.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }) === dayOfWeek);

          if (item) {
              weeklyForecasts.push({
                  day: i === 0 ? 'Today' : dayOfWeek,
                  temp: `${Math.round(item.main.temp_max)}°C`,
                  condition: item.weather[0].main,
              });
          }
      }

      return {
          daily: dailyForecasts,
          weekly: weeklyForecasts,
      };

    } catch (err: any) {
      console.error('Error fetching weather data:', err);
      return {
        error:
          'Sorry, there was a problem fetching the real-time weather data.',
      };
    }
  }
);
