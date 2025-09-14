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
        <div className="text-center">
            <h1 className="text-3xl font-bold font-headline">Agricultural Services</h1>
            <p className="text-muted-foreground mt-2">All essential tools in one place to improve traditional farming with modern technology.</p>
        </div>

      <div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {serviceLinks.map((link) => (
            <Card key={link.title} className="flex flex-col hover:shadow-lg transition-shadow rounded-2xl">
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
