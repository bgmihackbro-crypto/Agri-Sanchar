
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, getDocs, serverTimestamp, Timestamp, DocumentData, WithFieldValue, query, orderBy, doc, getDoc, updateDoc, arrayUnion, where, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

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

// Type for creating a new group, `id` and `createdAt` will be generated.
export type NewGroupData = Omit<Group, 'id' | 'createdAt'>;

/**
 * Creates a new group in Firestore.
 * @param groupData The data for the new group.
 * @returns The newly created group object with its ID.
 */
export const createGroup = async (groupData: NewGroupData): Promise<Group> => {
    const groupWithTimestamp: WithFieldValue<DocumentData> = {
        ...groupData,
        createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, 'groups'), groupWithTimestamp);
    return {
        ...groupData,
        id: docRef.id,
        createdAt: Timestamp.now(), // Approximate, actual is on server
    };
};

/**
 * Fetches all groups from Firestore, ordered by creation date.
 * @returns An array of group objects.
 */
export const getGroups = async (): Promise<Group[]> => {
    const q = query(collection(db, "groups"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    } as Group));
};

/**
 * Fetches a single group from Firestore.
 */
export const getGroup = async (groupId: string): Promise<Group | null> => {
    const docRef = doc(db, 'groups', groupId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Group;
    } else {
        return null;
    }
}


/**
 * Updates a group's details in Firestore.
 * @param groupId The ID of the group to update.
 * @param data The data to update.
 */
export const updateGroup = async (groupId: string, data: Partial<Omit<Group, 'id'>>) => {
    const groupRef = doc(db, 'groups', groupId);
    await updateDoc(groupRef, data);
};

/**
 * Uploads a new avatar for a group to Firebase Storage.
 * @param file The image file to upload.
 * @param groupId The ID of the group.
 * @returns The download URL of the uploaded image.
 */
export const uploadGroupAvatar = async (file: File, groupId: string): Promise<string> => {
    const fileId = uuidv4();
    const storageRef = ref(storage, `group-avatars/${groupId}/${fileId}-${file.name}`);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
};

/**
 * Fetches the profiles for all members of a group.
 * @param groupId The ID of the group.
 * @returns An array of member profiles.
 */
export const getGroupMembers = async (groupId: string): Promise<GroupMember[]> => {
    const group = await getGroup(groupId);
    if (!group || !group.members) {
        return [];
    }

    // Since we don't have a 'users' collection, we'll simulate fetching member data
    // based on what's stored in their localStorage profiles on their own clients.
    // In a real app, you would fetch from a 'users' collection here.
    // This function will therefore return partial data based on what we can guess.
    
    const memberProfiles: GroupMember[] = [];

    // Let's create a placeholder for the bot
    memberProfiles.push({ id: 'agribot-1', name: 'AgriBot', avatar: `https://picsum.photos/seed/bot-icon/40/40` });
    
    return memberProfiles;
};

/**
 * Adds a user to a group's member list.
 * @param groupId The ID of the group.
 * @param userId The ID of the user to add.
 * @returns An object indicating success or failure.
 */
export const addUserToGroup = async (groupId: string, userId: string): Promise<{success: boolean; error?: string; userName?: string; userId?: string; userAvatar?: string}> => {
    const groupRef = doc(db, 'groups', groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) {
        return { success: false, error: 'Group not found.' };
    }
    
    const groupData = groupSnap.data() as Group;

    if (groupData.members.includes(userId)) {
        return { success: false, error: 'User is already in this group.' };
    }
    
    // In a real app, we'd query a 'users' collection to find the user.
    // Since we don't have one, we can't truly add an arbitrary user.
    // We will simulate this by just adding the ID.
    // For the demo, let's assume any ID starting with 'AS-' is a valid farmer ID.
    if (!userId.startsWith('AS-')) {
        return { success: false, error: 'Invalid Farmer ID format.' };
    }

    // This is a placeholder. We can't know the user's name or avatar from just their ID
    // without a central user collection.
    const userName = `Farmer ${userId.substring(3, 7)}`;
    const userAvatar = `https://picsum.photos/seed/${userId}/40/40`;
    
    await updateDoc(groupRef, {
        members: arrayUnion(userId)
    });
    
    return { success: true, userName, userId, userAvatar };
};
