
"use client";

import { useState, useContext } from "react";
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
import { Spinner } from "@/components/ui/spinner";

const SIMULATED_OTP = "123456";

// A helper function to add notification to localStorage directly
// This is used because the NotificationContext is not available on the auth pages
const addWelcomeNotification = (name: string) => {
    const newNotification = {
        id: Date.now().toString(),
        title: `Welcome back, ${name}!`,
        description: "You have successfully logged in to Agri-Sanchar.",
        read: false,
        timestamp: Date.now(),
    };

    try {
        const storedNotifications = localStorage.getItem("notifications");
        const notifications = storedNotifications ? JSON.parse(storedNotifications) : [];
        localStorage.setItem("notifications", JSON.stringify([newNotification, ...notifications]));
    } catch (error) {
        console.error("Failed to add notification to localStorage", error);
    }
};


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
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
        description: `Enter ${SIMULATED_OTP} to log in.`,
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

    // Simulate successful verification and login
    setTimeout(() => {
      try {
        const userProfile = {
          name: "Simulated User",
          phone: "+91" + phone,
          avatar: `https://picsum.photos/seed/${phone}/100/100`,
          farmSize: "10",
          city: "Ludhiana",
          state: "Punjab",
          annualIncome: "500000",
        };

        localStorage.setItem("userProfile", JSON.stringify(userProfile));
        addWelcomeNotification(userProfile.name);

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
    }, 1000);
  };

  return (
    <Card className="w-full max-w-sm animate-card-flip-in bg-green-100/90 backdrop-blur-sm border-green-200/50">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline text-foreground">Login</CardTitle>
        <CardDescription className="text-black">
          {otpSent ? "Enter the simulated OTP to continue." : "Enter your phone number to login (Simulated)."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="grid gap-4">
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
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-green-400 hover:bg-green-500 text-black font-bold" disabled={loading || phone.length < 10}>
              {loading && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
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
                className="tracking-widest text-center"
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-primary-foreground font-bold" disabled={loading || otp.length < 6}>
              {loading && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Verifying..." : "Verify OTP & Login"}
            </Button>
          </form>
        )}
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
