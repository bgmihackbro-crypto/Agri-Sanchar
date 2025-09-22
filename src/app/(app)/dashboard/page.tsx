
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Bot, CloudSun, Search, TrendingUp, FlaskConical, Bug, Landmark, Users, Tractor } from "lucide-react";
import React from 'react';
import Image from "next/image";
import { useNotifications } from "@/context/notification-context";
import { useTranslation } from "@/hooks/use-translation";

export default function DashboardPage() {
  
  const { addNotification } = useNotifications();
  const { t } = useTranslation();

  const handleSchemeClick = (e: React.MouseEvent, title: string) => {
      e.preventDefault(); // Prevent navigation for the old implementation
      addNotification({
          title: t.dashboard.schemeNotification.title(title),
          description: t.dashboard.schemeNotification.description,
      });
  };

  const serviceLinks = [
    {
      title: t.dashboard.services.chatbot.title,
      description: t.dashboard.services.chatbot.description,
      href: "/chatbot",
      icon: Bot,
      badge: null,
      badgeColor: null,
    },
    {
      title: t.dashboard.services.detection.title,
      description: t.dashboard.services.detection.description,
      href: "/detection",
      icon: Search,
      badge: null,
      badgeColor: null,
    },
    {
      title: t.dashboard.services.weather.title,
      description: t.dashboard.services.weather.description,
      href: "/weather",
      icon: CloudSun,
      badge: null,
      badgeColor: null,
    },
    {
      title: t.dashboard.services.market.title,
      description: t.dashboard.services.market.description,
      href: "/market",
      icon: TrendingUp,
      badge: null,
      badgeColor: null,
    },
    {
      title: t.dashboard.services.community.title,
      description: t.dashboard.services.community.description,
      href: "/community",
      icon: Users,
      badge: null,
      badgeColor: null,
    },
     {
      title: t.dashboard.services.soil.title,
      description: t.dashboard.services.soil.description,
      href: "/soil-testing",
      icon: FlaskConical,
      badge: null,
      badgeColor: null,
    },
    {
      title: t.dashboard.services.schemes.title,
      description: t.dashboard.services.schemes.description,
      href: "/schemes", // Updated href to point to the new page
      icon: Landmark,
      badge: t.dashboard.services.schemes.badge,
      badgeColor: "bg-green-500",
    },
    {
      title: t.dashboard.services.pesticide.title,
      description: t.dashboard.services.pesticide.description,
      href: "/pesticide-guide",
      icon: Bug,
      badge: null,
      badgeColor: null,
    },
    {
      title: t.dashboard.services.rental.title,
      description: t.dashboard.services.rental.description,
      href: "/rental-equipment",
      icon: Tractor,
      badge: null,
      badgeColor: null,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl md:text-3xl font-bold font-headline">{t.dashboard.servicesTitle}</h2>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">{t.dashboard.servicesDescription}</p>
      </div>

      <div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {serviceLinks.map((link, i) => (
            <Card key={link.title} className="flex flex-col hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in-up" style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
                <Link href={link.href} className="flex flex-col flex-grow">
                    <CardHeader className="relative p-4">
                        <div className="flex items-start justify-between">
                            <div className="p-2 md:p-3 bg-primary/10 rounded-lg md:rounded-xl">
                                <link.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                            </div>
                            {link.badge && <Badge className={`text-white text-xs ${link.badgeColor}`}>{link.badge}</Badge>}
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col p-4 pt-0">
                        <CardTitle className="font-headline text-base md:text-lg mb-1 leading-tight">{link.title}</CardTitle>
                        <p className="text-muted-foreground text-xs md:text-sm line-clamp-2">{link.description}</p>
                    </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
