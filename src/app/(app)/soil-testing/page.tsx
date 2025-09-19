
'use client';

import { useState, useRef, useMemo } from 'react';
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
} from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { analyzeSoilReport, type SoilReportAnalysisOutput } from '@/ai/flows/analyze-soil-report';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


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

    try {
      const fileUrl = await fileToDataUri(selectedFile);
      const newReport: SoilReport = {
        id: `report-${Date.now()}`,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        uploadDate: new Date().toLocaleDateString(),
        fileUrl: fileUrl,
      };
      
      // Add report to state immediately to show it in the list
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
      
      // Update the report with the analysis result
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

  const activeReport = useMemo(() => {
    return reports.find(r => r.id === activeReportId);
  }, [reports, activeReportId]);

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
                                    {report.analysis ? <CheckCircle className="h-5 w-5 text-green-500" /> : report.analysisError ? <AlertTriangle className="h-5 w-5 text-red-500" /> : <FileClock className="h-5 w-5 text-muted-foreground"/> }
                                </button>
                            ))}
                        </div>
                    )}
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
                    ) : isLoading && !activeReport.analysis && !activeReport.analysisError ? (
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
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="area">Farm Area (acres)</Label>
                            <Input id="area" type="number" placeholder="e.g., 2.5" />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="crop-type">Crop Type</Label>
                            <Select>
                                <SelectTrigger id="crop-type">
                                    <SelectValue placeholder="Select crop" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="wheat">Wheat</SelectItem>
                                    <SelectItem value="rice">Rice</SelectItem>
                                    <SelectItem value="maize">Maize</SelectItem>
                                    <SelectItem value="cotton">Cotton</SelectItem>
                                    <SelectItem value="sugarcane">Sugarcane</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button disabled={!activeReport?.analysis} className="w-full">
                        <Tractor className="mr-2 h-4 w-4"/>
                        Calculate Required Dosage
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

    