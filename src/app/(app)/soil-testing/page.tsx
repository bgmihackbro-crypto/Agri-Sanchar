
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
  CircleHelp,
  Combine,
  Tractor,
  Map,
  Shovel,
  Box,
  Tag,
  PlayCircle,
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


  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
            toast({ variant: 'destructive', title: 'File Too Large', description: 'Please upload a file smaller than 4MB.' });
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
            title: 'Analysis Complete',
            description: `Successfully analyzed ${newReport.fileName}.`,
        });
      } catch (e: any) {
        analysisError = e.message || "Failed to analyze the report.";
         toast({
            variant: 'destructive',
            title: 'Analysis Failed',
            description: analysisError,
        });
      }
      
      setReports(prev => prev.map(r => r.id === newReport.id ? { ...r, analysis: analysisResult, analysisError: analysisError } : r));

    } catch (error) {
      console.error('File upload error:', error);
      toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not process the file.' });
    } finally {
      setIsLoading(false);
      setSelectedFile(null);
       if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  
  const handleCalculateDosage = async () => {
    if (!activeReport?.analysis || !farmArea || !cropType) {
        toast({ variant: 'destructive', title: 'Missing Information', description: 'Please ensure a report is analyzed and fill in both area and crop type.'});
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
        toast({ title: 'Calculation Complete', description: 'Fertilizer dosage has been calculated.'});
    } catch (e: any) {
        setCalculationError(e.message || 'An unexpected error occurred.');
        toast({ variant: 'destructive', title: 'Calculation Failed', description: e.message || 'Could not calculate fertilizer dosage.'});
    } finally {
        setIsCalculating(false);
    }
  };

  const activeReport = useMemo(() => {
    return reports.find(r => r.id === activeReportId);
  }, [reports, activeReportId]);

  useEffect(() => {
    // When active report changes, clear old calculation results
    setCalculationResult(null);
    setCalculationError(null);
    setFarmArea('');
    setCropType('');
  }, [activeReport]);

  const instructionSteps = [
    {
      icon: Map,
      title: "Select a Representative Area",
      description: "Choose a spot that accurately represents your field. Avoid unusual areas like near fences, trees, water sources, or where fertilizer has been spilled. For a large field, divide it into sections based on soil type, color, or past crop performance and take separate samples from each.",
    },
    {
      icon: Shovel,
      title: "Dig and Collect the Sample",
      description: "Using a spade or auger, clear any surface litter. Dig a 'V' shaped hole to a depth of 6 inches (15 cm). From one side of the 'V', take a uniform slice of soil, about 1-2 inches thick, from top to bottom. This is one sub-sample.",
    },
    {
      icon: Box,
      title: "Create a Composite Sample",
      description: "Repeat the digging process in at least 8-10 different spots across the representative area. Collect all the sub-samples in a clean bucket or plastic tub. Do not use bags that previously held fertilizers or other chemicals.",
    },
    {
      icon: Combine,
      title: "Mix and Prepare the Final Sample",
      description: "Break up any lumps or clods in the bucket and remove stones, roots, or other debris. Mix all the sub-samples together thoroughly to create a single, uniform composite sample. Spread the mixed soil on a clean sheet of paper or plastic and let it air-dry in the shade (never in direct sunlight).",
    },
     {
      icon: Tag,
      title: "Pack and Label Correctly",
      description: "From the dried composite sample, take about half a kilogram (500g) of soil. Pack it into a clean, properly labeled cloth or plastic bag. The label should clearly state your name, address, farmer ID, date of sampling, and the field number or name.",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Soil Testing</h1>
        <p className="text-muted-foreground">
          Upload soil health reports to get AI-powered analysis and recommendations.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Upload and History */}
        <div className="lg:col-span-1 space-y-6">
           <Card>
                <CardHeader>
                    <CardTitle>Upload New Report</CardTitle>
                    <CardDescription>Select a PDF or image of your soil test report.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div 
                        className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors"
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
                                <p className="mt-2 text-sm text-muted-foreground">Click or drag to upload</p>
                                <p className="text-xs text-muted-foreground">PDF, PNG, JPG up to 4MB</p>
                            </div>
                         )}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                     <Button className="w-full" onClick={handleUploadAndAnalyze} disabled={!selectedFile || isLoading}>
                        {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : <FlaskConical className="mr-2 h-4 w-4" />}
                        {isLoading ? 'Analyzing...' : 'Upload & Analyze'}
                     </Button>
                     {selectedFile && (
                        <Button className="w-full" variant="ghost" onClick={() => setSelectedFile(null)}>
                            <X className="mr-2 h-4 w-4" /> Cancel
                        </Button>
                     )}
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Report History</CardTitle>
                </CardHeader>
                <CardContent>
                    {reports.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No reports uploaded yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {reports.map(report => (
                                <button
                                    key={report.id}
                                    onClick={() => setActiveReportId(report.id)}
                                    className={`w-full text-left p-3 rounded-md border flex items-center justify-between transition-colors ${activeReportId === report.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'}`}
                                >
                                    <div>
                                        <p className="font-medium text-sm">{report.fileName}</p>
                                        <p className="text-xs text-muted-foreground">{report.uploadDate}</p>
                                    </div>
                                    {isLoading && activeReportId === report.id && !report.analysis && !report.analysisError ? <Spinner className="h-5 w-5"/> : report.analysis ? <CheckCircle className="h-5 w-5 text-green-500" /> : report.analysisError ? <AlertTriangle className="h-5 w-5 text-red-500" /> : <FileClock className="h-5 w-5 text-muted-foreground"/> }
                                </button>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>How to Collect Soil Samples</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <Link href="https://www.youtube.com/watch?v=F4h_g3a2n5M" target="_blank" rel="noopener noreferrer" className="block relative group">
                        <Image 
                            src="https://img.youtube.com/vi/F4h_g3a2n5M/hqdefault.jpg" 
                            alt="Video on how to collect soil samples"
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
        </div>

        {/* Right Column: Analysis Display and Tools */}
        <div className="lg:col-span-2 space-y-6">
            <Card className="min-h-[300px]">
                <CardHeader>
                    <CardTitle>Analysis & Recommendations</CardTitle>
                    <CardDescription>
                        {activeReport ? `Showing results for ${activeReport.fileName}`: "Upload a report to see AI-powered insights here."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!activeReport ? (
                         <div className="flex flex-col items-center justify-center h-64 text-center">
                            <FlaskConical className="h-16 w-16 text-muted-foreground/50"/>
                            <p className="mt-4 text-muted-foreground">Your report analysis will appear here.</p>
                        </div>
                    ) : isLoading && activeReportId === activeReport.id && !activeReport.analysis && !activeReport.analysisError ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <Spinner className="h-12 w-12" />
                            <p className="mt-4 text-muted-foreground">AI is analyzing your report. This may take a moment...</p>
                        </div>
                    ) : activeReport.analysisError ? (
                         <div className="flex flex-col items-center justify-center h-64 text-center text-destructive p-4 bg-destructive/5 rounded-lg">
                            <AlertTriangle className="h-16 w-16"/>
                            <p className="mt-4 font-semibold">Analysis Failed</p>
                            <p className="mt-2 text-sm">{activeReport.analysisError}</p>
                        </div>
                    ) : activeReport.analysis ? (
                        <Accordion type="multiple" defaultValue={['metrics', 'crops', 'fertilizer']} className="w-full">
                            <AccordionItem value="metrics">
                                <AccordionTrigger className="text-lg font-semibold"><BarChart3 className="h-5 w-5 mr-2 text-primary"/>Key Metrics</AccordionTrigger>
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
                                <AccordionTrigger className="text-lg font-semibold"><Trees className="h-5 w-5 mr-2 text-green-600"/>Crop Suitability</AccordionTrigger>
                                <AccordionContent>
                                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{activeReport.analysis.cropSuitability}</p>
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="fertilizer">
                                <AccordionTrigger className="text-lg font-semibold"><Combine className="h-5 w-5 mr-2 text-blue-600"/>Fertilizer Recommendations</AccordionTrigger>
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
                    <CardTitle className="flex items-center gap-2"><Calculator className="text-primary"/> Fertilizer Calculator</CardTitle>
                    <CardDescription>Get a customized fertilizer recommendation for your specific crop and area.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="area">Farm Area (acres)</Label>
                            <Input id="area" type="number" placeholder="e.g., 2.5" value={farmArea} onChange={e => setFarmArea(e.target.value)} disabled={!activeReport?.analysis} />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="crop-type">Crop Type</Label>
                            <Select onValueChange={setCropType} value={cropType} disabled={!activeReport?.analysis}>
                                <SelectTrigger id="crop-type">
                                    <SelectValue placeholder="Select crop" />
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
                            <p className="text-muted-foreground">Calculating required dosage...</p>
                        </div>
                    )}
                     {calculationError && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4"/>
                            <AlertTitle>Calculation Failed</AlertTitle>
                            <AlertDescription>{calculationError}</AlertDescription>
                        </Alert>
                     )}
                     {calculationResult && (
                        <Alert variant="default" className="bg-green-50 border-green-200">
                             <AlertTitle className="font-semibold text-green-800 flex items-center gap-2">
                                <Tractor className="h-5 w-5"/>
                                Calculated Dosage for {farmArea} acres of {cropType}
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
                        {isCalculating ? <Spinner className="mr-2 h-4 w-4"/> : <Tractor className="mr-2 h-4 w-4"/>}
                        {isCalculating ? 'Calculating...' : 'Calculate Required Dosage'}
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Resources & Support</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="labs">
                            <AccordionTrigger><Building className="h-4 w-4 mr-2"/>Find a Lab Near You</AccordionTrigger>
                            <AccordionContent>
                                <p className="text-sm text-muted-foreground">
                                    Visit the <a href="https://soilhealth.dac.gov.in/soil-testing-laboratories" target="_blank" rel="noopener noreferrer" className="text-primary underline">official government portal</a> to find a soil testing laboratory in your district. Many Krishi Vigyan Kendras (KVKs) also offer testing services.
                                </p>
                            </AccordionContent>
                        </AccordionItem>
                         <AccordionItem value="subsidies">
                            <AccordionTrigger><CircleHelp className="h-4 w-4 mr-2" />Government Subsidies</AccordionTrigger>
                            <AccordionContent>
                                 <p className="text-sm text-muted-foreground">
                                    Under the Soil Health Card Scheme, the government provides assistance to farmers for soil testing. Farmers can get their soil tested at subsidized rates. Contact your local agriculture office for more details on subsidies and procedures in your state.
                                </p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

    