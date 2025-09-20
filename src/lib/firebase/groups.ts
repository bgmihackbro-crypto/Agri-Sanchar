
import { v4 as uuidv4 } from 'uuid';
import { Timestamp } from 'firebase/firestore'; // Keep for type consistency
import { BOT_USER, EXPERT_BOT_USER } from './chat';
import { type UserProfile } from './users';

export interface Group {
    id: string;
    name: string;
    description?: string;
    city: string;
    ownerId: string; // ID of the user who created the group
    members: string[]; // Array of member IDs
    createdBy: string;
    createdAt: Timestamp;
    avatarUrl?: string;
}

export interface GroupMember {
    id: string;
    name: string;
    avatar: string;
}

// Type for creating a new group, `createdAt` will be generated. `id` can be optional.
export type NewGroupData = Omit<Group, 'createdAt' | 'members'> & { members: string[], id?: string };

// Helper to get groups from localStorage
const getStoredGroups = (): Group[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('groups');
    return stored ? JSON.parse(stored).map((g: any) => ({...g, createdAt: new Timestamp(g.createdAt.seconds, g.createdAt.nanoseconds)})) : [];
};

// Helper to save groups to localStorage
const setStoredGroups = (groups: Group[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('groups', JSON.stringify(groups));
     // Dispatch a storage event to notify other tabs/components
    window.dispatchEvent(new Event('storage'));
};

/**
 * Creates a new group in localStorage.
 * @param groupData The data for the new group.
 * @returns The newly created group object with its ID.
 */
export const createGroup = (groupData: NewGroupData): Group => {
    const groups = getStoredGroups();
    const isDirectMessage = groupData.id && groupData.id.startsWith('dm-');
    
    const newGroup: Group = {
        ...groupData,
        id: groupData.id || uuidv4(), // Use provided ID or generate a new one
        createdAt: Timestamp.now(),
        // Add the bot to public groups, but not DMs
        members: isDirectMessage ? groupData.members : [...groupData.members, BOT_USER.id], 
    };

    const updatedGroups = [newGroup, ...groups];
    setStoredGroups(updatedGroups);
    return newGroup;
};

/**
 * Fetches all groups from localStorage, ordered by creation date.
 * @returns An array of group objects.
 */
export const getGroups = (): Group[] => {
    const groups = getStoredGroups();
    return groups.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
};

/**
 * Fetches a single group from localStorage.
 */
export const getGroup = (groupId: string): Group | null => {
    const groups = getStoredGroups();
    return groups.find(g => g.id === groupId) || null;
}


/**
 * Updates a group's details in localStorage.
 * @param groupId The ID of the group to update.
 * @param data The data to update.
 */
export const updateGroup = (groupId: string, data: Partial<Omit<Group, 'id'>>) => {
    let groups = getStoredGroups();
    const groupIndex = groups.findIndex(g => g.id === groupId);
    if (groupIndex > -1) {
        groups[groupIndex] = { ...groups[groupIndex], ...data };
        setStoredGroups(groups);
    }
};

/**
 * Deletes a group and its associated chat messages from localStorage.
 * @param groupId The ID of the group to delete.
 */
export const deleteGroup = (groupId: string): void => {
    if (typeof window === 'undefined') return;
    
    // Remove the group
    const groups = getStoredGroups();
    const updatedGroups = groups.filter(g => g.id !== groupId);
    setStoredGroups(updatedGroups);

    // Remove the associated chat messages
    localStorage.removeItem(`chat_${groupId}`);
    
    // The 'storage' event is already dispatched by setStoredGroups
};


/**
 * Uploads a new avatar for a group. For localStorage, this will be a data URL.
 * @param file The image file to upload.
 * @returns The data URL of the image.
 */
export const uploadGroupAvatar = (file: File): Promise<string> => {
     return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * Fetches the profiles for all members of a group.
 * @param groupId The ID of the group.
 * @returns An array of member profiles.
 */
export const getGroupMembers = (groupId: string): GroupMember[] => {
    const group = getGroup(groupId);
    if (!group || !group.members) {
        return [];
    }
    
    // This is a simulation, as we don't have a central user collection.
    // We generate placeholder data based on the stored user profile if available for the current user.
    const memberProfiles: GroupMember[] = group.members.map(id => {
       if (id === BOT_USER.id) {
           return { id: BOT_USER.id, name: BOT_USER.name, avatar: BOT_USER.avatar };
       }
       if (id === EXPERT_BOT_USER.id) {
            return { id: EXPERT_BOT_USER.id, name: EXPERT_BOT_USER.name, avatar: EXPERT_BOT_USER.avatar };
       }
       
       if (typeof window !== 'undefined') {
            const userProfile: UserProfile | null = JSON.parse(localStorage.getItem('userProfile') || 'null');
            if (userProfile && userProfile.farmerId === id) {
                return { id, name: userProfile.name, avatar: userProfile.avatar };
            }
       }
       // Fallback for other members/experts
       return {
            id: id,
            name: `User ${id.substring(0, 4)}`,
            avatar: `https://picsum.photos/seed/${id}/40/40`,
        }
    });

    return memberProfiles;
};

/**
 * Adds a user to a group's member list in localStorage.
 * @param groupId The ID of the group.
 * @param userId The ID of the user to add.
 * @returns An object indicating success or failure.
 */
export const addUserToGroup = (groupId: string, userId: string): {success: boolean; error?: string; userName?: string;} => {
    let groups = getStoredGroups();
    const groupIndex = groups.findIndex(g => g.id === groupId);

    if (groupIndex === -1) {
        return { success: false, error: 'Group not found.' };
    }
    
    const groupData = groups[groupIndex];

    if (groupData.members.includes(userId)) {
        // Don't return an error, just confirm success as they are in the group.
        return { success: true };
    }
    
    const userName = `User ${userId.substring(0, 4)}`;
    
    groups[groupIndex].members.push(userId);
    setStoredGroups(groups);
    
    return { success: true, userName };
};
