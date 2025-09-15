

import { UserNav } from "@/components/user-nav";
import { Leaf } from "lucide-react";
import { Notifications } from "./notifications";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
       <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-300 ease-in-out hover:scale-110 hover:rotate-12">
            <Leaf className="h-6 w-6" />
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
