
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
    { name: "Rice (Basmati)", lastTwoWeeks: 3550, current: 3500, nextTwoWeeks: 3450 },
    { name: "Cotton", lastTwoWeeks: 6000, current: 6100, nextTwoWeeks: 6150 },
    { name: "Maize", lastTwoWeeks: 1800, current: 1820, nextTwoWeeks: 1850 },
  ],
  amritsar: [
    { name: "Wheat", lastTwoWeeks: 2130, current: 2180, nextTwoWeeks: 2230 },
    { name: "Rice (Basmati)", lastTwoWeeks: 3800, current: 3850, nextTwoWeeks: 3900 },
    { name: "Maize", lastTwoWeeks: 1780, current: 1800, nextTwoWeeks: 1810 },
  ],
  jalandhar: [
    { name: "Potato", lastTwoWeeks: 1100, current: 1150, nextTwoWeeks: 1200 },
    { name: "Wheat", lastTwoWeeks: 2140, current: 2190, nextTwoWeeks: 2240 },
    { name: "Sugarcane", lastTwoWeeks: 360, current: 370, nextTwoWeeks: 375 },
  ],
  patiala: [
    { name: "Rice (Basmati)", lastTwoWeeks: 3500, current: 3450, nextTwoWeeks: 3400 },
    { name: "Wheat", lastTwoWeeks: 2160, current: 2210, nextTwoWeeks: 2260 },
    { name: "Sunflower", lastTwoWeeks: 4700, current: 4800, nextTwoWeeks: 4850 },
  ],
  bathinda: [
    { name: "Cotton", lastTwoWeeks: 5950, current: 6050, nextTwoWeeks: 6100 },
    { name: "Wheat", lastTwoWeeks: 2120, current: 2170, nextTwoWeeks: 2220 },
    { name: "Guar", lastTwoWeeks: 5000, current: 5100, nextTwoWeeks: 5150 },
  ],
  // Delhi
  delhi: [
    { name: "Wheat", lastTwoWeeks: 2250, current: 2300, nextTwoWeeks: 2320 },
    { name: "Rice (Basmati)", lastTwoWeeks: 4000, current: 4100, nextTwoWeeks: 4150 },
    { name: "Masoor Dal", lastTwoWeeks: 6300, current: 6400, nextTwoWeeks: 6450 },
  ],
  "new delhi": [
    { name: "Wheat", lastTwoWeeks: 2250, current: 2300, nextTwoWeeks: 2320 },
    { name: "Rice (Basmati)", lastTwoWeeks: 4000, current: 4100, nextTwoWeeks: 4150 },
    { name: "Masoor Dal", lastTwoWeeks: 6300, current: 6400, nextTwoWeeks: 6450 },
  ],
  // Maharashtra
  mumbai: [
     { name: "Wheat", lastTwoWeeks: 2380, current: 2400, nextTwoWeeks: 2450 },
     { name: "Rice (Kolam)", lastTwoWeeks: 3800, current: 3850, nextTwoWeeks: 3880 },
     { name: "Tur (Arhar)", lastTwoWeeks: 9200, current: 9300, nextTwoWeeks: 9350 },
     { name: "Onions", lastTwoWeeks: 1450, current: 1500, nextTwoWeeks: 1550 },
  ],
  pune: [
     { name: "Sugarcane", lastTwoWeeks: 3000, current: 3050, nextTwoWeeks: 3100 },
     { name: "Onion", lastTwoWeeks: 1400, current: 1450, nextTwoWeeks: 1500 },
     { name: "Chana Dal", lastTwoWeeks: 5500, current: 5600, nextTwoWeeks: 5650 },
     { name: "Jowar", lastTwoWeeks: 2750, current: 2800, nextTwoWeeks: 2820 },
  ],
  nagpur: [
    { name: "Oranges", lastTwoWeeks: 4000, current: 4200, nextTwoWeeks: 4300 },
    { name: "Soyabean", lastTwoWeeks: 4300, current: 4400, nextTwoWeeks: 4450 },
    { name: "Cotton", lastTwoWeeks: 6000, current: 6100, nextTwoWeeks: 6120 },
  ],
  thane: [
    { name: "Rice (Kolam)", lastTwoWeeks: 3700, current: 3750, nextTwoWeeks: 3780 },
    { name: "Vegetables (Mixed)", lastTwoWeeks: 1500, current: 1550, nextTwoWeeks: 1600 },
    { name: "Nachni (Ragi)", lastTwoWeeks: 3300, current: 3400, nextTwoWeeks: 3450 },
  ],
  nashik: [
    { name: "Grapes", lastTwoWeeks: 60, current: 65, nextTwoWeeks: 70 }, // per kg
    { name: "Onion", lastTwoWeeks: 1350, current: 1400, nextTwoWeeks: 1450 },
    { name: "Tomato", lastTwoWeeks: 900, current: 1000, nextTwoWeeks: 1050 },
  ],
  // Madhya Pradesh
  indore: [
    { name: "Soyabean", lastTwoWeeks: 4400, current: 4500, nextTwoWeeks: 4550 },
    { name: "Wheat", lastTwoWeeks: 2080, current: 2100, nextTwoWeeks: 2120 },
    { name: "Chana (Gram)", lastTwoWeeks: 4950, current: 5000, nextTwoWeeks: 5050 },
    { name: "Tur (Arhar)", lastTwoWeeks: 9000, current: 9100, nextTwoWeeks: 9150 },
  ],
  bhopal: [
    { name: "Soyabean", lastTwoWeeks: 4350, current: 4450, nextTwoWeeks: 4500 },
    { name: "Wheat", lastTwoWeeks: 2050, current: 2080, nextTwoWeeks: 2100 },
    { name: "Masoor Dal", lastTwoWeeks: 6200, current: 6250, nextTwoWeeks: 6300 },
    { name: "Coriander", lastTwoWeeks: 6400, current: 6500, nextTwoWeeks: 6550 },
  ],
  jabalpur: [
    { name: "Wheat", lastTwoWeeks: 2060, current: 2090, nextTwoWeeks: 2110 },
    { name: "Rice (Sona Masuri)", lastTwoWeeks: 3200, current: 3250, nextTwoWeeks: 3280 },
    { name: "Chana (Gram)", lastTwoWeeks: 4900, current: 4950, nextTwoWeeks: 5000 },
    { name: "Peas", lastTwoWeeks: 2400, current: 2500, nextTwoWeeks: 2550 },
  ],
  gwalior: [
    { name: "Mustard", lastTwoWeeks: 5300, current: 5400, nextTwoWeeks: 5450 },
    { name: "Wheat", lastTwoWeeks: 2070, current: 2100, nextTwoWeeks: 2130 },
    { name: "Paddy", lastTwoWeeks: 3000, current: 3100, nextTwoWeeks: 3120 },
  ],
  ujjain: [
    { name: "Soyabean", lastTwoWeeks: 4420, current: 4520, nextTwoWeeks: 4570 },
    { name: "Wheat", lastTwoWeeks: 2090, current: 2110, nextTwoWeeks: 2130 },
    { name: "Garlic", lastTwoWeeks: 11000, current: 12000, nextTwoWeeks: 12500 },
  ],
  // Rajasthan
  jaipur: [
    { name: "Mustard", lastTwoWeeks: 5400, current: 5500, nextTwoWeeks: 5550 },
    { name: "Wheat", lastTwoWeeks: 2120, current: 2150, nextTwoWeeks: 2170 },
    { name: "Guar Seed", lastTwoWeeks: 5100, current: 5200, nextTwoWeeks: 5250 },
    { name: "Bajra", lastTwoWeeks: 2250, current: 2300, nextTwoWeeks: 2320 },
  ],
  jodhpur: [
     { name: "Mustard", lastTwoWeeks: 5350, current: 5450, nextTwoWeeks: 5500 },
     { name: "Cumin", lastTwoWeeks: 27000, current: 27500, nextTwoWeeks: 28000 },
     { name: "Guar Gum", lastTwoWeeks: 10000, current: 10500, nextTwoWeeks: 10700 },
  ],
  kota: [
    { name: "Soyabean", lastTwoWeeks: 4380, current: 4480, nextTwoWeeks: 4520 },
    { name: "Mustard", lastTwoWeeks: 5420, current: 5520, nextTwoWeeks: 5570 },
    { name: "Urad Dal", lastTwoWeeks: 8500, current: 8600, nextTwoWeeks: 8650 },
    { name: "Coriander", lastTwoWeeks: 6700, current: 6800, nextTwoWeeks: 6850 },
  ],
  bikaner: [
    { name: "Groundnut", lastTwoWeeks: 5600, current: 5700, nextTwoWeeks: 5750 },
    { name: "Mustard", lastTwoWeeks: 5380, current: 5480, nextTwoWeeks: 5530 },
    { name: "Moth Dal", lastTwoWeeks: 5900, current: 6000, nextTwoWeeks: 6050 },
  ],
  udaipur: [
    { name: "Maize", lastTwoWeeks: 1850, current: 1880, nextTwoWeeks: 1900 },
    { name: "Wheat", lastTwoWeeks: 2130, current: 2160, nextTwoWeeks: 2180 },
    { name: "Soyabean", lastTwoWeeks: 4350, current: 4400, nextTwoWeeks: 4420 },
  ],
  // Karnataka
  bengaluru: [
    { name: "Ragi", lastTwoWeeks: 3250, current: 3300, nextTwoWeeks: 3320 },
    { name: "Rice (Sona Masuri)", lastTwoWeeks: 3650, current: 3700, nextTwoWeeks: 3750 },
    { name: "Tur Dal", lastTwoWeeks: 9500, current: 9600, nextTwoWeeks: 9650 },
    { name: "Maize", lastTwoWeeks: 1880, current: 1900, nextTwoWeeks: 1920 },
  ],
  mysuru: [
      { name: "Ragi", lastTwoWeeks: 3200, current: 3250, nextTwoWeeks: 3300 },
      { name: "Silk Cocoon", lastTwoWeeks: 600, current: 620, nextTwoWeeks: 630 }, // per kg
      { name: "Tur Dal", lastTwoWeeks: 9400, current: 9500, nextTwoWeeks: 9550 },
  ],
  "hubballi-dharwad": [
    { name: "Jowar", lastTwoWeeks: 2500, current: 2550, nextTwoWeeks: 2600 },
    { name: "Cotton", lastTwoWeeks: 6100, current: 6150, nextTwoWeeks: 6200 },
    { name: "Groundnut", lastTwoWeeks: 5700, current: 5800, nextTwoWeeks: 5830 },
  ],
  mangaluru: [
    { name: "Areca nut", lastTwoWeeks: 50000, current: 51000, nextTwoWeeks: 51500 },
    { name: "Coconut", lastTwoWeeks: 2500, current: 2550, nextTwoWeeks: 2600 },
    { name: "Cashew", lastTwoWeeks: 750, current: 800, nextTwoWeeks: 820 }, // per kg
  ],
  belagavi: [
    { name: "Sugarcane", lastTwoWeeks: 2950, current: 3000, nextTwoWeeks: 3050 },
    { name: "Maize", lastTwoWeeks: 1870, current: 1890, nextTwoWeeks: 1910 },
    { name: "Soyabean", lastTwoWeeks: 4400, current: 4450, nextTwoWeeks: 4480 },
  ],
  // Tamil Nadu
  chennai: [
    { name: "Rice (Ponni)", lastTwoWeeks: 3550, current: 3600, nextTwoWeeks: 3620 },
    { name: "Turmeric", lastTwoWeeks: 6900, current: 7000, nextTwoWeeks: 7100 },
    { name: "Urad Dal", lastTwoWeeks: 8800, current: 8900, nextTwoWeeks: 8950 },
  ],
  coimbatore: [
     { name: "Cotton", lastTwoWeeks: 6300, current: 6350, nextTwoWeeks: 6400 },
     { name: "Turmeric", lastTwoWeeks: 6800, current: 6900, nextTwoWeeks: 7000 },
     { name: "Coconut", lastTwoWeeks: 2550, current: 2600, nextTwoWeeks: 2620 },
  ],
   madurai: [
    { name: "Jasmine", lastTwoWeeks: 1000, current: 1100, nextTwoWeeks: 1150 }, // per kg
    { name: "Paddy (IR20)", lastTwoWeeks: 1800, current: 1850, nextTwoWeeks: 1870 },
    { name: "Chilli", lastTwoWeeks: 15000, current: 16000, nextTwoWeeks: 16200 },
  ],
  tiruchirappalli: [
    { name: "Banana", lastTwoWeeks: 1250, current: 1300, nextTwoWeeks: 1350 },
    { name: "Paddy (ADT 45)", lastTwoWeeks: 1820, current: 1860, nextTwoWeeks: 1880 },
    { name: "Groundnut", lastTwoWeeks: 5800, current: 5900, nextTwoWeeks: 5950 },
  ],
  salem: [
    { name: "Turmeric", lastTwoWeeks: 6850, current: 6950, nextTwoWeeks: 7050 },
    { name: "Mango", lastTwoWeeks: 50, current: 55, nextTwoWeeks: 60 }, // per kg
    { name: "Tapioca", lastTwoWeeks: 1900, current: 2000, nextTwoWeeks: 2050 },
  ],
  // West Bengal
  kolkata: [
    { name: "Jute", lastTwoWeeks: 4900, current: 5000, nextTwoWeeks: 5050 },
    { name: "Rice (Sona Masuri)", lastTwoWeeks: 3350, current: 3400, nextTwoWeeks: 3420 },
    { name: "Masoor Dal", lastTwoWeeks: 6400, current: 6500, nextTwoWeeks: 6550 },
  ],
  asansol: [
    { name: "Potato", lastTwoWeeks: 1100, current: 1120, nextTwoWeeks: 1150 },
    { name: "Rice", lastTwoWeeks: 3300, current: 3350, nextTwoWeeks: 3380 },
    { name: "Mustard", lastTwoWeeks: 5400, current: 5500, nextTwoWeeks: 5520 },
  ],
  siliguri: [
    { name: "Tea", lastTwoWeeks: 200, current: 210, nextTwoWeeks: 215 }, // per kg
    { name: "Pineapple", lastTwoWeeks: 30, current: 32, nextTwoWeeks: 35 }, // per piece
    { name: "Ginger", lastTwoWeeks: 6800, current: 7000, nextTwoWeeks: 7100 },
  ],
  durgapur: [
    { name: "Rice", lastTwoWeeks: 3320, current: 3370, nextTwoWeeks: 3400 },
    { name: "Potato", lastTwoWeeks: 1110, current: 1130, nextTwoWeeks: 1160 },
    { name: "Jute", lastTwoWeeks: 4950, current: 5000, nextTwoWeeks: 5030 },
  ],
  // Uttar Pradesh
  lucknow: [
    { name: "Wheat", lastTwoWeeks: 2150, current: 2180, nextTwoWeeks: 2200 },
    { name: "Sugarcane", lastTwoWeeks: 340, current: 350, nextTwoWeeks: 355 },
    { name: "Arhar Dal", lastTwoWeeks: 9100, current: 9200, nextTwoWeeks: 9250 },
    { name: "Potato", lastTwoWeeks: 1200, current: 1250, nextTwoWeeks: 1280 },
  ],
  kanpur: [
    { name: "Wheat", lastTwoWeeks: 2160, current: 2180, nextTwoWeeks: 2210 },
    { name: "Potato", lastTwoWeeks: 1180, current: 1200, nextTwoWeeks: 1250 },
    { name: "Mustard", lastTwoWeeks: 5350, current: 5400, nextTwoWeeks: 5450 },
    { name: "Urad Dal", lastTwoWeeks: 8600, current: 8700, nextTwoWeeks: 8750 },
  ],
  ghaziabad: [
    { name: "Wheat", lastTwoWeeks: 2170, current: 2200, nextTwoWeeks: 2230 },
    { name: "Sugarcane", lastTwoWeeks: 345, current: 355, nextTwoWeeks: 360 },
    { name: "Rice (Basmati)", lastTwoWeeks: 3900, current: 4000, nextTwoWeeks: 4050 },
  ],
  agra: [
    { name: "Potato", lastTwoWeeks: 1150, current: 1180, nextTwoWeeks: 1220 },
    { name: "Mustard", lastTwoWeeks: 5380, current: 5420, nextTwoWeeks: 5470 },
    { name: "Wheat", lastTwoWeeks: 2150, current: 2160, nextTwoWeeks: 2180 },
  ],
  varanasi: [
    { name: "Wheat", lastTwoWeeks: 2140, current: 2170, nextTwoWeeks: 2190 },
    { name: "Rice (Samba)", lastTwoWeeks: 3250, current: 3300, nextTwoWeeks: 3320 },
    { name: "Peas", lastTwoWeeks: 2500, current: 2600, nextTwoWeeks: 2650 },
  ],
  meerut: [
     { name: "Sugarcane", lastTwoWeeks: 350, current: 360, nextTwoWeeks: 365 },
     { name: "Wheat", lastTwoWeeks: 2180, current: 2210, nextTwoWeeks: 2240 },
     { name: "Urad Dal", lastTwoWeeks: 8700, current: 8800, nextTwoWeeks: 8850 },
  ],
  // Gujarat
  ahmedabad: [
    { name: "Cotton", lastTwoWeeks: 6150, current: 6200, nextTwoWeeks: 6250 },
    { name: "Groundnut", lastTwoWeeks: 5700, current: 5800, nextTwoWeeks: 5850 },
    { name: "Cumin", lastTwoWeeks: 24500, current: 25000, nextTwoWeeks: 25200 },
    { name: "Castor Seed", lastTwoWeeks: 5500, current: 5600, nextTwoWeeks: 5650 },
  ],
  surat: [
    { name: "Sugarcane", lastTwoWeeks: 2900, current: 2950, nextTwoWeeks: 3000 },
    { name: "Banana", lastTwoWeeks: 1200, current: 1250, nextTwoWeeks: 1300 },
    { name: "Cotton", lastTwoWeeks: 6200, current: 6250, nextTwoWeeks: 6280 },
  ],
  vadodara: [
    { name: "Cotton", lastTwoWeeks: 6100, current: 6150, nextTwoWeeks: 6200 },
    { name: "Tur (Arhar)", lastTwoWeeks: 9000, current: 9100, nextTwoWeeks: 9150 },
    { name: "Groundnut", lastTwoWeeks: 5750, current: 5800, nextTwoWeeks: 5830 },
  ],
  rajkot: [
    { name: "Groundnut", lastTwoWeeks: 5750, current: 5850, nextTwoWeeks: 5900 },
    { name: "Cotton", lastTwoWeeks: 6180, current: 6220, nextTwoWeeks: 6270 },
    { name: "Cumin", lastTwoWeeks: 25000, current: 25500, nextTwoWeeks: 25700 },
  ],
  bhavnagar: [
    { name: "Onion", lastTwoWeeks: 1400, current: 1420, nextTwoWeeks: 1450 },
    { name: "Cotton", lastTwoWeeks: 6120, current: 6170, nextTwoWeeks: 6220 },
    { name: "Groundnut", lastTwoWeeks: 5700, current: 5750, nextTwoWeeks: 5780 },
  ],
  // Bihar
  patna: [
    { name: "Rice (Sona Masuri)", lastTwoWeeks: 3250, current: 3300, nextTwoWeeks: 3350 },
    { name: "Maize", lastTwoWeeks: 1820, current: 1850, nextTwoWeeks: 1870 },
    { name: "Lentils (Masur)", lastTwoWeeks: 6100, current: 6200, nextTwoWeeks: 6250 },
    { name: "Wheat", lastTwoWeeks: 2100, current: 2150, nextTwoWeeks: 2170 },
  ],
  gaya: [
    { name: "Rice", lastTwoWeeks: 3230, current: 3280, nextTwoWeeks: 3330 },
    { name: "Wheat", lastTwoWeeks: 2100, current: 2120, nextTwoWeeks: 2140 },
    { name: "Lentils (Masur)", lastTwoWeeks: 6000, current: 6150, nextTwoWeeks: 6200 },
  ],
  bhagalpur: [
    { name: "Maize", lastTwoWeeks: 1800, current: 1830, nextTwoWeeks: 1850 },
    { name: "Rice", lastTwoWeeks: 3280, current: 3330, nextTwoWeeks: 3380 },
    { name: "Wheat", lastTwoWeeks: 2120, current: 2140, nextTwoWeeks: 2160 },
  ],
  muzaffarpur: [
    { name: "Litchi", lastTwoWeeks: 100, current: 110, nextTwoWeeks: 115 }, // per kg
    { name: "Rice", lastTwoWeeks: 3260, current: 3310, nextTwoWeeks: 3360 },
    { name: "Maize", lastTwoWeeks: 1820, current: 1840, nextTwoWeeks: 1850 },
  ],
  purnia: [
    { name: "Maize", lastTwoWeeks: 1810, current: 1840, nextTwoWeeks: 1860 },
    { name: "Jute", lastTwoWeeks: 4850, current: 4950, nextTwoWeeks: 5000 },
    { name: "Wheat", lastTwoWeeks: 2110, current: 2130, nextTwoWeeks: 2150 },
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
    { name: "Paddy", lastTwoWeeks: 1920, current: 1950, nextTwoWeeks: 1970 },
  ],
  nizamabad: [
    { name: "Turmeric", lastTwoWeeks: 7150, current: 7250, nextTwoWeeks: 7300 },
    { name: "Maize", lastTwoWeeks: 1930, current: 1960, nextTwoWeeks: 1990 },
    { name: "Soyabean", lastTwoWeeks: 4450, current: 4500, nextTwoWeeks: 4530 },
  ],
  karimnagar: [
    { name: "Paddy (BPT 5204)", lastTwoWeeks: 1900, current: 1920, nextTwoWeeks: 1940 },
    { name: "Maize", lastTwoWeeks: 1940, current: 1970, nextTwoWeeks: 2000 },
    { name: "Cotton", lastTwoWeeks: 6220, current: 6280, nextTwoWeeks: 6310 },
  ],
  // Andaman and Nicobar Islands
  "port blair": [
    { name: "Coconut", lastTwoWeeks: 2750, current: 2800, nextTwoWeeks: 2820 },
    { name: "Areca nut", lastTwoWeeks: 47500, current: 48000, nextTwoWeeks: 48100 },
    { name: "Vegetables (Mixed)", lastTwoWeeks: 1900, current: 2000, nextTwoWeeks: 2050 },
  ],
  // Andhra Pradesh
  visakhapatnam: [
    { name: "Rice", lastTwoWeeks: 3350, current: 3400, nextTwoWeeks: 3450 },
    { name: "Groundnut", lastTwoWeeks: 5800, current: 5900, nextTwoWeeks: 5950 },
    { name: "Chilli", lastTwoWeeks: 13800, current: 14000, nextTwoWeeks: 14100 },
  ],
  vijayawada: [
    { name: "Turmeric", lastTwoWeeks: 7000, current: 7100, nextTwoWeeks: 7150 },
    { name: "Cotton", lastTwoWeeks: 6100, current: 6200, nextTwoWeeks: 6250 },
    { name: "Rice", lastTwoWeeks: 3450, current: 3500, nextTwoWeeks: 3520 },
  ],
  guntur: [
    { name: "Chilli", lastTwoWeeks: 15000, current: 15500, nextTwoWeeks: 15700 },
    { name: "Cotton", lastTwoWeeks: 6200, current: 6300, nextTwoWeeks: 6350 },
    { name: "Turmeric", lastTwoWeeks: 6900, current: 7000, nextTwoWeeks: 7050 },
  ],
  nellore: [
    { name: "Paddy", lastTwoWeeks: 1850, current: 1900, nextTwoWeeks: 1920 },
    { name: "Groundnut", lastTwoWeeks: 5750, current: 5800, nextTwoWeeks: 5820 },
    { name: "Lemons", lastTwoWeeks: 2900, current: 3000, nextTwoWeeks: 3100 },
  ],
  kurnool: [
    { name: "Onion", lastTwoWeeks: 1250, current: 1300, nextTwoWeeks: 1350 },
    { name: "Cotton", lastTwoWeeks: 6200, current: 6250, nextTwoWeeks: 6280 },
    { name: "Groundnut", lastTwoWeeks: 5600, current: 5700, nextTwoWeeks: 5750 },
  ],
  rajahmundry: [
    { name: "Sugarcane", lastTwoWeeks: 2750, current: 2800, nextTwoWeeks: 2830 },
    { name: "Paddy", lastTwoWeeks: 1800, current: 1850, nextTwoWeeks: 1870 },
    { name: "Coconut", lastTwoWeeks: 2550, current: 2600, nextTwoWeeks: 2630 },
  ],
  tirupati: [
    { name: "Groundnut", lastTwoWeeks: 5900, current: 5950, nextTwoWeeks: 6000 },
    { name: "Tomato", lastTwoWeeks: 850, current: 900, nextTwoWeeks: 950 },
    { name: "Mango", lastTwoWeeks: 40, current: 45, nextTwoWeeks: 50 }, // per kg
  ],
  // Arunachal Pradesh
  itanagar: [
    { name: "Ginger", lastTwoWeeks: 7000, current: 7200, nextTwoWeeks: 7300 },
    { name: "Large Cardamom", lastTwoWeeks: 64000, current: 65000, nextTwoWeeks: 65500 },
    { name: "Chilli", lastTwoWeeks: 12800, current: 13000, nextTwoWeeks: 13200 },
  ],
  tawang: [
    { name: "Potato", lastTwoWeeks: 1450, current: 1500, nextTwoWeeks: 1550 },
    { name: "Cabbage", lastTwoWeeks: 950, current: 1000, nextTwoWeeks: 1050 },
    { name: "Apples", lastTwoWeeks: 110, current: 120, nextTwoWeeks: 125 }, // per kg
  ],
  // Assam
  guwahati: [
    { name: "Tea", lastTwoWeeks: 210, current: 220, nextTwoWeeks: 225 }, // per kg
    { name: "Rice", lastTwoWeeks: 3250, current: 3300, nextTwoWeeks: 3320 },
    { name: "Potato", lastTwoWeeks: 1150, current: 1200, nextTwoWeeks: 1250 },
  ],
  silchar: [
    { name: "Rice", lastTwoWeeks: 3150, current: 3200, nextTwoWeeks: 3230 },
    { name: "Jute", lastTwoWeeks: 4700, current: 4800, nextTwoWeeks: 4850 },
    { name: "Pineapple", lastTwoWeeks: 28, current: 30, nextTwoWeeks: 32 }, // per piece
  ],
  dibrugarh: [
    { name: "Tea", lastTwoWeeks: 220, current: 230, nextTwoWeeks: 235 }, // per kg
    { name: "Rice", lastTwoWeeks: 3200, current: 3250, nextTwoWeeks: 3280 },
    { name: "Ginger", lastTwoWeeks: 6700, current: 6800, nextTwoWeeks: 6850 },
  ],
  jorhat: [
    { name: "Tea", lastTwoWeeks: 215, current: 225, nextTwoWeeks: 230 }, // per kg
    { name: "Rice", lastTwoWeeks: 3300, current: 3350, nextTwoWeeks: 3380 },
    { name: "Mustard", lastTwoWeeks: 5200, current: 5300, nextTwoWeeks: 5350 },
  ],
  // Chandigarh
  chandigarh: [
    { name: "Wheat", lastTwoWeeks: 2200, current: 2250, nextTwoWeeks: 2280 },
    { name: "Rice (Basmati)", lastTwoWeeks: 3800, current: 3900, nextTwoWeeks: 3950 },
    { name: "Vegetables (Mixed)", lastTwoWeeks: 1550, current: 1600, nextTwoWeeks: 1620 },
  ],
  // Chhattisgarh
  raipur: [
    { name: "Paddy", lastTwoWeeks: 1950, current: 1980, nextTwoWeeks: 2000 },
    { name: "Soyabean", lastTwoWeeks: 4350, current: 4400, nextTwoWeeks: 4420 },
    { name: "Chana (Gram)", lastTwoWeeks: 4800, current: 4900, nextTwoWeeks: 4950 },
  ],
  bhilai: [
    { name: "Paddy", lastTwoWeeks: 1940, current: 1970, nextTwoWeeks: 1990 },
    { name: "Wheat", lastTwoWeeks: 2080, current: 2100, nextTwoWeeks: 2110 },
    { name: "Soyabean", lastTwoWeeks: 4300, current: 4350, nextTwoWeeks: 4380 },
  ],
  bilaspur: [
    { name: "Paddy", lastTwoWeeks: 1930, current: 1960, nextTwoWeeks: 1980 },
    { name: "Maize", lastTwoWeeks: 1780, current: 1800, nextTwoWeeks: 1810 },
    { name: "Tur (Arhar)", lastTwoWeeks: 8900, current: 9000, nextTwoWeeks: 9050 },
  ],
  korba: [
    { name: "Paddy", lastTwoWeeks: 1920, current: 1950, nextTwoWeeks: 1970 },
    { name: "Maize", lastTwoWeeks: 1760, current: 1780, nextTwoWeeks: 1790 },
    { name: "Mahua", lastTwoWeeks: 3400, current: 3500, nextTwoWeeks: 3550 },
  ],
  // Dadra and Nagar Haveli and Daman and Diu
  daman: [
    { name: "Fish (Mixed)", lastTwoWeeks: 240, current: 250, nextTwoWeeks: 260 }, // per kg
    { name: "Paddy", lastTwoWeeks: 1780, current: 1800, nextTwoWeeks: 1810 },
    { name: "Coconut", lastTwoWeeks: 2600, current: 2700, nextTwoWeeks: 2720 },
  ],
  silvassa: [
    { name: "Paddy", lastTwoWeeks: 1800, current: 1820, nextTwoWeeks: 1830 },
    { name: "Vegetables (Mixed)", lastTwoWeeks: 1350, current: 1400, nextTwoWeeks: 1420 },
    { name: "Mango", lastTwoWeeks: 45, current: 50, nextTwoWeeks: 52 }, // per kg
  ],
  // Goa
  panaji: [
    { name: "Cashew", lastTwoWeeks: 770, current: 780, nextTwoWeeks: 790 }, // per kg
    { name: "Coconut", lastTwoWeeks: 2600, current: 2650, nextTwoWeeks: 2680 },
    { name: "Fish (Mixed)", lastTwoWeeks: 290, current: 300, nextTwoWeeks: 310 }, // per kg
  ],
  margao: [
    { name: "Cashew", lastTwoWeeks: 790, current: 800, nextTwoWeeks: 810 }, // per kg
    { name: "Coconut", lastTwoWeeks: 2650, current: 2700, nextTwoWeeks: 2730 },
    { name: "Rice", lastTwoWeeks: 3550, current: 3600, nextTwoWeeks: 3620 },
  ],
  "vasco da gama": [
    { name: "Fish (Mixed)", lastTwoWeeks: 270, current: 280, nextTwoWeeks: 290 }, // per kg
    { name: "Coconut", lastTwoWeeks: 2630, current: 2680, nextTwoWeeks: 2700 },
    { name: "Vegetables (Mixed)", lastTwoWeeks: 1650, current: 1700, nextTwoWeeks: 1720 },
  ],
  // Haryana
  faridabad: [
    { name: "Wheat", lastTwoWeeks: 2200, current: 2220, nextTwoWeeks: 2240 },
    { name: "Mustard", lastTwoWeeks: 5400, current: 5450, nextTwoWeeks: 5480 },
    { name: "Paddy", lastTwoWeeks: 3150, current: 3200, nextTwoWeeks: 3220 },
  ],
  gurugram: [
    { name: "Wheat", lastTwoWeeks: 2210, current: 2230, nextTwoWeeks: 2250 },
    { name: "Mustard", lastTwoWeeks: 5430, current: 5480, nextTwoWeeks: 5500 },
    { name: "Bajra", lastTwoWeeks: 2300, current: 2350, nextTwoWeeks: 2370 },
  ],
  panipat: [
    { name: "Wheat", lastTwoWeeks: 2190, current: 2210, nextTwoWeeks: 2230 },
    { name: "Rice (Basmati)", lastTwoWeeks: 4100, current: 4200, nextTwoWeeks: 4250 },
    { name: "Vegetables (Mixed)", lastTwoWeeks: 1450, current: 1500, nextTwoWeeks: 1520 },
  ],
  ambala: [
    { name: "Wheat", lastTwoWeeks: 2220, current: 2240, nextTwoWeeks: 2260 },
    { name: "Paddy (Basmati)", lastTwoWeeks: 4100, current: 4150, nextTwoWeeks: 4180 },
    { name: "Maize", lastTwoWeeks: 1810, current: 1830, nextTwoWeeks: 1840 },
  ],
  karnal: [
    { name: "Rice (Basmati)", lastTwoWeeks: 4200, current: 4250, nextTwoWeeks: 4300 },
    { name: "Wheat", lastTwoWeeks: 2210, current: 2230, nextTwoWeeks: 2250 },
    { name: "Sugarcane", lastTwoWeeks: 370, current: 375, nextTwoWeeks: 380 },
  ],
  // Himachal Pradesh
  shimla: [
    { name: "Apples", lastTwoWeeks: 120, current: 130, nextTwoWeeks: 135 }, // per kg
    { name: "Potato", lastTwoWeeks: 1350, current: 1400, nextTwoWeeks: 1420 },
    { name: "Ginger", lastTwoWeeks: 7400, current: 7500, nextTwoWeeks: 7550 },
  ],
  dharamshala: [
    { name: "Tea", lastTwoWeeks: 240, current: 250, nextTwoWeeks: 255 }, // per kg
    { name: "Potato", lastTwoWeeks: 1300, current: 1350, nextTwoWeeks: 1370 },
    { name: "Maize", lastTwoWeeks: 1730, current: 1750, nextTwoWeeks: 1760 },
  ],
  solan: [
    { name: "Tomato", lastTwoWeeks: 1050, current: 1100, nextTwoWeeks: 1150 },
    { name: "Ginger", lastTwoWeeks: 7200, current: 7300, nextTwoWeeks: 7350 },
    { name: "Peas", lastTwoWeeks: 2700, current: 2800, nextTwoWeeks: 2850 },
  ],
  mandi: [
    { name: "Maize", lastTwoWeeks: 1760, current: 1780, nextTwoWeeks: 1800 },
    { name: "Wheat", lastTwoWeeks: 2130, current: 2150, nextTwoWeeks: 2160 },
    { name: "Potato", lastTwoWeeks: 1280, current: 1300, nextTwoWeeks: 1320 },
  ],
  // Jammu and Kashmir
  srinagar: [
    { name: "Apples", lastTwoWeeks: 100, current: 110, nextTwoWeeks: 115 }, // per kg
    { name: "Saffron", lastTwoWeeks: 240000, current: 250000, nextTwoWeeks: 255000 }, // per kg
    { name: "Walnut", lastTwoWeeks: 880, current: 900, nextTwoWeeks: 910 }, // per kg
  ],
  jammu: [
    { name: "Rice (Basmati)", lastTwoWeeks: 3900, current: 4000, nextTwoWeeks: 4050 },
    { name: "Wheat", lastTwoWeeks: 2180, current: 2200, nextTwoWeeks: 2220 },
    { name: "Maize", lastTwoWeeks: 1780, current: 1800, nextTwoWeeks: 1810 },
  ],
  anantnag: [
    { name: "Apples", lastTwoWeeks: 90, current: 100, nextTwoWeeks: 105 }, // per kg
    { name: "Rice", lastTwoWeeks: 3050, current: 3100, nextTwoWeeks: 3120 },
    { name: "Walnut", lastTwoWeeks: 830, current: 850, nextTwoWeeks: 860 }, // per kg
  ],
  // Jharkhand
  ranchi: [
    { name: "Vegetables (Mixed)", lastTwoWeeks: 1550, current: 1600, nextTwoWeeks: 1620 },
    { name: "Rice", lastTwoWeeks: 3150, current: 3200, nextTwoWeeks: 3230 },
    { name: "Maize", lastTwoWeeks: 1730, current: 1750, nextTwoWeeks: 1760 },
  ],
  jamshedpur: [
    { name: "Rice", lastTwoWeeks: 3200, current: 3250, nextTwoWeeks: 3280 },
    { name: "Wheat", lastTwoWeeks: 2130, current: 2150, nextTwoWeeks: 2160 },
    { name: "Vegetables (Mixed)", lastTwoWeeks: 1500, current: 1550, nextTwoWeeks: 1570 },
  ],
  dhanbad: [
    { name: "Rice", lastTwoWeeks: 3180, current: 3220, nextTwoWeeks: 3250 },
    { name: "Wheat", lastTwoWeeks: 2110, current: 2130, nextTwoWeeks: 2140 },
    { name: "Potato", lastTwoWeeks: 1130, current: 1150, nextTwoWeeks: 1170 },
  ],
  "bokaro steel city": [
    { name: "Rice", lastTwoWeeks: 3200, current: 3230, nextTwoWeeks: 3260 },
    { name: "Wheat", lastTwoWeeks: 2120, current: 2140, nextTwoWeeks: 2150 },
    { name: "Maize", lastTwoWeeks: 1740, current: 1760, nextTwoWeeks: 1770 },
  ],
  // Kerala
  thiruvananthapuram: [
    { name: "Coconut", lastTwoWeeks: 2700, current: 2750, nextTwoWeeks: 2780 },
    { name: "Rubber", lastTwoWeeks: 168, current: 170, nextTwoWeeks: 171 }, // per kg
    { name: "Tapioca", lastTwoWeeks: 2080, current: 2100, nextTwoWeeks: 2120 },
  ],
  kochi: [
    { name: "Coconut", lastTwoWeeks: 2750, current: 2800, nextTwoWeeks: 2830 },
    { name: "Spices (Mixed)", lastTwoWeeks: 780, current: 800, nextTwoWeeks: 810 }, // per kg
    { name: "Rubber", lastTwoWeeks: 170, current: 172, nextTwoWeeks: 173 }, // per kg
  ],
  kozhikode: [
    { name: "Coconut", lastTwoWeeks: 2730, current: 2780, nextTwoWeeks: 2800 },
    { name: "Spices (Black Pepper)", lastTwoWeeks: 590, current: 600, nextTwoWeeks: 605 }, // per kg
    { name: "Areca nut", lastTwoWeeks: 49500, current: 50000, nextTwoWeeks: 50200 },
  ],
  kollam: [
    { name: "Cashew", lastTwoWeeks: 780, current: 790, nextTwoWeeks: 795 }, // per kg
    { name: "Coconut", lastTwoWeeks: 2710, current: 2760, nextTwoWeeks: 2790 },
    { name: "Tapioca", lastTwoWeeks: 2030, current: 2050, nextTwoWeeks: 2070 },
  ],
  thrissur: [
    { name: "Rice", lastTwoWeeks: 3650, current: 3700, nextTwoWeeks: 3720 },
    { name: "Coconut", lastTwoWeeks: 2720, current: 2770, nextTwoWeeks: 2800 },
    { name: "Banana", lastTwoWeeks: 1350, current: 1400, nextTwoWeeks: 1420 },
  ],
  // Ladakh
  leh: [
    { name: "Apricot", lastTwoWeeks: 240, current: 250, nextTwoWeeks: 255 }, // per kg
    { name: "Barley", lastTwoWeeks: 1950, current: 2000, nextTwoWeeks: 2020 },
    { name: "Potato", lastTwoWeeks: 1750, current: 1800, nextTwoWeeks: 1820 },
  ],
  kargil: [
    { name: "Apricot", lastTwoWeeks: 230, current: 240, nextTwoWeeks: 245 }, // per kg
    { name: "Wheat", lastTwoWeeks: 2250, current: 2300, nextTwoWeeks: 2320 },
    { name: "Potato", lastTwoWeeks: 1700, current: 1750, nextTwoWeeks: 1770 },
  ],
  // Lakshadweep
  kavaratti: [
    { name: "Coconut", lastTwoWeeks: 2950, current: 3000, nextTwoWeeks: 3020 },
    { name: "Fish (Tuna)", lastTwoWeeks: 390, current: 400, nextTwoWeeks: 410 }, // per kg
  ],
  // Manipur
  imphal: [
    { name: "Rice (Black)", lastTwoWeeks: 110, current: 120, nextTwoWeeks: 125 }, // per kg
    { name: "Ginger", lastTwoWeeks: 6900, current: 7000, nextTwoWeeks: 7050 },
    { name: "Turmeric", lastTwoWeeks: 7400, current: 7500, nextTwoWeeks: 7550 },
  ],
  // Meghalaya
  shillong: [
    { name: "Potato", lastTwoWeeks: 1400, current: 1450, nextTwoWeeks: 1480 },
    { name: "Ginger", lastTwoWeeks: 7100, current: 7200, nextTwoWeeks: 7250 },
    { name: "Turmeric", lastTwoWeeks: 7700, current: 7800, nextTwoWeeks: 7850 },
  ],
  // Mizoram
  aizawl: [
    { name: "Ginger", lastTwoWeeks: 7000, current: 7100, nextTwoWeeks: 7150 },
    { name: "Chilli", lastTwoWeeks: 14800, current: 15000, nextTwoWeeks: 15100 },
    { name: "Passion Fruit", lastTwoWeeks: 75, current: 80, nextTwoWeeks: 82 }, // per kg
  ],
  // Nagaland
  kohima: [
    { name: "Naga King Chilli", lastTwoWeeks: 950, current: 1000, nextTwoWeeks: 1020 }, // per kg
    { name: "Ginger", lastTwoWeeks: 6900, current: 7000, nextTwoWeeks: 7050 },
    { name: "Maize", lastTwoWeeks: 1880, current: 1900, nextTwoWeeks: 1910 },
  ],
  dimapur: [
    { name: "Rice", lastTwoWeeks: 3350, current: 3400, nextTwoWeeks: 3420 },
    { name: "Pineapple", lastTwoWeeks: 33, current: 35, nextTwoWeeks: 36 }, // per piece
    { name: "Ginger", lastTwoWeeks: 6800, current: 6900, nextTwoWeeks: 6950 },
  ],
  // Odisha
  bhubaneswar: [
    { name: "Paddy", lastTwoWeeks: 1900, current: 1920, nextTwoWeeks: 1940 },
    { name: "Turmeric", lastTwoWeeks: 6700, current: 6800, nextTwoWeeks: 6850 },
    { name: "Vegetables (Mixed)", lastTwoWeeks: 1480, current: 1500, nextTwoWeeks: 1510 },
  ],
  cuttack: [
    { name: "Paddy", lastTwoWeeks: 1910, current: 1930, nextTwoWeeks: 1950 },
    { name: "Jute", lastTwoWeeks: 4800, current: 4900, nextTwoWeeks: 4950 },
    { name: "Pulses (Mixed)", lastTwoWeeks: 6900, current: 7000, nextTwoWeeks: 7050 },
  ],
  rourkela: [
    { name: "Paddy", lastTwoWeeks: 1890, current: 1910, nextTwoWeeks: 1930 },
    { name: "Maize", lastTwoWeeks: 1750, current: 1770, nextTwoWeeks: 1780 },
    { name: "Vegetables (Mixed)", lastTwoWeeks: 1430, current: 1450, nextTwoWeeks: 1460 },
  ],
  puri: [
    { name: "Coconut", lastTwoWeeks: 2550, current: 2600, nextTwoWeeks: 2620 },
    { name: "Paddy", lastTwoWeeks: 1880, current: 1900, nextTwoWeeks: 1910 },
    { name: "Fish (Mixed)", lastTwoWeeks: 190, current: 200, nextTwoWeeks: 205 }, // per kg
  ],
  // Puducherry
  puducherry: [
    { name: "Paddy", lastTwoWeeks: 1860, current: 1880, nextTwoWeeks: 1890 },
    { name: "Groundnut", lastTwoWeeks: 5800, current: 5850, nextTwoWeeks: 5880 },
    { name: "Coconut", lastTwoWeeks: 2550, current: 2580, nextTwoWeeks: 2600 },
  ],
  // Sikkim
  gangtok: [
    { name: "Large Cardamom", lastTwoWeeks: 65000, current: 66000, nextTwoWeeks: 66500 },
    { name: "Ginger", lastTwoWeeks: 7300, current: 7400, nextTwoWeeks: 7450 },
    { name: "Turmeric", lastTwoWeeks: 7500, current: 7600, nextTwoWeeks: 7650 },
  ],
  // Tripura
  agartala: [
    { name: "Rubber", lastTwoWeeks: 158, current: 160, nextTwoWeeks: 161 }, // per kg
    { name: "Pineapple", lastTwoWeeks: 27, current: 28, nextTwoWeeks: 30 }, // per piece
    { name: "Rice", lastTwoWeeks: 3250, current: 3300, nextTwoWeeks: 3320 },
  ],
  // Uttarakhand
  dehradun: [
    { name: "Rice (Basmati)", lastTwoWeeks: 4400, current: 4500, nextTwoWeeks: 4550 },
    { name: "Wheat", lastTwoWeeks: 2160, current: 2180, nextTwoWeeks: 2200 },
    { name: "Maize", lastTwoWeeks: 1800, current: 1820, nextTwoWeeks: 1830 },
  ],
  haridwar: [
    { name: "Sugarcane", lastTwoWeeks: 355, current: 360, nextTwoWeeks: 362 },
    { name: "Wheat", lastTwoWeeks: 2150, current: 2170, nextTwoWeeks: 2190 },
    { name: "Paddy", lastTwoWeeks: 3150, current: 3200, nextTwoWeeks: 3220 },
  ],
  roorkee: [
    { name: "Sugarcane", lastTwoWeeks: 360, current: 365, nextTwoWeeks: 368 },
    { name: "Wheat", lastTwoWeeks: 2170, current: 2190, nextTwoWeeks: 2210 },
    { name: "Mentha", lastTwoWeeks: 940, current: 950, nextTwoWeeks: 955 }, // per kg
  ],
  haldwani: [
    { name: "Soyabean", lastTwoWeeks: 4250, current: 4300, nextTwoWeeks: 4320 },
    { name: "Wheat", lastTwoWeeks: 2130, current: 2150, nextTwoWeeks: 2170 },
    { name: "Paddy", lastTwoWeeks: 3050, current: 3100, nextTwoWeeks: 3120 },
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

    