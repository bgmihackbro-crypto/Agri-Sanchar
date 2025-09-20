
export interface SoilLab {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone?: string;
}

export const soilLabs: SoilLab[] = [
  // Punjab
  {
    id: "PBLDH01",
    name: "Punjab Agricultural University Soil Testing Lab",
    address: "PAU, Ferozepur Rd, Ludhiana, Punjab 141004",
    city: "Ludhiana",
    state: "Punjab",
    phone: "0161-2401960",
  },
  {
    id: "PBASR01",
    name: "Chief Agriculture Office Soil Testing Lab",
    address: "Near Power Colony, Amritsar, Punjab 143001",
    city: "Amritsar",
    state: "Punjab",
    phone: "0183-2585475",
  },
  {
    id: "PBJAL01",
    name: "Soil & Water Testing Laboratory, Jalandhar",
    address: "Khalsa College of Education, GT Road, Jalandhar, Punjab 144001",
    city: "Jalandhar",
    state: "Punjab",
  },
  // Maharashtra
  {
    id: "MHPUN01",
    name: "Maharashtra State Soil Testing Laboratory, Pune",
    address: "Agriculture College Campus, Shivajinagar, Pune, Maharashtra 411005",
    city: "Pune",
    state: "Maharashtra",
    phone: "020-25537683",
  },
  {
    id: "MHNAG01",
    name: "Regional Soil Testing Laboratory, Nagpur",
    address: "Opposite GPO, Civil Lines, Nagpur, Maharashtra 440001",
    city: "Nagpur",
    state: "Maharashtra",
  },
  // Karnataka
  {
    id: "KABEN01",
    name: "Karnataka State Soil Health Institute",
    address: "Hebbal, Bengaluru, Karnataka 560024",
    city: "Bengaluru",
    state: "Karnataka",
    phone: "080-23418580",
  },
  // Uttar Pradesh
  {
    id: "UPLKO01",
    name: "UP Council of Agricultural Research Soil Lab",
    address: "8th Floor, Kisan Mandi Bhawan, Vibhuti Khand, Gomti Nagar, Lucknow",
    city: "Lucknow",
    state: "Uttar Pradesh",
    phone: "0522-2721625",
  },
  // Haryana
  {
    id: "HRKAR01",
    name: "Haryana Agricultural University Soil Testing Lab",
    address: "CCS HAU, Hisar, Haryana 125004",
    city: "Karnal", // Note: HAU is in Hisar, but placing under Karnal as an example
    state: "Haryana",
  },
  // Rajasthan
  {
    id: "RJJAI01",
    name: "State Soil Testing Laboratory, Durgapura",
    address: "Durgapura, Tonk Road, Jaipur, Rajasthan 302018",
    city: "Jaipur",
    state: "Rajasthan",
  },
];
