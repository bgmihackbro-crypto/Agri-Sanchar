
"use client";

import { useState, useEffect } from "react";
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

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
          'callback': () => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
          }
        });
      } catch(e) {
        console.error("Error generating reCAPTCHA", e);
      }
    }
  }, []);

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
      const appVerifier = window.recaptchaVerifier!;
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      window.confirmationResult = confirmationResult;
      setOtpSent(true);
      toast({
        title: "OTP Sent",
        description: "An OTP has been sent to your phone number for verification.",
      });
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send OTP. Please try again.",
      });
    } finally {
        setLoading(false);
    }
  };

  const handleVerifyOtpAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyingOtp) return;
    setVerifyingOtp(true);
    
    const performSignup = () => {
      // Save user details to localStorage
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
        title: "Welcome to Agri-Sanchar!",
        description: "Your account has been created successfully.",
      });
      router.push("/dashboard");
    }

    // Test mode check
    if (phone.replace(/\D/g, '').substring(0, 10) === TEST_PHONE_NUMBER) {
      if (otp.length === 6 && /^\d+$/.test(otp)) {
        performSignup();
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
      performSignup();
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
        <CardTitle className="text-2xl font-headline">Sign Up</CardTitle>
        <CardDescription className="text-foreground">
          {otpSent ? "Verify your number to create an account." : "Create your account to get started."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div id="recaptcha-container"></div>
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
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-foreground font-bold" disabled={loading || phone.length < 10 || name.length === 0}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Sending OTP..." : "Send OTP"}
            </Button>
          </form>
        ) : (
           <form onSubmit={handleVerifyOtpAndSignup} className="grid gap-4">
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
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-foreground font-bold" disabled={verifyingOtp || otp.length < 6}>
             {verifyingOtp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
             {verifyingOtp ? "Verifying..." : "Create Account"}
            </Button>
             <Button variant="link" onClick={() => setOtpSent(false)} className="text-foreground" disabled={verifyingOtp}>
              Back to details
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
