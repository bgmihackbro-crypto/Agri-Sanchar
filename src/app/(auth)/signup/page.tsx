
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

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSimulatedSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      // Simulate creating and storing a new user profile
      const userProfile = {
        name: name,
        phone: "+91" + phone,
        avatar: `https://picsum.photos/seed/${phone}/100/100`,
        farmSize: "",
        city: "",
        state: "",
        annualIncome: "",
      };

      // Save to localStorage for immediate use
      localStorage.setItem("userProfile", JSON.stringify(userProfile));

      toast({
        title: "Welcome to Agri-Sanchar! (Simulated)",
        description: "Your account has been created successfully.",
      });

      router.push("/dashboard");

    } catch (error) {
      console.error("Simulated signup error:", error);
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: "There was a problem creating your profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm animate-card-flip-in bg-green-100/90 backdrop-blur-sm border-gray-200/50">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">Sign Up</CardTitle>
        <CardDescription className="text-foreground">
          Create your account to get started (Simulated).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSimulatedSignup} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-foreground text-left">Full Name</Label>
            <Input 
              id="name"
              placeholder="Ram Singh" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="border-gray-400"
            />
          </div>
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
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-foreground font-bold" disabled={loading || phone.length < 10 || name.length === 0}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Creating Account..." : "Create Account (Simulated)"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-foreground">
          Already have an account?{" "}
          <Link href="/login" className="underline text-primary font-semibold">
            Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
