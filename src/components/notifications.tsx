
"use client";

import {
  Bell,
  MessageCircle,
  CloudRain,
  TrendingUp,
  Landmark,
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

const notifications = [
    {
        id: 1,
        type: 'weather',
        icon: CloudRain,
        text: 'Heavy rainfall expected in Ludhiana tomorrow. Plan accordingly.',
        time: '15m ago',
        iconColor: 'text-blue-500',
    },
    {
        id: 2,
        type: 'mandi',
        icon: TrendingUp,
        text: 'Wheat prices in Khanna Mandi have increased by 5%.',
        time: '1h ago',
        iconColor: 'text-green-500',
    },
    {
        id: 3,
        type: 'community',
        icon: MessageCircle,
        text: 'New question about pest control for cotton.',
        time: '3h ago',
        iconColor: 'text-purple-500',
    },
    {
        id: 4,
        type: 'scheme',
        icon: Landmark,
        text: 'PM-KISAN: Next installment scheduled for release next week.',
        time: '1d ago',
        iconColor: 'text-yellow-500',
    }
];

export function Notifications() {

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
                    <DropdownMenuItem key={notification.id} className="gap-3 cursor-pointer items-start">
                         <div className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 ${notification.iconColor}`}>
                            <notification.icon className="h-5 w-5" />
                        </div>
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
