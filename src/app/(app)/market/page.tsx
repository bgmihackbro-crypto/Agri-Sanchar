
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
import { TrendingUp, Sparkles } from "lucide-react";
import { answerFarmerQuestion } from "@/ai/flows/answer-farmer-question";
import { predictCropPrices } from "@/ai/flows/predict-crop-prices";
import { Badge } from "@/components/ui/badge";
import type { PriceRecord, PricePrediction } from "@/ai/types";
import { Spinner } from "@/components/ui/spinner";
import { useNotifications } from "@/context/NotificationContext";

type CombinedPriceData = PriceRecord & Partial<PricePrediction>;

export default function MarketPricesPage() {
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [prices, setPrices] = useState<CombinedPriceData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotifications();

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
    setIsPredicting(false);
    setPrices(null);
    setError(null);

    try {
      // 1. Fetch current prices
      const response = await answerFarmerQuestion({
        question: `Get prices for ${city}`,
        city: city,
        returnJson: true,
      });
      
      let currentPrices: PriceRecord[] = [];
      if (response.priceData) {
        currentPrices = response.priceData;
        setPrices(currentPrices); // Show current prices immediately
        if (addNotification) {
            addNotification({
                id: Date.now(),
                type: 'mandi',
                icon: TrendingUp,
                text: `Live market prices for ${city} have been updated.`,
                time: new Date().toISOString(),
                iconColor: 'text-yellow-500',
            });
        }
      } else if (response.answer) {
        setError(response.answer);
        setPrices([]);
        setIsLoading(false);
        return;
      } else {
        setError(`No market data could be found for ${city}.`);
        setIsLoading(false);
        return;
      }
      setIsLoading(false);

      // 2. Fetch AI predictions
      if(currentPrices.length > 0) {
        setIsPredicting(true);
        const predictionResponse = await predictCropPrices({
          city,
          prices: currentPrices,
        });

        if (predictionResponse.predictions) {
          // Merge predictions with current prices
          const combinedData = currentPrices.map(p => {
            const prediction = predictionResponse.predictions.find(pred => pred.commodity === p.commodity);
            return { ...p, ...prediction };
          });
          setPrices(combinedData);
        }
        setIsPredicting(false);
      }
      
    } catch (e) {
      console.error(e);
      setError(`Failed to fetch market data for ${city}.`);
      setIsLoading(false);
      setIsPredicting(false);
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
  
  const getSuggestionBadge = (suggestion?: string) => {
    if (!suggestion) return null;
    switch (suggestion) {
      case 'Sell':
        return <Badge variant="destructive">Sell</Badge>;
      case 'Hold/Buy':
        return <Badge className="bg-green-600 text-white">Hold/Buy</Badge>;
      case 'Hold':
        return <Badge variant="secondary">Hold</Badge>;
      default:
        return null;
    }
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Live Market Prices</h1>
        <p className="text-muted-foreground">
          Track real-time crop prices with AI-powered suggestions.
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
              Live prices from local mandis (All prices per quintal). AI suggestions may take a moment to load.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex justify-center items-center py-8">
                <Spinner className="h-8 w-8 text-primary" />
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
                    <TableHead className="text-right">Next 2 Weeks (AI Est.)</TableHead>
                    <TableHead className="text-right">AI Suggestion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prices.map((crop, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{crop.commodity}</TableCell>
                      <TableCell className="text-right font-bold">
                        {parseInt(crop.modal_price).toLocaleString("en-IN")}
                      </TableCell>
                       <TableCell className="text-right">
                        {crop.nextTwoWeeksPrice ? (
                           <div className="flex items-center justify-end gap-2">
                             <Sparkles className="h-4 w-4 text-primary/70" />
                            {crop.nextTwoWeeksPrice.toLocaleString("en-IN")}
                           </div>
                        ) : isPredicting ? <div className="flex justify-end"><Spinner className="h-4 w-4 animate-spin" /></div> : null}
                      </TableCell>
                       <TableCell className="text-right">
                        {crop.suggestion ? getSuggestionBadge(crop.suggestion) : isPredicting ? <div className="flex justify-end"><Spinner className="h-4 w-4 animate-spin" /></div> : null }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
             {!isLoading && !error && prices?.length === 0 && (
               <div className="text-center py-8 text-muted-foreground">
                <p>No price data found for {selectedCity}. It may not be a major market or data is temporarily unavailable.</p>
              </div>
            )}
             {!isLoading && !error && !prices && !isLoading && (
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
