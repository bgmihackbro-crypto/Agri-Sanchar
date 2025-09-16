
import { Leaf } from "lucide-react";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 overflow-hidden">
        <Image
          src="https://picsum.photos/seed/farm/1920/1080"
          alt="Farm background"
          fill
          className="object-cover -z-20"
          data-ai-hint="farm"
        />
        <div className="absolute inset-0 bg-black/50 -z-10" />

      <div className="mb-6 flex items-center gap-2 text-3xl font-bold text-white drop-shadow-lg">
        <Leaf className="h-8 w-8" />
        <h1 className="font-headline">Agri-Sanchar</h1>
      </div>
      {children}
    </div>
  );
}
