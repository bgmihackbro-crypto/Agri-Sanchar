
"use client";

import {
  Bell,
  MessageCircle,
  Heart,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

const notifications = [
    {
        id: 1,
        type: 'comment',
        icon: MessageCircle,
        text: 'Sukhdev Singh commented on your post.',
        time: '5m ago',
        avatar: 'https://picsum.photos/seed/sukhdev/40/40',
        avatarHint: 'farmer avatar'
    },
    {
        id: 2,
        type: 'like',
        icon: Heart,
        text: 'Rani Devi liked your post.',
        time: '12m ago',
        avatar: 'https://picsum.photos/seed/rice-field/40/40',
        avatarHint: 'rice field'
    },
    {
        id: 3,
        type: 'follow',
        icon: UserPlus,
        text: 'Gurpreet Kaur started following you.',
        time: '1h ago',
        avatar: 'https://picsum.photos/seed/gurpreet/40/40',
        avatarHint: 'woman farmer'
    }
];

export function Notifications() {

  const getIcon = (type: string) => {
    switch(type) {
        case 'comment': return <MessageCircle className="h-4 w-4 text-blue-500" />;
        case 'like': return <Heart className="h-4 w-4 text-red-500" />;
        case 'follow': return <UserPlus className="h-4 w-4 text-green-500" />;
        default: return <Bell className="h-4 w-4" />;
    }
  }


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {notifications.length > 0 && 
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">{notifications.length}</span>
            }
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel>
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium leading-none">Notifications</p>
            <Button variant="link" size="sm" className="h-auto p-0 text-primary">Mark all as read</Button>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
            {notifications.length > 0 ? (
                notifications.map(notification => (
                    <DropdownMenuItem key={notification.id} className="gap-3 cursor-pointer">
                         <Avatar className="h-9 w-9">
                            <AvatarImage src={notification.avatar} data-ai-hint={notification.avatarHint} />
                            <AvatarFallback>{notification.text.substring(0, 1)}</AvatarFallback>
                            <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-background bg-primary-foreground p-0.5">
                                {getIcon(notification.type)}
                            </span>
                        </Avatar>
                        <div className="flex flex-col">
                            <p className="text-sm text-foreground/90 whitespace-normal">{notification.text}</p>
                            <p className="text-xs text-muted-foreground">{notification.time}</p>
                        </div>
                    </DropdownMenuItem>
                ))
            ) : (
                <div className="text-center text-sm text-muted-foreground p-4">No new notifications</div>
            )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center text-sm text-primary font-medium cursor-pointer">
            View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
