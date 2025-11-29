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
}

export interface Advisor {
  id: number;
  name: string;
  role: string;
  phone: string;
  image: string;
  isFounder?: boolean;
  about?: string;
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