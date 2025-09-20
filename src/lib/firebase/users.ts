
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface UserProfile {
    farmerId: string;
    name: string;
    phone: string;
    avatar: string;
    farmSize: string;
    city: string;
    state: string;
    annualIncome: string;
    gender: string;
    age: string;
    dob: string;
    language: 'English' | 'Hindi';
}

/**
 * Creates or overwrites a user's profile in Firestore.
 * @param userId The user's authentication ID.
 * @param profileData The user's profile data.
 */
export const setUserProfile = async (userId: string, profileData: UserProfile): Promise<void> => {
    try {
        const userDocRef = doc(db, 'users', userId);
        await setDoc(userDocRef, profileData);
    } catch (error) {
        console.error("Error setting user profile in Firestore:", error);
        throw new Error("Could not save user profile to the database.");
    }
};

/**
 * Retrieves a user's profile from Firestore.
 * @param userId The user's authentication ID.
 * @returns The user's profile data, or null if not found.
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
        const userDocRef = doc(db, 'users', userId);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            return docSnap.data() as UserProfile;
        }
        return null;
    } catch (error) {
        console.error("Error fetching user profile from Firestore:", error);
        throw new Error("Could not fetch user profile from the database.");
    }
};

/**
 * Updates a user's profile in Firestore.
 * @param userId The user's authentication ID.
 * @param updates The fields to update.
 */
export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<void> => {
    try {
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, updates);
    } catch (error) {
        console.error("Error updating user profile in Firestore:", error);
        throw new Error("Could not update user profile in the database.");
    }
};
