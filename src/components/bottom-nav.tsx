
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Users, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navLinks = [
    { href: "/dashboard", label: t.bottomNav.home, icon: Home },
    { href: "/community", label: t.bottomNav.community, icon: Users },
    { href: "/yield-calculator", label: t.bottomNav.calculator, icon: Calculator },
    { href: "/profile", label: t.bottomNav.profile, icon: User },
  ];


  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <link.icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
