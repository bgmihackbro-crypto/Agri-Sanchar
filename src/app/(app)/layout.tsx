
"use client";

import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { BottomNav } from "@/components/bottom-nav";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { NotificationProvider } from "@/context/notification-context";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";


function ProfileCompletionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Exclude join page from profile completion check
    const isJoinPage = pathname.startsWith('/community/join');
    if (isJoinPage) return;

    // Only run this check on the client side
    if (typeof window !== 'undefined') {
      const savedProfile = localStorage.getItem("userProfile");
      let isProfileComplete = false;

      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile);
          // A profile is considered complete if it has a state and a city.
          if (profile.state && profile.city) {
            isProfileComplete = true;
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }

      // If the profile is not complete and the user is not on the profile page, redirect them.
      if (!isProfileComplete && pathname !== "/profile") {
        router.replace("/profile");
      }
    }
  }, [pathname, router]);

  return <>{children}</>;
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <ProfileCompletionGuard>
        <SidebarProvider>
          <Sidebar collapsible="icon">
            <AppSidebar />
          </Sidebar>
          <div className="md:hidden">
            <BottomNav />
          </div>
          <SidebarInset>
            <AppHeader />
            <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </ProfileCompletionGuard>
    </NotificationProvider>
  );
}
