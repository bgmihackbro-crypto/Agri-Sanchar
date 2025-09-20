
'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Upload,
  FileText,
  X,
  FlaskConical,
  BarChart3,
  Trees,
  CheckCircle,
  AlertTriangle,
  FileClock,
  Calculator,
  Building,
  Combine,
  Tractor,
  Map,
  Shovel,
  Box,
  Tag,
  PlayCircle,
  ExternalLink,
} from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { analyzeSoilReport, type SoilReportAnalysisOutput } from '@/ai/flows/analyze-soil-report';
import { calculateFertilizer, type FertilizerCalculationOutput } from '@/ai/flows/calculate-fertilizer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { useTranslation } from '@/hooks/use-translation';


type SoilReport = {
    id: string;
    fileName: string;
    fileType: string;
    uploadDate: string;
    fileUrl: string; // Data URI for the image/PDF
    analysis?: SoilReportAnalysisOutput;
    analysisError?: string;
};


const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'high':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'medium':
        case 'normal':
        case 'neutral':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'low':
        case 'slightly alkaline':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

export default function SoilTestingPage() {
  const [reports, setReports] = useState<SoilReport[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  
  // State for fertilizer calculator
  const [farmArea, setFarmArea] = useState('');
  const [cropType, setCropType] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationResult, setCalculationResult] = useState<FertilizerCalculationOutput | null>(null);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  
  const [userProfile, setUserProfile] = useState<{state?: string; city?: string} | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t } = useTranslation();
  
  useEffect(() => {
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      setUserProfile(JSON.parse(profile));
    }
  }, []);

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        if(file.size > 4 * 1024 * 1024) { // 4MB limit
            toast({ variant: 'destructive', title: t.soilTesting.toast.largeFile, description: t.soilTesting.toast.largeFileDesc });
            return;
        }
      setSelectedFile(file);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setCalculationResult(null);
    setCalculationError(null);
    setFarmArea('');
    setCropType('');

    try {
      const fileUrl = await fileToDataUri(selectedFile);
      const newReport: SoilReport = {
        id: `report-${Date.now()}`,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        uploadDate: new Date().toLocaleDateString(),
        fileUrl: fileUrl,
      };
      
      setReports(prev => [newReport, ...prev]);
      setActiveReportId(newReport.id);
      
      let analysisResult: SoilReportAnalysisOutput | undefined;
      let analysisError: string | undefined;

      try {
        analysisResult = await analyzeSoilReport({ reportDataUri: fileUrl });
         toast({
            title: t.soilTesting.toast.analysisComplete,
            description: t.soilTesting.toast.analysisCompleteDesc(newReport.fileName),
        });
      } catch (e: any) {
        analysisError = e.message || "Failed to analyze the report.";
         toast({
            variant: 'destructive',
            title: t.soilTesting.toast.analysisFailed,
            description: analysisError,
        });
      }
      
      setReports(prev => prev.map(r => r.id === newReport.id ? { ...r, analysis: analysisResult, analysisError: analysisError } : r));

    } catch (error) {
      console.error('File upload error:', error);
      toast({ variant: 'destructive', title: t.soilTesting.toast.uploadFailed, description: t.soilTesting.toast.uploadFailedDesc });
    } finally {
      setIsLoading(false);
      setSelectedFile(null);
       if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  
  const handleCalculateDosage = async () => {
    if (!activeReport?.analysis || !farmArea || !cropType) {
        toast({ variant: 'destructive', title: t.soilTesting.toast.missingInfo, description: t.soilTesting.toast.missingInfoDesc});
        return;
    }

    setIsCalculating(true);
    setCalculationResult(null);
    setCalculationError(null);

    try {
        const result = await calculateFertilizer({
            soilMetrics: activeReport.analysis.keyMetrics,
            areaInAcres: parseFloat(farmArea),
            cropType: cropType,
        });
        setCalculationResult(result);
        toast({ title: t.soilTesting.toast.calculationComplete, description: t.soilTesting.toast.calculationCompleteDesc});
    } catch (e: any) {
        setCalculationError(e.message || 'An unexpected error occurred.');
        toast({ variant: 'destructive', title: t.soilTesting.toast.calculationFailed, description: e.message || t.soilTesting.toast.calculationFailedDesc});
    } finally {
        setIsCalculating(false);
    }
  };

  const activeReport = useMemo(() => {
    return reports.find(r => r.id === activeReportId);
  }, [reports, activeReportId]);


  const instructionSteps = [
    {
      icon: Map,
      title: t.soilTesting.steps.area.title,
      description: t.soilTesting.steps.area.description,
    },
    {
      icon: Shovel,
      title: t.soilTesting.steps.dig.title,
      description: t.soilTesting.steps.dig.description,
    },
    {
      icon: Box,
      title: t.soilTesting.steps.composite.title,
      description: t.soilTesting.steps.composite.description,
    },
    {
      icon: Combine,
      title: t.soilTesting.steps.mix.title,
      description: t.soilTesting.steps.mix.description,
    },
     {
      icon: Tag,
      title: t.soilTesting.steps.pack.title,
      description: t.soilTesting.steps.pack.description,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">{t.soilTesting.title}</h1>
        <p className="text-muted-foreground">
          {t.soilTesting.description}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Instructions and Upload */}
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-lg">1</span>
                        {t.soilTesting.collectTitle}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <Link href="https://youtu.be/T_0N__RsNBg" target="_blank" rel="noopener noreferrer" className="block relative group">
                        <Image 
                            src="https://img.youtube.com/vi/T_0N__RsNBg/hqdefault.jpg" 
                            alt={t.soilTesting.videoAlt}
                            width={1280}
                            height={720}
                            className="rounded-lg w-full aspect-video object-cover"
                        />
                         <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg transition-opacity opacity-0 group-hover:opacity-100">
                            <PlayCircle className="h-16 w-16 text-white/80" />
                        </div>
                    </Link>
                    <div className="space-y-4">
                        {instructionSteps.map((step, index) => (
                           <div key={index} className="flex items-start gap-4">
                               <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
                                   <step.icon className="h-5 w-5" />
                               </div>
                               <div>
                                   <h4 className="font-semibold">{step.title}</h4>
                                   <p className="text-sm text-muted-foreground">{step.description}</p>
                               </div>
                           </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t.soilTesting.resourcesTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full" defaultValue="labs">
                        <AccordionItem value="labs">
                            <AccordionTrigger><Building className="h-4 w-4 mr-2"/>{t.soilTesting.findLabTitle}</AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-3 pt-2">
                                  <p className="text-sm text-muted-foreground">
                                    {t.soilTesting.findLabDesc}
                                  </p>
                                   <Button variant="outline" size="sm" asChild className="w-full">
                                      <Link href="https://soilhealth.dac.gov.in/soilTestingLabs" target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        {t.soilTesting.searchPortal}
                                    </Link>
                                 </Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>

        </div>

        {/* Right Column: Analysis, Tools, and History */}
        <div className="lg:col-span-2 space-y-6">
             <Card>
                <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                        <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-lg">2</span>
                        {t.soilTesting.uploadTitle}
                    </CardTitle>
                    <CardDescription>{t.soilTesting.uploadDesc}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div 
                        className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors bg-muted/20"
                        onClick={() => fileInputRef.current?.click()}
                    >
                         <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*,application/pdf"
                         />
                         {selectedFile ? (
                             <div className="text-center">
                                 <FileText className="mx-auto h-12 w-12 text-primary" />
                                 <p className="mt-2 text-sm font-medium">{selectedFile.name}</p>
                                 <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                             </div>
                         ) : (
                             <div className="text-center">
                                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                                <p className="mt-2 text-sm text-muted-foreground">{t.soilTesting.uploadPlaceholder}</p>
                                <p className="text-xs text-muted-foreground">{t.soilTesting.uploadHint}</p>
                            </div>
                         )}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                     <Button className="w-full" onClick={handleUploadAndAnalyze} disabled={!selectedFile || isLoading}>
                        {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : <FlaskConical className="mr-2 h-4 w-4" />}
                        {isLoading ? t.soilTesting.analyzing : t.soilTesting.uploadButton}
                     </Button>
                     {selectedFile && (
                        <Button className="w-full" variant="ghost" onClick={() => setSelectedFile(null)}>
                            <X className="mr-2 h-4 w-4" /> {t.soilTesting.cancel}
                        </Button>
                     )}
                </CardFooter>
                  {reports.length > 0 && (
                    <div className="border-t mt-4">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">{t.soilTesting.history}</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="space-y-2">
                                {reports.map(report => (
                                    <button
                                        key={report.id}
                                        onClick={() => setActiveReportId(report.id)}
                                        className={`w-full text-left p-3 rounded-md border flex items-center justify-between transition-colors ${activeReportId === report.id ? 'bg-primary/10 border-primary shadow-sm' : 'hover:bg-muted/50'}`}
                                    >
                                        <div>
                                            <p className="font-medium text-sm">{report.fileName}</p>
                                            <p className="text-xs text-muted-foreground">{report.uploadDate}</p>
                                        </div>
                                        {isLoading && activeReportId === report.id && !report.analysis && !report.analysisError ? <Spinner className="h-5 w-5"/> : report.analysis ? <CheckCircle className="h-5 w-5 text-green-500" /> : report.analysisError ? <AlertTriangle className="h-5 w-5 text-red-500" /> : <FileClock className="h-5 w-5 text-muted-foreground"/> }
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </div>
                 )}
            </Card>

            <Card className="min-h-[300px]">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-lg">3</span>
                        {t.soilTesting.analysisTitle}
                    </CardTitle>
                    <CardDescription>
                        {activeReport ? t.soilTesting.analysisDesc(activeReport.fileName): t.soilTesting.analysisPlaceholder}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!activeReport ? (
                         <div className="flex flex-col items-center justify-center h-64 text-center">
                            <FlaskConical className="h-16 w-16 text-muted-foreground/50"/>
                            <p className="mt-4 text-muted-foreground">{t.soilTesting.analysisPlaceholder}</p>
                        </div>
                    ) : isLoading && activeReportId === activeReport.id && !activeReport.analysis && !activeReport.analysisError ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <Spinner className="h-12 w-12" />
                            <p className="mt-4 text-muted-foreground">{t.soilTesting.analysisLoading}</p>
                        </div>
                    ) : activeReport.analysisError ? (
                         <div className="flex flex-col items-center justify-center h-64 text-center text-destructive p-4 bg-destructive/5 rounded-lg">
                            <AlertTriangle className="h-16 w-16"/>
                            <p className="mt-4 font-semibold">{t.soilTesting.analysisFailed}</p>
                            <p className="mt-2 text-sm">{activeReport.analysisError}</p>
                        </div>
                    ) : activeReport.analysis ? (
                        <Accordion type="multiple" defaultValue={['metrics', 'crops', 'fertilizer']} className="w-full">
                            <AccordionItem value="metrics">
                                <AccordionTrigger className="text-lg font-semibold"><BarChart3 className="h-5 w-5 mr-2 text-primary"/>{t.soilTesting.results.metrics}</AccordionTrigger>
                                <AccordionContent>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                                        {activeReport.analysis.keyMetrics.map(metric => (
                                            <div key={metric.name} className="p-3 border rounded-lg">
                                                <p className="text-sm text-muted-foreground">{metric.name}</p>
                                                <p className="text-xl font-bold">{metric.value}</p>
                                                <Badge variant="outline" className={`mt-1 ${getStatusColor(metric.status)}`}>{metric.status}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="crops">
                                <AccordionTrigger className="text-lg font-semibold"><Trees className="h-5 w-5 mr-2 text-green-600"/>{t.soilTesting.results.crops}</AccordionTrigger>
                                <AccordionContent>
                                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{activeReport.analysis.cropSuitability}</p>
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="fertilizer">
                                <AccordionTrigger className="text-lg font-semibold"><Combine className="h-5 w-5 mr-2 text-blue-600"/>{t.soilTesting.results.fertilizer}</AccordionTrigger>
                                <AccordionContent>
                                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md whitespace-pre-wrap">{activeReport.analysis.fertilizerRecommendation}</p>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    ) : null}
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-lg">4</span>
                        {t.soilTesting.calculator.title}
                    </CardTitle>
                    <CardDescription>{t.soilTesting.calculator.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="area">{t.soilTesting.calculator.areaLabel}</Label>
                            <Input id="area" type="number" placeholder={t.soilTesting.calculator.areaPlaceholder} value={farmArea} onChange={e => setFarmArea(e.target.value)} disabled={!activeReport?.analysis} />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="crop-type">{t.soilTesting.calculator.cropLabel}</Label>
                            <Select onValueChange={setCropType} value={cropType} disabled={!activeReport?.analysis}>
                                <SelectTrigger id="crop-type">
                                    <SelectValue placeholder={t.soilTesting.calculator.cropPlaceholder} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Wheat">Wheat</SelectItem>
                                    <SelectItem value="Rice">Rice</SelectItem>
                                    <SelectItem value="Maize">Maize</SelectItem>
                                    <SelectItem value="Cotton">Cotton</SelectItem>
                                    <SelectItem value="Sugarcane">Sugarcane</SelectItem>
                                    <SelectItem value="Chickpea">Chickpea</SelectItem>
                                    <SelectItem value="Lentil">Lentil</SelectItem>
                                    <SelectItem value="Potato">Potato</SelectItem>
                                    <SelectItem value="Tomato">Tomato</SelectItem>
                                    <SelectItem value="Onion">Onion</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     {isCalculating && (
                        <div className="flex justify-center items-center py-4">
                            <Spinner className="mr-2 h-5 w-5"/>
                            <p className="text-muted-foreground">{t.soilTesting.calculator.calculating}</p>
                        </div>
                    )}
                     {calculationError && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4"/>
                            <AlertTitle>{t.soilTesting.toast.calculationFailed}</AlertTitle>
                            <AlertDescription>{calculationError}</AlertDescription>
                        </Alert>
                     )}
                     {calculationResult && (
                        <Alert variant="default" className="bg-green-50 border-green-200">
                             <AlertTitle className="font-semibold text-green-800 flex items-center gap-2">
                                <Tractor className="h-5 w-5"/>
                                {t.soilTesting.calculator.dosageTitle(farmArea, cropType)}
                            </AlertTitle>
                            <AlertDescription>
                                <ul className="mt-2 list-disc pl-5 text-green-900 space-y-1">
                                    {calculationResult.recommendations.map(rec => (
                                        <li key={rec.fertilizer}>{rec.fertilizer}: <span className="font-bold">{rec.quantity}</span></li>
                                    ))}
                                </ul>
                                {calculationResult.notes && <p className="mt-3 text-xs text-green-800/80">{calculationResult.notes}</p>}
                            </AlertDescription>
                        </Alert>
                     )}
                </CardContent>
                <CardFooter>
                    <Button onClick={handleCalculateDosage} disabled={!activeReport?.analysis || !farmArea || !cropType || isCalculating} className="w-full">
                        {isCalculating ? <Spinner className="mr-2 h-4 w-4"/> : <Calculator className="mr-2 h-4 w-4"/>}
                        {isCalculating ? t.soilTesting.calculator.calculating : t.soilTesting.calculator.calculateButton}
                    </Button>
                </CardFooter>
            </Card>

        </div>
      </div>
    </div>
  );
}
