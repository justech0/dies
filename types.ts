
export interface Property {
  id: number;
  title: string;
  price: number;
  currency: 'TL' | 'USD' | 'EUR';
  location: string; 
  province?: string;
  district?: string;
  neighborhood?: string;
  type: 'Satılık' | 'Kiralık' | 'Satıldı' | 'Kiralandı' | 'pending';
  category: 'Konut' | 'Ticari' | 'Arsa';
  image: string;
  images?: string[];
  bedrooms?: string; 
  bathrooms?: number;
  area: number; 
  netArea?: number;
  advisorId: number;
  sahibindenLink?: string;
  description: string;
  features: string[];
  date: string;
  
  buildingAge?: string;
  heatingType?: string;
  floorLocation?: number | string;
  totalFloors?: number;
  isFurnished?: boolean;
  isInComplex?: boolean;
  balconyCount?: number;
  hasBalcony?: boolean;

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
  specializations?: string[];
  sahibindenLink?: string;
  social?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
  stats?: {
    totalSales: number;
    activeListings: number;
    experience: number;
    avgSalePrice?: string;
    highestSalePrice?: string;
    clientSatisfaction?: number;
  }
}

export interface User {
  id: number;
  name: string;
  type: 'admin' | 'advisor' | 'user';
  role: 'admin' | 'advisor' | 'user';
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
  phone2?: string;
  whatsapp?: string;
  image: string;
  gallery?: string[];
  locationUrl?: string;
  workingHours: string;
  isHeadquarters: boolean;
  city: string;
  district: string;
  description?: string;
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
  budget?: string;
  details?: string;
}

export interface AdvisorApplication {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate?: string;
  education?: string;
  experience?: string;
  date: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
}

export interface FilterState {
  status: string;
  type: string;
  minPrice: string;
  maxPrice: string;
  roomCount: string;
  minArea: string;
  maxArea: string;
  province: string;
  district: string;
  neighborhood: string;
  heatingType: string;
  buildingAge: string;
  isFurnished: string;
  floorLocation: string;
  hasBalcony: string;
}

export interface LocationData {
  [city: string]: {
    [district: string]: string[];
  }
}

export interface SiteSettings {
    heroImage: string;
    heroTitle: string;
    showFeatured: boolean;
    featuredIds: number[];
}
