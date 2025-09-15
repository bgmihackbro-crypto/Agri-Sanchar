
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
import { Loader2, TrendingUp } from "lucide-react";
import { answerFarmerQuestion } from "@/ai/flows/answer-farmer-question";


type PriceRecord = {
  commodity: string;
  modal_price: string;
};

// The PriceChangeIndicator and getSuggestion components are no longer needed
// as we are fetching live data that doesn't include trend/forecast info.
// They can be removed or adapted if a new data source provides this.

export default function MarketPricesPage() {
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [prices, setPrices] = useState<PriceRecord[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      if (parsedProfile.state) {
        const userState = parsedProfile.state;
        const userCity = parsedProfile.city;
        setSelectedState(userState);
        const cities = indianCities[userState] || [];
        setAvailableCities(cities);
        if (userCity && cities.includes(userCity)) {
          setSelectedCity(userCity);
          fetchPrices(userCity);
        }
      }
    }
  }, []);

  const fetchPrices = async (city: string) => {
    if (!city) return;
    setIsLoading(true);
    setPrices(null);
    setError(null);
    try {
       // We use the chatbot's flow to get the prices, ensuring a single source of truth.
      const response = await answerFarmerQuestion({
        question: `What are the current mandi prices in ${city}?`,
        city: city,
      });

      // This is a simple parser. A real implementation might need a more robust one
      // depending on the exact format from the LLM.
      const parsedPrices: PriceRecord[] = response.answer
        .split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => {
            // e.g., "- Wheat: ₹2200/quintal"
            const parts = line.split(':');
            const commodity = parts[0]?.replace('-', '').trim();
            const price = parts[1]?.split('/')[0]?.replace('₹', '').trim();
            return { commodity, modal_price: price };
        }).filter(p => p.commodity && p.modal_price);

      if (parsedPrices.length === 0) {
        // Check for common error messages from the flow
        if(response.answer.toLowerCase().includes('sorry') || response.answer.toLowerCase().includes('not find')){
           setError(response.answer);
        } else {
           setError(`No market data could be parsed for ${city}. The format might have changed.`);
        }
      } else {
        setPrices(parsedPrices);
      }
      
    } catch (e) {
      console.error(e);
      setError(`Failed to fetch market data for ${city}.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setSelectedCity("");
    const cities = indianCities[value] || [];
    setAvailableCities(cities);
    setPrices(null);
    setError(null);
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    fetchPrices(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Live Market Prices</h1>
        <p className="text-muted-foreground">
          Track real-time crop prices in your area.
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
            disabled={!selectedState || isLoading}
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
              <TrendingUp className="h-6 w-6 text-primary" /> Prices for {selectedCity}
            </CardTitle>
            <CardDescription>
              Live prices from local mandis (All prices per quintal).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Fetching live data...</p>
              </div>
            )}
            {error && (
              <div className="text-center py-8 text-destructive">
                <p>{error}</p>
              </div>
            )}
            {!isLoading && !error && prices && prices.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Crop</TableHead>
                    <TableHead className="text-right">Current Price (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prices.map((crop, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{crop.commodity}</TableCell>
                      <TableCell className="text-right font-bold">
                        {parseInt(crop.modal_price).toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
             {!isLoading && !error && (!prices || prices.length === 0) && (
               <div className="text-center py-8 text-muted-foreground">
                <p>Select a city to see prices.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
