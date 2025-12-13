


import { Property, Advisor, LocationData, Office, OfficeApplication, AdvisorApplication, SiteSettings, User } from '../types';

export const TURKEY_LOCATIONS: LocationData = {
  "Batman": {
    "Merkez": [
        "19 Mayıs", "Akyürek", "Aydınlıkevler", "Bağlar", "Bahçelievler", "Bayındır", 
        "Belde", "Beşevler", "Cudi", "Cumhuriyet", "Çamlıtepe", "Çarşı", "Çay", 
        "Fatih", "Gap", "Gültepe", "Güneykent", "Hilmievler", "Hürriyet", "Huzur", 
        "İluh", "İpragaz", "Karşıyaka", "Kısmet", "Korik", "Kültür", "Meydan", 
        "Pazaryeri", "Petrol", "Petrolkent", "Pınarbaşı", "Raman", "Sağlık", 
        "Seyitler", "Site", "Şafak", "Şirinevler", "Tilmerç", "Yeni", "Yenişehir", 
        "Yeşiltepe", "Ziya Gökalp"
    ],
    "Kozluk": [
        "Aşağı Güneşli", "Çayhan", "Hamam", "İslamkoy", "Kale", "Komando", 
        "Selçuklu", "Tepecik", "Yamaçlı", "Yukarı Güneşli", "Armutlu", "Bekirhan",
        "Çetinler", "Dereköy", "Geçitaltı", "Geyikli", "Güllüce", "Gümüşörgü"
    ],
    "Sason": [
        "Aşağı", "Gürpınar", "Haydar", "Orta", "Tekevler", "Yeşilova", "Yıldız", 
        "Yukarı", "Zafer", "Dereköy", "Ergünü", "Kelhasan", "Yücebağ"
    ],
    "Beşiri": [
        "Bağdu", "Behrem", "Cumhuriyet", "Kobin", "Mehmet Yatkın", "Milli Egemenlik",
        "İkiköprü", "Oğuz", "Örmegöze", "Yontukyazı"
    ],
    "Gercüş": [
        "Bağlarbaşı", "Çukurçeşme", "Pınarbaşı", "Yolağzı", "Kayapınar", "Arıca",
        "Gökçepınar", "Hisar", "Kırkat", "Koçak", "Nurlu", "Yüce"
    ],
    "Hasankeyf": [
        "Bahçelievler", "Dicle", "Eyyubi", "Kültür", "Raman", "Akatin", "Aksu",
        "Büyükdere", "Çardaklı", "Gaziler", "İncirli", "Karaköy", "Saklı"
    ]
  },
  "İstanbul": { 
      "Kadıköy": ["Moda", "Fenerbahçe", "Caddebostan", "Suadiye", "Göztepe"], 
      "Beşiktaş": ["Bebek", "Etiler", "Levent", "Ortaköy"],
      "Şişli": ["Nişantaşı", "Teşvikiye", "Bomonti"]
  },
  "Ankara": { 
      "Çankaya": ["Oran", "Birlik", "Çayyolu", "Ümitköy"],
      "Gölbaşı": ["İncek", "Karşıyaka"]
  },
  "İzmir": {
      "Karşıyaka": ["Bostanlı", "Mavişehir"],
      "Konak": ["Alsancak", "Göztepe"]
  }
};

// Mutable Settings
export let MOCK_SETTINGS: SiteSettings = {
    heroImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070',
    heroTitle: 'Yatırımlarınıza Değer Katıyoruz',
    showFeatured: true,
    featuredIds: [101, 105, 106, 107, 108, 109, 110, 111, 112]
};

// Initial User Database (Mutable)
export let MOCK_USERS: User[] = [
    {
        id: 900, 
        name: 'Admin User', 
        email: 'admin@dies.com', 
        role: 'admin', 
        type: 'admin',
        phone: '05550000000', 
        image: ''
    },
    {
        id: 1, // Matches Advisor ID 1
        name: 'Abdurrahman Tayğav', 
        email: 'advisor@dies.com', 
        role: 'advisor', 
        type: 'advisor',
        phone: '05438682668', 
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=400'
    },
    {
        id: 200, 
        name: 'Normal Kullanıcı', 
        email: 'user@dies.com', 
        role: 'user', 
        type: 'user',
        phone: '05001234567', 
        image: ''
    }
];

// Mutable Offices
export let MOCK_OFFICES: Office[] = [
    {
        id: 1,
        name: "Batman Merkez Ofis",
        address: "Bahçelievler, Mimar Sinan Cd., Batman, Türkiye",
        phone: "+90 543 868 26 68",
        phone2: "+90 505 996 96 12",
        // Whatsapp removed for headquarters as requested
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200",
        gallery: [
            "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800"
        ],
        locationUrl: "https://maps.app.goo.gl/CsFkuohU5wpcnTBC9",
        workingHours: "Pazartesi - Cumartesi: 09:00 - 19:00",
        isHeadquarters: true,
        city: "Batman",
        district: "Merkez",
        description: "Batman'ın kalbinde, Bahçelievler bölgesinde bulunan merkez ofisimiz, uzman kadrosu ve geniş portföy ağı ile sizlere hizmet vermektedir. Ticari gayrimenkulden konut projelerine kadar her alanda profesyonel çözümler sunuyoruz."
    }
];

// Mutable Office Applications
export let MOCK_OFFICE_APPLICATIONS: OfficeApplication[] = [
    {
        id: 1,
        firstName: "Serkan",
        lastName: "Yılmaz",
        email: "serkan.yilmaz@example.com",
        phone: "+90 555 999 88 77",
        birthDate: "1985-04-12",
        profession: "Emlak Ofisi Sahibi",
        city: "İstanbul",
        education: "Lisans",
        date: "2024-05-28",
        status: "pending"
    }
];

// Mutable Advisor Applications
export let MOCK_ADVISOR_APPLICATIONS: AdvisorApplication[] = [
    {
        id: 1,
        firstName: "Mehmet",
        lastName: "Demir",
        email: "mehmet.demir@example.com",
        phone: "+90 555 111 22 33",
        date: "2024-06-01",
        education: "Lisans",
        experience: "Evet",
        status: "pending"
    }
];

// Mutable Advisors
export let MOCK_ADVISORS: Advisor[] = [
  {
    id: 1,
    name: "Abdurrahman Tayğav",
    role: "Kurucu Ortak & Broker",
    phone: "+90 543 868 26 68",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=400",
    isFounder: true,
    about: "Sektörde 15 yılı aşkın tecrübesiyle Batman'ın en prestijli projelerine imza atmıştır. Müşteri memnuniyeti odaklı çalışma prensibi ve geniş yatırımcı ağı ile gayrimenkul danışmanlığında fark yaratmaktadır. Özellikle ticari gayrimenkul ve arsa yatırımları konusunda uzmandır.",
    specializations: ['Ticari Gayrimenkul', 'Arsa', 'Lüks Konut'],
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
    specializations: ['Proje Satış', 'Lüks Konut', 'Yatırım'],
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
    specializations: ['Konut Satış', 'Kiralama', 'Değerleme'],
    stats: { totalSales: 45, activeListings: 5, experience: 5 }
  }
];

// Mutable Properties
export let MOCK_PROPERTIES: Property[] = [
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
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200",
    images: [
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200"
    ],
    bedrooms: "4+1",
    bathrooms: 2,
    area: 210,
    netArea: 185,
    advisorId: 1,
    description: "Ultra lüks yapılı, geniş balkonlu, güney cephe. Özel mimari tasarım.",
    features: ["Asansör", "Kapalı Otopark", "7/24 Güvenlik", "Akıllı Ev Sistemi", "Ebeveyn Banyosu"],
    date: "2024-06-25", // Newer
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
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200",
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200"],
    bedrooms: "3+1",
    bathrooms: 1,
    area: 145,
    advisorId: 2,
    description: "Okullara ve marketlere yürüme mesafesinde.",
    features: ["Doğalgaz", "Balkon", "Çelik Kapı", "Isı Yalıtımı"],
    date: "2024-06-20",
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
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=1200",
    images: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=1200"],
    bedrooms: "3+1",
    bathrooms: 1,
    area: 165,
    netArea: 150,
    advisorId: 3,
    description: "Belde mahallesinde, park ve okullara yakın.",
    features: ["Asansör", "Balkon", "Doğalgaz", "Parke Zemin"],
    date: "2024-06-18",
    buildingAge: "5-10",
    heatingType: "Doğalgaz (Kombi)",
    balconyCount: 2,
    isFurnished: false
  },
  {
    id: 107,
    title: "Çamlıtepe'de Satılık Geniş 2+1",
    price: 2400000,
    currency: 'TL',
    location: "Batman, Çamlıtepe",
    province: "Batman",
    district: "Merkez",
    neighborhood: "Çamlıtepe",
    type: 'Satılık',
    category: 'Konut',
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200",
    bedrooms: "2+1",
    bathrooms: 1,
    area: 110,
    advisorId: 2,
    description: "Yatırımlık, kiracılı daire. Merkezi konumda.",
    features: ["Doğalgaz", "Asansör"],
    date: "2024-06-22",
    buildingAge: "10-15",
    heatingType: "Doğalgaz (Kombi)"
  },
  {
    id: 108,
    title: "Hasankeyf Yolu Üzeri Arsa",
    price: 8500000,
    currency: 'TL',
    location: "Batman, Hasankeyf",
    province: "Batman",
    district: "Hasankeyf",
    neighborhood: "Raman",
    type: 'Satılık',
    category: 'Arsa',
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200",
    area: 5000,
    advisorId: 1,
    description: "Yatırıma uygun, imarlı arsa. Yol kenarı.",
    features: ["İmarlı", "Köşe Parsel"],
    date: "2024-06-24", // New
    buildingAge: "",
    heatingType: ""
  },
  {
    id: 109,
    title: "Tilmerç Villaları Satılık Villa",
    price: 12000000,
    currency: 'TL',
    location: "Batman, Tilmerç",
    province: "Batman",
    district: "Merkez",
    neighborhood: "Tilmerç",
    type: 'Satılık',
    category: 'Konut',
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?auto=format&fit=crop&q=80&w=1200",
    bedrooms: "5+2",
    bathrooms: 3,
    area: 450,
    advisorId: 1,
    description: "Özel havuzlu, geniş bahçeli ultra lüks villa.",
    features: ["Havuz", "Otopark", "Güvenlik"],
    date: "2024-06-26", // Newest
    buildingAge: "0",
    heatingType: "Yerden Isıtma"
  },
  {
    id: 110,
    title: "Batman Park Yanı Kiralık Ofis",
    price: 25000,
    currency: 'TL',
    location: "Batman, Merkez",
    province: "Batman",
    district: "Merkez",
    neighborhood: "Kültür",
    type: 'Kiralık',
    category: 'Ticari',
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200",
    bedrooms: "3+1",
    area: 120,
    advisorId: 3,
    description: "Tabela değeri yüksek, prestijli ofis katı.",
    features: ["Asansör", "Merkezi Sistem"],
    date: "2024-06-21",
    buildingAge: "5-10",
    heatingType: "Merkezi"
  },
  {
    id: 111,
    title: "Gap Mahallesi Satılık 3+1",
    price: 2950000,
    currency: 'TL',
    location: "Batman, Gap",
    province: "Batman",
    district: "Merkez",
    neighborhood: "Gap",
    type: 'Satılık',
    category: 'Konut',
    image: "https://images.unsplash.com/photo-1484154218962-a1c00207099b?auto=format&fit=crop&q=80&w=1200",
    bedrooms: "3+1",
    bathrooms: 2,
    area: 160,
    advisorId: 2,
    description: "Gap mahallesinde, okula yakın, geniş balkonlu.",
    features: ["Doğalgaz", "Parke"],
    date: "2024-06-19",
    buildingAge: "5-10",
    heatingType: "Kombi"
  },
  {
    id: 112,
    title: "Yenişehir Satılık Dükkan",
    price: 6500000,
    currency: 'TL',
    location: "Batman, Yenişehir",
    province: "Batman",
    district: "Merkez",
    neighborhood: "Yenişehir",
    type: 'Satılık',
    category: 'Ticari',
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1200",
    area: 90,
    advisorId: 1,
    description: "Kuyumcular çarşısına yakın, yatırımlık dükkan.",
    features: ["Depolu", "WC"],
    date: "2024-06-15",
    buildingAge: "10-20",
    heatingType: "Klima"
  }
];
