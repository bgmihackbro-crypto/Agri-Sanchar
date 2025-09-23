
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // This check only runs on the client side
    if (typeof window !== 'undefined') {
      const savedProfile = localStorage.getItem("userProfile");
      let isAdmin = false;

      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile);
          if (profile.userType === 'admin') {
            isAdmin = true;
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }

      // If user is not an admin and not on the admin login page, redirect them.
      if (!isAdmin && pathname !== "/admin/login") {
        router.replace("/admin/login");
      }
      
      // If user is an admin but on the login page, redirect to dashboard.
      if (isAdmin && pathname === "/admin/login") {
        router.replace("/admin/dashboard");
      }
    }
  }, [pathname, router]);

  // Optionally show a loading spinner while checking auth
  if (pathname !== "/admin/login" && typeof window !== 'undefined' && !localStorage.getItem("userProfile")?.includes('"userType":"admin"')) {
      return (
          <div className="flex h-screen w-full items-center justify-center">
              <Spinner className="h-8 w-8" />
          </div>
      );
  }

  return <>{children}</>;
}


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-muted/40">
        {/* We can add Admin-specific headers or sidebars here later */}
        <main>{children}</main>
      </div>
    </AdminAuthGuard>
  );
}
