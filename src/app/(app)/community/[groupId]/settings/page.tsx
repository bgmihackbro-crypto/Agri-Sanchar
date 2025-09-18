
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Upload, Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import type { Group } from "@/lib/firebase/groups";
import { getGroup, updateGroup, uploadGroupAvatar } from "@/lib/firebase/groups";

type UserProfile = {
  farmerId: string;
};

export default function GroupSettingsPage() {
  const [group, setGroup] = useState<Group | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const groupId = typeof params.groupId === "string" ? params.groupId : "";

  useEffect(() => {
    const profile = localStorage.getItem("userProfile");
    if (profile) {
      setUserProfile(JSON.parse(profile));
    }

    if (groupId) {
      getGroup(groupId)
        .then((groupData) => {
          if (groupData) {
            setGroup(groupData);
            setName(groupData.name);
            setDescription(groupData.description || "");
            setAvatarPreview(groupData.avatarUrl || null);
          } else {
            toast({ variant: "destructive", title: "Group not found" });
            router.push("/community");
          }
        })
        .catch((err) => {
          console.error(err);
          toast({ variant: "destructive", title: "Failed to load group details" });
        })
        .finally(() => setIsLoading(false));
    }
  }, [groupId, router, toast]);

  // Authorization check
  useEffect(() => {
    if (group && userProfile && group.ownerId !== userProfile.farmerId) {
      toast({ variant: "destructive", title: "Unauthorized", description: "You are not the owner of this group." });
      router.push(`/community/${groupId}`);
    }
  }, [group, userProfile, groupId, router, toast]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveChanges = async () => {
    if (!group) return;
    setIsSaving(true);

    try {
      let newAvatarUrl = group.avatarUrl;
      if (avatarFile) {
        newAvatarUrl = await uploadGroupAvatar(avatarFile, groupId);
      }

      const updatedData = {
        name,
        description,
        avatarUrl: newAvatarUrl,
      };

      await updateGroup(groupId, updatedData);

      toast({ title: "Success", description: "Group details updated successfully." });
      router.push(`/community/${groupId}`);
    } catch (error) {
      console.error("Error updating group:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to save changes." });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Spinner className="h-8 w-8" /></div>;
  }
  
  // Render null or a message if the user is not authorized, to prevent form flashing
  if (!group || !userProfile || group.ownerId !== userProfile.farmerId) {
      return <div className="flex h-full items-center justify-center"><p>Verifying permissions...</p></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <div>
            <h1 className="text-3xl font-bold font-headline">Group Settings</h1>
            <p className="text-muted-foreground">Edit details for &quot;{group.name}&quot;</p>
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-6">
            <div className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                     <div className="relative group">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={avatarPreview ?? `https://picsum.photos/seed/${groupId}/100/100`} />
                            <AvatarFallback>{name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <Button
                            variant="outline"
                            size="icon"
                            className="absolute bottom-0 right-0 rounded-full group-hover:bg-primary group-hover:text-primary-foreground"
                            onClick={() => avatarInputRef.current?.click()}
                        >
                            <Camera className="h-4 w-4" />
                        </Button>
                        <Input
                            type="file"
                            ref={avatarInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleAvatarChange}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="group-name">Group Name</Label>
                    <Input id="group-name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="group-description">Group Description</Label>
                    <Textarea 
                        id="group-description" 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What is this group about?"
                        rows={4}
                    />
                </div>
            </div>
        </CardContent>
        <CardFooter>
            <Button className="w-full" onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving ? <Spinner className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
