
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, serverTimestamp, Timestamp, DocumentData, WithFieldValue, query, orderBy } from 'firebase/firestore';

export interface Group {
    id: string;
    name: string;
    description?: string;
    city: string;
    memberCount: number;
    createdBy: string;
    createdAt: Timestamp;
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

    