import { Property, Advisor, LocationData } from '../types';

export const TURKEY_LOCATIONS: LocationData = {
  "Batman": {
    "Merkez": ["Gültepe", "Kültür", "Bahçelievler", "Belde", "Gap", "Şafak", "Yenişehir", "Çamlıtepe", "Pınarbaşı"],
    "Kozluk": ["Merkez"]
  },
  "İstanbul": { "Kadıköy": ["Moda", "Fenerbahçe"], "Beşiktaş": ["Bebek", "Etiler"] },
  "Ankara": { "Çankaya": ["Oran", "Birlik"] }
};

export const MOCK_ADVISORS: Advisor[] = [
  {
    id: 1,
    name: "Abdurrahman Tayğav",
    role: "Kurucu Ortak & Broker",
    phone: "+90 543 868 26 68",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=400",
    isFounder: true,
    about: "Sektörde 15 yılı aşkın tecrübesiyle Batman'ın en prestijli projelerine imza atmıştır. Müşteri memnuniyeti odaklı çalışma prensibi ve geniş yatırımcı ağı ile gayrimenkul danışmanlığında fark yaratmaktadır. Özellikle ticari gayrimenkul ve arsa yatırımları konusunda uzmandır.",
    social: {
        instagram: "https://www.instagram.com/diesgayrimenkul/",
        facebook: "https://www.facebook.com/diesgayrimenkul/"
    },
    stats: { totalSales: 150, activeListings: 12, experience: 12 }
  },
  {
    id: 2,
    name: "İsmail Demirbilek",
    role: "Kurucu Ortak & Broker",
    phone: "+90 505 996 96 12",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400&h=400",
    isFounder: true,
    about: "İnşaat ve emlak sektöründeki köklü geçmişi ile Dies Gayrimenkul'ün kurucu ortaklarındandır. Lüks konut satışları ve proje pazarlama konularında derin bir bilgi birikimine sahiptir. Batman'da modern yaşam alanlarının pazarlanmasında öncü rol oynamaktadır.",
    social: {
        instagram: "https://www.instagram.com/diesgayrimenkul/",
        facebook: "https://www.facebook.com/diesgayrimenkul/"
    },
    stats: { totalSales: 120, activeListings: 8, experience: 10 }
  },
  {
    id: 3,
    name: "Ahmet Yılmaz",
    role: "Gayrimenkul Danışmanı",
    phone: "+90 555 123 45 67",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400&h=400",
    isFounder: false,
    about: "Anadolu Üniversitesi İktisat Fakültesi mezunu olan Ahmet Yılmaz, 5 yıldır profesyonel gayrimenkul danışmanlığı yapmaktadır. Konut satışı ve kiralama konularında uzmanlaşmıştır. Müşterilerine doğru fiyatlandırma ve hızlı sonuç alma konularında rehberlik etmektedir. Güler yüzlü hizmeti ve şeffaf çalışma anlayışı ile tanınır.",
    stats: { totalSales: 45, activeListings: 5, experience: 5 }
  }
];

export const MOCK_PROPERTIES: Property[] = [
  {
    id: 101,
    title: "Gültepe'de Ultra Lüks 4.5+1 Daire",
    price: 5500000,
    currency: 'TL',
    location: "Batman, Gültepe",
    province: "Batman",
    district: "Merkez",
    neighborhood: "Gültepe",
    type: 'Satılık',
    category: 'Konut',
    // Luxury Modern Apartment Image
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200",
    images: [
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&q=80&w=1200", // Living room
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200", // Kitchen
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200"  // Bedroom
    ],
    bedrooms: "4+1",
    bathrooms: 2,
    area: 210,
    netArea: 185,
    advisorId: 1,
    description: "Ultra lüks yapılı, geniş balkonlu, güney cephe. Özel mimari tasarım, birinci sınıf malzeme kalitesi.",
    features: ["Asansör", "Kapalı Otopark", "7/24 Güvenlik", "Akıllı Ev Sistemi", "Ebeveyn Banyosu"],
    date: "2024-05-20",
    buildingAge: "0",
    heatingType: "Yerden Isıtma",
    isFurnished: false,
    isInComplex: true,
    balconyCount: 2
  },
  {
    id: 105,
    title: "Kültür Mahallesi Ara Kat 3+1",
    price: 3200000,
    currency: 'TL',
    location: "Batman, Kültür",
    province: "Batman",
    district: "Merkez",
    neighborhood: "Kültür",
    type: 'Satılık',
    category: 'Konut',
    // Cozy Apartment Image
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200",
    images: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1484154218962-a1c00207099b?auto=format&fit=crop&q=80&w=1200"
    ],
    bedrooms: "3+1",
    bathrooms: 1,
    area: 145,
    advisorId: 2,
    description: "Okullara ve marketlere yürüme mesafesinde. Geniş ve ferah odalar.",
    features: ["Doğalgaz", "Balkon", "Çelik Kapı", "Isı Yalıtımı"],
    date: "2024-05-22",
    buildingAge: "10-15",
    heatingType: "Doğalgaz (Kombi)",
    balconyCount: 1
  },
  {
    id: 106,
    title: "Belde Mahallesi Kiralık Lüx Daire",
    price: 15000,
    currency: 'TL',
    location: "Batman, Belde",
    province: "Batman",
    district: "Merkez",
    neighborhood: "Belde",
    type: 'Kiralık',
    category: 'Konut',
    // Interior Apartment Image
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=1200",
    images: [
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&q=80&w=1200"
    ],
    bedrooms: "3+1",
    bathrooms: 1,
    area: 165,
    netArea: 150,
    advisorId: 3, // Assigned to new advisor
    description: "Belde mahallesinde, park ve okullara yakın, önü açık, ferah kiralık daire. Boyalı ve temiz teslim edilecektir.",
    features: ["Asansör", "Balkon", "Doğalgaz", "Parke Zemin"],
    date: "2024-05-28",
    buildingAge: "5-10",
    heatingType: "Doğalgaz (Kombi)",
    balconyCount: 2,
    isFurnished: false
  }
];