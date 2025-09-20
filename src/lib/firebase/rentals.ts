
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
        imageUrl: "https://images.unsplash.com/photo-1625803323233-252748937397?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
        imageUrl: "https://images.unsplash.com/photo-1518993083190-3b957a06e1ce?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
        imageUrl: "https://plus.unsplash.com/premium_photo-1678297274438-ac7135010196?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
        imageUrl: "https://images.unsplash.com/photo-1622359400204-63539943542d?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
    },
    {
        name: "Mahindra JIVO 245 DI",
        category: "Tractor",
        price: 700,
        priceUnit: "per_hour",
        location: "Pune",
        address: "Near Wagholi, Pune",
        ownerId: "user-7",
        ownerName: "Rajesh Sharma",
        ownerAvatar: "https://picsum.photos/seed/polyhouse/40/40",
        imageUrl: "https://images.unsplash.com/photo-1581489694695-883c50a1d7c3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        description: "Mini tractor, perfect for vineyards, orchards, and small farms. Compact size with powerful performance.",
        contact: "+919876543216"
    },
    {
        name: "Paddy Transplanter",
        category: "Planter",
        price: 4500,
        priceUnit: "per_day",
        location: "Kolkata",
        address: "Howrah district area",
        ownerId: "user-8",
        ownerName: "Deepak Bose",
        ownerAvatar: "https://picsum.photos/seed/canal-water/40/40",
        imageUrl: "https://images.unsplash.com/photo-1627923769935-373809623c2c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        description: "8-row paddy transplanter, reduces labor and saves time during the critical transplanting season.",
        contact: "+919876543217"
    },
    {
        name: "Battery Operated Sprayer",
        category: "Sprayer",
        price: 500,
        priceUnit: "per_day",
        location: "Bengaluru",
        address: "K.R. Puram, Bengaluru",
        ownerId: "user-9",
        ownerName: "Sunita Devi",
        ownerAvatar: "https://picsum.photos/seed/marigold-farm/40/40",
        imageUrl: "https://images.unsplash.com/photo-1601267448652-e3c6395b033d?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        description: "16-liter capacity battery sprayer for easy and uniform spraying of pesticides and fertilizers. Comes with multiple nozzles.",
        contact: "+919876543218"
    },
    {
        name: "Massey Ferguson 241",
        category: "Tractor",
        price: 900,
        priceUnit: "per_hour",
        location: "Hyderabad",
        address: "Near Medchal, Hyderabad",
        ownerId: "user-10",
        ownerName: "Arjun Reddy",
        ownerAvatar: "https://picsum.photos/seed/kcc-card/40/40",
        imageUrl: "https://images.unsplash.com/photo-1618774835071-6156747b8ab3?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        description: "Reliable and powerful 42 HP tractor. Excellent for haulage and all basic farming operations.",
        contact: "+919876543219"
    },
    {
        name: "Potato Digger/Harvester",
        category: "Harvester",
        price: 6000,
        priceUnit: "per_day",
        location: "Jalandhar",
        address: "Nakodar road, Jalandhar",
        ownerId: "user-11",
        ownerName: "Harpreet Gill",
        ownerAvatar: "https://picsum.photos/seed/potato-crop/40/40",
        imageUrl: "https://images.unsplash.com/photo-1628231882126-194315c54536?q=80&w=1033&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        description: "Tractor-operated potato digger. Efficiently digs out potatoes with minimal damage. Can cover 2-3 acres a day.",
        contact: "+919876543220"
    },
    {
        name: "Sugarcane Harvester",
        category: "Harvester",
        price: 9000,
        priceUnit: "per_day",
        location: "Lucknow",
        address: "Barabanki district",
        ownerId: "user-12",
        ownerName: "Kavita Patel",
        ownerAvatar: "https://picsum.photos/seed/sugarcane/40/40",
        imageUrl: "https://images.unsplash.com/photo-1621282692291-a588bf33241d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        description: "Mechanical sugarcane harvester for quick and efficient harvesting. Reduces labor costs significantly.",
        contact: "+919876543221"
    },
    {
        name: "Power Tiller (15 HP)",
        category: "Tiller",
        price: 1500,
        priceUnit: "per_day",
        location: "Jaipur",
        address: "Near Sanganer, Jaipur",
        ownerId: "user-13",
        ownerName: "Priya Singh",
        ownerAvatar: "https://picsum.photos/seed/compost/40/40",
        imageUrl: "https://images.unsplash.com/photo-1615826914969-968602209930?q=80&w=1031&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        description: "Walk-behind power tiller, diesel engine. Ideal for small to medium-sized vegetable farms and inter-culture operations.",
        contact: "+919876543222"
    },
    {
        name: "Groundnut/Peanut Digger",
        category: "Harvester",
        price: 5000,
        priceUnit: "per_day",
        location: "Ahmedabad",
        address: "Sanand area, Ahmedabad",
        ownerId: "user-14",
        ownerName: "Anil Patel",
        ownerAvatar: "https://picsum.photos/seed/groundnut/40/40",
        imageUrl: "https://images.unsplash.com/photo-1598164746079-54165682b684?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        description: "Efficiently harvests groundnuts from the soil. Tractor-mounted and easy to operate.",
        contact: "+919876543223"
    },
    {
        name: "Water Tanker (5000L)",
        category: "Other",
        price: 3000,
        priceUnit: "per_day",
        location: "Indore",
        address: "Bypass road, Indore",
        ownerId: "user-15",
        ownerName: "Meena Kumari",
        ownerAvatar: "https://picsum.photos/seed/onion-market/40/40",
        imageUrl: "https://plus.unsplash.com/premium_photo-1661963958963-1283a0429712?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        description: "Tractor-towed water tanker for irrigation and other farm uses. Clean and well-maintained.",
        contact: "+919876543224"
    },
    {
        name: "Disc Plough",
        category: "Tiller",
        price: 500,
        priceUnit: "per_hour",
        location: "Nagpur",
        address: "Near Outer Ring Road, Nagpur",
        ownerId: "user-16",
        ownerName: "Suresh Rao",
        ownerAvatar: "https://picsum.photos/seed/orange-farm/40/40",
        imageUrl: "https://images.unsplash.com/photo-1625246332213-914806a69532?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        description: "Heavy-duty 3-disc plough for primary tillage in hard and dry soil. Can break up new ground effectively.",
        contact: "+919876543225"
    },
    {
        name: "Laser Land Leveler",
        category: "Other",
        price: 1200,
        priceUnit: "per_hour",
        location: "Hisar",
        address: "Near Haryana Agricultural University",
        ownerId: "user-17",
        ownerName: "Dr. Vijay Singh",
        ownerAvatar: "https://picsum.photos/seed/expert-4/40/40",
        imageUrl: "https://images.unsplash.com/photo-1627923769935-373809623c2c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        description: "Precision land leveling for water conservation and improved crop yield. Comes with a trained operator.",
        contact: "+919876543226"
    },
    {
        name: "Post Hole Digger",
        category: "Other",
        price: 1000,
        priceUnit: "per_day",
        location: "Jaipur",
        address: "Vatika Road, Jaipur",
        ownerId: "user-18",
        ownerName: "Priya Singh",
        ownerAvatar: "https://picsum.photos/seed/compost/40/40",
        imageUrl: "https://images.unsplash.com/photo-1543051932-6ef9fecfbc80?q=80&w=1080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        description: "Tractor-mounted auger for digging holes for fencing, tree plantation, and poles. 9-inch and 12-inch bits available.",
        contact: "+919876543227"
    },
    {
        name: "Multi-crop Thresher",
        category: "Harvester",
        price: 3000,
        priceUnit: "per_day",
        location: "Bhopal",
        address: "Near Mandideep, Bhopal",
        ownerId: "user-19",
        ownerName: "Anil Kumar",
        ownerAvatar: "https://picsum.photos/seed/bhopal-farmer/40/40",
        imageUrl: "https://images.unsplash.com/photo-1635562985686-4f8bb9c0d3bf?q=80&w=1080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        description: "High-capacity thresher suitable for wheat, soybean, maize, and pulses. Provides clean grain output.",
        contact: "+919876543228"
    },
    {
        name: "Claas Multi-crop Harvester",
        category: "Harvester",
        price: 2800,
        priceUnit: "per_hour",
        location: "Karnal",
        address: "GT Road, Karnal",
        ownerId: "user-20",
        ownerName: "Rakesh Kumar",
        ownerAvatar: "https://picsum.photos/seed/expert-2/40/40",
        imageUrl: "https://images.unsplash.com/photo-1529159942819-334f07de4fe5?q=80&w=1080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        description: "German-engineered Claas harvester for efficient and loss-free harvesting of multiple crops. Available for booking.",
        contact: "+919876543229"
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
