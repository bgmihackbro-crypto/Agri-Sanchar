"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, Check, IndianRupee, X as XIcon, Trash2, TrendingUp, TrendingDown, Scale } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface CalculatorInput {
    area: string;
    yieldPerAcre: string;
    sellingPrice: string;
    productionCost: string;
}

interface CalculationResult {
    netYield: number;
    revenue: number;
    totalCosts: number;
    profit: number;
    roi: number;
    breakevenPrice: number;
}

const initialInputs: CalculatorInput = {
    area: '',
    yieldPerAcre: '',
    sellingPrice: '',
    productionCost: '',
};

export default function YieldCalculatorPage() {
    const [inputs, setInputs] = useState<CalculatorInput>(initialInputs);
    const [result, setResult] = useState<CalculationResult | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setInputs(prev => ({ ...prev, [id]: value }));
    };

    const handleClear = () => {
        setInputs(initialInputs);
        setResult(null);
    }

    const handleCalculate = () => {
        const area = parseFloat(inputs.area);
        const yieldPerAcre = parseFloat(inputs.yieldPerAcre);
        const sellingPrice = parseFloat(inputs.sellingPrice);
        const productionCostPerAcre = parseFloat(inputs.productionCost);

        if (isNaN(area) || isNaN(yieldPerAcre) || isNaN(sellingPrice) || isNaN(productionCostPerAcre)) {
            setResult(null);
            return;
        }

        const netYield = area * yieldPerAcre;
        const revenue = netYield * sellingPrice;
        const totalCosts = productionCostPerAcre * area;
        const profit = revenue - totalCosts;
        const roi = totalCosts > 0 ? (profit / totalCosts) * 100 : (profit > 0 ? Infinity : 0);
        const breakevenPrice = netYield > 0 ? totalCosts / netYield : 0;

        setResult({
            netYield,
            revenue,
            totalCosts,
            profit,
            roi,
            breakevenPrice,
        });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('en-IN').format(value);
    }

    const hasInputs = Object.values(inputs).some(v => v !== '');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Crop Yield Calculator</h1>
                <p className="text-muted-foreground">Estimate your potential profit or loss for a crop.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Enter Crop Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="area">Area (acres)</Label>
                                <Input id="area" type="number" placeholder="e.g., 5" value={inputs.area} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="yieldPerAcre">Expected Yield (kg/acre)</Label>
                                <Input id="yieldPerAcre" type="number" placeholder="e.g., 2000" value={inputs.yieldPerAcre} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sellingPrice">Market Price (₹/kg)</Label>
                                <Input id="sellingPrice" type="number" placeholder="e.g., 20" value={inputs.sellingPrice} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="productionCost">Production Cost (₹/acre)</Label>
                                <Input id="productionCost" type="number" placeholder="e.g., 12000" value={inputs.productionCost} onChange={handleInputChange} />
                            </div>
                        </div>
                        
                    </CardContent>
                    <CardFooter className="flex justify-between gap-2 bg-muted/50 p-4 rounded-b-lg">
                        <Button onClick={handleClear} variant="ghost" disabled={!hasInputs}>
                            <Trash2 className="mr-2 h-4 w-4" /> Clear
                        </Button>
                        <Button onClick={handleCalculate} disabled={!inputs.area || !inputs.yieldPerAcre || !inputs.sellingPrice || !inputs.productionCost}>
                            <Calculator className="mr-2 h-4 w-4" /> Calculate
                        </Button>
                    </CardFooter>
                </Card>

                 <Card>
                     <CardHeader>
                        <CardTitle>Calculation Results</CardTitle>
                        <CardDescription>Based on the values you provided.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    {result ? (
                        <div className="space-y-3">
                            <div className={`p-4 rounded-lg text-center ${result.profit >= 0 ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'}`}>
                                <p className="text-sm font-semibold">{result.profit >= 0 ? "Estimated Profit" : "Estimated Loss"}</p>
                                <p className="text-3xl font-bold">{formatCurrency(result.profit)}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="p-3 bg-muted rounded-lg">
                                    <p className="text-muted-foreground flex items-center gap-1.5"><TrendingUp className="h-4 w-4"/>Total Revenue</p>
                                    <p className="font-semibold text-lg">{formatCurrency(result.revenue)}</p>
                                </div>
                                <div className="p-3 bg-muted rounded-lg">
                                    <p className="text-muted-foreground flex items-center gap-1.5"><TrendingDown className="h-4 w-4"/>Total Costs</p>
                                    <p className="font-semibold text-lg">{formatCurrency(result.totalCosts)}</p>
                                </div>
                                <div className="p-3 bg-muted rounded-lg col-span-2">
                                    <p className="text-muted-foreground flex items-center gap-1.5"><Scale className="h-4 w-4"/>Breakeven Price (per kg)</p>
                                    <p className="font-semibold text-lg">{formatCurrency(result.breakevenPrice)}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                         <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                            <Calculator className="h-12 w-12 mb-4" />
                            <p>Your results will be displayed here.</p>
                        </div>
                    )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
