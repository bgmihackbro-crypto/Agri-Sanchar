import { UserNav } from "@/components/user-nav";
import { Bell } from "lucide-react";
import { Button } from "./ui/button";

const WheatIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12.83,3.05C12.45,4.83 11.08,5.86 9.46,5.65C8.27,5.5 7.21,4.74 6.6,3.68C6.81,3.22 7.1,2.82 7.47,2.5C8.21,4.1 9.9,5.03 11.54,4.7C12.87,4.43 13.75,3.31 13.97,2C13.6,2.3 13.22,2.65 12.83,3.05M16.32,3.68C15.71,4.74 14.65,5.5 13.46,5.65C11.84,5.86 10.47,4.83 10.09,3.05C9.7,2.65 9.32,2.3 8.95,2C9.17,3.31 10.05,4.43 11.38,4.7C13.02,5.03 14.71,4.1 15.45,2.5C15.82,2.82 16.11,3.22 16.32,3.68M19.5,6.5A1,1 0 0,0 18.5,7.5C18.5,8.61 18.05,9.62 17.29,10.29L19,12L17,14L15.68,12.68C13.88,14.05 13,16.14 13,18.31C13,18.86 13.08,19.39 13.2,19.9L11.79,21.31L10.38,19.9L11.79,18.5C10.2,17.83 9,16.2 9,14.31C9,13.45 9.31,12.66 9.83,12.06L5,17L3.5,15.5L8.36,10.64C7.54,9.83 7,8.71 7,7.5A1,1 0 0,0 6,6.5A1,1 0 0,0 5,7.5C5,9.07 5.66,10.47 6.76,11.36L5,13.12L6.5,14.62L8.14,12.97C8.59,13.56 9.21,14 9.92,14.25L5,19L6.5,20.5L11.59,15.41C11.97,16.33 12.65,17.14 13.5,17.65L12,19.14L13.41,20.55L15.59,18.41C16.5,19.43 17.84,20.06 19.3,20C21.32,19.86 23,18.06 23,16V10.5C23,8.29 21.5,6.5 19.5,6.5M19.5,8.5C20.4,8.5 21,9.12 21,10V10.5C21,10.78 20.78,11 20.5,11H18.5C18.22,11 18,10.78 18,10.5V9C18,8.72 18.22,8.5 18.5,8.5H19.5M19.5,12H21.5V13.5C21.5,13.78 21.28,14 21,14H19C18.72,14 18.5,13.78 18.5,13.5V12.5C18.5,12.22 18.72,12 19,12H19.5M21,16C21,16.83 20.25,17.5 19.36,17.5C18.7,17.5 18.12,17.14 17.78,16.63L16.5,18L15,16.5L20.25,11.25C20.68,11.56 21,12 21,12.5V16Z" />
    </svg>
);


export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
       <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <WheatIcon className="h-6 w-6" />
        </div>
        <span className="truncate text-lg font-semibold text-foreground font-headline">
            Agri-Sanchar
        </span>
       </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">3</span>
        </Button>
        <UserNav />
      </div>
    </header>
  );
}
