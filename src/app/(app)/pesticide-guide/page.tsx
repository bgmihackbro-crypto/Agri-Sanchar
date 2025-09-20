"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Bug, Leaf, TestTube, Target, Info, ThumbsUp, ThumbsDown, ShieldAlert, Timer, Bot, Wand2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { recommendPesticide, type PesticideRecommendationOutput } from "@/ai/flows/recommend-pesticide";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";


const pesticideData = [
  {
    name: "Neem Oil",
    type: "Organic",
    target: "Insecticide/Fungicide",
    description: "A broad-spectrum organic pesticide effective against aphids, mites, and powdery mildew. Safe for most plants.",
    activeIngredient: "Azadirachtin",
    crops: ["Vegetables", "Fruits", "Cotton"],
    dosage: "Mix 5-10ml per liter of water. Spray every 7-14 days.",
    advantages: [
      "Safe for the environment and beneficial insects.",
      "Repels a wide range of pests.",
      "Can be used up to the day of harvest."
    ],
    disadvantages: [
      "Slower acting than chemical pesticides.",
      "May need frequent reapplication, especially after rain.",
      "Can have a strong odor."
    ],
    safetyPrecautions: [
        "While organic, avoid direct contact with eyes and skin.",
        "Keep out of reach of children."
    ],
    preHarvestInterval: "None, can be used up to the day of harvest.",
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
    advantages: [
        "Highly effective and provides long-lasting control.",
        "Systemic action protects the entire plant.",
        "Effective against a wide range of sucking pests."
    ],
    disadvantages: [
        "Can be harmful to pollinators like bees.",
        "Pests may develop resistance over time.",
        "Requires a waiting period before harvest."
    ],
    safetyPrecautions: [
        "Wear protective clothing, gloves, and eye protection.",
        "Do not eat, drink, or smoke while handling.",
        "Avoid inhaling the spray mist."
    ],
    preHarvestInterval: "7-21 days, depending on the crop. Refer to the product label.",
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
    advantages: [
        "Controls a wide spectrum of fungal diseases.",
        "Provides essential nutrients like Manganese and Zinc to the crop.",
        "Low risk of resistance development."
    ],
    disadvantages: [
        "Contact fungicide, so it does not penetrate the plant tissue.",
        "Needs to be reapplied after rain.",
        "Can leave a visible residue on produce."
    ],
    safetyPrecautions: [
        "Use in a well-ventilated area.",
        "Avoid contact with skin and eyes.",
        "Wash hands thoroughly after use."
    ],
    preHarvestInterval: "7-10 days for most vegetables. Refer to label.",
    color: "bg-blue-100 text-blue-800",
  },
  {
    name: "Beauveria Bassiana",
    type: "Organic",
    target: "Insecticide",
    description: "A beneficial fungus that acts as a natural insecticide against pests like whiteflies, thrips, and mealybugs.",
    activeIngredient: "Beauveria Bassiana spores",
    crops: ["Vegetables", "Fruits", "Cotton", "Grapes"],
    dosage: "5 grams or 5ml per liter of water. Ensure thorough coverage.",
    advantages: [
        "Eco-friendly and non-toxic to humans and animals.",
        "Does not lead to pest resistance.",
        "Helps maintain a healthy soil microbiome."
    ],
    disadvantages: [
        "Slower to act compared to chemical insecticides.",
        "Requires specific temperature and humidity for best results.",
        "Has a shorter shelf life."
    ],
    safetyPrecautions: [
        "Even though it's biological, avoid inhaling the powder.",
        "Store in a cool, dry place away from direct sunlight."
    ],
    preHarvestInterval: "None.",
    color: "bg-green-100 text-green-800",
  },
  {
    name: "Chlorpyrifos",
    type: "Chemical",
    target: "Insecticide",
    description: "A non-systemic insecticide used to control a wide range of chewing and sucking insects in soil or on foliage.",
    activeIngredient: "Chlorpyrifos",
    crops: ["Rice", "Cotton", "Pulses", "Sugarcane"],
    dosage: "2-3 ml per liter of water. Use with caution.",
     advantages: [
        "Broad-spectrum control of many pests including termites.",
        "Relatively low cost.",
        "Effective as a soil drench."
    ],
    disadvantages: [
        "High toxicity to humans, fish, and beneficial insects.",
        "Banned or restricted in many countries.",
        "Can persist in the environment."
    ],
    safetyPrecautions: [
        "Extremely toxic. Must use full protective equipment.",
        "Ensure proper disposal of empty containers.",
        "Keep away from water bodies."
    ],
    preHarvestInterval: "14-30 days. Strictly follow label recommendations.",
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
    advantages: [
        "Improves plant growth and resistance to diseases.",
        "Completely natural and eco-friendly.",
        "Effective against a wide range of soil-borne pathogens."
    ],
    disadvantages: [
        "Effectiveness can be influenced by soil conditions.",
        "Cannot be mixed with chemical fungicides.",
        "May be slow to establish in the soil."
    ],
    safetyPrecautions: [
        "Not harmful, but it's good practice to wear a mask to avoid inhaling spores.",
        "Keep product dry before use."
    ],
    preHarvestInterval: "None.",
    color: "bg-green-100 text-green-800",
  },
   {
    name: "Glyphosate",
    type: "Chemical",
    target: "Herbicide",
    description: "A broad-spectrum systemic herbicide used to kill weeds, especially perennial grasses. Used for pre-sowing weed control.",
    activeIngredient: "Glyphosate",
    crops: ["Non-crop areas", "Tea plantations"],
    dosage: "8-10 ml per liter of water. Avoid contact with main crop.",
    advantages: [
        "Highly effective in killing a wide variety of weeds.",
        "Systemic action kills the weed down to the root.",
        "Relatively low cost for large area application."
    ],
    disadvantages: [
        "Controversial due to potential health and environmental concerns.",
        "Can lead to herbicide-resistant weeds.",
        "Damages any crop it comes in contact with (non-selective)."
    ],
    safetyPrecautions: [
        "Avoid spray drift to desired plants.",
        "Wear gloves and eye protection.",
        "Do not use in household gardens."
    ],
    preHarvestInterval: "N/A for its intended use (pre-sowing or non-crop areas).",
    color: "bg-orange-100 text-orange-800",
  },
   {
    name: "Pheromone Traps",
    type: "Organic",
    target: "Insect Monitoring",
    description: "Used to monitor and trap specific insect pests (like fruit flies or bollworms) by using sex pheromones to attract them.",
    activeIngredient: "Species-specific pheromone lure",
    crops: ["Fruits", "Vegetables", "Cotton", "Maize"],
    dosage: "5-10 traps per acre, depending on pest intensity.",
    advantages: [
        "Non-toxic and species-specific, so it doesn't harm other organisms.",
        "Helps in early detection of pest infestation.",
        "Reduces the need for widespread pesticide application."
    ],
    disadvantages: [
        "Primarily for monitoring and mass trapping, not eradication.",
        "Lures need to be replaced periodically.",
        "Only effective for the specific target pest."
    ],
    safetyPrecautions: [
        "Handle lures with care to avoid contamination.",
        "Place traps away from direct human traffic."
    ],
    preHarvestInterval: "None.",
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
    advantages: [
        "Controls both fungal and bacterial diseases.",
        "Permitted in some organic farming systems (with restrictions).",
        "Provides essential copper nutrient to plants."
    ],
    disadvantages: [
        "Can be toxic to plants at high concentrations (phytotoxicity).",
        "May accumulate in the soil over time.",
        "Can be washed off by rain."
    ],
    safetyPrecautions: [
        "Avoid application during hot weather to prevent plant burn.",
        "Wear standard protective equipment.",
        "Can be toxic to aquatic life."
    ],
    preHarvestInterval: "5-10 days, varies by crop.",
    color: "bg-blue-100 text-blue-800",
  },
  {
    name: "Spinosad",
    type: "Organic",
    target: "Insecticide",
    description: "A natural insecticide derived from a soil bacterium. Effective against thrips, leaf miners, and caterpillars.",
    activeIngredient: "Spinosyn A and Spinosyn D",
    crops: ["Grapes", "Chilli", "Cotton", "Brinjal"],
    dosage: "0.3-0.5 ml per liter of water.",
    advantages: [
      "Effective at low concentrations.",
      "Low toxicity to mammals and most beneficial insects.",
      "Fast acting compared to other biological insecticides."
    ],
    disadvantages: [
      "Can be toxic to bees when sprayed directly.",
      "Higher cost compared to some chemical alternatives.",
      "Effectiveness can be reduced by sunlight."
    ],
    safetyPrecautions: [
        "Spray during late evening to protect bees.",
        "Store away from direct sunlight.",
        "Follow label instructions for mixing."
    ],
    preHarvestInterval: "3-7 days, depending on the crop.",
    color: "bg-green-100 text-green-800",
  },
  {
    name: "Fipronil",
    type: "Chemical",
    target: "Insecticide",
    description: "A broad-spectrum insecticide that disrupts the insect central nervous system. Effective against thrips and stem borers.",
    activeIngredient: "Fipronil",
    crops: ["Rice", "Grapes", "Cabbage", "Chilli"],
    dosage: "1-2 ml per liter of water. Handle with care.",
    advantages: [
      "Long residual activity.",
      "Effective against a wide range of pests.",
      "Can be used for both foliar spray and soil application."
    ],
    disadvantages: [
      "Highly toxic to fish and bees.",
      "Has been linked to colony collapse disorder in bees.",
      "Persistence in the environment can be a concern."
    ],
    safetyPrecautions: [
        "Do not use near fish ponds or bee hives.",
        "Strictly adhere to dosage recommendations to avoid environmental damage.",
        "Use full protective gear."
    ],
    preHarvestInterval: "15-30 days. Varies significantly, check the label.",
    color: "bg-red-100 text-red-800",
  },
  {
    name: "Sulphur",
    type: "Chemical",
    target: "Fungicide/Acaricide",
    description: "A contact fungicide that controls powdery mildew and also acts as a miticide against certain mites.",
    activeIngredient: "Sulphur 80% WDG",
    crops: ["Grapes", "Mango", "Peas", "Cowpea"],
    dosage: "2-3 grams per liter of water.",
    advantages: [
      "One of the oldest and most reliable fungicides.",
      "Provides essential nutrient (Sulphur) to the plant.",
      "Acceptable for use in organic farming."
    ],
    disadvantages: [
      "Can cause scorching on some plants in hot weather.",
      "Not effective against all fungal diseases.",
      "Can be washed away by rain."
    ],
    safetyPrecautions: [
        "Do not spray in temperatures above 32°C (90°F).",
        "Can cause irritation to eyes and skin.",
        "Do not mix with horticultural oils."
    ],
    preHarvestInterval: "1-7 days, check for specific crop.",
    color: "bg-blue-100 text-blue-800",
  }
];

type Pesticide = (typeof pesticideData)[0];

const DetailDialog = ({ pesticide, t }: { pesticide: Pesticide, t: any }) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="mt-auto w-full">
                    <Info className="mr-2 h-4 w-4" /> {t.pesticideGuide.viewDetails}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-headline">{pesticide.name}</DialogTitle>
                    <div className="flex flex-wrap gap-2 pt-1">
                        <Badge className={pesticide.color}>{pesticide.type === "Organic" ? t.pesticideGuide.organic : t.pesticideGuide.chemical}</Badge>
                        <Badge variant="secondary">{pesticide.target}</Badge>
                    </div>
                </DialogHeader>
                <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-4">
                    <p className="text-sm text-foreground">{pesticide.description}</p>

                     <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                        <h4 className="font-semibold text-yellow-900 flex items-center gap-2"><ShieldAlert className="h-5 w-5"/>{t.pesticideGuide.dialog.precautions}</h4>
                        <ul className="space-y-1.5 text-sm text-yellow-800 list-disc pl-5 mt-2">
                            {pesticide.safetyPrecautions.map((adv, i) => (
                                <li key={i}>{adv}</li>
                            ))}
                        </ul>
                    </div>

                     <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <h4 className="font-semibold text-blue-900 flex items-center gap-2"><Timer className="h-5 w-5"/>{t.pesticideGuide.dialog.phi}</h4>
                        <p className="text-sm text-blue-800 mt-1">{pesticide.preHarvestInterval}</p>
                    </div>
                    
                    <div className="space-y-2">
                        <h4 className="font-semibold">{t.pesticideGuide.dialog.advantages}</h4>
                        <ul className="space-y-1.5 text-sm">
                            {pesticide.advantages.map((adv, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <ThumbsUp className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>{adv}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                     <div className="space-y-2">
                        <h4 className="font-semibold">{t.pesticideGuide.dialog.disadvantages}</h4>
                        <ul className="space-y-1.5 text-sm">
                            {pesticide.disadvantages.map((dis, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <ThumbsDown className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                                    <span>{dis}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="space-y-2">
                        <h4 className="font-semibold">{t.pesticideGuide.dialog.activeIngredient}</h4>
                        <p className="text-sm">{pesticide.activeIngredient}</p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-semibold">{t.pesticideGuide.dialog.recommendedFor}</h4>
                        <p className="text-sm">{pesticide.crops.join(", ")}</p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-semibold">{t.pesticideGuide.dialog.dosage}</h4>
                        <p className="text-sm">{pesticide.dosage}</p>
                    </div>
                     <div className="!mt-6">
                        <p className="text-xs text-destructive font-semibold">
                            {t.pesticideGuide.dialog.disclaimer}
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
  const [filterCrop, setFilterCrop] = useState("all");

  const [wizardCrop, setWizardCrop] = useState("");
  const [wizardProblem, setWizardProblem] = useState("");
  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendation, setRecommendation] = useState<PesticideRecommendationOutput | null>(null);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

  const allCrops = ["all", ...Array.from(new Set(pesticideData.flatMap(p => p.crops)))].sort();

  const filteredPesticides = pesticideData.filter((pesticide) => {
    const searchMatch =
      pesticide.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pesticide.description.toLowerCase().includes(searchQuery.toLowerCase());
    const typeMatch = filterType === "all" || pesticide.type === filterType;
    const targetMatch = filterTarget === "all" || pesticide.target.includes(filterTarget);
    const cropMatch = filterCrop === "all" || pesticide.crops.includes(filterCrop);
    return searchMatch && typeMatch && targetMatch && cropMatch;
  });

  const getIcon = (type: string) => {
    switch(type) {
        case 'Organic': return <Leaf className="h-5 w-5 text-green-600"/>;
        case 'Chemical': return <TestTube className="h-5 w-5 text-red-600"/>;
        default: return <Bug className="h-5 w-5 text-gray-600"/>;
    }
  }

  const handleGetRecommendation = async () => {
    if (!wizardCrop || !wizardProblem) {
        toast({ variant: 'destructive', title: t.pesticideGuide.toast.missingInfo, description: t.pesticideGuide.toast.missingInfoDesc });
        return;
    }
    setIsRecommending(true);
    setRecommendation(null);
    setRecommendationError(null);

    try {
        const result = await recommendPesticide({
            crop: wizardCrop,
            problem: wizardProblem,
            pesticideData: JSON.stringify(pesticideData),
        });
        setRecommendation(result);
    } catch (e: any) {
        setRecommendationError(e.message || "An unknown error occurred.");
    } finally {
        setIsRecommending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">{t.pesticideGuide.title}</h1>
        <p className="text-muted-foreground">
          {t.pesticideGuide.description}
        </p>
      </div>

       <Tabs defaultValue="directory" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="directory"><Search className="mr-2 h-4 w-4"/>{t.pesticideGuide.directory}</TabsTrigger>
                <TabsTrigger value="wizard"><Wand2 className="mr-2 h-4 w-4"/>{t.pesticideGuide.wizard}</TabsTrigger>
            </TabsList>
            <TabsContent value="directory" className="pt-4">
                 <Card>
                    <CardContent className="p-4 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                        placeholder={t.pesticideGuide.searchPlaceholder}
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Select onValueChange={setFilterType} value={filterType}>
                        <SelectTrigger>
                            <SelectValue placeholder={t.pesticideGuide.filterType} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t.pesticideGuide.allTypes}</SelectItem>
                            <SelectItem value="Organic">{t.pesticideGuide.organic}</SelectItem>
                            <SelectItem value="Chemical">{t.pesticideGuide.chemical}</SelectItem>
                        </SelectContent>
                        </Select>
                        <Select onValueChange={setFilterTarget} value={filterTarget}>
                        <SelectTrigger>
                            <SelectValue placeholder={t.pesticideGuide.filterTarget} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t.pesticideGuide.allTargets}</SelectItem>
                            <SelectItem value="Insecticide">{t.pesticideGuide.insecticide}</SelectItem>
                            <SelectItem value="Fungicide">{t.pesticideGuide.fungicide}</SelectItem>
                            <SelectItem value="Herbicide">{t.pesticideGuide.herbicide}</SelectItem>
                            <SelectItem value="Insect Monitoring">{t.pesticideGuide.monitoring}</SelectItem>
                            <SelectItem value="Bactericide">{t.pesticideGuide.bactericide}</SelectItem>
                            <SelectItem value="Acaricide">{t.pesticideGuide.acaricide}</SelectItem>
                        </SelectContent>
                        </Select>
                        <Select onValueChange={setFilterCrop} value={filterCrop}>
                        <SelectTrigger>
                            <SelectValue placeholder={t.pesticideGuide.filterCrop} />
                        </SelectTrigger>
                        <SelectContent>
                            {allCrops.map(crop => (
                                <SelectItem key={crop} value={crop}>{crop === 'all' ? t.pesticideGuide.allCrops : crop}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    </div>
                    </CardContent>
                </Card>

                {filteredPesticides.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
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
                                    <Badge variant="outline">{pesticide.type === "Organic" ? t.pesticideGuide.organic : t.pesticideGuide.chemical}</Badge>
                                    <Badge variant="secondary">{pesticide.target}</Badge>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                            <p className="text-sm text-muted-foreground line-clamp-3">
                                {pesticide.description}
                            </p>
                            </CardContent>
                            <CardFooter>
                            <DetailDialog pesticide={pesticide} t={t.pesticideGuide} />
                            </CardFooter>
                        </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-muted-foreground">{t.pesticideGuide.noPesticidesFound}</p>
                    </div>
                )}

            </TabsContent>
            <TabsContent value="wizard" className="pt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>{t.pesticideGuide.wizardTitle}</CardTitle>
                        <CardDescription>{t.pesticideGuide.wizardDesc}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                placeholder={t.pesticideGuide.cropPlaceholder}
                                value={wizardCrop}
                                onChange={(e) => setWizardCrop(e.target.value)}
                                disabled={isRecommending}
                            />
                        </div>
                        <Textarea
                            placeholder={t.pesticideGuide.problemPlaceholder}
                            rows={4}
                            value={wizardProblem}
                            onChange={(e) => setWizardProblem(e.target.value)}
                            disabled={isRecommending}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleGetRecommendation} disabled={isRecommending || !wizardCrop || !wizardProblem}>
                            {isRecommending ? <Spinner className="mr-2 h-4 w-4"/> : <Bot className="mr-2 h-4 w-4"/>}
                            {isRecommending ? t.pesticideGuide.analyzing : t.pesticideGuide.getRecommendation}
                        </Button>
                    </CardFooter>
                </Card>
                
                {isRecommending && (
                     <div className="text-center py-16">
                        <Spinner className="h-8 w-8 text-primary"/>
                        <p className="mt-2 text-muted-foreground">{t.pesticideGuide.aiThinking}</p>
                    </div>
                )}

                {recommendationError && (
                    <Alert variant="destructive" className="mt-6">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{recommendationError}</AlertDescription>
                    </Alert>
                )}

                {recommendation && (
                    <Card className="mt-6 animate-fade-in">
                        <CardHeader>
                            <CardTitle>{t.pesticideGuide.aiRecommendation}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <Alert className="bg-primary/5">
                                <AlertTitle className="font-bold text-lg text-primary">{recommendation.recommendation}</AlertTitle>
                            </Alert>
                            
                            <div>
                                <h4 className="font-semibold">{t.pesticideGuide.reasoning}</h4>
                                <p className="text-muted-foreground text-sm">{recommendation.reasoning}</p>
                            </div>
                            
                             <div>
                                <h4 className="font-semibold">{t.pesticideGuide.usage}</h4>
                                <p className="text-muted-foreground text-sm">{recommendation.usage}</p>
                            </div>
                             <p className="text-xs text-muted-foreground pt-4">
                                {t.pesticideGuide.disclaimer}
                            </p>
                        </CardContent>
                    </Card>
                )}


            </TabsContent>
        </Tabs>
    </div>
  );
}
