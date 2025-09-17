
"use client";

import { Bell, Trash2 } from "lucide-react";
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
import { useNotifications } from "@/context/NotificationContext";
import { formatDistanceToNow } from 'date-fns';

export function Notifications() {
  const { notifications, clearNotifications } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {notifications && notifications.length > 0 && 
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">{notifications.length}</span>
            }
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel>
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium leading-none">Notifications</p>
            {notifications && notifications.length > 0 &&
              <Button variant="link" size="sm" className="h-auto p-0 text-primary" onClick={clearNotifications}>Mark all as read</Button>
            }
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
            {notifications && notifications.length > 0 ? (
                notifications.map(notification => (
                    <DropdownMenuItem key={notification.id} className="gap-3 cursor-pointer items-start">
                         <div className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 ${notification.iconColor}`}>
                            <notification.icon className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm text-foreground/90 whitespace-normal">{notification.text}</p>
                            <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(notification.time), { addSuffix: true })}</p>
                        </div>
                    </DropdownMenuItem>
                ))
            ) : (
                <div className="text-center text-sm text-muted-foreground p-4">No new notifications</div>
            )}
        </DropdownMenuGroup>
        {notifications && notifications.length > 0 &&
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={clearNotifications} className="justify-center text-sm text-destructive font-medium cursor-pointer focus:bg-destructive/10 focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear all notifications
            </DropdownMenuItem>
          </>
        }
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
