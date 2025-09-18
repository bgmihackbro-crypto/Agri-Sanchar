
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Image as ImageIcon, Paperclip, Video, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";

type Message = {
  id: number;
  author: string;
  avatar: string;
  text: string;
  timestamp: Date;
  image?: string;
  video?: string;
};

type UserProfile = {
  name: string;
  avatar: string;
  farmerId: string;
};

// MOCK: In a real app, this would come from your DB
const getGroupDetails = (groupId: string) => {
    return {
        name: `Group ${groupId.substring(0,5)}...`,
    };
};


export default function GroupChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const groupId = typeof params.groupId === "string" ? params.groupId : "";
  const groupDetails = getGroupDetails(groupId);

  useEffect(() => {
    const profile = localStorage.getItem("userProfile");
    if (profile) {
      setUserProfile(JSON.parse(profile));
    }

    // Load messages from local storage
    if (groupId) {
        const storedMessages = localStorage.getItem(`group_chat_${groupId}`);
        if (storedMessages) {
            // Parse and convert timestamp strings back to Date objects
            const parsedMessages = JSON.parse(storedMessages).map((m: any) => ({
                ...m,
                timestamp: new Date(m.timestamp)
            }));
            setMessages(parsedMessages);
        }
    }
  }, [groupId]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      // Basic validation for file type and size
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please select an image or video file.' });
          return;
      }
      setAttachedFile(file);
    }
  };
  
  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachedFile) || !userProfile) return;

    setIsLoading(true);

    const message: Message = {
      id: Date.now(),
      author: userProfile.name,
      avatar: userProfile.avatar,
      text: newMessage,
      timestamp: new Date(),
    };

    if (attachedFile) {
        try {
            const dataUri = await fileToDataUri(attachedFile);
            if (attachedFile.type.startsWith('image/')) {
                message.image = dataUri;
            } else if (attachedFile.type.startsWith('video/')) {
                message.video = dataUri;
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'File Read Error', description: 'Could not process the attached file.'});
            setIsLoading(false);
            return;
        }
    }
    
    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);

    // Save to local storage
    localStorage.setItem(`group_chat_${groupId}`, JSON.stringify(updatedMessages));

    setNewMessage("");
    setAttachedFile(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
    setIsLoading(false);
  };

  const renderMedia = (message: Message) => {
      if (message.image) {
          return <Image src={message.image} alt="User upload" width={300} height={200} className="mt-2 rounded-lg max-w-full h-auto" />;
      }
      if (message.video) {
          return <video src={message.video} controls className="mt-2 rounded-lg max-w-full h-auto" />;
      }
      return null;
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
                    <AvatarFallback>{groupDetails.name.substring(0,2)}</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-lg font-semibold font-headline">{groupDetails.name}</h2>
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
                                message.author === userProfile?.name ? "justify-end" : "justify-start"
                            }`}
                        >
                            {message.author !== userProfile?.name && (
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={message.avatar} />
                                    <AvatarFallback>{message.author.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                            )}
                            <div
                                className={`max-w-xs md:max-w-md lg:max-w-xl p-3 rounded-lg shadow-sm ${
                                message.author === userProfile?.name
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                }`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-xs font-semibold opacity-80">{message.author}</p>
                                    <p className="text-xs opacity-75">{format(message.timestamp, "p")}</p>
                                </div>
                                {message.text && <p className="text-sm whitespace-pre-wrap">{message.text}</p>}
                                {renderMedia(message)}
                            </div>
                            {message.author === userProfile?.name && (
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={message.avatar} />
                                    <AvatarFallback>{userProfile.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                        ))}
                         {isLoading && (
                            <div className="flex justify-end">
                                <Spinner />
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
            <div className="border-t p-4">
                {attachedFile && (
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
                    <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()}>
                        <Paperclip className="h-4 w-4" />
                        <span className="sr-only">Attach file</span>
                    </Button>
                     <Input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*,video/*"
                    />
                    <Input 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading || (!newMessage.trim() && !attachedFile)}>
                        <Send className="h-4 w-4"/>
                    </Button>
                </form>
            </div>
        </Card>
    </div>
  );
}

