
"use client";

import { useState, useRef, useEffect } from "react";
import { answerFarmerQuestion } from "@/ai/flows/answer-farmer-question";
import { Bot, Image as ImageIcon, Mic, Send, User, X, Volume2, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/hooks/use-translation";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
  timestamp: Date;
};

type UserProfile = {
  name: string;
  phone: string;
  avatar: string;
  city?: string;
  language?: 'English' | 'Hindi';
}


export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [nowPlayingMessageId, setNowPlayingMessageId] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const { toast } = useToast();
  const { t, language } = useTranslation();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null); // For SpeechRecognition instance
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastInputWasVoice = useRef(false);


  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    const profile = savedProfile ? JSON.parse(savedProfile) : null;
    setUserProfile(profile);

    const populateVoiceList = () => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
            setVoices(availableVoices);
            window.speechSynthesis.onvoiceschanged = null;
        }
    };
    
    populateVoiceList();
    if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = populateVoiceList;
    }
    
    const speechKeepAlive = setInterval(() => {
        if (typeof window === 'undefined' || !window.speechSynthesis || window.speechSynthesis.speaking) {
            return;
        }
        const utterance = new SpeechSynthesisUtterance("");
        utterance.volume = 0;
        window.speechSynthesis.speak(utterance);
    }, 5000);
    
    return () => {
      clearInterval(speechKeepAlive);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.onvoiceschanged = null;
      }
    };

  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);
  
  const speak = (message: Message) => {
    if (nowPlayingMessageId === message.id) {
      window.speechSynthesis.cancel();
      setNowPlayingMessageId(null);
      return;
    }
    
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(message.content);
    const targetLang = language === 'Hindi' ? 'hi-IN' : 'en-US';
    utterance.lang = targetLang;

    let selectedVoice = null;
    if (targetLang === 'hi-IN') {
        selectedVoice = voices.find(voice => voice.lang === 'hi-IN' && voice.name.includes('Google')) 
                     || voices.find(voice => voice.lang === 'hi-IN');
    } else {
        selectedVoice = voices.find(voice => voice.lang === 'en-US' && voice.name.includes('Google') && voice.name.includes('Female')) 
                     || voices.find(voice => voice.lang === 'en-US' && voice.name.includes('Samantha'))
                     || voices.find(voice => voice.lang === 'en-US' && voice.name.includes('Female'));
    }
    
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }

    utterance.onstart = () => setNowPlayingMessageId(message.id);
    utterance.onend = () => setNowPlayingMessageId(null);
    utterance.onerror = (e) => {
        console.error("Speech synthesis error", e);
        toast({ variant: 'destructive', title: t.chatbot.speechError, description: t.chatbot.speechErrorDesc });
        setNowPlayingMessageId(null);
    }
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      // This is a typed submission
      lastInputWasVoice.current = false;
    }

    if ((!input.trim() && !imageFile) || isLoading) return;

    if (isRecording) {
      stopRecording();
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      ...(imageFile && { image: URL.createObjectURL(imageFile) }),
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    const currentImageFile = imageFile;
    setImageFile(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
    
    setIsLoading(true);

    let aiResponseContent = t.chatbot.aiProcessError;
    try {
      let photoDataUri: string | undefined = undefined;
      if (currentImageFile) {
        photoDataUri = await fileToDataUri(currentImageFile);
      }

      const response = await answerFarmerQuestion({
        question: input,
        photoDataUri: photoDataUri,
        city: userProfile?.city,
        language: userProfile?.language || 'English',
      });
      aiResponseContent = response.answer ?? t.chatbot.aiResponseError;
    } catch (error) {
      console.error("AI Error:", error);
      aiResponseContent = t.chatbot.aiError;
    }

    const assistantMessage: Message = {
      id: `asst-${Date.now()}`,
      role: "assistant",
      content: aiResponseContent,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
    
    if (lastInputWasVoice.current) {
        speak(assistantMessage);
    }
  };

  const startRecording = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
          toast({ variant: 'destructive', title: t.chatbot.notSupported, description: t.chatbot.notSupportedDesc });
          return;
      }
      
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language === 'Hindi' ? 'hi-IN' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
              .map((result: any) => result[0])
              .map((result: any) => result.transcript)
              .join('');
          setInput(transcript);
      };
      
      recognitionRef.current.onend = () => {
          setIsRecording(false);
          // Auto-submit after recording stops and there's text
          // Using a timeout to ensure the final 'input' state is set
          setTimeout(() => {
              const currentInput = (document.getElementById('chatbot-input') as HTMLInputElement)?.value;
              if (currentInput && currentInput.trim()) {
                  lastInputWasVoice.current = true;
                  handleSubmit();
              }
          }, 100);
      };
      
      recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          toast({ variant: 'destructive', title: t.chatbot.voiceError, description: `${t.chatbot.voiceErrorDesc}${event.error}`});
          setIsRecording(false);
      };

      recognitionRef.current.start();
      setIsRecording(true);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };


  const removeImage = () => {
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="h-full">
      <Card className="h-[calc(100vh-10rem)] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 font-headline">
                <Bot className="h-6 w-6 text-primary" /> {t.chatbot.title}
            </CardTitle>
            <Button type="button" size="icon" onClick={toggleRecording} disabled={isLoading} variant={isRecording ? 'destructive': 'outline'}>
                <Mic className="h-4 w-4" />
                <span className="sr-only">{t.chatbot.recordVoice}</span>
            </Button>
        </CardHeader>
        <CardContent 
          className="flex-1 overflow-hidden relative"
          style={{
            backgroundImage: "url('https://plus.unsplash.com/premium_photo-1675747966994-fed6bb450c31?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-white/80 dark:bg-black/80" />
          <ScrollArea className="h-full pr-4 relative" ref={scrollAreaRef}>
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
                      "max-w-xs md:max-w-md lg:max-w-xl p-3 rounded-lg shadow-sm relative group",
                      message.role === "user"
                        ? "bg-muted"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    <div className="text-xs opacity-75 mb-1">{message.timestamp ? format(message.timestamp, "p"): ''}</div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.image && (
                      <img
                        src={message.image}
                        alt="user upload"
                        className="mt-2 rounded-lg max-w-full h-auto"
                      />
                    )}
                     {message.role === 'assistant' && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute -bottom-2 -right-2 h-7 w-7 text-primary-foreground opacity-20 group-hover:opacity-100 transition-opacity"
                            onClick={() => speak(message)}
                        >
                            {nowPlayingMessageId === message.id ? (
                                <Loader2 className="h-4 w-4 animate-spin"/>
                            ) : (
                                <Volume2 className="h-4 w-4" />
                            )}
                        </Button>
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
                    <Spinner className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">{t.chatbot.thinking}</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t pt-4 flex flex-col items-start gap-2">
           {imageFile && (
            <div className="relative p-2 border rounded-md">
              <Image
                src={URL.createObjectURL(imageFile)}
                alt="Selected image"
                width={80}
                height={80}
                className="rounded-md object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <form
            onSubmit={handleSubmit}
            className="flex w-full items-center space-x-2"
          >
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <ImageIcon className="h-4 w-4" />
              <span className="sr-only">{t.chatbot.uploadImage}</span>
            </Button>
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
            />
            <Input
              id="chatbot-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isRecording ? t.chatbot.listening : t.chatbot.placeholder}
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || (!input.trim() && !imageFile)}>
              <Send className="h-4 w-4" />
              <span className="sr-only">{t.chatbot.send}</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}

    