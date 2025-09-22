
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, Check, IndianRupee, X as XIcon, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

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

const initialInputs: CalculatorInput = {
    area: '',
    yieldPerAcre: '',
    sellingPrice: '',
    productionCost: '',
    fixedCosts: '0',
    otherIncome: '0',
    lossPercentage: '0',
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
        const fixedCosts = parseFloat(inputs.fixedCosts) || 0;
        const otherIncome = parseFloat(inputs.otherIncome) || 0;
        const lossPercentage = parseFloat(inputs.lossPercentage) || 0;

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

    const hasInputs = inputs.area || inputs.yieldPerAcre || inputs.sellingPrice || inputs.productionCost;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Crop Yield Calculator</h1>
                <p className="text-muted-foreground">Estimate your potential profit or loss for a crop.</p>
            </div>

            <Card className="w-full max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle>Enter Crop Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-semibold mb-2">Primary Inputs</h3>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    </div>
                     <div>
                        <h3 className="font-semibold mb-2">Additional Factors (Optional)</h3>
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="lossPercentage">Post-harvest Loss (%)</Label>
                                <Input id="lossPercentage" type="number" value={inputs.lossPercentage} onChange={handleInputChange} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="fixedCosts">Fixed Costs (₹)</Label>
                                <Input id="fixedCosts" type="number" value={inputs.fixedCosts} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="otherIncome">Other Income (₹)</Label>
                                <Input id="otherIncome" type="number" value={inputs.otherIncome} onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>

                </CardContent>
                <CardFooter className="flex-col sm:flex-row justify-between gap-2 bg-muted/50 p-4 rounded-b-lg">
                    <Button onClick={handleClear} variant="ghost" disabled={!hasInputs}>
                        <Trash2 className="mr-2 h-4 w-4" /> Clear
                    </Button>
                    <Button onClick={handleCalculate} disabled={!hasInputs}>
                        <Calculator className="mr-2 h-4 w-4" /> Calculate
                    </Button>
                </CardFooter>

                {result && (
                     <div className="border-t">
                        <CardHeader>
                            <CardTitle>Calculation Results</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
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
                        </CardContent>
                     </div>
                )}
            </Card>
        </div>
    );
}

