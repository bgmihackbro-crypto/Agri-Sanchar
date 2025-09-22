
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
import { cn } from "@/lib/utils";

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
      href: "/chatbot",
      icon: Bot,
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
      color: "bg-cyan-100 dark:bg-cyan-900/30 border-cyan-200 dark:border-cyan-800/50",
      iconColor: "text-cyan-600 dark:text-cyan-400",
    },
    {
      title: t.dashboard.services.market.title,
      href: "/market",
      icon: TrendingUp,
      badge: null,
      color: "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800/50",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      title: t.dashboard.services.community.title,
      href: "/community",
      icon: Users,
      badge: null,
      color: "bg-pink-100 dark:bg-pink-900/30 border-pink-200 dark:border-pink-800/50",
      iconColor: "text-pink-600 dark:text-pink-400",
    },
     {
      title: t.dashboard.services.soil.title,
      href: "/soil-testing",
      icon: FlaskConical,
      badge: null,
      color: "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800/50",
      iconColor: "text-yellow-600 dark:text-yellow-400",
    },
    {
      title: t.dashboard.services.schemes.title,
      href: "/schemes", // Updated href to point to the new page
      icon: Landmark,
      badge: t.dashboard.services.schemes.badge,
      badgeColor: "bg-green-500",
      color: "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800/50",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      title: t.dashboard.services.pesticide.title,
      href: "/pesticide-guide",
      icon: Bug,
      badge: null,
      color: "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800/50",
      iconColor: "text-red-600 dark:text-red-400",
    },
    {
      title: t.dashboard.services.rental.title,
      href: "/rental-equipment",
      icon: Tractor,
      badge: null,
      color: "bg-indigo-100 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800/50",
      iconColor: "text-indigo-600 dark:text-indigo-400",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold font-headline">{t.dashboard.servicesTitle}</h1>
        <p className="text-muted-foreground">{t.dashboard.servicesDescription}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-4">
        {serviceLinks.map((link, i) => (
          <Card key={link.title} className={cn("flex flex-col hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in-up hover:-translate-y-1", link.color)} style={{ animationDelay: `${0.3 + i * 0.05}s` }}>
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
  );
}
