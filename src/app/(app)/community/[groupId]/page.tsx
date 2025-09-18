
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Paperclip, Video, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";
import type { Group } from "@/lib/firebase/groups";
import { getGroupDetails, listenToMessages, sendMessage, type Message } from "@/lib/firebase/chat";
import { Progress } from "@/components/ui/progress";

type UserProfile = {
  name: string;
  avatar: string;
  farmerId: string;
};


export default function GroupChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [groupDetails, setGroupDetails] = useState<Omit<Group, 'members'> | null>(null);
  
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const groupId = typeof params.groupId === "string" ? params.groupId : "";

  useEffect(() => {
    const profile = localStorage.getItem("userProfile");
    if (profile) {
      setUserProfile(JSON.parse(profile));
    } else {
        router.push('/login');
    }

    if (groupId) {
        setIsLoading(true);
        getGroupDetails(groupId).then(details => {
            setGroupDetails(details);
        }).catch(err => {
            console.error(err);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load group details.'});
        });

        const unsubscribe = listenToMessages(groupId, (newMessages) => {
            setMessages(newMessages);
            setIsLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }
  }, [groupId, router, toast]);

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
          toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please select an image or video file.' });
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
        toast({ variant: 'destructive', title: 'Send Error', description: 'Could not send your message. Please try again.' });
    } finally {
        setIsSending(false);
        setUploadProgress(0);
    }
  };

  const renderMedia = (message: Message) => {
      if (message.mediaUrl) {
          if (message.mediaType?.startsWith('image/')) {
              return <Image src={message.mediaUrl} alt="User upload" width={300} height={200} className="mt-2 rounded-lg max-w-full h-auto" />;
          }
          if (message.mediaType?.startsWith('video/')) {
              return <video src={message.mediaUrl} controls className="mt-2 rounded-lg max-w-full h-auto" />;
          }
      }
      return null;
  }

  if (isLoading && messages.length === 0) {
      return <div className="h-full flex items-center justify-center"><Spinner className="h-8 w-8" /></div>
  }

  return (
    <div className="h-full">
        <Card className="h-[calc(100vh-10rem)] flex flex-col">
            <CardHeader className="flex flex-row items-center gap-4 border-b">
                 <Button variant="ghost" size="icon" onClick={() => router.push('/community')}>
                    <ArrowLeft />
                 </Button>
                <Avatar>
                    <AvatarImage src={`https://picsum.photos/seed/${groupId}/40/40`} data-ai-hint="group icon" />
                    <AvatarFallback>{groupDetails?.name?.substring(0,2) ?? 'G'}</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-lg font-semibold font-headline">{groupDetails?.name ?? 'Loading...'}</h2>
                    <p className="text-xs text-muted-foreground">Group Chat</p>
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
                                    <p className="text-xs opacity-75">{format(message.timestamp.toDate(), "p")}</p>
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
                            alt="Selected media"
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
                        <span className="sr-only">Attach file</span>
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
                        placeholder="Type a message..."
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
