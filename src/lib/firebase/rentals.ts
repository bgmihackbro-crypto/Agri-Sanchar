
import { v4 as uuidv4 } from 'uuid';

export interface Rental {
    id: string;
    name: string;
    category: string;
    description: string;
    imageUrl?: string; // Made optional
    price: number;
    priceType: 'day' | 'hour';
    location: string;
    contact: string;
    ownerId: string;
    ownerName: string;
    ownerAvatar: string;
    createdAt: number;
}

export type NewRentalData = Omit<Rental, 'id' | 'createdAt'>;

const RENTALS_STORAGE_KEY = 'rentals';

// Helper to get rentals from localStorage
export const getStoredRentals = (): Rental[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(RENTALS_STORAGE_KEY);
    
    // Check if initial data needs to be populated
    if (!stored) {
        const initialRentals: Rental[] = []; // No initial data
        localStorage.setItem(RENTALS_STORAGE_KEY, JSON.stringify(initialRentals));
        return initialRentals;
    }

    return JSON.parse(stored);
};

// Helper to save rentals to localStorage
const setStoredRentals = (rentals: Rental[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(RENTALS_STORAGE_KEY, JSON.stringify(rentals));
    // Dispatch a storage event to notify other tabs/components of the change
    window.dispatchEvent(new Event('storage'));
};

/**
 * Adds a new rental listing to localStorage.
 */
export const addRental = async (data: NewRentalData): Promise<Rental> => {
    const rentals = getStoredRentals();
    
    const newRental: Rental = {
        ...data,
        id: uuidv4(),
        createdAt: Date.now(),
        imageUrl: data.imageUrl || '' // Ensure imageUrl is at least an empty string
    };

    const updatedRentals = [newRental, ...rentals];
    setStoredRentals(updatedRentals);
    
    return Promise.resolve(newRental);
};

    