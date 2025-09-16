
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  
  const handleSimulatedLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      // Simulate fetching a user profile
      const userProfile = {
        name: "Simulated User",
        phone: "+91" + phone,
        avatar: `https://picsum.photos/seed/${phone}/100/100`,
        farmSize: "10",
        city: "Ludhiana",
        state: "Punjab",
        annualIncome: "500000",
      };

      // Save to localStorage to mimic session
      localStorage.setItem("userProfile", JSON.stringify(userProfile));

      toast({
        title: "Login Successful (Simulated)",
        description: "Welcome back to Agri-Sanchar!",
      });

      router.push("/dashboard");

    } catch (error) {
      console.error("Simulated login error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Simulated login failed.",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <Card className="w-full max-w-sm animate-card-flip-in bg-green-100/90 backdrop-blur-sm border-gray-200/50">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline text-foreground">Login</CardTitle>
        <CardDescription className="text-foreground">
          Enter your phone number to login (Simulated).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSimulatedLogin} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="phone" className="text-foreground text-left">Phone Number</Label>
            <div className="flex items-center gap-2">
              <span className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm">
                +91
              </span>
              <Input
                id="phone"
                type="tel"
                placeholder="9876543210"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').substring(0, 10))}
                disabled={loading}
                className="border-gray-400"
              />
            </div>
          </div>
          <Button type="submit" className="w-full hover:bg-primary/90 font-bold text-foreground text-base" disabled={loading || phone.length < 10}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Logging in..." : "Login (Simulated)"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="underline text-primary font-semibold">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
