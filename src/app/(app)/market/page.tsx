
"use client";

import { useState, useEffect, useContext } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { TrendingUp, MapPin, KeyRound, Leaf, Lightbulb, ShoppingCart, Award, Building, Phone, MessageSquare, Briefcase } from "lucide-react";
import { answerFarmerQuestion } from "@/ai/flows/answer-farmer-question";
import { predictCropPrices } from "@/ai/flows/predict-crop-prices";
import { Badge } from "@/components/ui/badge";
import type { PriceRecord, PricePrediction } from "@/ai/types";
import { Spinner } from "@/components/ui/spinner";
import { useNotifications } from "@/context/notification-context";
import { useTranslation } from "@/hooks/use-translation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getGroup, createGroup } from "@/lib/firebase/groups";
import type { UserProfile } from "@/lib/firebase/users";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


type CombinedPriceData = PriceRecord & Partial<PricePrediction>;

const strategyCards = [
    {
        icon: Leaf,
        title: "Start Small, Grow Big",
        description: "Begin with a small, manageable plot of land. This allows you to learn the process, understand your soil, and minimize risks before scaling up your operations.",
    },
    {
        icon: Lightbulb,
        title: "Diversify Your Crops",
        description: "Don't put all your eggs in one basket. Planting a variety of crops can protect you from the price volatility of a single commodity and reduce the risk of total crop failure due to pests or disease.",
    },
    {
        icon: ShoppingCart,
        title: "Target Local Markets (Mandis)",
        description: "Initially, focus on selling your produce at the nearest local markets. This reduces transportation costs and helps you build relationships with local traders and buyers.",
    },
    {
        icon: Award,
        title: "Value Addition",
        description: "Increase your profit margins by processing your produce. For example, instead of selling raw tomatoes, you could make and sell pickles, sauces, or dried tomatoes.",
    },
];

const buyerData = [
    {
        id: 'buyer-1',
        name: "Punjab Agro Traders",
        avatar: "https://picsum.photos/seed/trader-1/80/80",
        type: "Wholesaler",
        location: "Ludhiana",
        contact: "+919876512345",
        crops: ["Wheat", "Rice", "Maize"],
    },
    {
        id: 'buyer-2',
        name: "Veggie Exports Inc.",
        avatar: "https://picsum.photos/seed/trader-2/80/80",
        type: "Exporter",
        location: "Chandigarh",
        contact: "+919123456789",
        crops: ["Tomato", "Potato", "Onion", "Chilli"],
    },
    {
        id: 'buyer-3',
        name: "Desai & Sons",
        avatar: "https://picsum.photos/seed/trader-3/80/80",
        type: "Wholesaler",
        location: "Pune",
        contact: "+919988776655",
        crops: ["Onion", "Sugarcane", "Grapes"],
    },
    {
        id: 'buyer-4',
        name: "National Food Processors",
        avatar: "https://picsum.photos/seed/trader-4/80/80",
        type: "Food Processor",
        location: "Nagpur",
        contact: "+919112233445",
        crops: ["Orange", "Soybean", "Cotton"],
    }
]


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
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      setUserProfile(parsedProfile);
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

  const fetchPrices = async (city: string | null) => {
    setIsLoading(true);
    setIsPredicting(false);
    setPrices(null);
    setError(null);
    setIsAllIndia(city === null);

    const locationForRequest = city;
    if (!locationForRequest) {
        setIsLoading(false);
        return;
    }
    const locationName = locationForRequest;

    try {
      // 1. Fetch current prices
      const response = await answerFarmerQuestion({
        question: `Get prices for ${locationForRequest}`,
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
        setError(t.market.error.noData(locationName));
        setPrices([]);
        setIsLoading(false);
        return;
      } else if (response.answer === 'API_KEY_MISSING') {
        setError('API_KEY_MISSING');
        setPrices([]);
        setIsLoading(false);
        return;
      }
      else {
        setError(t.market.error.fetchFailed(locationName));
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
      setError(t.market.error.fetchFailed(locationName));
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
        return <Badge variant="destructive">{t.market.suggestion.sell}</Badge>;
      case 'Hold/Buy':
        return <Badge className="bg-green-600 text-white">{t.market.suggestion.holdBuy}</Badge>;
      case 'Hold':
        return <Badge variant="secondary">{t.market.suggestion.hold}</Badge>;
      default:
        return null;
    }
  };

  const handleChat = (buyer: (typeof buyerData)[0]) => {
      if (!userProfile) {
          return;
      }

      const dmGroupId = `dm-${userProfile.farmerId}-${buyer.id}`;
      const existingDm = getGroup(dmGroupId);

      if (existingDm) {
          router.push(`/community/${dmGroupId}`);
          return;
      }

      const newDmGroup = createGroup({
          id: dmGroupId,
          name: `Chat with ${buyer.name}`,
          description: `Direct message channel between ${userProfile.name} and ${buyer.name}.`,
          city: userProfile.city,
          ownerId: userProfile.farmerId,
          members: [userProfile.farmerId, buyer.id],
          createdBy: userProfile.name,
          avatarUrl: buyer.avatar,
      });

      router.push(`/community/${newDmGroup.id}`);
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">{t.market.title}</h1>
        <p className="text-muted-foreground">
          {t.market.description}
        </p>
      </div>

       <Tabs defaultValue="prices" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="prices">Live Prices</TabsTrigger>
                <TabsTrigger value="strategy">Market Strategy</TabsTrigger>
            </TabsList>
            <TabsContent value="prices" className="pt-4 space-y-6">
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
                        {availableCities.map((city) => (
                            <SelectItem key={city} value={city}>
                            {city}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    </CardContent>
                </Card>

                {(selectedCity) && (
                    <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline">
                        <TrendingUp className="h-6 w-6 text-primary" /> {t.market.pricesFor(selectedCity)}
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
                        {error && error === 'API_KEY_MISSING' ? (
                            <Alert variant="destructive">
                                <KeyRound className="h-4 w-4" />
                                <AlertTitle>{t.market.error.apiKeyTitle}</AlertTitle>
                                <AlertDescription>
                                    {t.market.error.apiKeyDesc}
                                    <pre className="mt-2 rounded-md bg-muted p-2 text-xs">GOV_DATA_API_KEY=YOUR_API_KEY_HERE</pre>
                                </AlertDescription>
                            </Alert>
                        ) : error && (
                        <div className="text-center py-8 text-destructive">
                            <p>{error}</p>
                        </div>
                        )}
                        {!isLoading && !error && prices && prices.length > 0 && (
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead>{t.market.table.crop}</TableHead>
                                <TableHead className="text-right">{t.market.table.currentPrice}</TableHead>
                                <TableHead className="text-right">{t.market.table.next2Weeks}</TableHead>
                                <TableHead className="text-right">{t.market.table.aiSuggestion}</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {prices.map((crop, index) => (
                                <TableRow key={index}>
                                <TableCell className="font-medium">{crop.commodity}</TableCell>
                                <TableCell className="text-right font-bold">
                                    {parseInt(crop.modal_price).toLocaleString("en-IN")}
                                </TableCell>
                                
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
                                
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                        )}
                        {!isLoading && !error && prices?.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>{t.market.error.noPriceData(selectedCity)}</p>
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
            </TabsContent>
            <TabsContent value="strategy" className="pt-4 space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Find Top Buyers</CardTitle>
                        <CardDescription>Connect directly with wholesalers, exporters, and food processors.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        {buyerData.map((buyer) => (
                            <Card key={buyer.id}>
                                <CardHeader className="flex flex-row items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={buyer.avatar} />
                                        <AvatarFallback>{buyer.name.substring(0,2)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">{buyer.name}</CardTitle>
                                        <p className="text-sm text-muted-foreground">{buyer.type} - {buyer.location}</p>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm font-semibold mb-2">Interested in:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {buyer.crops.map(crop => <Badge key={crop} variant="secondary">{crop}</Badge>)}
                                    </div>
                                </CardContent>
                                <CardFooter className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" asChild>
                                        <a href={`tel:${buyer.contact}`}>
                                            <Phone className="mr-2 h-4 w-4" /> Call
                                        </a>
                                    </Button>
                                    <Button onClick={() => handleChat(buyer)}>
                                        <MessageSquare className="mr-2 h-4 w-4"/> Chat
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
