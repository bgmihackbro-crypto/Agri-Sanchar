
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, Check, IndianRupee, X as XIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface CalculatorInput {
    area: string;
    yieldPerAcre: string;
    sellingPrice: string;
    productionCost: string;
    fixedCosts: string;
    otherIncome: string;
    lossPercentage: string;
}

interface CalculationResult {
    netYield: number;
    revenue: number;
    totalCosts: number;
    profit: number;
    roi: number;
    breakevenPrice: number;
}

export default function YieldCalculatorPage() {
    const [inputs, setInputs] = useState<CalculatorInput>({
        area: '',
        yieldPerAcre: '',
        sellingPrice: '',
        productionCost: '',
        fixedCosts: '0',
        otherIncome: '0',
        lossPercentage: '0',
    });
    const [result, setResult] = useState<CalculationResult | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setInputs(prev => ({ ...prev, [id]: value }));
    };

    const handleCalculate = () => {
        const area = parseFloat(inputs.area);
        const yieldPerAcre = parseFloat(inputs.yieldPerAcre);
        const sellingPrice = parseFloat(inputs.sellingPrice);
        const productionCostPerAcre = parseFloat(inputs.productionCost);
        const fixedCosts = parseFloat(inputs.fixedCosts);
        const otherIncome = parseFloat(inputs.otherIncome);
        const lossPercentage = parseFloat(inputs.lossPercentage);

        if (isNaN(area) || isNaN(yieldPerAcre) || isNaN(sellingPrice) || isNaN(productionCostPerAcre)) {
            setResult(null);
            return;
        }

        const grossYield = area * yieldPerAcre;
        const loss = grossYield * (lossPercentage / 100);
        const netYield = grossYield - loss;
        const revenue = netYield * sellingPrice;
        const variableCosts = productionCostPerAcre * area;
        const totalCosts = variableCosts + fixedCosts;
        const profit = revenue + otherIncome - totalCosts;
        const roi = totalCosts > 0 ? (profit / totalCosts) * 100 : 0;
        const breakevenPrice = netYield > 0 ? (totalCosts - otherIncome) / netYield : 0;

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
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(value);
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('en-IN').format(value);
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Crop Yield Calculator</h1>
                <p className="text-muted-foreground">Estimate your potential profit or loss for a crop.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
                <Card>
                    <CardHeader>
                        <CardTitle>Enter Crop Details</CardTitle>
                        <CardDescription>Provide the details below to calculate your estimated yield and profit.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="area">Area Under Cultivation (acres)</Label>
                            <Input id="area" type="number" placeholder="e.g., 5" value={inputs.area} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="yieldPerAcre">Expected Yield per Acre (kg/acre)</Label>
                            <Input id="yieldPerAcre" type="number" placeholder="e.g., 2000" value={inputs.yieldPerAcre} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sellingPrice">Market Selling Price (₹ per kg)</Label>
                            <Input id="sellingPrice" type="number" placeholder="e.g., 20" value={inputs.sellingPrice} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="productionCost">Production Cost per Acre (₹)</Label>
                            <Input id="productionCost" type="number" placeholder="e.g., 12000" value={inputs.productionCost} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fixedCosts">Fixed Costs (₹)</Label>
                            <Input id="fixedCosts" type="number" value={inputs.fixedCosts} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="otherIncome">Other Income (₹)</Label>
                            <Input id="otherIncome" type="number" value={inputs.otherIncome} onChange={handleInputChange} />
                        </div>
                         <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="lossPercentage">Post-harvest/Field Loss (%)</Label>
                            <Input id="lossPercentage" type="number" value={inputs.lossPercentage} onChange={handleInputChange} />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleCalculate} className="w-full">
                            <Calculator className="mr-2 h-4 w-4" /> Calculate
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="sticky top-24">
                    <CardHeader>
                        <CardTitle>Calculation Results</CardTitle>
                        <CardDescription>Here is the breakdown of your estimated profitability.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {result ? (
                            <div className="space-y-4">
                                <Alert variant={result.profit >= 0 ? "default" : "destructive"} className={result.profit >= 0 ? "bg-green-50 border-green-200" : ""}>
                                    {result.profit >= 0 ? <Check className="h-4 w-4" /> : <XIcon className="h-4 w-4" />}
                                    <AlertTitle className="text-xl font-bold">
                                        {result.profit >= 0 ? "Estimated Profit" : "Estimated Loss"}
                                    </AlertTitle>
                                    <AlertDescription className="text-2xl font-bold">
                                        {formatCurrency(result.profit)}
                                    </AlertDescription>
                                </Alert>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="p-3 bg-muted rounded-lg">
                                        <p className="text-muted-foreground">Total Revenue</p>
                                        <p className="font-semibold text-lg">{formatCurrency(result.revenue)}</p>
                                    </div>
                                    <div className="p-3 bg-muted rounded-lg">
                                        <p className="text-muted-foreground">Total Costs</p>
                                        <p className="font-semibold text-lg">{formatCurrency(result.totalCosts)}</p>
                                    </div>
                                    <div className="p-3 bg-muted rounded-lg">
                                        <p className="text-muted-foreground">Net Yield</p>
                                        <p className="font-semibold text-lg">{formatNumber(result.netYield)} kg</p>
                                    </div>
                                    <div className="p-3 bg-muted rounded-lg">
                                        <p className="text-muted-foreground">Return on Investment (ROI)</p>
                                        <p className="font-semibold text-lg">{result.roi.toFixed(2)}%</p>
                                    </div>
                                     <div className="p-3 bg-blue-50 border-blue-200 rounded-lg col-span-2">
                                        <p className="text-blue-700">Breakeven Price</p>
                                        <p className="font-semibold text-lg text-blue-900">{formatCurrency(result.breakevenPrice)} / kg</p>
                                        <p className="text-xs text-blue-800">This is the minimum price you must sell at to cover your costs.</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64">
                                <Calculator className="h-12 w-12 mb-4" />
                                <p>Your results will be displayed here once you fill out the form and click "Calculate".</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
