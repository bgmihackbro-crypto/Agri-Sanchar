
import { v4 as uuidv4 } from 'uuid';
import { Timestamp } from 'firebase/firestore';

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

const initialRentalsData: NewRentalData[] = [
    {
        name: "Sonalika Tractor 50HP",
        category: "Tractor",
        price: 800,
        priceUnit: "per_hour",
        location: "Ludhiana",
        address: "Near Jagraon Bridge, Ludhiana",
        ownerId: "user-1",
        ownerName: "Balwinder Singh",
        ownerAvatar: "https://picsum.photos/seed/wheat-field/40/40",
        imageUrl: "https://plus.unsplash.com/premium_photo-1675276637042-a87b5c4e0367?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        description: "Well-maintained Sonalika DI 745 III tractor. Suitable for ploughing and tilling. Available with a driver.",
        contact: "+919876543210"
    },
    {
        name: "John Deere Combine Harvester",
        category: "Harvester",
        price: 2500,
        priceUnit: "per_hour",
        location: "Amritsar",
        address: "Village near Amritsar",
        ownerId: "user-2",
        ownerName: "Gurpreet Kaur",
        ownerAvatar: "https://picsum.photos/seed/farm-avatar-2/40/40",
        imageUrl: "https://images.unsplash.com/photo-1632303496738-348f76e04879?q=80&w=1025&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        description: "High-capacity W70 combine harvester, ideal for wheat and paddy. Book in advance for the harvest season.",
        contact: "+919876543211"
    },
    {
        name: "Rotavator / Tiller",
        category: "Tiller",
        price: 600,
        priceUnit: "per_hour",
        location: "Jalandhar",
        address: "Main road, Jalandhar",
        ownerId: "user-3",
        ownerName: "Sukhdev Singh",
        ownerAvatar: "https://picsum.photos/seed/farm-avatar-3/40/40",
        imageUrl: "https://images.unsplash.com/photo-1625803323233-252748937397?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        description: "6-feet rotavator for seedbed preparation. Works efficiently in both dry and wet soil conditions.",
        contact: "+919876543212"
    },
    {
        name: "Automatic Seed Planter",
        category: "Planter",
        price: 4000,
        priceUnit: "per_day",
        location: "Patiala",
        address: "Near Patiala city center",
        ownerId: "user-4",
        ownerName: "Manpreet Kaur",
        ownerAvatar: "https://picsum.photos/seed/tractor-purchase/40/40",
        imageUrl: "https://images.unsplash.com/photo-1591785366623-6d09c4812d46?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        description: "Multi-crop planter for maize, cotton, and soybeans. Ensures uniform seed placement and spacing.",
        contact: "+919876543213"
    },
     {
        name: "Power Sprayer (Tractor Mounted)",
        category: "Sprayer",
        price: 2000,
        priceUnit: "per_day",
        location: "Ludhiana",
        address: "Near grain market, Ludhiana",
        ownerId: "user-5",
        ownerName: "Jaswinder Singh",
        ownerAvatar: "https://picsum.photos/seed/solar-pump/40/40",
        imageUrl: "https://plus.unsplash.com/premium_photo-1661962388390-34907d353dec?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        description: "400-liter capacity tractor-mounted boom sprayer. Suitable for large fields. Covers up to 5 acres per hour.",
        contact: "+919876543214"
    },
     {
        name: "New Holland Baler",
        category: "Baler",
        price: 8000,
        priceUnit: "per_day",
        location: "Bathinda",
        address: "Farm on Bathinda-Mansa road",
        ownerId: "user-6",
        ownerName: "Sandeep Kumar",
        ownerAvatar: "https://picsum.photos/seed/drip-irrigation/40/40",
        imageUrl: "https://images.unsplash.com/photo-1613862213342-3113934d4791?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        description: "Reliable square baler for paddy straw and wheat stubble. Creates compact and easy-to-handle bales.",
        contact: "+919876543215"
    }
];

const RENTALS_STORAGE_KEY = 'rentals';

// Helper to get rentals from localStorage
const getStoredRentals = (): Rental[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(RENTALS_STORAGE_KEY);
    if (!stored) {
        // If nothing is in storage, populate with initial data
        const initialData: Rental[] = initialRentalsData.map(r => ({
            ...r,
            id: uuidv4(),
            createdAt: Timestamp.now(),
        }));
        setStoredRentals(initialData);
        return initialData;
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
