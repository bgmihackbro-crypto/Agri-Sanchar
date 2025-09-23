
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("userProfile");
        router.push("/admin/login");
    };

    return (
        <div className="p-4 md:p-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
                <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Welcome, Admin!</CardTitle>
                    <CardDescription>This is the central hub for managing the Agri-Sanchar application.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>From here, you will be able to manage users, view analytics, and oversee content. More features will be added here soon.</p>
                </CardContent>
            </Card>

            {/* Placeholder for future admin components */}
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border-dashed">
                     <CardHeader>
                        <CardTitle>User Management</CardTitle>
                     </CardHeader>
                     <CardContent>
                        <p className="text-muted-foreground">Coming soon...</p>
                     </CardContent>
                </Card>
                 <Card className="border-dashed">
                     <CardHeader>
                        <CardTitle>App Analytics</CardTitle>
                     </CardHeader>
                     <CardContent>
                        <p className="text-muted-foreground">Coming soon...</p>
                     </CardContent>
                </Card>
                 <Card className="border-dashed">
                     <CardHeader>
                        <CardTitle>Content Moderation</CardTitle>
                     </CardHeader>
                     <CardContent>
                        <p className="text-muted-foreground">Coming soon...</p>
                     </CardContent>
                </Card>
            </div>
        </div>
    );
}
