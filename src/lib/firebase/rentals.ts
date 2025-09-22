
import { v4 as uuidv4 } from 'uuid';
import { Timestamp } from 'firebase/firestore';
import { type UserProfile } from './users';

export interface Rental {
    id: string;
    name: string;
    category: string;
    description: string;
    imageUrl: string;
    price: number;
    priceUnit: 'per_hour' | 'per_day';
    location: string; // City
    address?: string; // More specific address
    ownerId: string;
    ownerName: string;
    ownerAvatar: string;
    contact: string;
    createdAt: Timestamp;
}

export type NewRentalData = Omit<Rental, 'id' | 'createdAt'>;

const RENTALS_STORAGE_KEY = 'rentals';

// Helper to get rentals from localStorage
const getStoredRentals = (): Rental[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(RENTALS_STORAGE_KEY);
    // If no data is in storage, return an empty array instead of populating with initial data.
    if (!stored) {
        return [];
    }
    return JSON.parse(stored).map((r: any) => ({...r, createdAt: new Timestamp(r.createdAt.seconds, r.createdAt.nanoseconds)}));
};

// Helper to save rentals to localStorage
const setStoredRentals = (rentals: Rental[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(RENTALS_STORAGE_KEY, JSON.stringify(rentals));
    // Dispatch a storage event to notify other components/tabs
    window.dispatchEvent(new Event('storage'));
};

/**
 * Creates a new rental listing in localStorage.
 */
export const createRental = (rentalData: NewRentalData): Rental => {
    const rentals = getStoredRentals();
    const newRental: Rental = {
        ...rentalData,
        id: uuidv4(),
        createdAt: Timestamp.now(),
    };
    const updatedRentals = [newRental, ...rentals];
    setStoredRentals(updatedRentals);
    return newRental;
};

/**
 * Fetches all rental listings from localStorage.
 */
export const getRentals = (): Rental[] => {
    const rentals = getStoredRentals();
    return rentals.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
};

/**
 * Fetches a single rental listing by its ID.
 */
export const getRental = (id: string): Rental | null => {
    const rentals = getStoredRentals();
    return rentals.find(r => r.id === id) || null;
};

/**
 * Deletes a rental listing.
 */
export const deleteRental = (id: string): void => {
    const rentals = getStoredRentals();
    const updatedRentals = rentals.filter(r => r.id !== id);
    setStoredRentals(updatedRentals);
};

    

    
