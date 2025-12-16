
import React, { useState, useEffect } from 'react';
import { useTheme } from '../components/ThemeContext';
import { useAuth } from '../components/AuthContext';
// @ts-ignore
import { Link, useNavigate } from 'react-router-dom';
import { Home, CheckCircle, XCircle, BarChart, Trash2, Clock, Users, Edit, Plus, Image as ImageIcon, Layout, Save, Settings, ShieldAlert, Building, FileText, Eye, MapPin, MessageCircle, Filter, Search, LogOut, Briefcase, UploadCloud, X } from 'lucide-react';
import { MOCK_PROPERTIES, MOCK_ADVISORS, MOCK_OFFICES, MOCK_OFFICE_APPLICATIONS, MOCK_ADVISOR_APPLICATIONS, MOCK_SETTINGS, MOCK_USERS } from '../services/mockData';
import { Property, Advisor, Office, OfficeApplication, AdvisorApplication, User } from '../types';

export const AdminDashboard = () => {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'approvals' | 'all-listings' | 'advisors' | 'users' | 'offices' | 'settings'>('overview');
  
  // Data States
  const [advisors, setAdvisors] = useState<Advisor[]>(MOCK_ADVISORS);
  const [offices, setOffices] = useState<Office[]>(MOCK_OFFICES);
  const [officeApplications, setOfficeApplications] = useState<OfficeApplication[]>(MOCK_OFFICE_APPLICATIONS);
  const [advisorApplications, setAdvisorApplications] = useState<AdvisorApplication[]>(MOCK_ADVISOR_APPLICATIONS);
  const [allListings, setAllListings] = useState<Property[]>(MOCK_PROPERTIES);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  
  const [homeSettings, setHomeSettings] = useState(MOCK_SETTINGS);
  
  // UI States for Forms
  const [showAdvisorForm, setShowAdvisorForm] = useState(false);
  const [editingAdvisor, setEditingAdvisor] = useState<Advisor | null>(null);
  const [advisorForm, setAdvisorForm] = useState({ name: '', phone: '', role: 'Gayrimenkul Danışmanı', image: '' });

  const [listingFilters, setListingFilters] = useState({
      term: '', // Title or ID
      advisorId: '',
      roomCount: '',
      status: '' // New status filter
  });
  const [filteredListings, setFilteredListings] = useState<Property[]>(MOCK_PROPERTIES);
  
  const [showOfficeForm, setShowOfficeForm] = useState(false);
  // 'approvals' tab sub-state
  const [activeApprovalsSubTab, setActiveApprovalsSubTab] = useState<'listings' | 'advisors' | 'offices'>('listings');
  
  const [editingOffice, setEditingOffice] = useState<Office | null>(null);
  
  // Office File Upload State
  const [officeFiles, setOfficeFiles] = useState<File[]>([]);
  const [officePreviews, setOfficePreviews] = useState<string[]>([]);

  const [officeFormData, setOfficeFormData] = useState({
      name: '',
      city: '',
      district: '',
      phone: '',
      whatsapp: '',
      address: '',
      locationUrl: '',
      image: '',
      gallery: '',
      workingHours: '',
      description: ''
  });

  // Sync state with mocks on load/render (simple effect for this demo structure)
  useEffect(() => {
      setAllListings(MOCK_PROPERTIES);
      setFilteredListings(MOCK_PROPERTIES);
  }, []);

  // Access Control
  if (!user || user.role !== 'admin') {
      return (
        <div className="pt-40 text-center px-4">
            <ShieldAlert size={64} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Yetkisiz Erişim</h2>
            <p className="text-gray-500">Bu sayfayı görüntülemek için Yönetici yetkisine sahip olmalısınız.</p>
        </div>
      );
  }

  // --- ACTIONS ---

  // ADVISORS
  const openAdvisorForm = (advisor?: Advisor) => {
      if (advisor) {
          setEditingAdvisor(advisor);
          setAdvisorForm({
              name: advisor.name,
              phone: advisor.phone,
              role: advisor.role,
              image: advisor.image
          });
      } else {
          setEditingAdvisor(null);
          setAdvisorForm({ name: '', phone: '', role: 'Gayrimenkul Danışmanı', image: '' });
      }
      setShowAdvisorForm(true);
  };

  const handleSaveAdvisor = (e: React.FormEvent) => {
      e.preventDefault();
      const newAdvisorData: Advisor = {
          id: editingAdvisor ? editingAdvisor.id : Math.floor(Math.random() * 10000) + 2000,
          name: advisorForm.name,
          role: advisorForm.role,
          phone: advisorForm.phone,
          image: advisorForm.image || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=400',
          stats: editingAdvisor ? editingAdvisor.stats : { totalSales: 0, activeListings: 0, experience: 0 },
          isFounder: editingAdvisor ? editingAdvisor.isFounder : false
      };

      if (editingAdvisor) {
          const updated = advisors.map(a => a.id === editingAdvisor.id ? newAdvisorData : a);
          setAdvisors(updated);
          const index = MOCK_ADVISORS.findIndex(a => a.id === editingAdvisor.id);
          if (index !== -1) MOCK_ADVISORS[index] = newAdvisorData;
      } else {
          const updated = [...advisors, newAdvisorData];
          setAdvisors(updated);
          MOCK_ADVISORS.push(newAdvisorData);
      }
      setShowAdvisorForm(false);
      setEditingAdvisor(null);
  };

  const handleDeleteAdvisor = (id: number) => {
      if (window.confirm("Bu danışmanı silmek istediğinize emin misiniz?")) {
          setAdvisors(advisors.filter(a => a.id !== id));
          const index = MOCK_ADVISORS.findIndex(a => a.id === id);
          if (index !== -1) MOCK_ADVISORS.splice(index, 1);
          
          // Also demote in Users if linked
          const userIdx = MOCK_USERS.findIndex(u => u.id === id);
          if (userIdx !== -1) {
              MOCK_USERS[userIdx].role = 'user';
              MOCK_USERS[userIdx].type = 'user';
              setUsers([...MOCK_USERS]);
          }
      }
  };

  // USERS
  const handleRoleChange = (userId: number, newRole: 'admin' | 'advisor' | 'user') => {
      if (window.confirm("Kullanıcının rolünü değiştirmek istediğinize emin misiniz?")) {
          const updatedUsers = users.map(u => 
              u.id === userId ? { ...u, role: newRole, type: newRole } : u
          );
          setUsers(updatedUsers);
          
          // Update global mock data
          const userIndex = MOCK_USERS.findIndex(u => u.id === userId);
          if (userIndex !== -1) {
              MOCK_USERS[userIndex].role = newRole;
              MOCK_USERS[userIndex].type = newRole;
              const currentUserData = MOCK_USERS[userIndex];

              // Sync with MOCK_ADVISORS
              if (newRole === 'advisor') {
                  // Check if already in advisors
                  const exists = MOCK_ADVISORS.find(a => a.id === userId);
                  if (!exists) {
                      MOCK_ADVISORS.push({
                          id: userId,
                          name: currentUserData.name,
                          role: 'Gayrimenkul Danışmanı',
                          phone: currentUserData.phone || '',
                          image: currentUserData.image || 'https://via.placeholder.com/150',
                          stats: { totalSales: 0, activeListings: 0, experience: 0 },
                          about: 'Dies Gayrimenkul profesyonel danışmanı.',
                          specializations: ['Genel Gayrimenkul']
                      });
                  }
              } else {
                  // If demoted from advisor, remove from MOCK_ADVISORS
                  const advIndex = MOCK_ADVISORS.findIndex(a => a.id === userId);
                  if (advIndex !== -1) {
                      MOCK_ADVISORS.splice(advIndex, 1);
                  }
              }
          }
          // Refresh advisors local state
          setAdvisors([...MOCK_ADVISORS]);
      }
  };

  // LISTINGS
  const handleListingFilter = () => {
      let results = allListings;

      if (listingFilters.term) {
          const term = listingFilters.term.toLowerCase();
          results = results.filter(p => 
              p.title.toLowerCase().includes(term) || 
              p.id.toString() === term
          );
      }
      if (listingFilters.advisorId) {
          results = results.filter(p => p.advisorId === parseInt(listingFilters.advisorId));
      }
      if (listingFilters.roomCount) {
          results = results.filter(p => p.bedrooms === listingFilters.roomCount);
      }
      if (listingFilters.status) {
          results = results.filter(p => p.type === listingFilters.status);
      }
      setFilteredListings(results);
  };

  const handleClearListingFilter = () => {
      setListingFilters({ term: '', advisorId: '', roomCount: '', status: '' });
      setFilteredListings(allListings);
  };

  const handleDeleteListing = (id: number) => {
      if (window.confirm("Bu ilanı silmek istediğinize emin misiniz?")) {
         setAllListings(prev => prev.filter(p => p.id !== id));
         setFilteredListings(prev => prev.filter(p => p.id !== id));
         const index = MOCK_PROPERTIES.findIndex(p => p.id === id);
         if (index !== -1) MOCK_PROPERTIES.splice(index, 1);
      }
  };

  const handleRejectListing = (id: number) => {
      const reason = window.prompt("İlanı reddetme sebebini giriniz (Opsiyonel):");
      if (reason === null) return; // User cancelled

      // Remove from list
      setAllListings(prev => prev.filter(p => p.id !== id));
      setFilteredListings(prev => prev.filter(p => p.id !== id));
      
      // Remove from Mock Data
      const index = MOCK_PROPERTIES.findIndex(p => p.id === id);
      if (index !== -1) MOCK_PROPERTIES.splice(index, 1);
  };
  
  // LISTING APPROVALS
  const pendingListings = allListings.filter(p => p.type === 'pending');
  
  const handleApproveListing = (id: number) => {
      if(window.confirm("Bu ilanı yayına almak istiyor musunuz?")) {
          const index = MOCK_PROPERTIES.findIndex(p => p.id === id);
          if (index !== -1) {
              MOCK_PROPERTIES[index].type = 'Satılık'; // Default to sales, or could check category
          }
          setAllListings([...MOCK_PROPERTIES]);
          setFilteredListings([...MOCK_PROPERTIES]); // Refresh visible lists
      }
  };

  // OFFICE APPLICATIONS
  const handleOfficeApprove = (appId: number) => {
      const app = officeApplications.find(a => a.id === appId);
      if(!app) return;

      if(window.confirm(`${app.firstName} ${app.lastName} adlı kişinin Ofis (Bayilik) başvurusunu onaylıyor musunuz? Bu işlem otomatik olarak yeni bir ofis oluşturacaktır.`)) {
          // 1. Update status
          setOfficeApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'approved' } : a));
          
          // 2. Create new Office
          const newOffice: Office = {
              id: Math.floor(Math.random() * 10000) + 200,
              name: `Dies ${app.city} Ofisi (${app.firstName} ${app.lastName})`,
              city: app.city,
              district: 'Merkez', // Defaulting
              address: `${app.city}, Türkiye`,
              phone: app.phone,
              workingHours: '09:00 - 18:00',
              image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200',
              isHeadquarters: false,
              description: `Dies Gayrimenkul ${app.city} temsilciliği.`
          };
          
          MOCK_OFFICES.push(newOffice);
          setOffices([...MOCK_OFFICES]);
          alert("Ofis başvurusu onaylandı ve Ofisler listesine eklendi.");
      }
  };

  const handleRejectOfficeApp = (appId: number) => {
      if(window.confirm("Bu başvuruyu reddetmek ve silmek istediğinize emin misiniz?")) {
          setOfficeApplications(prev => prev.filter(app => app.id !== appId));
          // Remove from global mock
          const index = MOCK_OFFICE_APPLICATIONS.findIndex(app => app.id === appId);
          if (index !== -1) MOCK_OFFICE_APPLICATIONS.splice(index, 1);
      }
  };

  // ADVISOR APPLICATIONS
  const handleAdvisorApprove = (appId: number) => {
      const app = advisorApplications.find(a => a.id === appId);
      if (!app) return;
      
      if(window.confirm(`${app.firstName} ${app.lastName} adlı kişinin danışmanlık başvurusunu onaylıyor musunuz? Bu işlem kullanıcıyı oluşturacak ve danışman listesine ekleyecektir.`)) {
          // 1. Mark App as Approved
          setAdvisorApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'approved' } : a));
          
          // 2. Generate new ID
          const newId = Math.floor(Math.random() * 10000) + 2000;

          // 3. Create User (for login)
          const newUser: User = {
              id: newId,
              name: `${app.firstName} ${app.lastName}`,
              email: app.email,
              role: 'advisor',
              type: 'advisor',
              phone: app.phone,
              image: 'https://via.placeholder.com/400'
          };
          MOCK_USERS.push(newUser);
          setUsers([...MOCK_USERS]);

          // 4. Create Advisor (for public list)
          const newAdvisor: Advisor = {
              id: newId,
              name: `${app.firstName} ${app.lastName}`,
              role: 'Gayrimenkul Danışmanı',
              phone: app.phone,
              image: 'https://via.placeholder.com/400',
              stats: { totalSales: 0, activeListings: 0, experience: app.experience === 'Evet' ? 2 : 0 },
              about: `${app.education} mezunu. Dies Gayrimenkul ailesinin yeni üyesi.`,
              specializations: ['Konut Satış']
          };
          MOCK_ADVISORS.push(newAdvisor);
          setAdvisors([...MOCK_ADVISORS]);
          
          alert("Başvuru onaylandı. Kullanıcı oluşturuldu ve danışman listesine eklendi. (Giriş için email adresi kullanılır).");
      }
  };
  
  const handleRejectAdvisorApp = (appId: number) => {
      if(window.confirm("Bu başvuruyu silmek istediğinize emin misiniz?")) {
          setAdvisorApplications(prev => prev.filter(app => app.id !== appId));
          const index = MOCK_ADVISOR_APPLICATIONS.findIndex(app => app.id === appId);
          if (index !== -1) MOCK_ADVISOR_APPLICATIONS.splice(index, 1);
      }
  };


  // OFFICES MANAGEMENT
  const openOfficeForm = (office?: Office) => {
      // Reset files
      setOfficeFiles([]);
      setOfficePreviews([]);

      if (office) {
          setEditingOffice(office);
          setOfficeFormData({
              name: office.name,
              city: office.city,
              district: office.district,
              phone: office.phone,
              whatsapp: office.whatsapp || '',
              address: office.address,
              locationUrl: office.locationUrl || '',
              image: office.image,
              gallery: office.gallery ? office.gallery.join(', ') : '',
              workingHours: office.workingHours,
              description: office.description || ''
          });
      } else {
          setEditingOffice(null);
          setOfficeFormData({ name: '', city: '', district: '', phone: '', whatsapp: '', address: '', locationUrl: '', image: '', gallery: '', workingHours: '', description: '' });
      }
      setShowOfficeForm(true);
  };
  
  const handleOfficeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          const files = Array.from(e.target.files) as File[];
          // Check limit (existing + new <= 3)
          if (officeFiles.length + files.length > 3) {
              alert("En fazla 3 dosya yükleyebilirsiniz.");
              return;
          }
          const newFiles = [...officeFiles, ...files];
          setOfficeFiles(newFiles);
          
          // Generate previews
          const newPreviews = files.map(file => URL.createObjectURL(file));
          setOfficePreviews(prev => [...prev, ...newPreviews]);
      }
  };

  const removeOfficeFile = (index: number) => {
      setOfficeFiles(prev => prev.filter((_, i) => i !== index));
      setOfficePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveOffice = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Handle file uploads (Mock: convert to blob URLs)
      const uploadedImageUrls = officeFiles.map(file => URL.createObjectURL(file));
      
      // Determine Main Image: Use Input URL OR First Uploaded File if URL is empty
      let mainImage = officeFormData.image;
      if (!mainImage && uploadedImageUrls.length > 0) {
          mainImage = uploadedImageUrls[0];
      }
      // Fallback default
      if (!mainImage) {
          mainImage = "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200";
      }

      // Combine Gallery: Existing Text Input URLs + Uploaded Files
      const textGallery = officeFormData.gallery.split(',').map(s => s.trim()).filter(s => s !== '');
      // If we used the first uploaded file as main image because input was empty, don't duplicate it in gallery if we want strict separation,
      // but typically gallery includes all images. Let's append all uploaded to gallery.
      const finalGallery = [...textGallery, ...uploadedImageUrls];

      const officeData: Office = {
          id: editingOffice ? editingOffice.id : Math.floor(Math.random() * 10000),
          name: officeFormData.name,
          address: officeFormData.address,
          phone: officeFormData.phone,
          whatsapp: officeFormData.whatsapp,
          locationUrl: officeFormData.locationUrl,
          city: officeFormData.city,
          district: officeFormData.district,
          image: mainImage,
          gallery: finalGallery.length > 0 ? finalGallery : undefined,
          workingHours: officeFormData.workingHours || "09:00 - 18:00",
          isHeadquarters: editingOffice ? editingOffice.isHeadquarters : false,
          description: officeFormData.description
      };

      if (editingOffice) {
          setOffices(prev => prev.map(o => o.id === editingOffice.id ? officeData : o));
          const index = MOCK_OFFICES.findIndex(o => o.id === editingOffice.id);
          if (index !== -1) MOCK_OFFICES[index] = officeData;
      } else {
          setOffices([...offices, officeData]);
          MOCK_OFFICES.push(officeData);
      }
      setShowOfficeForm(false);
      setEditingOffice(null);
  };

  // SETTINGS
  const toggleFeatured = (id: number) => {
      const currentIds = [...homeSettings.featuredIds];
      if (currentIds.includes(id)) {
          setHomeSettings({...homeSettings, featuredIds: currentIds.filter(fid => fid !== id)});
      } else {
          setHomeSettings({...homeSettings, featuredIds: [...currentIds, id]});
      }
  };

  const handleSaveSettings = () => {
      MOCK_SETTINGS.heroImage = homeSettings.heroImage;
      MOCK_SETTINGS.heroTitle = homeSettings.heroTitle;
      MOCK_SETTINGS.showFeatured = homeSettings.showFeatured;
      MOCK_SETTINGS.featuredIds = homeSettings.featuredIds;
      alert("Vitrin ayarları kaydedildi.");
  };

  const inputClass = `w-full p-2.5 rounded-lg border text-sm ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`;
  const labelClass = `block text-xs font-bold mb-1.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`;

  return (
    <div className="container mx-auto px-4 py-12 pt-32 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Yönetim Paneli
            </h1>
            <p className="text-gray-500 text-sm mt-1">Hoşgeldin, <span className="font-bold text-dies-blue">{user.name}</span></p>
        </div>
        <div className="flex gap-2">
             <button onClick={() => { logout(); navigate('/'); }} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-red-100">
                 <LogOut size={16} /> Çıkış Yap
             </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex overflow-x-auto gap-2 mb-8 border-b border-gray-200 pb-1 scrollbar-hide">
            <button onClick={() => setActiveTab('overview')} className={`px-6 py-3 font-bold rounded-t-lg whitespace-nowrap ${activeTab === 'overview' ? 'bg-dies-blue text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Genel Bakış</button>
            <button onClick={() => setActiveTab('offices')} className={`px-6 py-3 font-bold rounded-t-lg whitespace-nowrap ${activeTab === 'offices' ? 'bg-dies-blue text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Başvurular & Onaylar</button>
            <button onClick={() => setActiveTab('users')} className={`px-6 py-3 font-bold rounded-t-lg whitespace-nowrap ${activeTab === 'users' ? 'bg-dies-blue text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Kullanıcılar</button>
            <button onClick={() => setActiveTab('all-listings')} className={`px-6 py-3 font-bold rounded-t-lg whitespace-nowrap ${activeTab === 'all-listings' ? 'bg-dies-blue text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Tüm İlanlar</button>
            <button onClick={() => setActiveTab('advisors')} className={`px-6 py-3 font-bold rounded-t-lg whitespace-nowrap ${activeTab === 'advisors' ? 'bg-dies-blue text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Danışmanlar</button>
            <button onClick={() => setActiveTab('settings')} className={`px-6 py-3 font-bold rounded-t-lg whitespace-nowrap ${activeTab === 'settings' ? 'bg-dies-blue text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Site Ayarları</button>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-4 md:p-6 min-h-[500px]">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="text-dies-blue" />
                        <span className="font-bold text-gray-700">Toplam Üye</span>
                    </div>
                    <p className="text-3xl font-extrabold text-dies-blue">{users.length}</p>
                </div>
                <div className="p-6 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex items-center gap-3 mb-2">
                        <Home className="text-green-600" />
                        <span className="font-bold text-gray-700">Yayında Olan</span>
                    </div>
                    <p className="text-3xl font-extrabold text-green-600">{allListings.filter(p => p.type !== 'pending' && p.type !== 'Satıldı' && p.type !== 'Kiralandı').length}</p>
                </div>
                <div className="p-6 bg-yellow-50 rounded-xl border border-yellow-100">
                    <div className="flex items-center gap-3 mb-2">
                        <Clock className="text-yellow-600" />
                        <span className="font-bold text-gray-700">Onay Bekleyen İlan</span>
                    </div>
                    <p className="text-3xl font-extrabold text-yellow-600">{pendingListings.length}</p>
                </div>
                <div className="p-6 bg-orange-50 rounded-xl border border-orange-100">
                    <div className="flex items-center gap-3 mb-2">
                        <Briefcase className="text-orange-600" />
                        <span className="font-bold text-gray-700">Danışman Sayısı</span>
                    </div>
                    <p className="text-3xl font-extrabold text-orange-600">{advisors.length}</p>
                </div>
            </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
            <div>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Users /> Kullanıcı Yönetimi</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="pb-3 pl-2">ID</th>
                                <th className="pb-3">Ad Soyad</th>
                                <th className="pb-3">E-posta</th>
                                <th className="pb-3">Mevcut Rol</th>
                                <th className="pb-3">Rol Değiştir</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-gray-50">
                                    <td className="py-3 pl-2 text-gray-500 font-mono text-sm">#{u.id}</td>
                                    <td className="py-3 font-bold">{u.name}</td>
                                    <td className="py-3 text-gray-600">{u.email}</td>
                                    <td className="py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                            u.role === 'admin' ? 'bg-red-100 text-red-700' :
                                            u.role === 'advisor' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {u.role === 'admin' ? 'Yönetici' : u.role === 'advisor' ? 'Danışman' : 'Kullanıcı'}
                                        </span>
                                    </td>
                                    <td className="py-3">
                                        <select 
                                            value={u.role}
                                            onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                                            className="p-1 border rounded text-sm bg-white"
                                            disabled={u.id === user.id} // Cannot change own role
                                        >
                                            <option value="user">Kullanıcı</option>
                                            <option value="advisor">Danışman</option>
                                            <option value="admin">Yönetici</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* ALL LISTINGS TAB */}
        {activeTab === 'all-listings' && (
            <div>
                <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-6 pb-6 border-b border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                        <div>
                            <label className={labelClass}>Arama (Başlık / İlan No)</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Aranacak kelime..." 
                                    className={`${inputClass} pl-10`}
                                    value={listingFilters.term}
                                    onChange={(e) => setListingFilters({...listingFilters, term: e.target.value})}
                                />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Danışman</label>
                            <select 
                                className={inputClass}
                                value={listingFilters.advisorId}
                                onChange={(e) => setListingFilters({...listingFilters, advisorId: e.target.value})}
                            >
                                <option value="">Tümü</option>
                                {advisors.map(adv => (
                                    <option key={adv.id} value={adv.id}>{adv.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Durum</label>
                            <select 
                                className={inputClass}
                                value={listingFilters.status}
                                onChange={(e) => setListingFilters({...listingFilters, status: e.target.value})}
                            >
                                <option value="">Tümü</option>
                                <option value="Satılık">Satılık</option>
                                <option value="Kiralık">Kiralık</option>
                                <option value="Satıldı">Satıldı</option>
                                <option value="Kiralandı">Kiralandı</option>
                                <option value="pending">Onay Bekliyor</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Oda Sayısı</label>
                            <select 
                                className={inputClass}
                                value={listingFilters.roomCount}
                                onChange={(e) => setListingFilters({...listingFilters, roomCount: e.target.value})}
                            >
                                <option value="">Tümü</option>
                                <option value="1+1">1+1</option>
                                <option value="2+1">2+1</option>
                                <option value="3+1">3+1</option>
                                <option value="4+1">4+1</option>
                                <option value="5+1+">5+1 ve üzeri</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <button onClick={handleListingFilter} className="bg-dies-blue text-white px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-800 transition-colors w-full md:w-auto justify-center">
                            <Filter size={18} /> Filtrele
                        </button>
                        <button onClick={handleClearListingFilter} className="bg-gray-100 text-gray-600 px-4 py-2.5 rounded-lg font-bold hover:bg-gray-200 transition-colors">
                            Temizle
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead>
                            <tr className="border-b border-gray-200 text-gray-500 text-sm">
                                <th className="pb-3 pl-2">Görsel</th>
                                <th className="pb-3">Başlık</th>
                                <th className="pb-3">Fiyat</th>
                                <th className="pb-3">Danışman</th>
                                <th className="pb-3">Durum</th>
                                <th className="pb-3 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredListings.map(p => {
                                const adv = advisors.find(a => a.id === p.advisorId);
                                return (
                                    <tr key={p.id} className="hover:bg-gray-50 group">
                                        <td className="py-2 pl-2 w-20">
                                            <img src={p.image} className="w-16 h-12 object-cover rounded" alt="" />
                                        </td>
                                        <td className="py-2">
                                            <div className="font-bold text-dies-dark line-clamp-1">{p.title}</div>
                                            <div className="text-xs text-gray-400">#{p.id} • {p.district}</div>
                                        </td>
                                        <td className="py-2 font-mono font-bold text-dies-blue">
                                            {p.price.toLocaleString()} {p.currency}
                                        </td>
                                        <td className="py-2 text-sm text-gray-600">
                                            {adv ? adv.name : 'Bilinmiyor'}
                                        </td>
                                        <td className="py-2">
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${
                                                p.type === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                p.type === 'Satıldı' ? 'bg-gray-200 text-gray-700' :
                                                'bg-green-100 text-green-700'
                                            }`}>
                                                {p.type === 'pending' ? 'Bekliyor' : p.type}
                                            </span>
                                        </td>
                                        <td className="py-2 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => navigate('/ilan-ver', { state: { editingProperty: p } })}
                                                    className="p-2 text-gray-400 hover:text-dies-blue" 
                                                    title="Düzenle"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button onClick={() => navigate(`/ilan/${p.id}`)} className="p-2 text-gray-400 hover:text-dies-blue" title="Görüntüle">
                                                    <Eye size={18} />
                                                </button>
                                                <button onClick={() => handleDeleteListing(p.id)} className="p-2 text-gray-400 hover:text-red-600" title="Sil">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    {filteredListings.length === 0 && <div className="text-center py-10 text-gray-400">İlan bulunamadı.</div>}
                </div>
            </div>
        )}

        {/* APPROVALS & OFFICES TAB */}
        {activeTab === 'offices' && (
            <div>
                 <div className="flex gap-4 mb-6 border-b border-gray-100 overflow-x-auto pb-2">
                     <button onClick={() => setActiveApprovalsSubTab('listings')} className={`pb-2 font-bold whitespace-nowrap ${activeApprovalsSubTab === 'listings' ? 'text-dies-blue border-b-2 border-dies-blue' : 'text-gray-400'}`}>İlan Onayları ({pendingListings.length})</button>
                     <button onClick={() => setActiveApprovalsSubTab('advisors')} className={`pb-2 font-bold whitespace-nowrap ${activeApprovalsSubTab === 'advisors' ? 'text-dies-blue border-b-2 border-dies-blue' : 'text-gray-400'}`}>Danışman Başvuruları ({advisorApplications.length})</button>
                     <button onClick={() => setActiveApprovalsSubTab('offices')} className={`pb-2 font-bold whitespace-nowrap ${activeApprovalsSubTab === 'offices' ? 'text-dies-blue border-b-2 border-dies-blue' : 'text-gray-400'}`}>Ofis İşlemleri</button>
                 </div>

                 {activeApprovalsSubTab === 'listings' && (
                     <div>
                        <h3 className="font-bold mb-4 text-gray-700">Onay Bekleyen Kullanıcı İlanları</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[600px]">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="pb-3 pl-2">Görsel</th>
                                        <th className="pb-3">Başlık</th>
                                        <th className="pb-3">Fiyat</th>
                                        <th className="pb-3">Kullanıcı</th>
                                        <th className="pb-3 text-right">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingListings.map(p => {
                                        const userOwner = users.find(u => u.id === p.advisorId);
                                        return (
                                            <tr key={p.id} className="hover:bg-yellow-50/50">
                                                <td className="py-2 pl-2">
                                                    <img src={p.image} className="w-16 h-12 object-cover rounded" alt="" />
                                                </td>
                                                <td className="py-2 font-medium">{p.title}</td>
                                                <td className="py-2 text-dies-blue font-bold">{p.price.toLocaleString()} TL</td>
                                                <td className="py-2 text-sm">{userOwner ? userOwner.name : 'Bilinmiyor'}</td>
                                                <td className="py-2 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={() => navigate(`/ilan/${p.id}`)}
                                                            className="text-gray-500 hover:text-blue-600 bg-white border border-gray-200 px-3 py-1 rounded text-xs font-bold"
                                                        >
                                                            İncele
                                                        </button>
                                                        <button 
                                                            onClick={() => handleApproveListing(p.id)}
                                                            className="text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-xs font-bold"
                                                        >
                                                            Onayla
                                                        </button>
                                                        <button 
                                                            onClick={() => handleRejectListing(p.id)}
                                                            className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-xs font-bold"
                                                        >
                                                            Reddet
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                            {pendingListings.length === 0 && <div className="text-center py-10 text-gray-400">Onay bekleyen ilan bulunmamaktadır.</div>}
                        </div>
                     </div>
                 )}

                 {activeApprovalsSubTab === 'advisors' && (
                     <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="pb-3">Ad Soyad</th>
                                    <th className="pb-3">Telefon</th>
                                    <th className="pb-3">Eğitim</th>
                                    <th className="pb-3">Deneyim</th>
                                    <th className="pb-3">Tarih</th>
                                    <th className="pb-3 text-right">İşlem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {advisorApplications.map(app => (
                                    <tr key={app.id} className="border-b border-gray-50 hover:bg-gray-50">
                                        <td className="py-4 font-bold">{app.firstName} {app.lastName}</td>
                                        <td className="py-4 text-sm">{app.phone}</td>
                                        <td className="py-4 text-sm">{app.education}</td>
                                        <td className="py-4 text-sm">{app.experience}</td>
                                        <td className="py-4 text-sm text-gray-500">{app.date}</td>
                                        <td className="py-4 text-right">
                                            {app.status === 'pending' ? (
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleAdvisorApprove(app.id)} className="text-green-600 hover:bg-green-50 p-2 rounded" title="Onayla ve Ekle"><CheckCircle size={18} /></button>
                                                    <button onClick={() => handleRejectAdvisorApp(app.id)} className="text-red-600 hover:bg-red-50 p-2 rounded" title="Reddet ve Sil"><Trash2 size={18} /></button>
                                                </div>
                                            ) : (
                                                <span className="text-xs font-bold text-green-600 uppercase">Onaylandı</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {advisorApplications.length === 0 && <div className="text-center py-10 text-gray-400">Danışman başvurusu bulunmamaktadır.</div>}
                     </div>
                 )}

                 {activeApprovalsSubTab === 'offices' && (
                     <div>
                         <div className="mb-8">
                             <h4 className="font-bold mb-4 text-gray-700">Ofis Başvuruları</h4>
                             <div className="overflow-x-auto">
                                <table className="w-full text-left min-w-[600px]">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="pb-3">Ad Soyad</th>
                                            <th className="pb-3">Şehir</th>
                                            <th className="pb-3">Meslek</th>
                                            <th className="pb-3">Tarih</th>
                                            <th className="pb-3 text-right">İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {officeApplications.map(app => (
                                            <tr key={app.id} className="border-b border-gray-50 hover:bg-gray-50">
                                                <td className="py-4 font-bold">{app.firstName} {app.lastName}</td>
                                                <td className="py-4">{app.city}</td>
                                                <td className="py-4 text-sm">{app.profession}</td>
                                                <td className="py-4 text-sm text-gray-500">{app.date}</td>
                                                <td className="py-4 text-right">
                                                    {app.status === 'pending' ? (
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => handleOfficeApprove(app.id)} className="text-green-600 hover:bg-green-50 p-2 rounded" title="Onayla"><CheckCircle size={18} /></button>
                                                            <button onClick={() => handleRejectOfficeApp(app.id)} className="text-red-600 hover:bg-red-50 p-2 rounded" title="Reddet ve Sil"><Trash2 size={18} /></button>
                                                        </div>
                                                    ) : <span className="text-green-600 font-bold text-xs uppercase">Onaylandı</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                         </div>

                         <div className="border-t border-gray-200 pt-8">
                             <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-gray-700">Mevcut Ofisler ({offices.length})</h4>
                                <button onClick={() => openOfficeForm()} className="bg-dies-blue text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm"><Plus size={16} /> Yeni Ofis Ekle</button>
                             </div>
                             
                             <div className="grid gap-4">
                                {offices.map(office => (
                                    <div key={office.id} className="border p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 gap-4">
                                        <div>
                                            <h4 className="font-bold text-lg">{office.name}</h4>
                                            <p className="text-sm text-gray-500">{office.city}, {office.district}</p>
                                        </div>
                                        <button onClick={() => openOfficeForm(office)} className="text-dies-blue underline text-sm font-bold">Düzenle</button>
                                    </div>
                                ))}
                             </div>
                             
                             {showOfficeForm && (
                                 <div id="officeFormAnchor" className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                                     <h3 className="font-bold text-lg mb-4">{editingOffice ? 'Ofisi Düzenle' : 'Yeni Ofis Ekle'}</h3>
                                     <form onSubmit={handleSaveOffice} className="space-y-4">
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                             <div><label className={labelClass}>Ofis Adı</label><input required className={inputClass} value={officeFormData.name} onChange={e => setOfficeFormData({...officeFormData, name: e.target.value})} /></div>
                                             <div><label className={labelClass}>Şehir</label><input required className={inputClass} value={officeFormData.city} onChange={e => setOfficeFormData({...officeFormData, city: e.target.value})} /></div>
                                             <div><label className={labelClass}>İlçe</label><input required className={inputClass} value={officeFormData.district} onChange={e => setOfficeFormData({...officeFormData, district: e.target.value})} /></div>
                                             <div><label className={labelClass}>Adres</label><input required className={inputClass} value={officeFormData.address} onChange={e => setOfficeFormData({...officeFormData, address: e.target.value})} /></div>
                                             <div><label className={labelClass}>Telefon</label><input required className={inputClass} value={officeFormData.phone} onChange={e => setOfficeFormData({...officeFormData, phone: e.target.value})} /></div>
                                             
                                             <div className="md:col-span-2 space-y-2">
                                                 <label className={labelClass}>Görsel URL (Ana Resim)</label>
                                                 <input className={inputClass} value={officeFormData.image} onChange={e => setOfficeFormData({...officeFormData, image: e.target.value})} placeholder="https://..." />
                                             </div>

                                             <div className="md:col-span-2 space-y-2">
                                                <label className={labelClass}>Ofis Görselleri (Max 3 Dosya)</label>
                                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors relative cursor-pointer">
                                                    <input 
                                                        type="file" 
                                                        multiple 
                                                        accept="image/*"
                                                        onChange={handleOfficeFileChange}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    />
                                                    <UploadCloud className="mx-auto text-gray-400 mb-2" size={32} />
                                                    <p className="text-sm font-bold text-gray-600">Görselleri Seçin veya Sürükleyin</p>
                                                    <p className="text-xs text-gray-400 mt-1">JPG, PNG (Max 3 Adet)</p>
                                                </div>
                                                
                                                {/* Previews */}
                                                {officePreviews.length > 0 && (
                                                    <div className="grid grid-cols-3 gap-4 mt-4">
                                                        {officePreviews.map((src, idx) => (
                                                            <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 group">
                                                                <img src={src} className="w-full h-full object-cover" alt="Preview" />
                                                                <button 
                                                                    type="button" 
                                                                    onClick={() => removeOfficeFile(idx)}
                                                                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                             </div>
                                         </div>
                                         <div className="flex gap-4 pt-4 border-t border-gray-100 mt-4">
                                             <button type="button" onClick={() => setShowOfficeForm(false)} className="px-6 py-3 bg-gray-200 rounded-lg font-bold text-gray-600 hover:bg-gray-300 transition-colors">İptal</button>
                                             <button type="submit" className="px-6 py-3 bg-dies-blue text-white rounded-lg font-bold hover:bg-blue-800 transition-colors flex items-center gap-2">
                                                 <Save size={18} /> Kaydet
                                             </button>
                                         </div>
                                     </form>
                                 </div>
                             )}
                         </div>
                     </div>
                 )}
            </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
            <div>
                 <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Settings /> Site Ayarları</h3>
                 <div className="space-y-6">
                     <div className="p-4 border border-gray-200 rounded-xl">
                         <h4 className="font-bold mb-4 text-dies-blue">Vitrin İlanları (Anasayfa)</h4>
                         <p className="text-sm text-gray-500 mb-4">Anasayfada "Öne Çıkan Fırsatlar" bölümünde gösterilecek ilanları seçiniz.</p>
                         
                         <div className="h-64 overflow-y-auto border border-gray-100 rounded-lg p-2 bg-gray-50 space-y-1">
                             {allListings.map(l => (
                                 <label key={l.id} className="flex items-center gap-3 p-2 bg-white rounded border border-gray-200 hover:bg-blue-50 cursor-pointer">
                                     <input 
                                        type="checkbox" 
                                        checked={homeSettings.featuredIds.includes(l.id)} 
                                        onChange={() => toggleFeatured(l.id)}
                                        className="w-5 h-5 rounded text-dies-blue focus:ring-dies-blue"
                                     />
                                     <img src={l.image} className="w-10 h-8 object-cover rounded" alt="" />
                                     <div className="flex-1">
                                         <div className="font-bold text-sm text-gray-800">{l.title}</div>
                                         <div className="text-xs text-gray-500">#{l.id} - {l.price.toLocaleString()} {l.currency}</div>
                                     </div>
                                     {homeSettings.featuredIds.includes(l.id) && <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded">Vitrinde</span>}
                                 </label>
                             ))}
                         </div>
                     </div>

                     <div className="p-4 border border-gray-200 rounded-xl">
                         <h4 className="font-bold mb-4 text-dies-blue">Hero Banner Ayarları</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                 <label className={labelClass}>Ana Başlık</label>
                                 <input className={inputClass} value={homeSettings.heroTitle} onChange={e => setHomeSettings({...homeSettings, heroTitle: e.target.value})} />
                             </div>
                             <div>
                                 <label className={labelClass}>Arkaplan Görsel URL</label>
                                 <input className={inputClass} value={homeSettings.heroImage} onChange={e => setHomeSettings({...homeSettings, heroImage: e.target.value})} />
                                 <div className="mt-2 h-32 rounded-lg overflow-hidden border border-gray-200 relative bg-gray-100">
                                     <img src={homeSettings.heroImage} alt="Banner Preview" className="w-full h-full object-cover" />
                                     <div className="absolute bottom-0 left-0 bg-black/50 text-white text-xs px-2 py-1">Önizleme</div>
                                 </div>
                             </div>
                         </div>
                     </div>

                     <div className="flex justify-end">
                         <button onClick={handleSaveSettings} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg">
                             <Save size={20} /> Ayarları Kaydet
                         </button>
                     </div>
                 </div>
            </div>
        )}

      </div>
    </div>
  );
};
