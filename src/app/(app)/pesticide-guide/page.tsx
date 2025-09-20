
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Bug, Leaf, TestTube, Target, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


const pesticideData = [
  {
    name: "Neem Oil",
    type: "Organic",
    target: "Insecticide/Fungicide",
    description: "A broad-spectrum organic pesticide effective against aphids, mites, and powdery mildew. Safe for most plants.",
    activeIngredient: "Azadirachtin",
    crops: ["Vegetables", "Fruits", "Cotton"],
    dosage: "Mix 5-10ml per liter of water. Spray every 7-14 days.",
    color: "bg-green-100 text-green-800",
  },
  {
    name: "Imidacloprid",
    type: "Chemical",
    target: "Insecticide",
    description: "A systemic insecticide used to control sucking insects like aphids, whiteflies, and jassids in various crops.",
    activeIngredient: "Imidacloprid",
    crops: ["Cotton", "Rice", "Sugarcane", "Vegetables"],
    dosage: "Varies by formulation. Follow product label instructions carefully.",
    color: "bg-red-100 text-red-800",
  },
  {
    name: "Mancozeb",
    type: "Chemical",
    target: "Fungicide",
    description: "A broad-spectrum contact fungicide used to control a wide range of fungal diseases on fruits, vegetables, and field crops.",
    activeIngredient: "Mancozeb",
    crops: ["Potato", "Tomato", "Grapes", "Chilli"],
    dosage: "2-2.5 grams per liter of water. Spray at 10-15 day intervals.",
    color: "bg-blue-100 text-blue-800",
  },
  {
    name: "Beauveria Bassiana",
    type: "Organic",
    target: "Insecticide",
    description: "A beneficial fungus that acts as a natural insecticide against pests like whiteflies, thrips, and mealybugs.",
    activeIngredient: "Beauveria Bassiana spores",
    crops: ["Most crops"],
    dosage: "5 grams or 5ml per liter of water. Ensure thorough coverage.",
    color: "bg-green-100 text-green-800",
  },
  {
    name: "Chlorpyrifos",
    type: "Chemical",
    target: "Insecticide",
    description: "A non-systemic insecticide used to control a wide range of chewing and sucking insects in soil or on foliage.",
    activeIngredient: "Chlorpyrifos",
    crops: ["Rice", "Cotton", "Pulses"],
    dosage: "2-3 ml per liter of water. Use with caution.",
    color: "bg-red-100 text-red-800",
  },
  {
    name: "Trichoderma Viride",
    type: "Organic",
    target: "Fungicide",
    description: "An antagonistic fungus used for seed and soil treatment to control soil-borne diseases like root rot and wilt.",
    activeIngredient: "Trichoderma Viride spores",
    crops: ["All crops"],
    dosage: "Seed treatment: 5-10g per kg of seed. Soil application: 1kg per acre.",
    color: "bg-green-100 text-green-800",
  },
   {
    name: "Glyphosate",
    type: "Chemical",
    target: "Herbicide",
    description: "A broad-spectrum systemic herbicide used to kill weeds, especially perennial grasses. Used for pre-sowing weed control.",
    activeIngredient: "Glyphosate",
    crops: ["Non-crop areas", "Pre-sowing for many crops"],
    dosage: "8-10 ml per liter of water. Avoid contact with main crop.",
    color: "bg-orange-100 text-orange-800",
  },
   {
    name: "Pheromone Traps",
    type: "Organic",
    target: "Insect Monitoring",
    description: "Used to monitor and trap specific insect pests (like fruit flies or bollworms) by using sex pheromones to attract them.",
    activeIngredient: "Species-specific pheromone lure",
    crops: ["Fruits", "Vegetables", "Cotton"],
    dosage: "5-10 traps per acre, depending on pest intensity.",
    color: "bg-green-100 text-green-800",
  },
  {
    name: "Copper Oxychloride",
    type: "Chemical",
    target: "Fungicide/Bactericide",
    description: "A protective fungicide and bactericide used to control diseases like leaf spot, blight, and canker in various crops.",
    activeIngredient: "Copper Oxychloride",
    crops: ["Citrus", "Potato", "Tomato", "Coffee"],
    dosage: "2-3 grams per liter of water. Spray thoroughly.",
    color: "bg-blue-100 text-blue-800",
  }
];

type Pesticide = (typeof pesticideData)[0];

const DetailDialog = ({ pesticide }: { pesticide: Pesticide }) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="mt-auto w-full">
                    <Info className="mr-2 h-4 w-4" /> View Details
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-headline">{pesticide.name}</DialogTitle>
                    <div className="flex flex-wrap gap-2 pt-2">
                            <Badge className={pesticide.color}>{pesticide.type}</Badge>
                            <Badge variant="secondary">{pesticide.target}</Badge>
                    </div>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <p className="text-sm text-foreground">{pesticide.description}</p>
                    <div className="space-y-2">
                        <h4 className="font-semibold">Active Ingredient</h4>
                        <p className="text-sm">{pesticide.activeIngredient}</p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-semibold">Recommended For</h4>
                        <p className="text-sm">{pesticide.crops.join(", ")}</p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-semibold">Dosage & Application</h4>
                        <p className="text-sm">{pesticide.dosage}</p>
                    </div>
                     <div className="!mt-6">
                        <p className="text-xs text-destructive font-semibold">
                            Disclaimer: Always read and follow the manufacturer's label for instructions and safety precautions before use.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}


export default function PesticideGuidePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterTarget, setFilterTarget] = useState("all");

  const filteredPesticides = pesticideData.filter((pesticide) => {
    const searchMatch =
      pesticide.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pesticide.description.toLowerCase().includes(searchQuery.toLowerCase());
    const typeMatch = filterType === "all" || pesticide.type === filterType;
    const targetMatch = filterTarget === "all" || pesticide.target.includes(filterTarget);
    return searchMatch && typeMatch && targetMatch;
  });

  const getIcon = (type: string) => {
    switch(type) {
        case 'Organic': return <Leaf className="h-5 w-5 text-green-600"/>;
        case 'Chemical': return <TestTube className="h-5 w-5 text-red-600"/>;
        default: return <Bug className="h-5 w-5 text-gray-600"/>;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Pesticide Guide</h1>
        <p className="text-muted-foreground">
          Find information on common organic and chemical pesticides.
        </p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for a pesticide..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select onValueChange={setFilterType} value={filterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Organic">Organic</SelectItem>
                <SelectItem value="Chemical">Chemical</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={setFilterTarget} value={filterTarget}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Target" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Targets</SelectItem>
                <SelectItem value="Insecticide">Insecticide</SelectItem>
                <SelectItem value="Fungicide">Fungicide</SelectItem>
                <SelectItem value="Herbicide">Herbicide</SelectItem>
                <SelectItem value="Insect Monitoring">Insect Monitoring</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

        {filteredPesticides.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPesticides.map((pesticide) => (
                <Card key={pesticide.name} className="flex flex-col">
                    <CardHeader>
                    <div className="flex items-start justify-between">
                         <CardTitle className="font-headline text-lg">{pesticide.name}</CardTitle>
                         <div className={`p-2 rounded-lg ${pesticide.color}`}>
                            {getIcon(pesticide.type)}
                         </div>
                    </div>
                    <CardDescription className="flex gap-2 pt-1">
                        <Badge variant="outline">{pesticide.type}</Badge>
                        <Badge variant="secondary">{pesticide.target}</Badge>
                    </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                        {pesticide.description}
                    </p>
                    </CardContent>
                    <CardFooter>
                       <DetailDialog pesticide={pesticide} />
                    </CardFooter>
                </Card>
                ))}
            </div>
        ) : (
            <div className="text-center py-16">
                 <p className="text-muted-foreground">No pesticides found matching your criteria.</p>
            </div>
        )}

    </div>
  );
}
