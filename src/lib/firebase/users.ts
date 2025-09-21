
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
    userType: 'farmer' | 'expert' | 'ngo';
}

// In-memory/localStorage cache for user profiles to support simulation
let userProfiles: { [key: string]: UserProfile } = {};

if (typeof window !== 'undefined') {
    const storedProfiles = localStorage.getItem('userProfiles');
    if (storedProfiles) {
        userProfiles = JSON.parse(storedProfiles);
    }
}

const saveProfilesToLocalStorage = () => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('userProfiles', JSON.stringify(userProfiles));
    }
};

/**
 * Creates or overwrites a user's profile.
 * Simulates Firestore 'set' but uses localStorage for this prototyping environment.
 * @param userId The user's authentication ID (or simulated ID).
 * @param profileData The user's profile data.
 */
export const setUserProfile = async (userId: string, profileData: UserProfile): Promise<void> => {
    userProfiles[userId] = profileData;
    saveProfilesToLocalStorage();
    return Promise.resolve();
};

/**
 * Retrieves a user's profile.
 * Simulates Firestore 'get' but uses localStorage.
 * @param userId The user's authentication ID (or simulated ID).
 * @returns The user's profile data, or null if not found.
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    const profile = userProfiles[userId];
    return Promise.resolve(profile || null);
};

/**
 * Updates a user's profile.
 * Simulates Firestore 'update' but uses localStorage.
 * @param userId The user's authentication ID.
 * @param updates The fields to update.
 */
export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<void> => {
    if (userProfiles[userId]) {
        userProfiles[userId] = { ...userProfiles[userId], ...updates };
        saveProfilesToLocalStorage();
        return Promise.resolve();
    } else {
        // In a real app, you might throw an error or handle this case differently.
        // For simulation, we can just create it if it doesn't exist.
        const newProfileData: UserProfile = {
             farmerId: userId,
             name: '',
             phone: '',
             avatar: '',
             farmSize: '',
             city: '',
             state: '',
             annualIncome: '',
             gender: '',
             age: '',
             dob: '',
             language: 'English' as const,
             userType: 'farmer' as const,
             ...updates,
        };
        await setUserProfile(userId, newProfileData);
    }
};
