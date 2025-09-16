
"use client";

import { useState, useRef, useEffect } from "react";
import { answerFarmerQuestion } from "@/ai/flows/answer-farmer-question";
import { Bot, Image as ImageIcon, Send, User, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  image?: string;
};

type UserProfile = {
  name: string;
  phone: string;
  avatar: string;
  city?: string;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImageFile(event.target.files[0]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !imageFile) return;

    setIsLoading(true);

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input,
      ...(imageFile && { image: URL.createObjectURL(imageFile) }),
    };
    setMessages((prev) => [...prev, userMessage]);

    let aiResponse = "Sorry, I could not process your request.";
    try {
      let photoDataUri: string | undefined = undefined;
      if (imageFile) {
        photoDataUri = await fileToDataUri(imageFile);
      }

      const response = await answerFarmerQuestion({
        question: input,
        photoDataUri: photoDataUri,
        city: userProfile?.city,
      });
      aiResponse = response.answer;
    } catch (error) {
      console.error("AI Error:", error);
      aiResponse =
        "An error occurred while communicating with the AI. Please try again.";
    }

    const assistantMessage: Message = {
      id: Date.now() + 1,
      role: "assistant",
      content: aiResponse,
    };
    setMessages((prev) => [...prev, assistantMessage]);

    setInput("");
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsLoading(false);
  };

  return (
    <div className="relative h-full" style={{backgroundImage: "url('/circuit-board.svg')"}}>
      <Card className="h-[calc(100vh-10rem)] flex flex-col bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <Bot className="h-6 w-6 text-primary" /> AI Expert Chat
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start gap-3 animate-fade-in",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8 border">
                      <div className="h-full w-full flex items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Bot size={20} />
                      </div>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-xs md:max-w-md lg:max-w-xl p-3 rounded-lg shadow-sm",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.image && (
                      <img
                        src={message.image}
                        alt="user upload"
                        className="mt-2 rounded-lg max-w-full h-auto"
                      />
                    )}
                  </div>
                  {message.role === "user" && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userProfile?.avatar || "https://picsum.photos/seed/farm-icon/40/40"} data-ai-hint="farm icon" />
                      <AvatarFallback>{userProfile?.name?.substring(0, 2) || 'U'}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3 justify-start animate-fade-in">
                  <Avatar className="h-8 w-8 border">
                    <div className="h-full w-full flex items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Bot size={20} />
                    </div>
                  </Avatar>
                  <div className="max-w-xs p-3 rounded-lg bg-muted flex items-center gap-2 shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <form
            onSubmit={handleSubmit}
            className="flex w-full items-center space-x-2"
          >
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-4 w-4" />
              <span className="sr-only">Upload Image</span>
            </Button>
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
            />
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about crops, prices, or upload a photo..."
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || (!input.trim() && !imageFile)} className="bg-primary hover:bg-primary/90">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}

    