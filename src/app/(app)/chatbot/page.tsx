
"use client";

import { useState, useRef, useEffect } from "react";
import { answerFarmerQuestion } from "@/ai/flows/answer-farmer-question";
import { Bot, Image as ImageIcon, Mic, Send, User, X, Volume2, Loader2, Camera, RefreshCw } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


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


const CameraCaptureDialog = ({ open, onOpenChange, onCapture, t }: { open: boolean, onOpenChange: (open: boolean) => void, onCapture: (dataUri: string) => void, t: any }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        let stream: MediaStream | null = null;
        const getCameraPermission = async () => {
            if (!open || hasCameraPermission) return;
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setHasCameraPermission(true);
                }
            } catch (error) {
                console.error('Error accessing camera:', error);
                setHasCameraPermission(false);
                toast({
                    variant: 'destructive',
                    title: t.detection.cameraDenied,
                    description: t.detection.cameraDeniedDesc,
                });
            }
        };

        getCameraPermission();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [open, hasCameraPermission, toast, t]);

    const handleCaptureClick = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUri = canvas.toDataURL('image/jpeg');
            setCapturedImage(dataUri);
        }
    };

    const handleConfirm = () => {
        if (capturedImage) {
            onCapture(capturedImage);
            onOpenChange(false);
            setCapturedImage(null);
        }
    };
    
    const handleRetake = () => setCapturedImage(null);
    
    const handleDialogClose = (isOpen: boolean) => {
        if (!isOpen) {
             setCapturedImage(null);
             setHasCameraPermission(null);
        }
        onOpenChange(isOpen);
    }

    return (
        <Dialog open={open} onOpenChange={handleDialogClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t.detection.captureButton}</DialogTitle>
                </DialogHeader>
                <div className="w-full aspect-video rounded-lg bg-muted overflow-hidden relative border">
                     {capturedImage ? (
                        <Image src={capturedImage} alt="Captured" layout="fill" objectFit="cover" />
                    ) : (
                        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                    )}
                     { hasCameraPermission === false && !capturedImage && (
                        <div className="absolute inset-0 flex items-center justify-center p-4">
                            <Alert variant="destructive">
                                <AlertTitle>{t.detection.cameraRequired}</AlertTitle>
                                <AlertDescription>{t.detection.cameraRequiredDesc}</AlertDescription>
                            </Alert>
                        </div>
                    )}
                </div>
                <canvas ref={canvasRef} className="hidden" />
                <DialogFooter>
                    {capturedImage ? (
                        <>
                            <Button variant="outline" onClick={handleRetake}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                {t.detection.retakeButton}
                            </Button>
                            <Button onClick={handleConfirm}>{t.chatbot.send}</Button>
                        </>
                    ) : (
                        <>
                            <DialogClose asChild>
                                <Button variant="ghost">{t.soilTesting.cancel}</Button>
                            </DialogClose>
                            <Button onClick={handleCaptureClick} disabled={!hasCameraPermission}>
                                <Camera className="mr-2 h-4 w-4" />
                                {t.detection.captureButton}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
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
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const { toast } = useToast();
  const { t, language } = useTranslation();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null); // For SpeechRecognition instance
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);


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
    
    return () => {
      // Cleanup when component unmounts
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel(); // This will stop any ongoing speech
        if (utteranceRef.current) {
            utteranceRef.current.onerror = null;
        }
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
    
    // Simple language detection for voice selection
    const isHindi = /[\u0900-\u097F]/.test(message.content);
    const targetLang = isHindi ? 'hi-IN' : 'en-US';
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
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
            console.error("Speech synthesis error", e);
            toast({ variant: 'destructive', title: t.chatbot.speechError, description: t.chatbot.speechErrorDesc });
        }
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

  const handleSubmit = async (e?: React.FormEvent, capturedPhotoUri?: string) => {
    if (e) {
      e.preventDefault();
    }

    if ((!input.trim() && !imageFile && !capturedPhotoUri) || isLoading) return;

    if (isRecording) {
      stopRecording();
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      image: capturedPhotoUri || (imageFile ? URL.createObjectURL(imageFile) : undefined),
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
      let photoDataUri: string | undefined = capturedPhotoUri;
      if (currentImageFile) {
        photoDataUri = await fileToDataUri(currentImageFile);
      }

      const response = await answerFarmerQuestion({
        question: input || t.detection.defaultQuestion,
        photoDataUri: photoDataUri,
        city: userProfile?.city,
        language: userProfile?.language,
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
    
    speak(assistantMessage);
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
      recognitionRef.current.lang = userProfile?.language === 'Hindi' ? 'hi-IN' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
              .map((result: any) => result[0])
              .map((result: any) => result.transcript)
              .join('');
          setInput(transcript);
      };
      
      recognitionRef.current.onend = () => {
          setIsRecording(false);
          // Use a timeout to ensure the input value is updated before submitting
          setTimeout(() => {
              const currentInput = (document.getElementById('chatbot-input') as HTMLInputElement)?.value;
              if (currentInput && currentInput.trim()) {
                  handleSubmit();
              }
          }, 100);
          recognitionRef.current = null; // Clean up
      };
      
      recognitionRef.current.onerror = (event: any) => {
          if (event.error !== 'no-speech') {
            console.error("Speech recognition error", event.error);
            toast({ variant: 'destructive', title: t.chatbot.voiceError, description: `${t.chatbot.voiceErrorDesc}${event.error}`});
          }
          setIsRecording(false);
          recognitionRef.current = null;
      };

      recognitionRef.current.start();
      setIsRecording(true);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
        recognitionRef.current.stop();
    }
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
  
  const handleCameraCapture = (dataUri: string) => {
    handleSubmit(undefined, dataUri);
  }

  return (
    <div className="h-full flex justify-center">
      <CameraCaptureDialog open={isCameraOpen} onOpenChange={setIsCameraOpen} onCapture={handleCameraCapture} t={t} />
      <Card className="h-[calc(100vh-10rem)] flex flex-col w-full max-w-xl">
        <CardHeader className="p-4">
            <CardTitle className="flex items-center gap-2 font-headline text-xl">
                <Bot className="h-6 w-6 text-primary" /> {t.chatbot.title}
            </CardTitle>
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
          <div className="h-full pr-4 overflow-y-auto" ref={scrollAreaRef}>
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
                      "max-w-xs md:max-w-md p-3 rounded-lg shadow-sm relative group",
                      message.role === "user"
                        ? "bg-muted"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                     <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2 h-7 w-7 text-primary-foreground opacity-70 group-hover:opacity-100 transition-opacity"
                        onClick={() => speak(message)}
                    >
                        {nowPlayingMessageId === message.id ? (
                            <Loader2 className="h-4 w-4 animate-spin"/>
                        ) : (
                            <Volume2 className="h-4 w-4" />
                        )}
                    </Button>
                    <div className="text-xs opacity-75 mb-1">{message.timestamp ? format(message.timestamp, "p"): ''}</div>
                    <p className="text-base whitespace-pre-wrap">{message.content}</p>
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
                    <Spinner className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">{t.chatbot.thinking}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-2 pb-2 flex flex-col items-start gap-2">
           {imageFile && (
            <div className="relative p-1.5 border rounded-md self-start ml-1">
              <Image
                src={URL.createObjectURL(imageFile)}
                alt="Selected image"
                width={60}
                height={60}
                className="rounded-md object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                onClick={removeImage}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          <form
            onSubmit={handleSubmit}
            className="flex w-full items-center space-x-2"
          >
            <div className="flex-1 flex items-center space-x-1 bg-muted/50 p-1.5 rounded-lg">
                <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsCameraOpen(true)}
                disabled={isLoading}
                className="text-foreground h-8 w-8"
                >
                <Camera className="h-4 w-4" />
                <span className="sr-only">Use Camera</span>
                </Button>
                <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="text-foreground h-8 w-8"
                >
                <ImageIcon className="h-4 w-4" />
                <span className="sr-only">{t.chatbot.uploadImage}</span>
                </Button>
                <Input
                id="chatbot-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isRecording ? t.chatbot.listening : t.chatbot.placeholder}
                disabled={isLoading}
                className="bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-auto py-2"
                />
                <Button type="button" size="icon" onClick={toggleRecording} disabled={isLoading} variant={isRecording ? 'destructive': 'ghost'} className="text-foreground h-8 w-8">
                    <Mic className="h-4 w-4" />
                    <span className="sr-only">{t.chatbot.recordVoice}</span>
                </Button>
            </div>
            <Button type="submit" size="icon" className="h-10 w-10 shrink-0" disabled={isLoading || (!input.trim() && !imageFile)}>
              <Send className="h-4 w-4" />
            </Button>
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
            />
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}

    

    

