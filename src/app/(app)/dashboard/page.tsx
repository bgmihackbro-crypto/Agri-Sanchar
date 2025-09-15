
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Bot, CloudSun, Search, TrendingUp, FlaskConical, Bug } from "lucide-react";
import React from 'react';
import Image from "next/image";
import { Button } from "@/components/ui/button";

const serviceLinks = [
  {
    title: "AI Advisory Chatbot",
    description: "AI-powered advice for crop, soil and pest problems. Communicate with voice support.",
    href: "/chatbot",
    icon: Bot,
    badge: null,
    badgeColor: null
  },
  {
    title: "Pest/Disease Detection",
    description: "Upload crop photos and get instant AI-powered pest or disease identification.",
    href: "#",
    icon: Search,
    badge: null,
    badgeColor: null
  },
  {
    title: "Weather Forecast",
    description: "7-day weather forecast, rainfall warnings, and farming-suitable weather conditions.",
    href: "/weather",
    icon: CloudSun,
    badge: null,
    badgeColor: null
  },
  {
    title: "Market Prices",
    description: "Fresh daily market rates, price trends, and better selling suggestions.",
    href: "#",
    icon: TrendingUp,
    badge: null,
    badgeColor: null
  },
  {
    title: "Soil Testing",
    description: "Upload soil reports and get recommendations for proper fertilizer quantities.",
    href: "#",
    icon: FlaskConical,
    badge: "नया",
    badgeColor: "bg-green-500"
  },
  {
    title: "Pesticide Guide",
    description: "Accurate information and usage methods for organic and chemical pesticides.",
    href: "#",
    icon: Bug,
    badge: "जल्द ही आ रहा",
    badgeColor: "bg-orange-400"
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="relative rounded-xl overflow-hidden w-full h-64 md:h-80 animate-fade-in-up">
        <Image
          src="https://picsum.photos/seed/farm-illustration/1200/400"
          alt="An illustration of a farm with a tractor in a field"
          fill
          className="object-cover"
          data-ai-hint="farm tractor"
        />
        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white font-headline">Agri-Sanchar</h1>
          <p className="mt-2 text-lg md:text-xl text-white/90">Your Digital Partner for Smart Farming</p>
          <p className="mt-4 max-w-2xl text-sm text-white/80">
            AI-powered crop advisory, pest detection, weather alerts, and market prices - all in your language to help small farmers grow better.
          </p>
        </div>
      </div>

      <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-3xl font-bold font-headline">Agricultural Services</h2>
          <p className="text-muted-foreground mt-2">All essential tools in one place to improve traditional farming with modern technology.</p>
      </div>

      <div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {serviceLinks.map((link, i) => (
            <Card key={link.title} className="flex flex-col hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in-up" style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
                <Link href={link.href} className="flex flex-col flex-grow">
                    <CardHeader className="relative">
                        <div className="flex items-start justify-between">
                            <div className="p-3 bg-primary/10 rounded-xl">
                                <link.icon className="w-6 h-6 text-primary" />
                            </div>
                            {link.badge && <Badge className={`text-white ${link.badgeColor}`}>{link.badge}</Badge>}
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col">
                        <CardTitle className="font-headline text-lg mb-2">{link.title}</CardTitle>
                        <p className="text-muted-foreground text-sm">{link.description}</p>
                    </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
