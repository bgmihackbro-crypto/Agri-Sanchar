
"use client";

import { useState, useEffect, useCallback } from 'react';
import { getGroups as getStoredGroups, type Group } from '@/lib/firebase/groups';
import { type UserProfile } from '@/lib/firebase/users';

export const useGroups = (userProfile: UserProfile | null) => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [userGroups, setUserGroups] = useState<Group[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchGroups = useCallback(() => {
        setIsLoading(true);
        try {
            const allGroups = getStoredGroups();
            setGroups(allGroups);
            if (userProfile) {
                const memberOf = allGroups.filter(g => g.members.includes(userProfile.farmerId));
                setUserGroups(memberOf);
            }
        } catch (error) {
            console.error("Error fetching groups:", error);
        } finally {
            setIsLoading(false);
        }
    }, [userProfile]);

    useEffect(() => {
        fetchGroups();
        window.addEventListener('storage', fetchGroups);
        return () => {
            window.removeEventListener('storage', fetchGroups);
        };
    }, [fetchGroups]);

    return { groups, userGroups, isLoading, fetchGroups };
};

    