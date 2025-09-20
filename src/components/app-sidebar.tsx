
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  CloudSun,
  LayoutDashboard,
  Users,
  User,
  TrendingUp,
  FlaskConical,
  Bug,
  Tractor
} from "lucide-react";
import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useTranslation } from "@/hooks/use-translation";

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const links = [
    { href: "/dashboard", label: t.sidebar.dashboard, icon: LayoutDashboard },
    { href: "/chatbot", label: t.sidebar.chatbot, icon: Bot },
    { href: "/rental-equipment", label: t.sidebar.rental, icon: Tractor },
    { href: "/weather", label: t.sidebar.weather, icon: CloudSun },
    { href: "/community", label: t.sidebar.community, icon: Users },
    { href: "/market", label: t.sidebar.market, icon: TrendingUp },
    { href: "/soil-testing", label: t.sidebar.soil, icon: FlaskConical },
    { href: "/pesticide-guide", label: t.sidebar.pesticide, icon: Bug },
    { href: "/profile", label: t.sidebar.profile, icon: User },
  ];

  return (
    <>
      <SidebarContent className="pt-8">
        <SidebarMenu>
          {links.map((link) => (
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton
                asChild
                isActive={link.href !== '#' && pathname.startsWith(link.href)}
                tooltip={link.label}
                className="justify-start"
              >
                <Link href={link.href}>
                  <link.icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
