
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getGroup, addUserToGroup, type Group } from '@/lib/firebase/groups';
import { Spinner } from '@/components/ui/spinner';
import { Users, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

type UserProfile = {
    farmerId: string;
    name: string;
    avatar: string;
};

function JoinGroupContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();

    const [group, setGroup] = useState<Group | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const groupId = searchParams.get('group');

    useEffect(() => {
        const profile = localStorage.getItem("userProfile");
        if (profile) {
            setUserProfile(JSON.parse(profile));
        } else {
            // Redirect to login but pass the join link so they can come back
            const joinUrl = `/community/join?group=${groupId}`;
            router.push(`/login?redirect=${encodeURIComponent(joinUrl)}`);
        }

        if (groupId) {
            const groupData = getGroup(groupId);
            if (groupData) {
                setGroup(groupData);
            } else {
                setError("This group does not exist or the link is invalid.");
            }
            setIsLoading(false);
        } else {
            setError("No group ID provided in the link.");
            setIsLoading(false);
        }
    }, [groupId, router]);

    const handleJoinGroup = () => {
        if (!groupId || !userProfile) return;

        setIsJoining(true);
        try {
            const result = addUserToGroup(groupId, userProfile.farmerId);
            if (result.success) {
                toast({
                    title: "Welcome!",
                    description: `You have successfully joined the "${group?.name}" group.`,
                });
                router.push(`/community/${groupId}`);
            } else {
                if (result.error?.includes('already in this group')) {
                     toast({
                        title: "Already a Member",
                        description: `You are already a member of "${group?.name}".`,
                    });
                     router.push(`/community/${groupId}`);
                } else {
                    toast({ variant: 'destructive', title: "Failed to Join", description: result.error });
                }
            }
        } catch (err) {
            toast({ variant: 'destructive', title: "Error", description: "An unexpected error occurred while trying to join." });
        } finally {
            setIsJoining(false);
        }
    };
    
    if (isLoading) {
        return <div className="flex flex-col items-center gap-2"><Spinner className="h-8 w-8" /> <p>Loading group info...</p></div>;
    }

    if (error) {
        return (
             <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-destructive">{error}</p>
                </CardContent>
                <CardFooter>
                     <Button variant="outline" asChild className="w-full">
                        <Link href="/community">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Go back to Community
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        );
    }
    
    if (!group) {
        return null;
    }

    const isAlreadyMember = group.members.includes(userProfile?.farmerId ?? '');

    return (
        <Card className="w-full max-w-md animate-fade-in">
            <CardHeader className="items-center text-center">
                 <Avatar className="h-20 w-20 mb-2">
                    <AvatarImage src={group.avatarUrl ?? `https://picsum.photos/seed/${groupId}/80/80`} />
                    <AvatarFallback>{group.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <CardTitle className="font-headline">{group.name}</CardTitle>
                <CardDescription>You&apos;ve been invited to join this group!</CardDescription>
                <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1"><Users className="h-4 w-4"/> {group.members.length} members</div>
                    <span>•</span>
                    <div>{group.city}</div>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-center text-muted-foreground bg-muted p-3 rounded-md">
                    {group.description || "No description provided for this group."}
                </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                <Button onClick={handleJoinGroup} disabled={isJoining} className="w-full">
                    {isJoining ? <Spinner className="mr-2 h-4 w-4"/> : null}
                    {isAlreadyMember ? "Open Chat" : "Join Group"}
                </Button>
                 <Button variant="ghost" asChild className="w-full">
                    <Link href="/community">Cancel</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}


export default function JoinPage() {
    return (
        <div className="flex justify-center items-center h-full -mt-20">
            <Suspense fallback={<Spinner className="h-8 w-8" />}>
                <JoinGroupContent />
            </Suspense>
        </div>
    );
}
