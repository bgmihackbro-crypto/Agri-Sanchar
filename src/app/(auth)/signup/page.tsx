
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

const SIMULATED_OTP = "123456";

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    // Simulate sending OTP
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      toast({
        title: "OTP Sent (Simulated)",
        description: `Enter ${SIMULATED_OTP} to sign up.`,
      });
    }, 1000);
  };

  const handleVerifyOtp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    if (otp !== SIMULATED_OTP) {
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: "The OTP you entered is incorrect.",
      });
      return;
    }

    setLoading(true);

    // Simulate successful verification and signup
    setTimeout(() => {
      try {
        const userProfile = {
          name: name,
          phone: "+91" + phone,
          avatar: `https://picsum.photos/seed/${phone}/100/100`,
          farmSize: "",
          city: "",
          state: "",
          annualIncome: "",
        };

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
    }, 1000);
  };

  return (
    <Card className="w-full max-w-sm animate-card-flip-in bg-green-100/90 backdrop-blur-sm border-gray-200/50">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">Sign Up</CardTitle>
        <CardDescription className="text-foreground">
          {otpSent ? "Enter the simulated OTP to create your account." : "Create your account to get started (Simulated)."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="grid gap-4">
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
            <Button type="submit" className="w-full hover:bg-primary/90 font-bold text-foreground text-base" disabled={loading || phone.length < 10 || name.length === 0}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Sending OTP..." : "Send OTP"}
            </Button>
          </form>
        ) : (
           <form onSubmit={handleVerifyOtp} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="otp" className="text-foreground text-left">One-Time Password</Label>
              <Input
                id="otp"
                type="tel"
                placeholder="123456"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))}
                disabled={loading}
                className="border-gray-400 tracking-widest text-center"
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-foreground font-bold" disabled={loading || otp.length < 6}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Verifying..." : "Verify OTP & Create Account"}
            </Button>
          </form>
        )}
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
