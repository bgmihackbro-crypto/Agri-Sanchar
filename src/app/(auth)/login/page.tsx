
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
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { Loader2 } from "lucide-react";

// Add a test phone number to bypass Firebase OTP for development
const TEST_PHONE_NUMBER = "9999999999";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const setupRecaptcha = () => {
    // Cleanup previous verifier if it exists
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
    }
    const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
      'callback': () => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      }
    });
    window.recaptchaVerifier = recaptchaVerifier;
    return recaptchaVerifier;
  }

  const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    // Test mode check
    if (phone.replace(/\D/g, '').substring(0, 10) === TEST_PHONE_NUMBER) {
      setOtpSent(true);
      toast({
        title: "Test OTP Sent",
        description: "You are in test mode. Enter any 6 digits to proceed.",
      });
      setLoading(false);
      return;
    }
    
    const phoneNumber = "+91" + phone;
    
    try {
      const appVerifier = setupRecaptcha();
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      window.confirmationResult = confirmationResult;
      setOtpSent(true);
      toast({
        title: "OTP Sent",
        description: "An OTP has been sent to your phone number.",
      });
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send OTP. Please check the number and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyingOtp) return;
    setVerifyingOtp(true);

    // Test mode check
    if (phone.replace(/\D/g, '').substring(0, 10) === TEST_PHONE_NUMBER) {
      if (otp.length === 6 && /^\d+$/.test(otp)) {
        toast({
          title: "Login Successful",
          description: "Welcome to Agri-Sanchar!",
        });
        router.push("/dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "Invalid OTP",
          description: "Please enter any 6-digit OTP to continue in test mode.",
        });
        setVerifyingOtp(false);
      }
      return;
    }
    
    try {
      if (!window.confirmationResult) {
        throw new Error("Confirmation result not found.");
      }
      await window.confirmationResult.confirm(otp);
      toast({
        title: "Login Successful",
        description: "Welcome to Agri-Sanchar!",
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: "The OTP you entered is incorrect. Please try again.",
      });
    } finally {
        setVerifyingOtp(false);
    }
  };

  return (
    <Card className="w-full max-w-sm animate-card-flip-in bg-green-100/90 backdrop-blur-sm border-gray-200/50">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline text-foreground">Login</CardTitle>
        <CardDescription className="text-foreground">
          {otpSent
            ? "Enter the OTP sent to your phone."
            : "Enter your phone number to login."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div id="recaptcha-container"></div>
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
                  className="border-gray-400"
                />
              </div>
            </div>
            <Button type="submit" className="w-full hover:bg-primary/90 font-bold text-foreground text-base" disabled={loading || phone.length < 10}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Sending OTP..." : "Login with OTP"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="otp" className="text-foreground text-left">Enter OTP</Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                placeholder="123456"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))}
                disabled={verifyingOtp}
                className="border-gray-400"
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 font-bold" disabled={verifyingOtp || otp.length < 6}>
             {verifyingOtp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
             {verifyingOtp ? "Verifying..." : "Verify OTP & Login"}
            </Button>
             <Button variant="link" onClick={() => setOtpSent(false)} className="text-primary" disabled={verifyingOtp}>
              Back to phone number
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
