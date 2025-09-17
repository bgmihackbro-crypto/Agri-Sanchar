
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, ComponentType } from 'react';
import { LucideProps } from 'lucide-react';

export type Notification = {
    id: number;
    type: string;
    icon: ComponentType<LucideProps>;
    text: string;
    time: string;
    iconColor: string;
};

type NotificationContextType = {
    notifications: Notification[];
    addNotification: (notification: Notification) => void;
    clearNotifications: () => void;
};

const NotificationContext = createContext<Partial<NotificationContextType>>({});

export const useNotifications = () => {
    return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const storedNotifications = localStorage.getItem('notifications');
        if (storedNotifications) {
            const parsed = JSON.parse(storedNotifications);
            const notificationsWithIcons = parsed.map((n: any) => ({...n, icon: () => null})); // We can't serialize icons
            setNotifications(notificationsWithIcons);
        }
    }, []);

    useEffect(() => {
        if (isMounted) {
            // We can't store the icon component, so we remove it before storing.
            const toStore = notifications.map(({icon, ...rest}) => rest);
            localStorage.setItem('notifications', JSON.stringify(toStore));
        }
    }, [notifications, isMounted]);

    const addNotification = (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
    };

    const clearNotifications = () => {
        setNotifications([]);
    };
    
    // We need to dynamically load icons on the client after loading from local storage
    const hydratedNotifications = notifications.map(n => {
        // This is a simplified mapping. For a real app, you would have a map of type to icon component.
        const allIcons: {[key: string]: ComponentType<LucideProps>} = {
            'welcome': require('lucide-react').UserCheck,
            'signup': require('lucide-react').UserPlus,
            'weather': require('lucide-react').CloudRain,
            'mandi': require('lucide-react').TrendingUp,
            'community': require('lucide-react').MessageCircle,
            'scheme': require('lucide-react').Landmark,
        }
        return {...n, icon: allIcons[n.type] || require('lucide-react').Bell };
    });

    const value = {
        notifications: hydratedNotifications,
        addNotification,
        clearNotifications,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
