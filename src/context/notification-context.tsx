
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { usePathname } from "next/navigation";

export type Notification = {
  id: string;
  title: string;
  description: string;
  read: boolean;
  timestamp: number;
};

type NotificationContextType = {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "read" | "timestamp">) => void;
  markAllAsRead: () => void;
  unreadCount: number;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const pathname = usePathname();
  
  // Load notifications from localStorage on initial render
  useEffect(() => {
    try {
      const storedNotifications = localStorage.getItem("notifications");
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      }
    } catch (error) {
      console.error("Failed to parse notifications from localStorage", error);
    }
  }, []);

  // Persist notifications to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("notifications", JSON.stringify(notifications));
    } catch (error) {
      console.error("Failed to save notifications to localStorage", error);
    }
  }, [notifications]);

  const addNotification = useCallback((notification: Omit<Notification, "id" | "read" | "timestamp">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
      timestamp: Date.now(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  }, []);

  // This prevents adding notifications on auth pages
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');

  const contextValue = {
    notifications,
    addNotification: isAuthPage ? () => {} : addNotification,
    markAllAsRead,
    unreadCount: notifications.filter((n) => !n.read).length,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
