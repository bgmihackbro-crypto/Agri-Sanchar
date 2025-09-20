
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/use-translation';
import { schemes, type Scheme } from '@/lib/schemes';
import { Landmark, Info, ExternalLink, FileText, BadgeCheck, UserCheck, Milestone, HandCoins, Tractor, Droplets, BookUser } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

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
                if (scheme.eligibility.landHolding && farmSize > parseFloat(scheme.eligibility.landHolding.match(/(\d+)/)?.[0] || '999')) {
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
            
            <div>
                <h2 className="text-2xl font-bold font-headline mb-4">{t.schemes.allSchemes}</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {otherSchemes.map(scheme => <SchemeCard key={scheme.id} scheme={scheme} t={t} />)}
                </div>
            </div>

        </div>
    );
}

function SchemeCard({ scheme, t }: { scheme: Scheme, t: any }) {
    return (
        <Dialog>
            <Card className="flex flex-col hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                        <CardTitle className="font-headline text-lg">{scheme.name}</CardTitle>
                        <Landmark className="h-8 w-8 text-primary/70 flex-shrink-0"/>
                    </div>
                    <CardDescription className="line-clamp-2">{scheme.description}</CardDescription>
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
                <CardFooter className="flex-col items-start gap-3">
                    <div className="flex justify-between w-full items-center">
                        {getStatusBadge(scheme.status, t)}
                        {scheme.lastDate && <p className="text-xs text-destructive font-semibold">{t.schemes.lastDate}: {scheme.lastDate}</p>}
                    </div>
                     <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                            <Info className="mr-2 h-4 w-4" /> {t.schemes.viewDetails}
                        </Button>
                    </DialogTrigger>
                </CardFooter>
            </Card>

            <DialogContent className="max-w-2xl">
                 <DialogHeader>
                    <DialogTitle className="text-2xl font-headline mb-2">{scheme.name}</DialogTitle>
                    <DialogDescription>{scheme.description}</DialogDescription>
                    <div className="flex justify-between items-center pt-2">
                        {getStatusBadge(scheme.status, t)}
                        {scheme.lastDate && <p className="text-sm text-destructive font-semibold">{t.schemes.lastDate}: {scheme.lastDate}</p>}
                    </div>
                </DialogHeader>

                <div className="grid md:grid-cols-2 gap-6 py-4 max-h-[60vh] overflow-y-auto pr-4">
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">{t.schemes.benefits}</h3>
                        <ul className="space-y-3">
                           {scheme.benefits.map((benefit, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <BenefitIcon benefit={benefit} t={t} />
                                    <span className="text-sm text-muted-foreground">{benefit}</span>
                                </li>
                           ))}
                        </ul>

                         <h3 className="font-semibold text-lg pt-4">{t.schemes.eligibility}</h3>
                         <ul className="space-y-3">
                            {scheme.eligibility.criteria.map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <UserCheck className="h-5 w-5 text-blue-600" />
                                    <span className="text-sm text-muted-foreground">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">{t.schemes.applicationProcess}</h3>
                         <ol className="relative border-l border-gray-200 dark:border-gray-700 space-y-4">                  
                            {scheme.applicationProcess.map((step, i) => (
                                <li key={i} className="ml-4">
                                    <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                                    <p className="text-sm font-semibold">{step.step}</p>
                                    <p className="text-sm text-muted-foreground">{step.detail}</p>
                                </li>
                            ))}
                        </ol>

                        <h3 className="font-semibold text-lg pt-4">{t.schemes.documents}</h3>
                        <ul className="space-y-2">
                             {scheme.documents.map((doc, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <FileText className="h-4 w-4 text-gray-500" />
                                    {doc}
                                </li>
                             ))}
                        </ul>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button asChild>
                        <Link href={scheme.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            {t.schemes.applyHere}
                        </Link>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

