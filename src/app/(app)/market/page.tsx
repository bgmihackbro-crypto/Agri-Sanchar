
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
import { Badge } from "@/components/ui/badge";

type CropPrice = {
  name: string;
  lastTwoWeeks: number;
  current: number;
  nextTwoWeeks: number;
};

const marketData: { [city: string]: CropPrice[] } = {
  // Punjab
  ludhiana: [
    { name: "Wheat", lastTwoWeeks: 2150, current: 2200, nextTwoWeeks: 2250 },
    { name: "Rice", lastTwoWeeks: 3550, current: 3500, nextTwoWeeks: 3450 },
    { name: "Cotton", lastTwoWeeks: 6000, current: 6100, nextTwoWeeks: 6150 },
    { name: "Maize", lastTwoWeeks: 1800, current: 1820, nextTwoWeeks: 1850 },
  ],
  amritsar: [
    { name: "Wheat", lastTwoWeeks: 2130, current: 2180, nextTwoWeeks: 2230 },
    { name: "Rice (Basmati)", lastTwoWeeks: 3800, current: 3850, nextTwoWeeks: 3900 },
  ],
  jalandhar: [
    { name: "Potato", lastTwoWeeks: 1100, current: 1150, nextTwoWeeks: 1200 },
    { name: "Wheat", lastTwoWeeks: 2140, current: 2190, nextTwoWeeks: 2240 },
  ],
  patiala: [
    { name: "Rice", lastTwoWeeks: 3500, current: 3450, nextTwoWeeks: 3400 },
    { name: "Wheat", lastTwoWeeks: 2160, current: 2210, nextTwoWeeks: 2260 },
  ],
  bathinda: [
    { name: "Cotton", lastTwoWeeks: 5950, current: 6050, nextTwoWeeks: 6100 },
    { name: "Wheat", lastTwoWeeks: 2120, current: 2170, nextTwoWeeks: 2220 },
  ],
  // Delhi
  delhi: [
    { name: "Wheat", lastTwoWeeks: 2250, current: 2300, nextTwoWeeks: 2320 },
    { name: "Rice (Basmati)", lastTwoWeeks: 4000, current: 4100, nextTwoWeeks: 4150 },
  ],
  "new delhi": [
    { name: "Wheat", lastTwoWeeks: 2250, current: 2300, nextTwoWeeks: 2320 },
    { name: "Rice (Basmati)", lastTwoWeeks: 4000, current: 4100, nextTwoWeeks: 4150 },
  ],
  // Maharashtra
  mumbai: [
     { name: "Wheat", lastTwoWeeks: 2380, current: 2400, nextTwoWeeks: 2450 },
     { name: "Rice (Kolam)", lastTwoWeeks: 3800, current: 3850, nextTwoWeeks: 3880 },
     { name: "Onions", lastTwoWeeks: 1450, current: 1500, nextTwoWeeks: 1550 },
  ],
  pune: [
     { name: "Sugarcane", lastTwoWeeks: 3000, current: 3050, nextTwoWeeks: 3100 },
     { name: "Onion", lastTwoWeeks: 1400, current: 1450, nextTwoWeeks: 1500 },
  ],
  nagpur: [
    { name: "Oranges", lastTwoWeeks: 4000, current: 4200, nextTwoWeeks: 4300 },
    { name: "Soyabean", lastTwoWeeks: 4300, current: 4400, nextTwoWeeks: 4450 },
  ],
  thane: [
    { name: "Rice", lastTwoWeeks: 3700, current: 3750, nextTwoWeeks: 3780 },
    { name: "Vegetables", lastTwoWeeks: 1500, current: 1550, nextTwoWeeks: 1600 },
  ],
  nashik: [
    { name: "Grapes", lastTwoWeeks: 60, current: 65, nextTwoWeeks: 70 }, // per kg
    { name: "Onion", lastTwoWeeks: 1350, current: 1400, nextTwoWeeks: 1450 },
  ],
  // Madhya Pradesh
  indore: [
    { name: "Soyabean", lastTwoWeeks: 4400, current: 4500, nextTwoWeeks: 4550 },
    { name: "Wheat", lastTwoWeeks: 2080, current: 2100, nextTwoWeeks: 2120 },
    { name: "Chana (Gram)", lastTwoWeeks: 4950, current: 5000, nextTwoWeeks: 5050 },
  ],
  bhopal: [
    { name: "Soyabean", lastTwoWeeks: 4350, current: 4450, nextTwoWeeks: 4500 },
    { name: "Wheat", lastTwoWeeks: 2050, current: 2080, nextTwoWeeks: 2100 },
  ],
  jabalpur: [
    { name: "Wheat", lastTwoWeeks: 2060, current: 2090, nextTwoWeeks: 2110 },
    { name: "Rice", lastTwoWeeks: 3200, current: 3250, nextTwoWeeks: 3280 },
  ],
  gwalior: [
    { name: "Mustard", lastTwoWeeks: 5300, current: 5400, nextTwoWeeks: 5450 },
    { name: "Wheat", lastTwoWeeks: 2070, current: 2100, nextTwoWeeks: 2130 },
  ],
  ujjain: [
    { name: "Soyabean", lastTwoWeeks: 4420, current: 4520, nextTwoWeeks: 4570 },
    { name: "Wheat", lastTwoWeeks: 2090, current: 2110, nextTwoWeeks: 2130 },
  ],
  // Rajasthan
  jaipur: [
    { name: "Mustard", lastTwoWeeks: 5400, current: 5500, nextTwoWeeks: 5550 },
    { name: "Wheat", lastTwoWeeks: 2120, current: 2150, nextTwoWeeks: 2170 },
    { name: "Guar Seed", lastTwoWeeks: 5100, current: 5200, nextTwoWeeks: 5250 },
  ],
  jodhpur: [
     { name: "Mustard", lastTwoWeeks: 5350, current: 5450, nextTwoWeeks: 5500 },
     { name: "Cumin", lastTwoWeeks: 27000, current: 27500, nextTwoWeeks: 28000 },
  ],
  kota: [
    { name: "Soyabean", lastTwoWeeks: 4380, current: 4480, nextTwoWeeks: 4520 },
    { name: "Mustard", lastTwoWeeks: 5420, current: 5520, nextTwoWeeks: 5570 },
  ],
  bikaner: [
    { name: "Groundnut", lastTwoWeeks: 5600, current: 5700, nextTwoWeeks: 5750 },
    { name: "Mustard", lastTwoWeeks: 5380, current: 5480, nextTwoWeeks: 5530 },
  ],
  udaipur: [
    { name: "Maize", lastTwoWeeks: 1850, current: 1880, nextTwoWeeks: 1900 },
    { name: "Wheat", lastTwoWeeks: 2130, current: 2160, nextTwoWeeks: 2180 },
  ],
  // Karnataka
  bengaluru: [
    { name: "Ragi", lastTwoWeeks: 3250, current: 3300, nextTwoWeeks: 3320 },
    { name: "Rice", lastTwoWeeks: 3650, current: 3700, nextTwoWeeks: 3750 },
    { name: "Maize", lastTwoWeeks: 1880, current: 1900, nextTwoWeeks: 1920 },
  ],
  mysuru: [
      { name: "Ragi", lastTwoWeeks: 3200, current: 3250, nextTwoWeeks: 3300 },
      { name: "Silk Cocoon", lastTwoWeeks: 600, current: 620, nextTwoWeeks: 630 }, // per kg
  ],
  "hubballi-dharwad": [
    { name: "Jowar", lastTwoWeeks: 2500, current: 2550, nextTwoWeeks: 2600 },
    { name: "Cotton", lastTwoWeeks: 6100, current: 6150, nextTwoWeeks: 6200 },
  ],
  mangaluru: [
    { name: "Areca nut", lastTwoWeeks: 50000, current: 51000, nextTwoWeeks: 51500 },
    { name: "Coconut", lastTwoWeeks: 2500, current: 2550, nextTwoWeeks: 2600 },
  ],
  belagavi: [
    { name: "Sugarcane", lastTwoWeeks: 2950, current: 3000, nextTwoWeeks: 3050 },
    { name: "Maize", lastTwoWeeks: 1870, current: 1890, nextTwoWeeks: 1910 },
  ],
  // Tamil Nadu
  chennai: [
    { name: "Rice (Ponni)", lastTwoWeeks: 3550, current: 3600, nextTwoWeeks: 3620 },
    { name: "Turmeric", lastTwoWeeks: 6900, current: 7000, nextTwoWeeks: 7100 },
  ],
  coimbatore: [
     { name: "Cotton", lastTwoWeeks: 6300, current: 6350, nextTwoWeeks: 6400 },
     { name: "Turmeric", lastTwoWeeks: 6800, current: 6900, nextTwoWeeks: 7000 },
  ],
   madurai: [
    { name: "Jasmine", lastTwoWeeks: 1000, current: 1100, nextTwoWeeks: 1150 }, // per kg
    { name: "Paddy", lastTwoWeeks: 1800, current: 1850, nextTwoWeeks: 1870 },
  ],
  tiruchirappalli: [
    { name: "Banana", lastTwoWeeks: 1250, current: 1300, nextTwoWeeks: 1350 },
    { name: "Paddy", lastTwoWeeks: 1820, current: 1860, nextTwoWeeks: 1880 },
  ],
  salem: [
    { name: "Turmeric", lastTwoWeeks: 6850, current: 6950, nextTwoWeeks: 7050 },
    { name: "Mango", lastTwoWeeks: 50, current: 55, nextTwoWeeks: 60 }, // per kg
  ],
  // West Bengal
  kolkata: [
    { name: "Jute", lastTwoWeeks: 4900, current: 5000, nextTwoWeeks: 5050 },
    { name: "Rice", lastTwoWeeks: 3350, current: 3400, nextTwoWeeks: 3420 },
  ],
  asansol: [
    { name: "Potato", lastTwoWeeks: 1100, current: 1120, nextTwoWeeks: 1150 },
    { name: "Rice", lastTwoWeeks: 3300, current: 3350, nextTwoWeeks: 3380 },
  ],
  siliguri: [
    { name: "Tea", lastTwoWeeks: 200, current: 210, nextTwoWeeks: 215 }, // per kg
    { name: "Pineapple", lastTwoWeeks: 30, current: 32, nextTwoWeeks: 35 }, // per piece
  ],
  durgapur: [
    { name: "Rice", lastTwoWeeks: 3320, current: 3370, nextTwoWeeks: 3400 },
    { name: "Potato", lastTwoWeeks: 1110, current: 1130, nextTwoWeeks: 1160 },
  ],
  // Uttar Pradesh
  lucknow: [
    { name: "Wheat", lastTwoWeeks: 2150, current: 2180, nextTwoWeeks: 2200 },
    { name: "Sugarcane", lastTwoWeeks: 340, current: 350, nextTwoWeeks: 355 },
  ],
  kanpur: [
    { name: "Wheat", lastTwoWeeks: 2160, current: 2180, nextTwoWeeks: 2210 },
    { name: "Potato", lastTwoWeeks: 1180, current: 1200, nextTwoWeeks: 1250 },
    { name: "Mustard", lastTwoWeeks: 5350, current: 5400, nextTwoWeeks: 5450 },
  ],
  ghaziabad: [
    { name: "Wheat", lastTwoWeeks: 2170, current: 2200, nextTwoWeeks: 2230 },
    { name: "Sugarcane", lastTwoWeeks: 345, current: 355, nextTwoWeeks: 360 },
  ],
  agra: [
    { name: "Potato", lastTwoWeeks: 1150, current: 1180, nextTwoWeeks: 1220 },
    { name: "Mustard", lastTwoWeeks: 5380, current: 5420, nextTwoWeeks: 5470 },
  ],
  varanasi: [
    { name: "Wheat", lastTwoWeeks: 2140, current: 2170, nextTwoWeeks: 2190 },
    { name: "Rice", lastTwoWeeks: 3250, current: 3300, nextTwoWeeks: 3320 },
  ],
  meerut: [
     { name: "Sugarcane", lastTwoWeeks: 350, current: 360, nextTwoWeeks: 365 },
     { name: "Wheat", lastTwoWeeks: 2180, current: 2210, nextTwoWeeks: 2240 },
  ],
  // Gujarat
  ahmedabad: [
    { name: "Cotton", lastTwoWeeks: 6150, current: 6200, nextTwoWeeks: 6250 },
    { name: "Groundnut", lastTwoWeeks: 5700, current: 5800, nextTwoWeeks: 5850 },
    { name: "Cumin", lastTwoWeeks: 24500, current: 25000, nextTwoWeeks: 25200 },
  ],
  surat: [
    { name: "Sugarcane", lastTwoWeeks: 2900, current: 2950, nextTwoWeeks: 3000 },
    { name: "Banana", lastTwoWeeks: 1200, current: 1250, nextTwoWeeks: 1300 },
  ],
  vadodara: [
    { name: "Cotton", lastTwoWeeks: 6100, current: 6150, nextTwoWeeks: 6200 },
    { name: "Tur", lastTwoWeeks: 9000, current: 9100, nextTwoWeeks: 9150 },
  ],
  rajkot: [
    { name: "Groundnut", lastTwoWeeks: 5750, current: 5850, nextTwoWeeks: 5900 },
    { name: "Cotton", lastTwoWeeks: 6180, current: 6220, nextTwoWeeks: 6270 },
  ],
  bhavnagar: [
    { name: "Onion", lastTwoWeeks: 1400, current: 1420, nextTwoWeeks: 1450 },
    { name: "Cotton", lastTwoWeeks: 6120, current: 6170, nextTwoWeeks: 6220 },
  ],
  // Bihar
  patna: [
    { name: "Rice", lastTwoWeeks: 3250, current: 3300, nextTwoWeeks: 3350 },
    { name: "Maize", lastTwoWeeks: 1820, current: 1850, nextTwoWeeks: 1870 },
    { name: "Lentils (Masur)", lastTwoWeeks: 6100, current: 6200, nextTwoWeeks: 6250 },
  ],
  gaya: [
    { name: "Rice", lastTwoWeeks: 3230, current: 3280, nextTwoWeeks: 3330 },
    { name: "Wheat", lastTwoWeeks: 2100, current: 2120, nextTwoWeeks: 2140 },
  ],
  bhagalpur: [
    { name: "Maize", lastTwoWeeks: 1800, current: 1830, nextTwoWeeks: 1850 },
    { name: "Rice", lastTwoWeeks: 3280, current: 3330, nextTwoWeeks: 3380 },
  ],
  muzaffarpur: [
    { name: "Litchi", lastTwoWeeks: 100, current: 110, nextTwoWeeks: 115 }, // per kg
    { name: "Rice", lastTwoWeeks: 3260, current: 3310, nextTwoWeeks: 3360 },
  ],
  purnia: [
    { name: "Maize", lastTwoWeeks: 1810, current: 1840, nextTwoWeeks: 1860 },
    { name: "Jute", lastTwoWeeks: 4850, current: 4950, nextTwoWeeks: 5000 },
  ],
  // Telangana
  hyderabad: [
    { name: "Cotton", lastTwoWeeks: 6200, current: 6250, nextTwoWeeks: 6300 },
    { name: "Maize", lastTwoWeeks: 1920, current: 1950, nextTwoWeeks: 1980 },
    { name: "Turmeric", lastTwoWeeks: 7100, current: 7200, nextTwoWeeks: 7250 },
  ],
  warangal: [
    { name: "Cotton", lastTwoWeeks: 6250, current: 6300, nextTwoWeeks: 6350 },
    { name: "Chilli", lastTwoWeeks: 14000, current: 14200, nextTwoWeeks: 14500 },
  ],
  nizamabad: [
    { name: "Turmeric", lastTwoWeeks: 7150, current: 7250, nextTwoWeeks: 7300 },
    { name: "Maize", lastTwoWeeks: 1930, current: 1960, nextTwoWeeks: 1990 },
  ],
  karimnagar: [
    { name: "Paddy", lastTwoWeeks: 1900, current: 1920, nextTwoWeeks: 1940 },
    { name: "Maize", lastTwoWeeks: 1940, current: 1970, nextTwoWeeks: 2000 },
  ]
};

const PriceChangeIndicator = ({ change }: { change: number }) => {
  if (change > 0) return <ArrowUp className="h-4 w-4 text-green-500" />;
  if (change < 0) return <ArrowDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-gray-500" />;
};

const getSuggestion = (current: number, next: number) => {
  if (next > current) {
    return <Badge className="bg-green-600 hover:bg-green-700 text-white">Hold/Buy</Badge>;
  }
  if (next < current) {
    return <Badge variant="destructive">Sell</Badge>;
  }
  return <Badge variant="secondary">Hold</Badge>;
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
        const cities = indianCities[parsedProfile.state] || [];
        setAvailableCities(cities);
        if (parsedProfile.city && cities.includes(parsedProfile.city)) {
          setSelectedCity(parsedProfile.city);
          setPrices(marketData[parsedProfile.city.toLowerCase()] || null);
        }
      }
    }
  }, []);

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setSelectedCity("");
    const cities = indianCities[value] || [];
    setAvailableCities(cities);
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
              All prices are per quintal (100 kg) unless otherwise noted.
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
                    <TableHead className="text-center">Suggestion</TableHead>
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
                       <TableCell className="text-center">
                        {getSuggestion(crop.current, crop.nextTwoWeeks)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
               <div className="text-center py-8 text-muted-foreground">
                <p>Sorry, no market data available for {selectedCity}.</p>
                 <p className="text-sm">We are actively working on expanding our coverage.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

    