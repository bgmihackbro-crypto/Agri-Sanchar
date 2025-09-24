
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

const initialRentalsData: Omit<Rental, 'id' | 'createdAt'>[] = [
    {
        name: "Sonalika Tractor 50HP",
        category: "Tractor",
        price: 2000,
        priceType: "day",
        description: "Well-maintained Sonalika DI 745 III tractor, suitable for ploughing and tilling. Available with driver.",
        contact: "+919876543210",
        location: "Ludhiana, Punjab",
        ownerId: "user-1",
        ownerName: "Balwinder Singh",
        ownerAvatar: "https://picsum.photos/seed/user1/40/40",
    },
    {
        name: "Paddy Harvester",
        category: "Harvester",
        price: 3500,
        priceType: "hour",
        description: "High-capacity combine harvester for rice and wheat. Can cover 2 acres per hour.",
        contact: "+919876543211",
        location: "Amritsar, Punjab",
        ownerId: "user-2",
        ownerName: "Sukhdev Singh",
        ownerAvatar: "https://picsum.photos/seed/user2/40/40",
    },
    {
        name: "Rotavator (6 feet)",
        category: "Plough",
        price: 800,
        priceType: "day",
        description: "Shaktiman rotavator, 6 feet wide. Perfect for seedbed preparation in all types of soil.",
        contact: "+919876543212",
        location: "Jalandhar, Punjab",
        ownerId: "user-3",
        ownerName: "Ranjit Kaur",
        ownerAvatar: "https://picsum.photos/seed/user3/40/40",
    },
     {
        name: "Seed Drill",
        category: "Seeder",
        price: 700,
        priceType: "day",
        description: "A 9-tine seed drill for accurate sowing of wheat, soybean, and pulses. Reduces seed wastage.",
        contact: "+919876543213",
        location: "Pune, Maharashtra",
        ownerId: "user-4",
        ownerName: "Vikram Patel",
        ownerAvatar: "https://picsum.photos/seed/user4/40/40",
    },
    {
        name: "Power Sprayer",
        category: "Sprayer",
        price: 500,
        priceType: "day",
        description: "15-liter capacity power sprayer for applying pesticides and fertilizers. Easy to operate.",
        contact: "+919876543214",
        location: "Nashik, Maharashtra",
        ownerId: "user-5",
        ownerName: "Anita Desai",
        ownerAvatar: "https://picsum.photos/seed/user5/40/40",
    },
     {
        name: "John Deere 5310",
        category: "Tractor",
        price: 2500,
        priceType: "day",
        description: "55HP John Deere tractor with 4WD. Excellent for heavy-duty tasks and all attachments.",
        contact: "+919876543215",
        location: "Lucknow, Uttar Pradesh",
        ownerId: "user-6",
        ownerName: "Rajesh Kumar",
        ownerAvatar: "https://picsum.photos/seed/user6/40/40",
    }
];


// Helper to get rentals from localStorage
export const getStoredRentals = (): Rental[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(RENTALS_STORAGE_KEY);
    
    // Check if initial data needs to be populated
    if (!stored || JSON.parse(stored).length === 0) {
        const initialRentals: Rental[] = initialRentalsData.map(r => ({
            ...r,
            id: uuidv4(),
            createdAt: Date.now() - Math.floor(Math.random() * 1000 * 3600 * 24 * 5) // Randomly in last 5 days
        }));
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

    
