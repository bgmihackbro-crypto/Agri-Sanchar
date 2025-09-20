
"use client";

import { useState, useRef, useEffect } from "react";
import { answerFarmerQuestion } from "@/ai/flows/answer-farmer-question";
import { Camera, Send, RefreshCw, X, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { useTranslation } from "@/hooks/use-translation";

export default function DetectionPage() {
  const [question, setQuestion] = useState("");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{name: string, avatar: string} | null>(null);
  const { t } = useTranslation();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
  }, []);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        toast({
            variant: "destructive",
            title: t.detection.cameraNotSupported,
            description: t.detection.cameraNotSupportedDesc,
        });
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasCameraPermission(true);
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
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
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [toast, t]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      const dataUri = canvas.toDataURL("image/jpeg");
      setCapturedImage(dataUri);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!capturedImage) return;

    setIsLoading(true);
    setAnalysis(null);

    const fullQuestion = question || t.detection.defaultQuestion;

    try {
      const response = await answerFarmerQuestion({
        question: fullQuestion,
        photoDataUri: capturedImage,
        city: userProfile?.name, // Use name for city context as in other pages
      });
      setAnalysis(response.answer);
    } catch (error) {
      console.error("AI Error:", error);
      toast({
        variant: "destructive",
        title: t.detection.analysisFailed,
        description: t.detection.analysisError,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setCapturedImage(null);
    setQuestion("");
    setAnalysis(null);
  }

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">{t.detection.title}</h1>
        <p className="text-muted-foreground">
          {t.detection.description}
        </p>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6 items-start">
            
            {/* Left Column: Camera/Image */}
            <div className="flex flex-col gap-4 items-center">
              <div className="w-full aspect-video rounded-lg bg-muted overflow-hidden relative border">
                {capturedImage ? (
                  <img src={capturedImage} alt="Captured crop" className="w-full h-full object-cover" />
                ) : (
                  <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                )}
                 { hasCameraPermission === false && !capturedImage && (
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                        <Alert variant="destructive">
                        <AlertTitle>{t.detection.cameraRequired}</AlertTitle>
                        <AlertDescription>
                            {t.detection.cameraRequiredDesc}
                        </AlertDescription>
                        </Alert>
                    </div>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />

              {!capturedImage ? (
                <Button 
                  onClick={handleCapture} 
                  disabled={hasCameraPermission !== true}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full"
                  >
                  <Camera className="mr-2 h-4 w-4" />
                  {t.detection.captureButton}
                </Button>
              ) : (
                <Button onClick={reset} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {t.detection.retakeButton}
                </Button>
              )}
            </div>

            {/* Right Column: Input/Analysis */}
            <div className="flex flex-col gap-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-start gap-3">
                   <Avatar className="h-9 w-9">
                    <AvatarImage src={userProfile?.avatar || "https://picsum.photos/seed/farm-icon/40/40"} data-ai-hint="farm icon" />
                    <AvatarFallback>{userProfile?.name?.substring(0, 2) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Input
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder={t.detection.inputPlaceholder}
                      disabled={isLoading || !capturedImage}
                    />
                     <p className="text-xs text-muted-foreground mt-1">{t.detection.inputExample}</p>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading || !capturedImage}>
                  {isLoading ? (
                    <><Spinner className="mr-2 h-4 w-4 animate-spin" /> {t.detection.analyzing}</>
                  ) : (
                    <><Send className="mr-2 h-4 w-4" /> {t.detection.submitButton}</>
                  )}
                </Button>
              </form>

              {(isLoading || analysis) && (
                <div className="border-t pt-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9 border">
                      <div className="h-full w-full flex items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Bot size={22} />
                      </div>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                        <p className="font-semibold text-primary">{t.detection.aiAnalysisTitle}</p>
                        {isLoading && !analysis ? (
                             <div className="flex items-center gap-2 text-muted-foreground">
                                <Spinner className="h-4 w-4 animate-spin" />
                                <span>{t.detection.aiThinking}</span>
                            </div>
                        ) : (
                            <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-wrap">{analysis}</div>
                        )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
