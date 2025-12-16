
export interface Property {
  id: number;
  title: string;
  price: number;
  currency: 'TL' | 'USD' | 'EUR';
  location: string; // Generic location string (kept for backward compatibility)
  province?: string;
  district?: string;
  neighborhood?: string;
  type: 'Satılık' | 'Kiralık' | 'Satıldı' | 'Kiralandı' | 'pending';
  category: 'Konut' | 'Ticari' | 'Arsa';
  image: string;
  images?: string[];
  bedrooms?: string; // "3+1", "2+0" etc.
  bathrooms?: number;
  area: number; // Gross
  netArea?: number;
  advisorId: number;
  sahibindenLink?: string;
  description: string;
  features: string[];
  date: string;
  
  // New Fields
  buildingAge?: string; // 0, 1-5, 5-10...
  heatingType?: string; // Kombi, Merkezi, etc.
  floorLocation?: number | string; // 1, 2, Giriş...
  totalFloors?: number;
  isFurnished?: boolean;
  isInComplex?: boolean; // Site içerisinde mi
  balconyCount?: number;
  hasBalcony?: boolean; // New field

  // Join Fields (Returned from API to display in cards)
  advisorName?: string;
  advisorImage?: string;
}

export interface Advisor {
  id: number;
  name: string;
  role: string;
  phone: string;
  image: string;
  isFounder?: boolean;
  about?: string;
  specializations?: string[]; // New field
  sahibindenLink?: string;
  social?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
  stats?: {
    totalSales: number;
    activeListings: number;
    experience: number; // years
    avgSalePrice?: string;
    highestSalePrice?: string;
    clientSatisfaction?: number; // 0-5
  }
}

export interface User {
  id: number;
  name: string;
  type: 'admin' | 'advisor' | 'user';
  role: 'admin' | 'advisor' | 'user'; // Normalized to role
  email: string;
  phone?: string;
  image?: string;
  instagram?: string;
  facebook?: string;
}

export interface Office {
  id: number;
  name: string;
  address: string;
  phone: string;
  phone2?: string; // New field
  whatsapp?: string;
  image: string; // Main exterior image
  gallery?: string[];
  locationUrl?: string; // Google Maps Link
  workingHours: string;
  isHeadquarters: boolean;
  city: string;
  district: string;
  description?: string; // New field for About Office
}

export interface OfficeApplication {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate?: string;
  profession: string;
  city: string;
  education?: string;
  date: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  budget?: string; // Added
  details?: string; // Added
}

export interface AdvisorApplication {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate?: string;
  education?: string;
  experience?: string; // 'Evet' | 'Hayır'
  date: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
}

export interface FilterState {
  status: string; // Satılık/Kiralık
  type: string; // Konut/Arsa...
  minPrice: string;
  maxPrice: string;
  roomCount: string; // Multi-select potential
  minArea: string;
  maxArea: string;
  province: string;
  district: string;
  neighborhood: string;
  heatingType: string;
  buildingAge: string;
  isFurnished: string; // "Tümü", "Evet", "Hayır"
}

// Location Data Types
export interface LocationData {
  [city: string]: {
    [district: string]: string[]; // Neighborhoods
  }
}

export interface SiteSettings {
    heroImage: string;
    heroTitle: string;
    showFeatured: boolean;
    featuredIds: number[];
}
