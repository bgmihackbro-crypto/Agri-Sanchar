
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sun, CloudRain, CloudSun, Cloudy, Moon, Wind, Droplets, Thermometer, Haze, Sunrise, Sunset, Gauge } from "lucide-react";
import { useNotifications } from "@/context/notification-context";
import { getWeatherForecast } from "@/ai/flows/get-weather-forecast";
import { type WeatherForecastOutput } from "@/ai/types";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const ICONS: { [key: string]: React.ElementType } = {
    "sun": Sun,
    "rain": CloudRain,
    "clouds": Cloudy,
    "clear": Sun, 
    "haze": Haze,
    "smoke": Wind,
    "mist": Droplets,
    "drizzle": CloudRain,
    "snow": Thermometer, // Placeholder
    "thunderstorm": CloudRain, // Placeholder
    "default": CloudSun,
};

const getIcon = (condition: string): React.ElementType => {
    const lowerCaseCondition = condition.toLowerCase();
    for (const key in ICONS) {
        if (lowerCaseCondition.includes(key)) {
            return ICONS[key];
        }
    }
    return ICONS.default;
}

export default function WeatherPage() {
    const [city, setCity] = useState("Ludhiana");
    const [state, setState] = useState("Punjab");
    const [weatherData, setWeatherData] = useState<WeatherForecastOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addNotification } = useNotifications();


    useEffect(() => {
        const fetchWeatherData = async () => {
            setIsLoading(true);
            setError(null);
            
            let userCity = 'Ludhiana';
            let userState = 'Punjab';

            const savedProfile = localStorage.getItem("userProfile");
            if (savedProfile) {
                const parsedProfile = JSON.parse(savedProfile);
                userCity = parsedProfile.city || 'Ludhiana';
                userState = parsedProfile.state || 'Punjab';
            }
            
            setCity(userCity);
            setState(userState);

            try {
                const forecast = await getWeatherForecast({ city: userCity });

                if (forecast.error) {
                    setError(forecast.error);
                    addNotification({
                        title: "Weather Unavailable",
                        description: forecast.error,
                    });
                } else {
                    setWeatherData(forecast);
                    addNotification({
                        title: "Weather Alert",
                        description: `Forecast loaded for ${userCity}. Current condition: ${forecast.current?.condition || "N/A"}.`
                    });
                }
            } catch (e) {
                const errorMessage = "Failed to fetch weather data. Please try again later.";
                setError(errorMessage);
                 addNotification({
                    title: "Weather Error",
                    description: errorMessage
                });
                console.error(e);
            }
            setIsLoading(false);
        };

        fetchWeatherData();
    }, [addNotification]);


  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold font-headline">Weather Forecast</h1>
        <p className="text-muted-foreground">For {city}, {state}</p>
      </div>

       {isLoading && (
            <div className="flex justify-center items-center py-16">
                <Spinner className="h-10 w-10 text-primary" />
                <p className="ml-3 text-muted-foreground">Fetching live weather data...</p>
            </div>
        )}

        {error && !isLoading && (
            <Alert variant="destructive">
                <AlertTitle>Error Fetching Weather</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

      {!isLoading && !error && weatherData && (
          <>
          <Card>
            <CardHeader>
                <CardTitle>Current Conditions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-primary/5 border gap-2">
                    <p className="font-semibold text-primary/80">Real Feel</p>
                    <Thermometer className="w-10 h-10 text-primary"/>
                    <p className="text-2xl font-bold">{weatherData.current?.realFeel}</p>
                </div>
                <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-primary/5 border gap-2">
                    <p className="font-semibold text-primary/80">Humidity</p>
                    <Droplets className="w-10 h-10 text-primary"/>
                    <p className="text-2xl font-bold">{weatherData.current?.humidity}</p>
                </div>
                 <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-primary/5 border gap-2">
                    <p className="font-semibold text-primary/80">Wind</p>
                    <Wind className="w-10 h-10 text-primary"/>
                    <p className="text-2xl font-bold">{weatherData.current?.windSpeed}</p>
                </div>
                 <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-primary/5 border gap-2">
                    <p className="font-semibold text-primary/80">Pressure</p>
                    <Gauge className="w-10 h-10 text-primary"/>
                    <p className="text-lg font-bold">{weatherData.current?.pressure}</p>
                </div>
            </CardContent>
          </Card>


            <Tabs defaultValue="weekly" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-sm">
                <TabsTrigger value="daily">Today</TabsTrigger>
                <TabsTrigger value="weekly">7-Day</TabsTrigger>
                </TabsList>
                <TabsContent value="daily">
                <Card>
                    <CardHeader>
                    <CardTitle className="font-headline">Today's Forecast</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {weatherData.daily?.map((forecast) => {
                        const Icon = getIcon(forecast.condition);
                        return (
                            <div
                            key={forecast.time}
                            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-primary/5 border "
                            >
                            <p className="font-semibold text-primary/80">{forecast.time}</p>
                            <Icon className="w-12 h-12 text-primary" />
                            <p className="text-2xl font-bold">{forecast.temp}</p>
                            <p className="text-sm text-muted-foreground">
                                {forecast.condition}
                            </p>
                            </div>
                        )
                    })}
                    </CardContent>
                </Card>
                </TabsContent>
                <TabsContent value="weekly">
                <Card>
                    <CardHeader>
                    <CardTitle className="font-headline">7-Day Forecast</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                    {weatherData.weekly?.map((forecast) => {
                        const Icon = getIcon(forecast.condition);
                        return (
                            <div
                            key={forecast.day}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                            <p className="font-semibold basis-1/4">{forecast.day}</p>
                            <div className="flex items-center gap-2 basis-1/2 justify-center">
                                <Icon className="w-6 h-6 text-primary" />
                                <p className="text-muted-foreground">{forecast.condition}</p>
                            </div>
                            <p className="font-bold text-lg basis-1/4 text-right">
                                {forecast.temp}
                            </p>
                            </div>
                        )
                    })}
                    </CardContent>
                </Card>
                </TabsContent>
            </Tabs>
        </>
      )}

    </div>
  );
}
