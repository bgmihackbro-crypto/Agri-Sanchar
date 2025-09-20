
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/use-translation';
import { schemes, type Scheme } from '@/lib/schemes';
import { Landmark, Info, ExternalLink, FileText, BadgeCheck, UserCheck, Milestone, HandCoins, Tractor, Droplets, BookUser, Calculator, ListChecks, CaseUpper, StepForward, Quote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


type UserProfile = {
  farmSize: string;
  city: string;
  state: string;
  annualIncome: string;
  crop?: string; 
};

const getStatusBadge = (status: string, t: any) => {
    switch (status.toLowerCase()) {
        case 'ongoing':
            return <Badge className="bg-green-100 text-green-800 border border-green-200 hover:bg-green-100">{t.schemes.status.ongoing}</Badge>;
        case 'upcoming':
            return <Badge className="bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-100">{t.schemes.status.upcoming}</Badge>;
        case 'closed':
            return <Badge className="bg-red-100 text-red-800 border border-red-200 hover:bg-red-100">{t.schemes.status.closed}</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
};

const BenefitIcon = ({ benefit, t }: { benefit: string, t: any }) => {
    const lowerBenefit = benefit.toLowerCase();
    if (lowerBenefit.includes(t.schemes.keywords.subsidy) || lowerBenefit.includes(t.schemes.keywords.financial)) {
        return <HandCoins className="h-5 w-5 text-green-600" />;
    }
    if (lowerBenefit.includes(t.schemes.keywords.equipment) || lowerBenefit.includes(t.schemes.keywords.tractor)) {
        return <Tractor className="h-5 w-5 text-blue-600" />;
    }
    if (lowerBenefit.includes(t.schemes.keywords.irrigation) || lowerBenefit.includes(t.schemes.keywords.water)) {
        return <Droplets className="h-5 w-5 text-cyan-600" />;
    }
    if (lowerBenefit.includes(t.schemes.keywords.insurance)) {
        return <BookUser className="h-5 w-5 text-amber-600" />;
    }
    return <Milestone className="h-5 w-5 text-gray-500" />;
};


export default function SchemesPage() {
    const { t } = useTranslation();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [recommendedSchemes, setRecommendedSchemes] = useState<Scheme[]>([]);
    const [otherSchemes, setOtherSchemes] = useState<Scheme[]>([]);
    
    // State for the page-level calculator
    const [sumInsured, setSumInsured] = useState('');
    const [cropType, setCropType] = useState<'kharif' | 'rabi' | ''>('');
    const [calculatedPremium, setCalculatedPremium] = useState<number | null>(null);

    useEffect(() => {
        const profile = localStorage.getItem('userProfile');
        if (profile) {
            setUserProfile(JSON.parse(profile));
        }
    }, []);

    useEffect(() => {
        if (userProfile) {
            const recommended: Scheme[] = [];
            const others: Scheme[] = [];
            
            schemes(t).forEach(scheme => {
                let isEligible = true;
                // Simple eligibility check
                const farmSize = parseFloat(userProfile.farmSize);
                if (scheme.eligibility.landHolding && scheme.eligibility.landHolding !== 'any' && farmSize > parseFloat(scheme.eligibility.landHolding.match(/(\d+)/)?.[0] || '999')) {
                    isEligible = false;
                }
                
                if (isEligible) {
                    recommended.push(scheme);
                } else {
                    others.push(scheme);
                }
            });

            setRecommendedSchemes(recommended);
            setOtherSchemes(others);
        } else {
            setOtherSchemes(schemes(t));
        }
    }, [userProfile, t]);

    const handleCalculate = () => {
        const insuredAmount = parseFloat(sumInsured);
        if (!insuredAmount || !cropType) {
            setCalculatedPremium(null);
            return;
        }

        const premiumRate = cropType === 'kharif' ? 0.02 : 0.015; // 2% for Kharif, 1.5% for Rabi
        const premium = insuredAmount * premiumRate;
        setCalculatedPremium(premium);
    };

    const successStories = [
        {
            name: "Gurpreet Singh",
            location: "Punjab",
            avatar: "https://images.unsplash.com/photo-1620177088257-782f8a359334?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            scheme: t.schemes.pm_kisan.name,
            story: "The PM-KISAN installments came just when I needed money for seeds. It reduced my burden and I didn't have to take a loan from the local moneylender this time."
        },
        {
            name: "Meena Devi",
            location: "Maharashtra",
            avatar: "https://images.unsplash.com/photo-1601288496429-7de5f9118b62?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fA%3D%3D",
            scheme: t.schemes.pmfby.name,
            story: "Last year, unseasonal rains destroyed my entire soyabean crop. Thanks to Fasal Bima Yojana, I got the insurance claim on time and was able to sow for the next season without any debt."
        },
        {
            name: "Rajesh Kumar",
            location: "Rajasthan",
            avatar: "https://images.unsplash.com/photo-1594745561149-2212a51c9d64?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            scheme: t.schemes.pm_kusum.name,
            story: "Diesel for my water pump was a major expense. With the subsidy from the KUSUM scheme, I installed a solar pump. Now, my irrigation cost is almost zero and I have a reliable water supply."
        }
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">{t.schemes.title}</h1>
                <p className="text-muted-foreground">{t.schemes.description}</p>
            </div>

            {userProfile && recommendedSchemes.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold font-headline mb-4 flex items-center gap-2">
                        <BadgeCheck className="h-7 w-7 text-green-600" />
                        {t.schemes.recommendedForYou}
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {recommendedSchemes.map(scheme => <SchemeCard key={scheme.id} scheme={scheme} t={t} />)}
                    </div>
                </div>
            )}
            
            <div className="mt-8">
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {otherSchemes.map(scheme => <SchemeCard key={scheme.id} scheme={scheme} t={t} />)}
                </div>
            </div>

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-6 w-6 text-primary" />
                        {t.schemes.calculator.title} (PMFBY)
                    </CardTitle>
                    <CardDescription>{t.schemes.pmfby.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="sum-insured">{t.schemes.calculator.sumInsuredLabel}</Label>
                            <Input id="sum-insured" type="number" placeholder={t.schemes.calculator.sumInsuredPlaceholder} value={sumInsured} onChange={(e) => setSumInsured(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="crop-type">{t.schemes.calculator.cropTypeLabel}</Label>
                            <Select onValueChange={(v) => setCropType(v as any)} value={cropType}>
                                <SelectTrigger id="crop-type">
                                    <SelectValue placeholder={t.schemes.calculator.cropTypePlaceholder} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="kharif">{t.schemes.calculator.kharif}</SelectItem>
                                    <SelectItem value="rabi">{t.schemes.calculator.rabi}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     {calculatedPremium !== null && (
                        <Alert className="bg-green-50 border-green-200">
                            <AlertTitle className="font-bold text-lg text-green-800">{t.schemes.calculator.resultTitle}</AlertTitle>
                            <AlertDescription className="text-green-900">
                                {t.schemes.calculator.resultDescription(calculatedPremium.toLocaleString('en-IN'))}
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
                <CardFooter>
                     <Button onClick={handleCalculate} disabled={!sumInsured || !cropType} className="w-full sm:w-auto">
                        {t.schemes.calculator.calculateButton}
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Quote className="h-6 w-6 text-primary" />
                        Success Stories
                    </CardTitle>
                    <CardDescription>Real stories from farmers who benefited from these schemes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {successStories.map((story, index) => (
                        <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border">
                             <Avatar className="h-12 w-12 border">
                                <AvatarImage src={story.avatar} alt={story.name} />
                                <AvatarFallback>{story.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <blockquote className="text-foreground italic border-l-4 border-primary pl-4">
                                    {story.story}
                                </blockquote>
                                <div className="mt-2 text-right">
                                    <p className="font-semibold text-sm">{story.name}, <span className="text-muted-foreground">{story.location}</span></p>
                                    <Badge variant="secondary" className="mt-1">{story.scheme}</Badge>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

        </div>
    );
}

function SchemeCard({ scheme, t }: { scheme: Scheme, t: any }) {
    return (
        <Dialog>
            <Card className="flex flex-col hover:shadow-lg transition-shadow duration-300">
                 <CardHeader>
                    <div className="flex justify-between items-start">
                        <CardTitle className="font-headline text-lg pr-2">{scheme.name}</CardTitle>
                        {getStatusBadge(scheme.status, t)}
                    </div>
                    <CardDescription className="line-clamp-2 pt-1 text-foreground">{scheme.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                        <UserCheck className="h-4 w-4 text-muted-foreground"/>
                        <span className="font-semibold">{t.schemes.eligibility}:</span>
                        <span className="text-muted-foreground">{scheme.eligibility.summary}</span>
                    </div>
                     <div className="flex items-center gap-2 text-sm">
                        <HandCoins className="h-4 w-4 text-muted-foreground"/>
                        <span className="font-semibold">{t.schemes.benefits}:</span>
                        <span className="text-muted-foreground">{scheme.benefitsSummary}</span>
                    </div>
                </CardContent>
                <CardFooter className="flex-col gap-2 items-stretch">
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                            <Info className="mr-2 h-4 w-4" /> {t.schemes.viewDetails}
                        </Button>
                    </DialogTrigger>
                </CardFooter>
            </Card>

            <DialogContent className="sm:max-w-sm p-0">
                <ScrollArea className="max-h-[80vh]">
                    <div className="p-6 space-y-4">
                        <DialogHeader className="text-left">
                            <DialogTitle className="text-2xl font-headline mb-1">{scheme.name}</DialogTitle>
                            <DialogDescription className="text-foreground">{scheme.description}</DialogDescription>
                        </DialogHeader>
                        
                        {getStatusBadge(scheme.status, t)}

                        <Accordion type="multiple" defaultValue={['benefits', 'eligibility']} className="w-full space-y-1">
                            <AccordionItem value="benefits" className="border-b-0">
                                <AccordionTrigger className="text-lg font-semibold bg-muted/50 px-4 rounded-md hover:no-underline">
                                    <div className="flex items-center gap-2"><HandCoins className="h-5 w-5 text-primary"/>{t.schemes.benefits}</div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-2 px-2">
                                     <ul className="space-y-3 p-2">
                                        {scheme.benefits.map((benefit, i) => (
                                                <li key={i} className="flex items-start gap-3">
                                                    <BenefitIcon benefit={benefit} t={t} />
                                                    <span className="text-sm text-foreground">{benefit}</span>
                                                </li>
                                        ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="eligibility" className="border-b-0">
                                <AccordionTrigger className="text-lg font-semibold bg-muted/50 px-4 rounded-md hover:no-underline">
                                    <div className="flex items-center gap-2"><UserCheck className="h-5 w-5 text-primary"/>{t.schemes.eligibility}</div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-2 px-2">
                                    <ul className="space-y-3 p-2">
                                        {scheme.eligibility.criteria.map((item, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <CaseUpper className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                                <span className="text-sm text-foreground">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="documents" className="border-b-0">
                                <AccordionTrigger className="text-lg font-semibold bg-muted/50 px-4 rounded-md hover:no-underline">
                                    <div className="flex items-center gap-2"><ListChecks className="h-5 w-5 text-primary"/>{t.schemes.documents}</div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-2 px-2">
                                    <div className="flex flex-wrap gap-2 p-2">
                                        {scheme.documents.map((doc, i) => (
                                            <Badge key={i} variant="secondary" className="flex items-center gap-2">
                                                <FileText className="h-4 w-4" />
                                                {doc}
                                            </Badge>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="process" className="border-b-0">
                                <AccordionTrigger className="text-lg font-semibold bg-muted/50 px-4 rounded-md hover:no-underline">
                                    <div className="flex items-center gap-2"><StepForward className="h-5 w-5 text-primary"/>{t.schemes.applicationProcess}</div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-2 px-2">
                                     <ol className="relative border-l border-gray-200 dark:border-gray-700 space-y-6 mt-2 ml-2">                  
                                        {scheme.applicationProcess.map((step, i) => (
                                            <li key={i} className="ml-6">
                                                <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
                                                    <span className="font-bold text-blue-800 dark:text-blue-300 text-xs">{i + 1}</span>
                                                </span>
                                                <p className="font-semibold text-sm">{step.step}</p>
                                                <p className="text-xs text-foreground">{step.detail}</p>
                                            </li>
                                        ))}
                                    </ol>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                    </div>
                    <div className="flex justify-end pt-4 border-t p-6 bg-muted/30">
                        <Button asChild>
                            <Link href={scheme.link} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                {t.schemes.applyHere}
                            </Link>
                        </Button>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}



      

    