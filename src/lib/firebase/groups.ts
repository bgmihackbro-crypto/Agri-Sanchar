
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, getDocs, serverTimestamp, Timestamp, DocumentData, WithFieldValue, query, orderBy, doc, getDoc, updateDoc } from 'firebase/firestore';
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
