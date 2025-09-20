
"use client";

import { useState, useEffect, useContext } from "react";
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
import { TrendingUp, MapPin } from "lucide-react";
import { answerFarmerQuestion } from "@/ai/flows/answer-farmer-question";
import { predictCropPrices } from "@/ai/flows/predict-crop-prices";
import { Badge } from "@/components/ui/badge";
import type { PriceRecord, PricePrediction } from "@/ai/types";
import { Spinner } from "@/components/ui/spinner";
import { useNotifications } from "@/context/notification-context";
import { useTranslation } from "@/hooks/use-translation";


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
  const [isAllIndia, setIsAllIndia] = useState(false);
  const { t } = useTranslation();

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
    } else {
        // Default to all India if no profile
        fetchPrices(null);
    }
  }, []);

  const fetchPrices = async (city: string | null) => {
    setIsLoading(true);
    setIsPredicting(false);
    setPrices(null);
    setError(null);
    setIsAllIndia(city === null);

    const locationForRequest = city === 'all' ? null : city;
    const locationName = locationForRequest || t.market.allIndia;

    try {
      // 1. Fetch current prices
      const response = await answerFarmerQuestion({
        question: `Get prices for ${locationForRequest || 'India'}`,
        city: locationForRequest || undefined,
        returnJson: true,
      });
      
      let currentPrices: PriceRecord[] = [];
      if (response.priceData && response.priceData.length > 0) {
        currentPrices = response.priceData;
        setPrices(currentPrices); // Show current prices immediately
         addNotification({
          title: t.market.notification.updated,
          description: t.market.notification.loaded(locationName),
        });
      } else if (response.answer === 'NO_DATA_FOUND') {
        setError(`No market data could be found for ${locationName}.`);
        setPrices([]);
        setIsLoading(false);
        return;
      } else {
        setError(`Failed to fetch market data for ${locationName}.`);
        setIsLoading(false);
        return;
      }
      setIsLoading(false);

      // 2. Fetch AI predictions (only for single city view)
      if(currentPrices.length > 0 && locationForRequest) {
        setIsPredicting(true);
        try {
          const predictionResponse = await predictCropPrices({
            city: locationForRequest,
            prices: currentPrices,
          });

          if (predictionResponse && predictionResponse.predictions) {
            // Merge predictions with current prices
            const combinedData = currentPrices.map(p => {
              const prediction = predictionResponse.predictions.find(pred => pred.commodity === p.commodity);
              return { ...p, ...prediction };
            });
            setPrices(combinedData);
          }
        } catch (predError) {
          console.error("AI Prediction Error:", predError);
          // Don't set a page-level error, just log it. The user will still see the live prices.
        } finally {
            setIsPredicting(false);
        }
      }
      
    } catch (e) {
      console.error(e);
      setError(`Failed to fetch market data for ${locationName}.`);
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
    if (value === 'all') {
        fetchPrices(null);
    } else {
        fetchPrices(value);
    }
  };
  
  const getSuggestionBadge = (suggestion?: string) => {
    if (!suggestion) return null;
    switch (suggestion) {
      case 'Sell':
        return <Badge variant="destructive">{t.market.suggestion.sell}</Badge>;
      case 'Hold/Buy':
        return <Badge className="bg-green-600 text-white">{t.market.suggestion.holdBuy}</Badge>;
      case 'Hold':
        return <Badge variant="secondary">{t.market.suggestion.hold}</Badge>;
      default:
        return null;
    }
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">{t.market.title}</h1>
        <p className="text-muted-foreground">
          {t.market.description}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.market.locationTitle}</CardTitle>
          <CardDescription>
            {t.market.locationDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select onValueChange={handleStateChange} value={selectedState}>
            <SelectTrigger>
              <SelectValue placeholder={t.market.statePlaceholder} />
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
              <SelectValue placeholder={t.market.cityPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.market.allIndia}</SelectItem>
              {availableCities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {(selectedCity || isAllIndia) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <TrendingUp className="h-6 w-6 text-primary" /> {t.market.pricesFor(selectedCity === 'all' || isAllIndia ? t.market.allIndia : selectedCity)}
            </CardTitle>
            <CardDescription>
              {t.market.pricesDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex justify-center items-center py-8">
                <Spinner className="h-8 w-8 text-primary" />
                <p className="ml-2 text-muted-foreground">{t.market.fetching}</p>
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
                    <TableHead>{t.market.table.crop}</TableHead>
                    {isAllIndia && <TableHead>{t.market.table.market}</TableHead>}
                    <TableHead className="text-right">{t.market.table.currentPrice}</TableHead>
                    {!isAllIndia && <TableHead className="text-right">{t.market.table.next2Weeks}</TableHead>}
                    {!isAllIndia && <TableHead className="text-right">{t.market.table.aiSuggestion}</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prices.map((crop, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{crop.commodity}</TableCell>
                      {isAllIndia && <TableCell><div className="flex items-center gap-1.5 text-muted-foreground"><MapPin className="h-3 w-3"/>{crop.market}</div></TableCell>}
                      <TableCell className="text-right font-bold">
                        {parseInt(crop.modal_price).toLocaleString("en-IN")}
                      </TableCell>
                      {!isAllIndia && (
                        <>
                           <TableCell className="text-right">
                            {crop.nextTwoWeeksPrice ? (
                               <div className="flex items-center justify-end gap-2">
                                {crop.nextTwoWeeksPrice.toLocaleString("en-IN")}
                               </div>
                            ) : isPredicting ? <div className="flex justify-end"><Spinner className="h-4 w-4 animate-spin" /></div> : <span className="text-muted-foreground">-</span>}
                          </TableCell>
                           <TableCell className="text-right">
                            {crop.suggestion ? getSuggestionBadge(crop.suggestion) : isPredicting ? <div className="flex justify-end"><Spinner className="h-4 w-4 animate-spin" /></div> : <span className="text-muted-foreground">-</span> }
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
             {!isLoading && !error && prices?.length === 0 && (
               <div className="text-center py-8 text-muted-foreground">
                <p>{t.market.error.noPriceData(selectedCity === 'all' || isAllIndia ? t.market.allIndia : selectedCity)}</p>
              </div>
            )}
             {!isLoading && !error && !prices && !isLoading && (
               <div className="text-center py-8 text-muted-foreground">
                <p>{t.market.error.selectCity}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

    