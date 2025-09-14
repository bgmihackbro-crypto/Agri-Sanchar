import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sun, Cloud, CloudRain, CloudSun, Cloudy, Moon } from "lucide-react";

const dailyForecast = [
  { time: "Morning", temp: "18°C", condition: "Sunny", icon: Sun },
  { time: "Afternoon", temp: "25°C", condition: "Partly Cloudy", icon: CloudSun },
  { time: "Evening", temp: "20°C", condition: "Cloudy", icon: Cloud },
  { time: "Night", temp: "15°C", condition: "Clear", icon: Moon },
];

const weeklyForecast = [
  { day: "Today", temp: "25°C", condition: "Partly Cloudy", icon: CloudSun },
  { day: "Mon", temp: "26°C", condition: "Sunny", icon: Sun },
  { day: "Tue", temp: "24°C", condition: "Showers", icon: CloudRain },
  { day: "Wed", temp: "27°C", condition: "Sunny", icon: Sun },
  { day: "Thu", temp: "23°C", condition: "Cloudy", icon: Cloudy },
  { day: "Fri", temp: "22°C", condition: "Rain", icon: CloudRain },
  { day: "Sat", temp: "25°C", condition: "Partly Cloudy", icon: CloudSun },
];

export default function WeatherPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Weather Forecast</h1>
        <p className="text-muted-foreground">For Ludhiana, Punjab</p>
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
              {dailyForecast.map((forecast) => (
                <div
                  key={forecast.time}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-accent/10 border border-accent/20"
                >
                  <p className="font-semibold">{forecast.time}</p>
                  <forecast.icon className="w-12 h-12 text-accent" />
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
              {weeklyForecast.map((forecast) => (
                <div
                  key={forecast.day}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/10 transition-colors"
                >
                  <p className="font-semibold w-1/4">{forecast.day}</p>
                  <div className="flex items-center gap-2 w-1/2">
                    <forecast.icon className="w-6 h-6 text-accent" />
                    <p className="text-muted-foreground">{forecast.condition}</p>
                  </div>
                  <p className="font-bold text-lg w-1/4 text-right">
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
