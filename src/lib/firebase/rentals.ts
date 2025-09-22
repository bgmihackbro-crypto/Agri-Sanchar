
import { v4 as uuidv4 } from 'uuid';

export interface Rental {
    id: string;
    name: string;
    category: string;
    description: string;
    imageUrl: string;
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
        const initialRentals: Rental[] = [
            {
                id: 'rental-1',
                name: 'Sonalika Tractor 50HP',
                category: 'Tractor',
                description: 'Well-maintained 2021 model tractor, suitable for ploughing and tilling. Available with a driver if needed.',
                imageUrl: 'https://plus.unsplash.com/premium_photo-1681487807753-645313c4a45a?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                price: 2000,
                priceType: 'day',
                location: 'Ludhiana',
                contact: '+919876543210',
                ownerId: 'user-1',
                ownerName: 'Balwinder Singh',
                ownerAvatar: 'https://picsum.photos/seed/wheat-field/40/40',
                createdAt: Date.now() - 86400000 * 2, // 2 days ago
            },
            {
                id: 'rental-2',
                name: 'Class Crop Tiger Harvester',
                category: 'Harvester',
                description: 'High-capacity combine harvester for wheat and rice. Book in advance for the harvest season.',
                imageUrl: 'https://images.unsplash.com/photo-1627920769854-b08889154044?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                price: 3500,
                priceType: 'hour',
                location: 'Amritsar',
                contact: '+919988776655',
                ownerId: 'user-2',
                ownerName: 'Gurpreet Kaur',
                ownerAvatar: 'https://picsum.photos/seed/farm-avatar-2/40/40',
                createdAt: Date.now() - 86400000 * 5, // 5 days ago
            },
            {
                id: 'rental-3',
                name: 'Heavy Duty Cultivator',
                category: 'Plough',
                description: '9-tyne heavy-duty cultivator for deep ploughing. Can be attached to any tractor above 45HP.',
                imageUrl: 'https://media.istockphoto.com/id/1329025075/photo/plough-in-a-field.jpg?s=1024x1024&w=is&k=20&c=6_n5g72vKCSqOsK2Gv28JMR2Gf2yvQhTo5a34uS3mNM=',
                price: 800,
                priceType: 'day',
                location: 'Patiala',
                contact: '+919123456789',
                ownerId: 'user-3',
                ownerName: 'Sukhdev Singh',
                ownerAvatar: 'https://picsum.photos/seed/farm-avatar-3/40/40',
                createdAt: Date.now() - 86400000 * 1, // 1 day ago
            }
        ];
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
    
    // In a real app, you'd upload the image file to a storage service and get a URL.
    // For this simulation, the data URI is passed directly in `imageUrl`.
    
    const newRental: Rental = {
        ...data,
        id: uuidv4(),
        createdAt: Date.now(),
    };

    const updatedRentals = [newRental, ...rentals];
    setStoredRentals(updatedRentals);
    
    return Promise.resolve(newRental);
};
