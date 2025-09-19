
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  CloudSun,
  LayoutDashboard,
  Users,
  User,
  Search,
  TrendingUp,
  FlaskConical,
  Bug
} from "lucide-react";
import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chatbot", label: "AI Chatbot", icon: Bot },
  { href: "/detection", label: "Detection", icon: Search },
  { href: "/weather", label: "Weather", icon: CloudSun },
  { href: "/community", label: "Community", icon: Users },
  { href: "/market", label: "Market Prices", icon: TrendingUp },
  { href: "/soil-testing", label: "Soil Testing", icon: FlaskConical },
  { href: "#", label: "Pesticide Guide", icon: Bug },
  { href: "/profile", label: "Profile", icon: User },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarContent className="pt-8">
        <SidebarMenu>
          {links.map((link) => (
            <SidebarMenuItem key={link.label}>
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
