
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { indianStates } from "@/lib/indian-states";
import { indianCities } from "@/lib/indian-cities";
import { ArrowDown, ArrowUp, Minus, TrendingUp } from "lucide-react";

type CropPrice = {
  name: string;
  lastTwoWeeks: number;
  current: number;
  nextTwoWeeks: number;
};

const marketData: { [city: string]: CropPrice[] } = {
  ludhiana: [
    { name: "Wheat", lastTwoWeeks: 2150, current: 2200, nextTwoWeeks: 2250 },
    { name: "Rice", lastTwoWeeks: 3550, current: 3500, nextTwoWeeks: 3450 },
    { name: "Cotton", lastTwoWeeks: 6000, current: 6100, nextTwoWeeks: 6150 },
    { name: "Maize", lastTwoWeeks: 1800, current: 1820, nextTwoWeeks: 1850 },
  ],
  delhi: [
    { name: "Wheat", lastTwoWeeks: 2250, current: 2300, nextTwoWeeks: 2320 },
    { name: "Rice (Basmati)", lastTwoWeeks: 4000, current: 4100, nextTwoWeeks: 4150 },
  ],
  mumbai: [
     { name: "Wheat", lastTwoWeeks: 2380, current: 2400, nextTwoWeeks: 2450 },
     { name: "Rice (Kolam)", lastTwoWeeks: 3800, current: 3850, nextTwoWeeks: 3880 },
  ],
};

const PriceChangeIndicator = ({ change }: { change: number }) => {
  if (change > 0) return <ArrowUp className="h-4 w-4 text-green-500" />;
  if (change < 0) return <ArrowDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-gray-500" />;
};

export default function MarketPricesPage() {
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [prices, setPrices] = useState<CropPrice[] | null>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      if (parsedProfile.state) {
        setSelectedState(parsedProfile.state);
        setAvailableCities(indianCities[parsedProfile.state] || []);
        if (parsedProfile.city) {
          setSelectedCity(parsedProfile.city);
          setPrices(marketData[parsedProfile.city.toLowerCase()] || null);
        }
      }
    }
  }, []);

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setSelectedCity("");
    setAvailableCities(indianCities[value] || []);
    setPrices(null);
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    setPrices(marketData[value.toLowerCase()] || null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Market Prices</h1>
        <p className="text-muted-foreground">
          Track crop prices in your area and plan your sales.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Your Location</CardTitle>
          <CardDescription>
            Choose your state and city to see local mandi prices.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select onValueChange={handleStateChange} value={selectedState}>
            <SelectTrigger>
              <SelectValue placeholder="Select a State" />
            </SelectTrigger>
            <SelectContent>
              {indianStates.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            onValueChange={handleCityChange}
            value={selectedCity}
            disabled={!selectedState}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a City" />
            </SelectTrigger>
            <SelectContent>
              {availableCities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedCity && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <TrendingUp className="h-6 w-6 text-primary" /> Price Trends for {selectedCity}
            </CardTitle>
            <CardDescription>
              All prices are per quintal (100 kg).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {prices ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Crop</TableHead>
                    <TableHead className="text-right">Last 2 Weeks (₹)</TableHead>
                    <TableHead className="text-right">Current (₹)</TableHead>
                    <TableHead className="text-right">Next 2 Weeks (₹)</TableHead>
                    <TableHead className="text-center">Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prices.map((crop) => (
                    <TableRow key={crop.name}>
                      <TableCell className="font-medium">{crop.name}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {crop.lastTwoWeeks.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {crop.current.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right text-primary">
                        {crop.nextTwoWeeks.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="flex justify-center">
                        <PriceChangeIndicator change={crop.nextTwoWeeks - crop.current} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
               <div className="text-center py-8 text-muted-foreground">
                <p>Sorry, no market data available for {selectedCity}.</p>
                 <p className="text-sm">We currently have data for Ludhiana, Delhi, and Mumbai.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
