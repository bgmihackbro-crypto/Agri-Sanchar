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

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending OTP
    setTimeout(() => {
      setOtpSent(true);
      setLoading(false);
      toast({
        title: "OTP Sent",
        description: "An OTP has been sent to your phone number for verification.",
      });
    }, 1000);
  };

  const handleVerifyOtpAndSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate OTP verification and account creation
    setTimeout(() => {
      if (otp === "123456") { // Dummy OTP for demo
        toast({
          title: "Account Created!",
          description: "Welcome to Agri-Sanchar.",
        });
        router.push("/dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "Invalid OTP",
          description: "The OTP you entered is incorrect. Please try again.",
        });
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Sign Up</CardTitle>
        <CardDescription>
          {otpSent ? "Verify your number to create an account." : "Create your account to get started."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name"
                placeholder="Ram Singh" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex items-center gap-2">
                 <span className="flex h-10 items-center rounded-md border border-input bg-background px-3 text-sm text-muted-foreground">
                  +91
                </span>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="12345 67890"
                  required
                  pattern="\d{10}"
                  title="Please enter a valid 10-digit phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </Button>
          </form>
        ) : (
           <form onSubmit={handleVerifyOtpAndSignup} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
             {loading ? "Verifying..." : "Create Account"}
            </Button>
             <Button variant="link" onClick={() => setOtpSent(false)} className="text-primary">
              Back to details
            </Button>
          </form>
        )}
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline text-primary">
            Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
