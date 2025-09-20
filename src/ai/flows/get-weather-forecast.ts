
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
import { getFarmingTips } from './get-farming-tips';

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
  async ({ city, language }) => {
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

      // 2. Fetch both current weather and forecast data
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
      
      const [weatherResponse, forecastResponse] = await Promise.all([
          fetch(weatherUrl),
          fetch(forecastUrl),
      ]);

      if (!weatherResponse.ok) throw new Error('Failed to fetch current weather.');
      if (!forecastResponse.ok) throw new Error('Failed to fetch forecast.');
      
      const weatherData = await weatherResponse.json();
      const forecastData = await forecastResponse.json();
      const timezoneOffset = forecastData.city.timezone;
      
      // Process data for the UI
      const current = {
        temp: `${Math.round(weatherData.main.temp)}°C`,
        condition: weatherData.weather[0].main,
        realFeel: `${Math.round(weatherData.main.feels_like)}°C`,
        humidity: `${weatherData.main.humidity}%`,
        windSpeed: `${weatherData.wind.speed} m/s`,
        pressure: `${weatherData.main.pressure} hPa`,
      };

      const dailyForecasts: z.infer<typeof WeatherForecastOutputSchema.shape.daily.element>[] = [];
      const weeklyForecasts: z.infer<typeof WeatherForecastOutputSchema.shape.weekly.element>[] = [];

      // Create daily forecast (next 4 timestamps)
      for (let i = 0; i < 4 && i < forecastData.list.length; i++) {
         const item = forecastData.list[i];
         const date = new Date((item.dt + timezoneOffset) * 1000);
         dailyForecasts.push({
             time: date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true, timeZone: 'UTC' }),
             temp: `${Math.round(item.main.temp)}°C`,
             condition: item.weather[0].main,
         });
      }

      // Create weekly forecast (one per day for 7 days)
      const processedDays = new Set<string>();
      
      forecastData.list.forEach((item: any) => {
          const date = new Date(item.dt * 1000);
          const dayString = date.toISOString().split('T')[0]; // 'YYYY-MM-DD'

          if (!processedDays.has(dayString) && weeklyForecasts.length < 7) {
              processedDays.add(dayString);

              const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
              const today = new Date();
              today.setHours(0,0,0,0);
              const itemDate = new Date(date);
              itemDate.setHours(0,0,0,0);
              
              let dayLabel = dayOfWeek;
              if (itemDate.getTime() === today.getTime()) {
                  dayLabel = 'Today';
              }


              weeklyForecasts.push({
                  day: dayLabel,
                  temp: `${Math.round(item.main.temp_max)}°C`,
                  condition: item.weather[0].main,
              });
          }
      });

      // 3. Get AI farming tips
      const farmingTips = await getFarmingTips({ city, current, weekly: weeklyForecasts, language });

      return {
          current,
          daily: dailyForecasts,
          weekly: weeklyForecasts,
          farmingTips: farmingTips.tips,
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
