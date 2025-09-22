
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Paperclip, Video, X, Settings, Users, MoreVertical, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";
import { getGroup, type Group } from "@/lib/firebase/groups";
import { listenToMessages, sendMessage, clearChat, type Message } from "@/lib/firebase/chat";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
  name: string;
  avatar: string;
  farmerId: string;
};


export default function GroupChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [groupDetails, setGroupDetails] = useState<Group | null>(null);
  
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const groupId = typeof params.groupId === "string" ? params.groupId : "";

  useEffect(() => {
    let unsubscribe: () => void = () => {};

    const profile = localStorage.getItem("userProfile");
    if (profile) {      setUserProfile(JSON.parse(profile));
    } else {
        router.push('/login');
        return;
    }

    const loadInitialData = () => {
        if (!groupId) {
            setIsLoading(false);
            return;
        }

        const details = getGroup(groupId);
        if (details) {
            setGroupDetails(details);
            // Now that we have details, listen for messages
            unsubscribe = listenToMessages(groupId, (newMessages) => {
                setMessages(newMessages);
                setIsLoading(false); // Loading is done once we have messages
            });
        } else {
            // If group doesn't exist at all, show error and stop loading
            toast({ variant: 'destructive', title: t.community.group.error, description: t.community.group.notFound });
            setIsLoading(false);
        }
    };
    
    loadInitialData();

    // Listen for storage events to update group details if they change elsewhere
    const handleStorageChange = () => {
        if (groupId) {
            const updatedDetails = getGroup(groupId);
            if (updatedDetails) {
                setGroupDetails(updatedDetails);
            }
        }
    }
    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (unsubscribe) unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };

  }, [groupId, router, toast, t]);


  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          toast({ variant: 'destructive', title: t.community.group.invalidFile, description: t.community.group.invalidFileDesc });
          return;
      }
      setAttachedFile(file);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachedFile) || !userProfile || !groupId) return;

    setIsSending(true);
    setUploadProgress(0);

    try {
        await sendMessage({
            groupId,
            author: {
                id: userProfile.farmerId,
                name: userProfile.name,
                avatar: userProfile.avatar,
            },
            text: newMessage,
            file: attachedFile,
            onProgress: setUploadProgress
        });

        setNewMessage("");
        setAttachedFile(null);
        if(fileInputRef.current) fileInputRef.current.value = "";

    } catch (error) {
        console.error("Error sending message:", error);
        toast({ variant: 'destructive', title: t.community.group.sendError, description: t.community.group.sendErrorDesc });
    } finally {
        setIsSending(false);
        setUploadProgress(0);
    }
  };
  
  const handleClearChat = () => {
      if (groupId) {
          clearChat(groupId);
          toast({ title: t.community.group.chatCleared, description: t.community.group.chatClearedDesc });
      }
  }

  const renderMedia = (message: Message) => {
      if (message.mediaUrl) {
          if (message.mediaType?.startsWith('image/')) {
              return <Image src={message.mediaUrl} alt={t.community.group.userUploadAlt} width={300} height={200} className="mt-2 rounded-lg max-w-full h-auto" />;
          }
          if (message.mediaType?.startsWith('video/')) {
              return <video src={message.mediaUrl} controls className="mt-2 rounded-lg max-w-full h-auto" />;
          }
      }
      return null;
  }
  
  const isOwner = userProfile?.farmerId === groupDetails?.ownerId;

  if (isLoading) {
      return <div className="h-full flex items-center justify-center"><Spinner className="h-8 w-8" /></div>
  }
  
   if (!groupDetails) {
     return (
        <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">{t.community.group.notFound}</p>
        </div>
     );
  }

  return (
    <div className="h-full">
        <Card className="h-[calc(100vh-10rem)] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between gap-4 border-b">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/community')}>
                        <ArrowLeft />
                    </Button>
                    <Avatar>
                        <AvatarImage src={groupDetails?.avatarUrl ?? `https://picsum.photos/seed/${groupId}/40/40`} data-ai-hint="group icon" />
                        <AvatarFallback>{groupDetails?.name?.substring(0,2) ?? 'G'}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <h2 className="text-lg font-semibold font-headline truncate">{groupDetails?.name ?? t.community.group.loading}</h2>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {groupDetails?.members?.length} {t.community.group.members}
                        </p>
                    </div>
                </div>
                <div className="flex items-center">
                     {isOwner && (
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={`/community/${groupId}/settings`}>
                                 <Settings />
                            </Link>
                        </Button>
                    )}
                    <AlertDialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        {t.community.group.clearChat}
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                            </DropdownMenuContent>
                        </DropdownMenu>
                         <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>{t.community.group.areYouSure}</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {t.community.group.clearChatConfirm}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>{t.community.group.cancel}</AlertDialogCancel>
                                <AlertDialogAction onClick={handleClearChat} className="bg-destructive hover:bg-destructive/90">
                                    {t.community.group.clear}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
                 <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex items-start gap-3 animate-fade-in ${
                                message.author.id === userProfile?.farmerId ? "justify-end" : "justify-start"
                            }`}
                        >
                            {message.author.id !== userProfile?.farmerId && (
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={message.author.avatar} />
                                    <AvatarFallback>{message.author.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                            )}
                            <div
                                className={`max-w-xs md:max-w-md lg:max-w-xl p-3 rounded-lg shadow-sm ${
                                message.author.id === userProfile?.farmerId
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                }`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-xs font-semibold opacity-80">{message.author.name}</p>
                                    <p className="text-xs opacity-75">{message.timestamp ? format(message.timestamp.toDate(), "p") : ''}</p>
                                </div>
                                {message.text && <p className="text-sm whitespace-pre-wrap">{message.text}</p>}
                                {renderMedia(message)}
                            </div>
                            {message.author.id === userProfile?.farmerId && (
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={message.author.avatar} />
                                    <AvatarFallback>{userProfile.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                        ))}
                         {messages.length === 0 && !isLoading && (
                            <div className="text-center text-muted-foreground pt-16">
                                <p>No messages yet. Start the conversation!</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
            <div className="border-t p-4">
                {isSending && uploadProgress > 0 && <Progress value={uploadProgress} className="w-full h-1 mb-2" />}
                {attachedFile && !isSending && (
                    <div className="relative p-2 border rounded-md mb-2 w-fit">
                    {attachedFile.type.startsWith('image/') ? (
                        <Image
                            src={URL.createObjectURL(attachedFile)}
                            alt={t.community.group.selectedMediaAlt}
                            width={80}
                            height={80}
                            className="rounded-md object-cover"
                        />
                    ) : (
                        <div className="flex items-center gap-2">
                            <Video className="h-10 w-10 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground truncate max-w-xs">{attachedFile.name}</p>
                        </div>
                    )}
                    <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => setAttachedFile(null)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                    </div>
                )}
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isSending}>
                        <Paperclip className="h-4 w-4" />
                        <span className="sr-only">{t.community.group.attachFile}</span>
                    </Button>
                     <Input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*,video/*"
                        disabled={isSending}
                    />
                    <Input 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={t.community.group.typeMessage}
                        disabled={isSending}
                    />
                    <Button type="submit" disabled={isSending || (!newMessage.trim() && !attachedFile)}>
                        {isSending ? <Spinner className="h-4 w-4"/> : <Send className="h-4 w-4"/>}
                    </Button>
                </form>
            </div>
        </Card>
    </div>
  );
}

    