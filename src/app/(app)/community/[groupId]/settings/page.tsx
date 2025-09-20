
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Upload, Camera, Users, UserPlus, Link as LinkIcon, Crown, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { getGroup, updateGroup, uploadGroupAvatar, addUserToGroup, getGroupMembers, type GroupMember, deleteGroup } from "@/lib/firebase/groups";
import type { Group } from "@/lib/firebase/groups";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "@/hooks/use-translation";


type UserProfile = {
  farmerId: string;
};

export default function GroupSettingsPage() {
  const [group, setGroup] = useState<Group | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [newMemberId, setNewMemberId] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const groupId = typeof params.groupId === "string" ? params.groupId : "";

  useEffect(() => {
    const profile = localStorage.getItem("userProfile");
    if (profile) {
      setUserProfile(JSON.parse(profile));
    }

    const loadData = () => {
        if (groupId) {
            const groupData = getGroup(groupId);
            if (groupData) {
                const memberData = getGroupMembers(groupId);
                setGroup(groupData);
                setName(groupData.name);
                setDescription(groupData.description || "");
                setAvatarPreview(groupData.avatarUrl || null);
                setMembers(memberData);
            } else {
                toast({ variant: "destructive", title: t.community.settings.groupNotFound });
                router.push("/community");
            }
            setIsLoading(false);
        }
    };
    
    loadData();

    // Listen for storage changes to keep data fresh
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);

  }, [groupId, router, toast, t]);

  // Authorization check
  useEffect(() => {
    if (!isLoading && group && userProfile && group.ownerId !== userProfile.farmerId) {
      toast({ variant: "destructive", title: t.community.settings.unauthorized, description: t.community.settings.notOwner });
      router.push(`/community/${groupId}`);
    }
  }, [group, userProfile, groupId, router, toast, isLoading, t]);

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
        newAvatarUrl = await uploadGroupAvatar(avatarFile);
      }

      const updatedData = {
        name,
        description,
        avatarUrl: newAvatarUrl,
      };

      updateGroup(groupId, updatedData);

      toast({ title: t.community.settings.success, description: t.community.settings.groupUpdated });
    } catch (error) {
      console.error("Error updating group:", error);
      toast({ variant: "destructive", title: t.community.settings.error, description: t.community.settings.failedToSave });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleAddMember = () => {
      if (!group || !newMemberId.trim()) return;
      setIsAddingMember(true);
      try {
          const result = addUserToGroup(groupId, newMemberId.trim());
          if (result.success && result.userName) {
              toast({ title: t.community.settings.memberAdded, description: t.community.settings.memberAddedDesc(result.userName) });
              // The component will re-render via the storage event listener
              setNewMemberId("");
          } else {
              toast({ variant: "destructive", title: t.community.settings.error, description: result.error });
          }
      } catch (error) {
          console.error("Error adding member:", error);
          toast({ variant: "destructive", title: t.community.settings.error, description: t.community.settings.unexpectedError });
      } finally {
          setIsAddingMember(false);
      }
  };

  const generateInviteLink = () => {
    const link = `${window.location.origin}/community/join?group=${groupId}`;
    navigator.clipboard.writeText(link);
    toast({ title: t.community.settings.linkCopied, description: t.community.settings.linkCopiedDesc });
  };
  
  const handleDeleteGroup = () => {
      if (!group) return;
      setIsDeleting(true);
      try {
          deleteGroup(groupId);
          toast({ title: t.community.settings.groupDeleted, description: t.community.settings.groupDeletedDesc(group.name)});
          router.push('/community');
      } catch (error) {
          console.error("Error deleting group:", error);
          toast({ variant: "destructive", title: t.community.settings.error, description: t.community.settings.failedToDelete });
          setIsDeleting(false);
      }
  }

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Spinner className="h-8 w-8" /></div>;
  }
  
  if (!group || !userProfile || group.ownerId !== userProfile.farmerId) {
      return <div className="flex h-full items-center justify-center"><p>{t.community.settings.verifying}</p></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <div>
            <h1 className="text-3xl font-bold font-headline">{t.community.settings.title}</h1>
            <p className="text-muted-foreground">{t.community.settings.description(group.name)}</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t.community.settings.groupDetails}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
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
                    <Label htmlFor="group-name">{t.community.settings.groupName}</Label>
                    <Input id="group-name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="group-description">{t.community.settings.groupDescription}</Label>
                    <Textarea 
                        id="group-description" 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t.community.settings.groupDescriptionPlaceholder}
                        rows={4}
                    />
                </div>
            </div>
        </CardContent>
        <CardFooter>
            <Button className="w-full" onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving ? <Spinner className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                {t.community.settings.saveChanges}
            </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users /> {t.community.settings.members} ({members.length})</CardTitle>
            <CardDescription>{t.community.settings.membersDesc}</CardDescription>
        </CardHeader>
         <CardContent className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="new-member-id">{t.community.settings.addMember}</Label>
                <div className="flex gap-2">
                    <Input id="new-member-id" placeholder="AS-xxxxxxxx-xxxx..." value={newMemberId} onChange={(e) => setNewMemberId(e.target.value)} disabled={isAddingMember} />
                    <Button onClick={handleAddMember} disabled={isAddingMember || !newMemberId.trim()}>
                        {isAddingMember ? <Spinner className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                    </Button>
                </div>
             </div>
              <div className="space-y-2">
                <Label>{t.community.settings.inviteLink}</Label>
                 <div className="flex gap-2">
                    <Input readOnly value={`${typeof window !== 'undefined' ? window.location.origin : ''}/community/join?group=${groupId}`} className="text-xs text-muted-foreground" />
                    <Button variant="secondary" onClick={generateInviteLink}>
                        <LinkIcon className="h-4 w-4" />
                    </Button>
                </div>
             </div>
            <Separator />
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {members.map(member => (
                    <div key={member.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={member.avatar}/>
                                <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{member.name}</p>
                                <p className="text-xs text-muted-foreground font-mono">{member.id}</p>
                            </div>
                        </div>
                        {member.id === group?.ownerId ? (
                             <Crown className="h-5 w-5 text-amber-500" />
                        ): (
                            <Button variant="ghost" size="sm" className="text-destructive">{t.community.settings.remove}</Button>
                        )}
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>
      
      <Card className="border-destructive">
          <CardHeader>
              <CardTitle className="text-destructive">{t.community.settings.dangerZone}</CardTitle>
              <CardDescription>{t.community.settings.dangerZoneDesc}</CardDescription>
          </CardHeader>
          <CardContent>
              <AlertDialog>
                  <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t.community.settings.deleteGroup}
                      </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                          <AlertDialogTitle>{t.community.settings.areYouSure}</AlertDialogTitle>
                          <AlertDialogDescription>
                              {t.community.settings.deleteGroupConfirm(group.name)}
                          </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                          <AlertDialogCancel disabled={isDeleting}>{t.community.group.cancel}</AlertDialogCancel>
                          <AlertDialogAction
                              onClick={handleDeleteGroup}
                              disabled={isDeleting}
                              className="bg-destructive hover:bg-destructive/90"
                          >
                               {isDeleting && <Spinner className="mr-2 h-4 w-4" />}
                              {t.community.settings.delete}
                          </AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>
          </CardContent>
      </Card>


    </div>
  );
}

    