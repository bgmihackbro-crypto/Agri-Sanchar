import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Bot, CloudSun, Users, Info } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const quickLinks = [
  {
    title: "Ask the AI Expert",
    description: "Get instant advice on crop diseases, pests, and more.",
    href: "/chatbot",
    icon: Bot,
  },
  {
    title: "Weather Forecast",
    description: "Check the latest weather updates for your location.",
    href: "/weather",
    icon: CloudSun,
  },
  {
    title: "Community Forum",
    description: "Connect with fellow farmers and share knowledge.",
    href: "/community",
    icon: Users,
  },
];

export default function DashboardPage() {
  const dashboardHeroImage = PlaceHolderImages.find(p => p.id === 'dashboard-hero');

  return (
    <div className="space-y-8">
      <div className="relative w-full h-64 rounded-lg overflow-hidden shadow-lg">
        {dashboardHeroImage && <Image
          src={dashboardHeroImage.imageUrl}
          alt="Lush green farm"
          fill
          style={{ objectFit: "cover" }}
          className="rounded-lg"
          data-ai-hint={dashboardHeroImage.imageHint}
          priority
        />}
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-start p-8 md:p-12">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 font-headline">
            Welcome back, Farmer!
          </h1>
          <p className="text-lg md:text-xl text-white/90">
            Your digital companion for smart farming.
          </p>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle className="font-headline">Welcome aboard! Complete your profile.</AlertTitle>
        <AlertDescription>
          To give you the best crop advice, we need to know a little more about your farm. Please complete your profile by adding details like your land size, crops you grow, soil type, and location. This will help us provide accurate and personalized recommendations for you.
          <Button asChild variant="link" className="p-0 h-auto mt-2 text-primary font-semibold">
            <Link href="/profile">
              Complete Profile <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </AlertDescription>
      </Alert>

      <div>
        <h2 className="text-2xl font-bold font-headline mb-4">Quick Actions</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <Card key={link.title} className="flex flex-col hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent/20 rounded-full">
                    <link.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="font-headline">{link.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription>{link.description}</CardDescription>
              </CardContent>
              <CardFooter>
                <Button asChild variant="link" className="p-0 h-auto text-primary font-semibold">
                  <Link href={link.href}>
                    Check it out <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
