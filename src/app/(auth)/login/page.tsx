
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

const translations = {
    'English': {
        login: "Login",
        enterPhone: "Enter your phone number to login (Simulated).",
        enterOtp: "Enter the simulated OTP to continue.",
        phoneLabel: "Phone Number",
        phonePlaceholder: "9876543210",
        sendOtp: "Send OTP",
        sendingOtp: "Sending OTP...",
        otpLabel: "One-Time Password",
        otpPlaceholder: "123456",
        verifyAndLogin: "Verify OTP & Login",
        verifying: "Verifying...",
        noAccount: "Don't have an account?",
        signUp: "Sign up",
        otpSentTitle: "OTP Sent (Simulated)",
        otpSentDesc: "Enter 123456 to log in.",
        invalidOtpTitle: "Invalid OTP",
        invalidOtpDesc: "The OTP you entered is incorrect.",
        loginFailedTitle: "Login Failed",
        loginFailedDesc: "This phone number is not registered. Please sign up.",
        welcomeBack: "Welcome back to Agri-Sanchar!",
        loginSuccess: "Login Successful",
        errorTitle: "Error",
        errorDesc: "An unexpected error occurred during login."
    },
    'Hindi': {
        login: "लॉग इन करें",
        enterPhone: "लॉग इन करने के लिए अपना फ़ोन नंबर दर्ज करें (नकली)।",
        enterOtp: "जारी रखने के लिए नकली ओटीपी दर्ज करें।",
        phoneLabel: "फ़ोन नंबर",
        phonePlaceholder: "9876543210",
        sendOtp: "ओटीपी भेजें",
        sendingOtp: "ओटीपी भेजा जा रहा है...",
        otpLabel: "वन-टाइम पासवर्ड",
        otpPlaceholder: "123456",
        verifyAndLogin: "ओटीपी सत्यापित करें और लॉग इन करें",
        verifying: "सत्यापित हो रहा है...",
        noAccount: "खाता नहीं है?",
        signUp: "साइन अप करें",
        otpSentTitle: "ओटीपी भेजा गया (नकली)",
        otpSentDesc: "लॉग इन करने के लिए 123456 दर्ज करें।",
        invalidOtpTitle: "अमान्य ओटीपी",
        invalidOtpDesc: "आपके द्वारा दर्ज किया गया ओटीपी गलत है।",
        loginFailedTitle: "लॉगिन विफल",
        loginFailedDesc: "यह फ़ोन नंबर पंजीकृत नहीं है। कृपया साइन अप करें।",
        welcomeBack: "कृषि-संचार में आपका स्वागत है!",
        loginSuccess: "लॉगिन सफल",
        errorTitle: "त्रुटि",
        errorDesc: "लॉगिन के दौरान एक अप्रत्याशित त्रुटि हुई।"
    }
};

const addWelcomeNotification = (name: string, lang: 'English' | 'Hindi') => {
    const newNotification = {
        id: Date.now().toString(),
        title: lang === 'Hindi' ? `वापसी पर स्वागत है, ${name}!` : `Welcome back, ${name}!`,
        description: lang === 'Hindi' ? "आपने कृषि-संचार में सफलतापूर्वक लॉग इन कर लिया है।" : "You have successfully logged in to Agri-Sanchar.",
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
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [language, setLanguage] = useState<'English' | 'Hindi'>('English');

  useEffect(() => {
    const lang = localStorage.getItem('selectedLanguage');
    if (lang === 'Hindi') {
        setLanguage('Hindi');
    }
  }, []);

  const t = translations[language];


  const handleSendOtp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    // Simulate sending OTP
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      toast({
        title: t.otpSentTitle,
        description: t.otpSentDesc,
      });
    }, 1000);
  };

  const handleVerifyOtp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    if (otp !== SIMULATED_OTP) {
      toast({
        variant: "destructive",
        title: t.invalidOtpTitle,
        description: t.invalidOtpDesc,
      });
      return;
    }

    setLoading(true);

    setTimeout(() => {
      try {
        const existingProfile = localStorage.getItem("userProfile");
        
        let profileFound = false;
        let userProfile;

        if (existingProfile) {
            userProfile = JSON.parse(existingProfile);
            if (userProfile.phone === `+91${phone}`) {
                profileFound = true;
            }
        }

        if (!profileFound || !userProfile) {
            toast({ 
                variant: "destructive", 
                title: t.loginFailedTitle, 
                description: t.loginFailedDesc
            });
            setLoading(false);
            router.push('/signup');
            return;
        }

        // Set the language in the user's profile upon successful login
        userProfile.language = language;
        localStorage.setItem('userProfile', JSON.stringify(userProfile));

        addWelcomeNotification(userProfile.name, language);

        toast({
          title: t.loginSuccess,
          description: t.welcomeBack,
        });

        const redirectUrl = searchParams.get('redirect');

        if (redirectUrl) {
            router.push(redirectUrl);
        } else if (userProfile.state && userProfile.city) {
            router.push("/dashboard");
        } else {
            router.push("/profile");
        }

      } catch (error) {
        console.error("Simulated login error:", error);
        toast({
          variant: "destructive",
          title: t.errorTitle,
          description: t.errorDesc,
        });
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <Card className="w-full max-w-sm animate-card-flip-in bg-white/90 backdrop-blur-sm border-gray-200/50">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline text-foreground">{t.login}</CardTitle>
        <CardDescription className="text-muted-foreground">
          {otpSent ? t.enterOtp : t.enterPhone}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="phone" className="text-foreground text-left">{t.phoneLabel}</Label>
              <div className="flex items-center gap-2">
                <span className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm">
                  +91
                </span>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={t.phonePlaceholder}
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').substring(0, 10))}
                  disabled={loading}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading || phone.length < 10}>
              {loading && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? t.sendingOtp : t.sendOtp}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="otp" className="text-foreground text-left">{t.otpLabel}</Label>
              <Input
                id="otp"
                type="tel"
                placeholder={t.otpPlaceholder}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))}
                disabled={loading}
                className="tracking-widest text-center"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || otp.length < 6}>
              {loading && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? t.verifying : t.verifyAndLogin}
            </Button>
          </form>
        )}
        <div className="mt-4 text-center text-sm text-foreground">
          {t.noAccount}{" "}
          <Link href="/signup" className="underline text-primary font-semibold">
            {t.signUp}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
