
export interface SoilTestingLab {
    name: string;
    address: string;
    city: string;
    state: string;
    contact?: string;
}

export const soilTestingLabs: SoilTestingLab[] = [
    {
        name: "Punjab Agricultural University Soil Testing Lab",
        address: "PAU, Ferozepur Road",
        city: "Ludhiana",
        state: "Punjab",
        contact: "0161-2401960"
    },
    {
        name: "Khalsa College Soil Testing Laboratory",
        address: "Grand Trunk Road, Putligarh",
        city: "Amritsar",
        state: "Punjab",
        contact: "0183-2258802"
    },
    {
        name: "Soil & Water Testing Laboratory, Jalandhar",
        address: "Near Milk Bar, GT Road",
        city: "Jalandhar",
        state: "Punjab",
        contact: "0181-2225105"
    },
    {
        name: "Indian Agricultural Research Institute (IARI)",
        address: "Pusa, New Delhi",
        city: "New Delhi",
        state: "Delhi",
        contact: "011-25841670"
    },
    {
        name: "National Bureau of Soil Survey & Land Use Planning",
        address: "Amravati Road",
        city: "Nagpur",
        state: "Maharashtra",
        contact: "0712-2500386"
    },
    {
        name: "College of Agriculture, Pune - Soil Testing Lab",
        address: "Shivajinagar",
        city: "Pune",
        state: "Maharashtra",
        contact: "020-25537033"
    },
    {
        name: "Anand Agricultural University",
        address: "University Campus, Anand",
        city: "Anand",
        state: "Gujarat",
        contact: "02692-261310"
    },
    {
        name: "Acharya N. G. Ranga Agricultural University",
        address: "Lam, Guntur",
        city: "Guntur",
        state: "Andhra Pradesh",
        contact: "0863-2347100"
    },
    {
        name: "University of Agricultural Sciences, Bangalore",
        address: "GKVK, Bellary Road",
        city: "Bengaluru",
        state: "Karnataka",
        contact: "080-23330153"
    }
];
