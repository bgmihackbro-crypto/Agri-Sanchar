
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sun, CloudRain, CloudSun, Cloudy, Moon, Wind, Droplets } from "lucide-react";

type DailyForecast = {
  time: string;
  temp: string;
  condition: string;
  icon: React.ElementType;
};

type WeeklyForecast = {
  day: string;
  temp: string;
  condition: string;
  icon: React.ElementType;
};

type WeatherData = {
  daily: DailyForecast[];
  weekly: WeeklyForecast[];
};

const weatherDatabase: { [key: string]: WeatherData } = {
  ludhiana: {
    daily: [
      { time: "Morning", temp: "22°C", condition: "Hazy Sun", icon: CloudSun },
      { time: "Afternoon", temp: "28°C", condition: "Sunny", icon: Sun },
      { time: "Evening", temp: "24°C", condition: "Clear", icon: Moon },
      { time: "Night", temp: "19°C", condition: "Clear", icon: Moon },
    ],
    weekly: [
      { day: "Today", temp: "28°C", condition: "Sunny", icon: Sun },
      { day: "Mon", temp: "29°C", condition: "Sunny", icon: Sun },
      { day: "Tue", temp: "27°C", condition: "Showers", icon: CloudRain },
      { day: "Wed", temp: "30°C", condition: "Sunny", icon: Sun },
      { day: "Thu", temp: "28°C", condition: "Cloudy", icon: Cloudy },
      { day: "Fri", temp: "26°C", condition: "Rain", icon: CloudRain },
      { day: "Sat", temp: "29°C", condition: "Partly Cloudy", icon: CloudSun },
    ],
  },
  delhi: {
    daily: [
        { time: "Morning", temp: "25°C", condition: "Hazy", icon: CloudSun },
        { time: "Afternoon", temp: "32°C", condition: "Hazy Sun", icon: Sun },
        { time: "Evening", temp: "28°C", condition: "Clear", icon: Moon },
        { time: "Night", temp: "23°C", condition: "Clear", icon: Moon },
    ],
    weekly: [
      { day: "Today", temp: "32°C", condition: "Hazy Sun", icon: CloudSun },
      { day: "Mon", temp: "33°C", condition: "Sunny", icon: Sun },
      { day: "Tue", temp: "31°C", condition: "Hazy", icon: Cloudy },
      { day: "Wed", temp: "34°C", condition: "Sunny", icon: Sun },
      { day: "Thu", temp: "30°C", condition: "Cloudy", icon: Cloudy },
      { day: "Fri", temp: "29°C", condition: "Light Rain", icon: CloudRain },
      { day: "Sat", temp: "32°C", condition: "Sunny", icon: Sun },
    ],
  },
  indore: {
    daily: [
        { time: "Morning", temp: "23°C", condition: "Pleasant", icon: Sun },
        { time: "Afternoon", temp: "29°C", condition: "Sunny", icon: Sun },
        { time: "Evening", temp: "25°C", condition: "Clear", icon: Moon },
        { time: "Night", temp: "21°C", condition: "Clear", icon: Moon },
    ],
    weekly: [
      { day: "Today", temp: "29°C", condition: "Partly Cloudy", icon: CloudSun },
      { day: "Mon", temp: "30°C", condition: "Sunny", icon: Sun },
      { day: "Tue", temp: "28°C", condition: "Light Showers", icon: CloudRain },
      { day: "Wed", temp: "31°C", condition: "Sunny", icon: Sun },
      { day: "Thu", temp: "29°C", condition: "Cloudy", icon: Cloudy },
      { day: "Fri", temp: "27°C", condition: "Rain", icon: CloudRain },
      { day: "Sat", temp: "30°C", condition: "Partly Cloudy", icon: CloudSun },
    ],
  },
};


export default function WeatherPage() {
    const [city, setCity] = useState("Ludhiana");
    const [state, setState] = useState("Punjab");
    const [weatherData, setWeatherData] = useState<WeatherData>(weatherDatabase.ludhiana);

    useEffect(() => {
        const savedProfile = localStorage.getItem("userProfile");
        if (savedProfile) {
            const parsedProfile = JSON.parse(savedProfile);
            const userCity = parsedProfile.city?.toLowerCase() || 'ludhiana';
            const userState = parsedProfile.state || 'Punjab';
            const finalCity = parsedProfile.city || 'Ludhiana';

            setCity(finalCity);
            setState(userState);

            if (weatherDatabase[userCity]) {
                setWeatherData(weatherDatabase[userCity]);
            } else {
                // Default to Ludhiana if city not in our mock DB
                setWeatherData(weatherDatabase.ludhiana);
            }
        }
    }, []);


  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold font-headline">Weather Forecast</h1>
        <p className="text-muted-foreground">For {city}, {state}</p>
      </div>

      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-sm">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
        </TabsList>
        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Today's Forecast</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {weatherData.daily.map((forecast) => (
                <div
                  key={forecast.time}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-primary/5 border "
                >
                  <p className="font-semibold text-primary/80">{forecast.time}</p>
                  <forecast.icon className="w-12 h-12 text-primary" />
                  <p className="text-2xl font-bold">{forecast.temp}</p>
                  <p className="text-sm text-muted-foreground">
                    {forecast.condition}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">7-Day Forecast</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {weatherData.weekly.map((forecast) => (
                <div
                  key={forecast.day}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <p className="font-semibold basis-1/4">{forecast.day}</p>
                  <div className="flex items-center gap-2 basis-1/2 justify-center">
                    <forecast.icon className="w-6 h-6 text-primary" />
                    <p className="text-muted-foreground">{forecast.condition}</p>
                  </div>
                  <p className="font-bold text-lg basis-1/4 text-right">
                    {forecast.temp}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
