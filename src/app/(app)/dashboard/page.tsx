
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { MessageSquare, CloudSun, Search, TrendingUp, FlaskConical, Bug, Landmark, Users, Tractor, Calculator, ArrowRight, Volume2, Loader2 } from "lucide-react";
import React from 'react';
import Image from "next/image";
import { useNotifications } from "@/context/notification-context";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  
  const { addNotification } = useNotifications();
  const { t, language } = useTranslation();
  const [flippedCard, setFlippedCard] = React.useState<number | null>(null);

  const [voices, setVoices] = React.useState<SpeechSynthesisVoice[]>([]);
  const [nowPlayingIndex, setNowPlayingIndex] = React.useState<number | null>(null);
  const utteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null);

  React.useEffect(() => {
    const populateVoiceList = () => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
            setVoices(availableVoices);
            window.speechSynthesis.onvoiceschanged = null; // Remove the listener after populating
        }
    };
    
    populateVoiceList();
    if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = populateVoiceList;
    }
    
    return () => {
      // Cleanup on component unmount
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSchemeClick = (e: React.MouseEvent, title: string) => {
      e.preventDefault(); // Prevent navigation for the old implementation
      addNotification({
          title: t.dashboard.schemeNotification.title(title),
          description: t.dashboard.schemeNotification.description,
      });
  };

  const speak = (text: string, index: number) => {
    if (nowPlayingIndex === index) {
      window.speechSynthesis.cancel();
      setNowPlayingIndex(null);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any currently playing speech

    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang = language === 'Hindi' ? 'hi-IN' : 'en-US';
    utterance.lang = targetLang;

    let selectedVoice = null;
    if (targetLang === 'hi-IN') {
        selectedVoice = voices.find(voice => voice.lang === 'hi-IN' && voice.name.includes('Google')) 
                     || voices.find(voice => voice.lang === 'hi-IN');
    } else {
        selectedVoice = voices.find(voice => voice.lang === 'en-US' && voice.name.includes('Google')) 
                     || voices.find(voice => voice.lang.startsWith('en-'));
    }
    
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }

    utterance.onstart = () => setNowPlayingIndex(index);
    utterance.onend = () => setNowPlayingIndex(null);
    utterance.onerror = (e) => {
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
            console.error("Speech synthesis error", e);
        }
        setNowPlayingIndex(null);
    }
    
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };


  const serviceLinks = [
    {
      title: t.dashboard.services.chatbot.title,
      href: "/chatbot",
      icon: MessageSquare,
      badge: null,
      color: "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800/50",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: t.dashboard.services.detection.title,
      href: "/detection",
      icon: Search,
      badge: null,
      color: "bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800/50",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: t.dashboard.services.weather.title,
      href: "/weather",
      icon: CloudSun,
      badge: null,
      color: "bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800/50",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
    {
      title: t.dashboard.services.market.title,
      href: "/market",
      icon: TrendingUp,
      badge: null,
      color: "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800/50",
      iconColor: "text-green-600 dark:text-green-400",
    },
     {
      title: t.dashboard.services.soil.title,
      href: "/soil-testing",
      icon: FlaskConical,
      badge: null,
      color: "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800/50",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
     {
      title: t.dashboard.services.rental.title,
      href: "/rental",
      icon: Tractor,
      badge: null,
      color: "bg-lime-100 dark:bg-lime-900/30 border-lime-200 dark:border-lime-800/50",
      iconColor: "text-lime-600 dark:text-lime-400",
    },
    {
      title: t.dashboard.services.schemes.title,
      href: "/schemes", // Updated href to point to the new page
      icon: Landmark,
      badge: t.dashboard.services.schemes.badge,
      badgeColor: "bg-pink-500",
      color: "bg-pink-100 dark:bg-pink-900/30 border-pink-200 dark:border-pink-800/50",
      iconColor: "text-pink-600 dark:text-pink-400",
    },
    {
      title: t.dashboard.services.pesticide.title,
      href: "/pesticide-guide",
      icon: Bug,
      badge: null,
      color: "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800/50",
      iconColor: "text-red-600 dark:text-red-400",
    },
  ];

  const newsAndEvents = t.dashboard.newsAndEvents;


  return (
    <div
      className="space-y-8"
    >
      <div
        className="space-y-4"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold font-headline">{t.dashboard.servicesTitle}</h1>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-4">
          {serviceLinks.map((link, i) => (
            <Card
              key={link.title}
              className={cn("flex flex-col hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in-up hover:-translate-y-1 rounded-2xl", link.color)}
              style={{ animationDelay: `${0.3 + i * 0.05}s` }}
            >
              <Link href={link.href} className="flex flex-col flex-grow items-center justify-center p-2 sm:p-3 text-center">
                <div className="p-2 sm:p-3 bg-background/50 rounded-lg mb-2">
                  <link.icon className={cn("w-5 h-5 sm:w-6 sm:h-6", link.iconColor)} />
                </div>
                <CardTitle className="font-headline text-[11px] sm:text-xs leading-tight">{link.title}</CardTitle>
                {link.badge && <Badge className={`text-white text-[10px] ${link.badgeColor} absolute top-1.5 right-1.5`}>{link.badge}</Badge>}
              </Link>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="space-y-4 pt-4">
        <div className="text-center">
            <h1 className="text-2xl font-bold font-headline">{t.dashboard.newsAndEventsTitle}</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 [perspective:1000px]">
            {newsAndEvents.map((item, i) => (
                <div
                    key={i}
                    className={cn(
                        "relative transition-transform duration-700 [transform-style:preserve-3d]",
                        flippedCard === i && "[transform:rotateY(180deg)]"
                    )}
                 >
                    {/* Front of the card */}
                    <Card
                        className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group animate-fade-in-up [backface-visibility:hidden] cursor-pointer min-h-[160px] flex flex-col"
                        style={{ animationDelay: `${0.5 + i * 0.1}s` }}
                        onClick={() => setFlippedCard(flippedCard === i ? null : i)}
                    >
                        <CardHeader className="flex-grow">
                            <CardTitle className="text-base font-semibold leading-tight">{item.title}</CardTitle>
                        </CardHeader>
                        <CardFooter className="p-4 flex justify-between items-center bg-muted/50">
                        <p className="text-xs text-muted-foreground font-semibold">
                            {item.source}
                        </p>
                        <ArrowRight className="h-4 w-4 text-primary transition-transform duration-300 group-hover:translate-x-1" />
                        </CardFooter>
                    </Card>
                     {/* Back of the card */}
                    <Card
                        className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col"
                        onClick={() => setFlippedCard(flippedCard === i ? null : i)}
                    >
                         <CardHeader className="relative">
                             <CardDescription className="text-xs font-bold">{item.source}</CardDescription>
                             <Button
                                size="icon"
                                variant="ghost"
                                className="absolute top-2 right-2 h-7 w-7"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    speak(item.details, i);
                                }}
                             >
                                 {nowPlayingIndex === i ? (
                                    <Loader2 className="h-4 w-4 animate-spin"/>
                                ) : (
                                    <Volume2 className="h-4 w-4" />
                                )}
                             </Button>
                        </CardHeader>
                        <CardContent className="flex-grow overflow-y-auto text-sm">
                           <p>{item.details}</p>
                        </CardContent>
                    </Card>
                </div>
            ))}
        </div>
      </div>

    </div>
  );
}
