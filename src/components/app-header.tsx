

import { UserNav } from "@/components/user-nav";
import { Leaf } from "lucide-react";
import { Button } from "./ui/button";
import { Notifications } from "./notifications";
import Image from "next/image";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
       <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-primary-foreground transition-transform duration-300 ease-in-out hover:scale-110 hover:rotate-12 overflow-hidden">
            <Image 
                src="https://images.unsplash.com/photo-1588097247274-a174dd59f20d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxkYXJrJTIwZ3JlZW4lMjB8ZW58MHx8fHwxNzU4NTYwNjc0fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Agri-Sanchar Logo"
                width={40}
                height={40}
                className="object-cover"
                data-ai-hint="farm icon"
            />
        </div>
        <span className="truncate text-lg font-semibold text-foreground font-headline">
            Agri-Sanchar
        </span>
       </div>
      <div className="flex items-center gap-2">
        <Notifications />
        <UserNav />
      </div>
    </header>
  );
}
