
"use client";

import { Bell, CheckCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/context/notification-context";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export function Notifications() {
  const { notifications, markAllAsRead, unreadCount } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0">{unreadCount}</Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 md:w-96" align="end">
        <div className="flex items-center justify-between p-2">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={(e) => {
                    e.preventDefault();
                    markAllAsRead();
                }}>
                    <CheckCheck className="mr-2 h-4 w-4" />
                    Mark all as read
                </Button>
            )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-80">
            {notifications.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground p-4">No new notifications</p>
            ) : (
                 notifications.map((notification) => (
                    <DropdownMenuItem key={notification.id} className={cn("flex-col items-start gap-1 whitespace-normal", !notification.read && "bg-primary/5")}>
                        <div className="flex w-full items-start justify-between">
                            <p className="font-semibold text-sm">{notification.title}</p>
                            {!notification.read && <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{notification.description}</p>
                        <p className="text-xs text-muted-foreground/70 self-end">
                            {notification.timestamp ? formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true }) : ''}
                        </p>
                    </DropdownMenuItem>
                 ))
            )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
