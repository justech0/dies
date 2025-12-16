
import React, { useState, useEffect } from 'react';
import { useTheme } from '../components/ThemeContext';
import { useAuth } from '../components/AuthContext';
// @ts-ignore
import { Link, useNavigate } from 'react-router-dom';
import { Home, CheckCircle, XCircle, BarChart, Trash2, Clock, Users, Edit, Plus, Image as ImageIcon, Layout, Save, Settings, ShieldAlert, Building, FileText, Eye, MapPin, MessageCircle, Filter, Search, LogOut, Briefcase, UploadCloud, X, List, Phone } from 'lucide-react';
import { Property, Advisor, Office, OfficeApplication, AdvisorApplication, User } from '../types';
import { api } from '../services/api';

export const AdminDashboard = () => {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'approvals' | 'all-listings' | 'users' | 'offices' | 'settings'>('overview');
  
  // Users Tab Sub-State
  const [userFilterType, setUserFilterType] = useState<'all' | 'advisor'>('all');
  const [selectedAdvisorForListings, setSelectedAdvisorForListings] = useState<User | null>(null);

  // Application Details Modal State
  const [selectedApplication, setSelectedApplication] = useState<{ type: 'advisor' | 'office', data: any } | null>(null);

  // Office Management State
  const [isEditingOffice, setIsEditingOffice] = useState(false);
  const [currentOffice, setCurrentOffice] = useState<Partial<Office>>({});

  // Data States
  const [stats, setStats] = useState<any>({});
  const [pendingListings, setPendingListings] = useState<Property[]>([]);
  const [allListings, setAllListings] = useState<Property[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  
  const [officeApplications, setOfficeApplications] = useState<OfficeApplication[]>([]);
  const [advisorApplications, setAdvisorApplications] = useState<AdvisorApplication[]>([]);

  const [listingFilters, setListingFilters] = useState({ term: '', advisorId: '', roomCount: '', status: '' });
  const [filteredListings, setFilteredListings] = useState<Property[]>([]);

  // Load Initial Data
  const loadAdminData = async () => {
      try {
          const [statsData, pending, allListingsData, usersData, advisorsData, officesData, advisorApps, officeApps] = await Promise.all([
              api.admin.getStats(),
              api.admin.getPendingListings(),
              api.properties.getList(), 
              api.admin.getUsers(),
              api.advisors.getList(),
              api.offices.getList(),
              api.admin.getAdvisorApplications(),
              api.admin.getOfficeApplications()
          ]);

          setStats(statsData);
          setPendingListings(pending);
          setAllListings(allListingsData);
          setFilteredListings(allListingsData);
          setUsers(usersData);
          setAdvisors(advisorsData);
          setOffices(officesData);
          setAdvisorApplications(advisorApps);
          setOfficeApplications(officeApps);
      } catch (error) {
          console.error("Failed to load admin data", error);
      }
  };

  useEffect(() => {
      if (user?.role === 'admin') {
          loadAdminData();
      }
  }, [user]);

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

  // LISTINGS ACTIONS
  const handleApproveListing = async (id: number) => {
      if(window.confirm("Bu ilanı yayına almak istiyor musunuz?")) {
          try {
              await api.admin.approveListing(id);
              setPendingListings(prev => prev.filter(p => p.id !== id));
              const updatedListings = await api.properties.getList();
              setAllListings(updatedListings);
              setFilteredListings(updatedListings);
          } catch (e) {
              alert("Onaylama başarısız oldu.");
          }
      }
  };

  const handleRejectListing = async (id: number) => {
      const reason = window.prompt("İlanı reddetme sebebini giriniz (Opsiyonel):");
      if (reason === null) return;
      try {
          await api.admin.rejectListing(id, reason);
          setPendingListings(prev => prev.filter(p => p.id !== id));
      } catch (e) {
          alert("Reddetme başarısız oldu.");
      }
  };

  const handleDeleteListing = async (id: number) => {
      if (window.confirm("Bu ilanı silmek istediğinize emin misiniz?")) {
          try {
              await api.properties.delete(id);
              setAllListings(prev => prev.filter(p => p.id !== id));
              setFilteredListings(prev => prev.filter(p => p.id !== id));
          } catch (e) {
              alert("Silme işlemi başarısız.");
          }
      }
  };

  const handleEditListing = (property: Property) => {
      navigate('/ilan-ver', { state: { editingProperty: property } });
  };

  // APPLICATION ACTIONS
  const handleApplicationStatus = async (id: number, type: 'advisor' | 'office', status: string) => {
      if (window.confirm(`Başvuruyu ${status === 'approved' ? 'onaylamak' : 'reddetmek'} istiyor musunuz?`)) {
          try {
              await api.admin.manageApplication(id, type, status);
              if (type === 'advisor') {
                  setAdvisorApplications(prev => prev.map(a => a.id === id ? { ...a, status: status as any } : a));
              } else {
                  setOfficeApplications(prev => prev.map(a => a.id === id ? { ...a, status: status as any } : a));
              }
              // Close modal if action was taken from there
              setSelectedApplication(null);
          } catch (e) {
              alert("İşlem başarısız.");
          }
      }
  };

  // OFFICE ACTIONS
  const handleSaveOffice = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          if (currentOffice.id) {
              await api.offices.update(currentOffice.id, currentOffice);
          } else {
              await api.offices.create(currentOffice);
          }
          await loadAdminData(); // Refresh all data
          setIsEditingOffice(false);
          setCurrentOffice({});
      } catch (error) {
          alert("Ofis kaydedilirken hata oluştu.");
      }
  };

  const handleDeleteOffice = async (id: number) => {
      if(window.confirm("Bu ofisi silmek istediğinize emin misiniz?")) {
          try {
              await api.offices.delete(id);
              setOffices(prev => prev.filter(o => o.id !== id));
          } catch (e) {
              alert("Silme işlemi başarısız.");
          }
      }
  };

  // USERS ACTIONS
  const handleRoleChange = async (userId: number, newRole: string) => {
      if (window.confirm("Kullanıcının rolünü değiştirmek istediğinize emin misiniz?")) {
          try {
              await api.admin.changeRole(userId, newRole);
              setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
          } catch (e) {
              alert("Rol değiştirme başarısız.");
          }
      }
  };

  // HELPERS
  const getUserListingCount = (userId: number) => allListings.filter(p => p.advisorId === userId).length;
  const getAdvisorListings = (userId: number) => allListings.filter(p => p.advisorId === userId);

  const handleListingFilter = () => {
      let results = allListings;
      if (listingFilters.term) {
          const term = listingFilters.term.toLowerCase();
          results = results.filter(p => p.title.toLowerCase().includes(term) || p.id.toString() === term);
      }
      if (listingFilters.status) {
          results = results.filter(p => p.type === listingFilters.status);
      }
      setFilteredListings(results);
  };

  const inputClass = `w-full p-2.5 rounded-lg border text-sm ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`;
  const displayUsers = userFilterType === 'all' ? users : users.filter(u => u.role === 'advisor');

  return (
    <div className="container mx-auto px-4 py-12 pt-32 min-h-screen relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Yönetim Paneli</h1>
            <p className="text-gray-500 text-sm mt-1">Hoşgeldin, <span className="font-bold text-dies-blue">{user.name}</span></p>
        </div>
        <button onClick={() => { logout(); navigate('/'); }} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-red-100"><LogOut size={16} /> Çıkış Yap</button>
      </div>

      {/* TABS Navigation - Scrollable on mobile */}
      <div className="flex overflow-x-auto gap-2 mb-8 border-b border-gray-200 pb-1 scrollbar-hide">
            <button onClick={() => setActiveTab('overview')} className={`px-6 py-3 font-bold rounded-t-lg whitespace-nowrap ${activeTab === 'overview' ? 'bg-dies-blue text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Genel Bakış</button>
            <button onClick={() => setActiveTab('approvals')} className={`px-6 py-3 font-bold rounded-t-lg whitespace-nowrap ${activeTab === 'approvals' ? 'bg-dies-blue text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Başvurular & Onaylar</button>
            <button onClick={() => setActiveTab('users')} className={`px-6 py-3 font-bold rounded-t-lg whitespace-nowrap ${activeTab === 'users' ? 'bg-dies-blue text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Kullanıcılar</button>
            <button onClick={() => setActiveTab('offices')} className={`px-6 py-3 font-bold rounded-t-lg whitespace-nowrap ${activeTab === 'offices' ? 'bg-dies-blue text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Ofis Yönetimi</button>
            <button onClick={() => setActiveTab('all-listings')} className={`px-6 py-3 font-bold rounded-t-lg whitespace-nowrap ${activeTab === 'all-listings' ? 'bg-dies-blue text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Tüm İlanlar</button>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-4 md:p-6 min-h-[500px]">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-3xl font-extrabold text-dies-blue">{users.length}</p>
                    <span className="font-bold text-gray-700">Toplam Üye</span>
                </div>
                <div className="p-6 bg-green-50 rounded-xl border border-green-100">
                    <p className="text-3xl font-extrabold text-green-600">{allListings.filter(p => p.type !== 'pending').length}</p>
                    <span className="font-bold text-gray-700">Yayında Olan İlan</span>
                </div>
                <div className="p-6 bg-yellow-50 rounded-xl border border-yellow-100">
                    <p className="text-3xl font-extrabold text-yellow-600">{pendingListings.length}</p>
                    <span className="font-bold text-gray-700">Onay Bekleyen</span>
                </div>
                 <div className="p-6 bg-purple-50 rounded-xl border border-purple-100">
                    <p className="text-3xl font-extrabold text-purple-600">{advisorApplications.length + officeApplications.length}</p>
                    <span className="font-bold text-gray-700">Gelen Başvuru</span>
                </div>
            </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
            <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h3 className="text-xl font-bold flex items-center gap-2"><Users /> Kullanıcı Yönetimi</h3>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button onClick={() => setUserFilterType('all')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${userFilterType === 'all' ? 'bg-white shadow text-dies-dark' : 'text-gray-500'}`}>Tümü</button>
                        <button onClick={() => setUserFilterType('advisor')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${userFilterType === 'advisor' ? 'bg-white shadow text-dies-blue' : 'text-gray-500'}`}>Danışmanlar</button>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="pb-3 pl-2">ID</th>
                                <th className="pb-3">Ad Soyad</th>
                                <th className="pb-3">E-posta</th>
                                <th className="pb-3">Rol</th>
                                {userFilterType === 'advisor' && <th className="pb-3 text-center">İlan Sayısı</th>}
                                {userFilterType === 'advisor' && <th className="pb-3 text-right">İşlemler</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {displayUsers.map(u => (
                                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-3 pl-2 text-gray-500">#{u.id}</td>
                                    <td className="py-3 font-bold flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                            {u.image ? <img src={u.image} className="w-full h-full object-cover" /> : <Users size={16} className="text-gray-500" />}
                                        </div>
                                        {u.name}
                                    </td>
                                    <td className="py-3 text-gray-600">{u.email}</td>
                                    <td className="py-3">
                                        <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)} className={`p-1 border rounded text-sm bg-white font-bold ${u.role === 'admin' ? 'text-red-600 border-red-200' : u.role === 'advisor' ? 'text-dies-blue border-blue-200' : 'text-gray-600'}`} disabled={u.id === user.id}>
                                            <option value="user">Kullanıcı</option>
                                            <option value="advisor">Danışman</option>
                                            <option value="admin">Yönetici</option>
                                        </select>
                                    </td>
                                    {userFilterType === 'advisor' && (
                                        <td className="py-3 text-center">
                                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded font-bold text-xs">{getUserListingCount(u.id)} İlan</span>
                                        </td>
                                    )}
                                    {userFilterType === 'advisor' && (
                                        <td className="py-3 text-right">
                                            <button onClick={() => setSelectedAdvisorForListings(u)} className="bg-dies-blue hover:bg-blue-900 text-white px-3 py-1.5 rounded text-xs font-bold inline-flex items-center gap-1">
                                                <List size={14} /> İlanları Gör
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* LISTINGS TAB */}
        {activeTab === 'all-listings' && (
            <div>
                 <div className="mb-4 flex gap-2">
                     <input placeholder="Ara..." className={inputClass} value={listingFilters.term} onChange={e => setListingFilters({...listingFilters, term: e.target.value})} />
                     <button onClick={handleListingFilter} className="bg-dies-blue text-white px-4 rounded-lg font-bold">Ara</button>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                        <thead><tr className="border-b"><th className="pb-2">Başlık</th><th className="pb-2">Fiyat</th><th className="pb-2">Durum</th><th className="pb-2 text-right">İşlem</th></tr></thead>
                        <tbody>
                            {filteredListings.map(p => (
                                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="py-2">{p.title}</td>
                                    <td className="py-2 font-mono">{p.price.toLocaleString()}</td>
                                    <td className="py-2"><span className={`px-2 py-1 rounded text-xs font-bold ${p.type === 'pending' ? 'bg-yellow-100' : 'bg-green-100'}`}>{p.type}</span></td>
                                    <td className="py-2 text-right whitespace-nowrap">
                                        <button onClick={() => navigate(`/ilan/${p.id}`)} className="text-blue-600 mr-2 p-1 hover:bg-blue-50 rounded" title="Görüntüle"><Eye size={18} /></button>
                                        <button onClick={() => handleEditListing(p)} className="text-orange-500 mr-2 p-1 hover:bg-orange-50 rounded" title="Düzenle"><Edit size={18} /></button>
                                        <button onClick={() => handleDeleteListing(p.id)} className="text-red-600 p-1 hover:bg-red-50 rounded" title="Sil"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>
        )}

        {/* APPROVALS TAB */}
        {activeTab === 'approvals' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. Pending Property Listings */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Clock size={20} className="text-yellow-600" /> İlan Onayları ({pendingListings.length})</h3>
                    <div className="space-y-3">
                        {pendingListings.map(p => (
                            <div key={p.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                                <p className="font-bold text-sm mb-1">{p.title}</p>
                                <p className="text-xs text-gray-500 mb-3">{p.price.toLocaleString()} TL • {p.advisorName || 'Bilinmeyen Danışman'}</p>
                                <div className="flex gap-2">
                                    <button onClick={() => navigate(`/ilan/${p.id}`)} className="flex-1 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-bold">İncele</button>
                                    <button onClick={() => handleApproveListing(p.id)} className="flex-1 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-bold">Onayla</button>
                                    <button onClick={() => handleRejectListing(p.id)} className="flex-1 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-bold">Red</button>
                                </div>
                            </div>
                        ))}
                        {pendingListings.length === 0 && <p className="text-gray-400 text-sm italic">Bekleyen ilan yok.</p>}
                    </div>
                </div>

                {/* 2. Advisor Applications */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Briefcase size={20} className="text-blue-600" /> Danışman Başvuruları</h3>
                    <div className="space-y-3">
                        {advisorApplications.filter(a => a.status === 'pending').map(app => (
                            <div key={app.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-bold text-sm">{app.firstName} {app.lastName}</p>
                                        <p className="text-xs text-gray-500">{app.phone}</p>
                                    </div>
                                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{app.education}</span>
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <button onClick={() => setSelectedApplication({type: 'advisor', data: app})} className="flex-1 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded text-xs font-bold">Detay</button>
                                    <button onClick={() => handleApplicationStatus(app.id, 'advisor', 'approved')} className="flex-1 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-bold">Kabul</button>
                                    <button onClick={() => handleApplicationStatus(app.id, 'advisor', 'rejected')} className="flex-1 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-bold">Red</button>
                                </div>
                            </div>
                        ))}
                        {advisorApplications.filter(a => a.status === 'pending').length === 0 && <p className="text-gray-400 text-sm italic">Bekleyen başvuru yok.</p>}
                    </div>
                </div>

                {/* 3. Office Applications */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Building size={20} className="text-purple-600" /> Ofis Başvuruları</h3>
                    <div className="space-y-3">
                        {officeApplications.filter(a => a.status === 'pending').map(app => (
                            <div key={app.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                                <div className="mb-2">
                                    <p className="font-bold text-sm">{app.firstName} {app.lastName}</p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={10} /> {app.city}</p>
                                </div>
                                <div className="flex gap-2 mt-2">
                                     <button onClick={() => setSelectedApplication({type: 'office', data: app})} className="flex-1 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded text-xs font-bold">Detay</button>
                                     <button onClick={() => handleApplicationStatus(app.id, 'office', 'approved')} className="flex-1 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-bold">Kabul</button>
                                     <button onClick={() => handleApplicationStatus(app.id, 'office', 'rejected')} className="flex-1 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-bold">Red</button>
                                </div>
                            </div>
                        ))}
                        {officeApplications.filter(a => a.status === 'pending').length === 0 && <p className="text-gray-400 text-sm italic">Bekleyen başvuru yok.</p>}
                    </div>
                </div>
            </div>
        )}

        {/* OFFICE MANAGEMENT TAB */}
        {activeTab === 'offices' && (
            <div>
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2"><Building /> Ofis Yönetimi</h3>
                    <button onClick={() => { setCurrentOffice({}); setIsEditingOffice(true); }} className="bg-dies-blue text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm hover:bg-blue-900 transition-colors">
                        <Plus size={18} /> Yeni Ofis Ekle
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {offices.map(office => (
                        <div key={office.id} className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden group hover:shadow-md transition-all">
                            <div className="h-40 relative">
                                <img src={office.image} alt={office.name} className="w-full h-full object-cover" />
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setCurrentOffice(office); setIsEditingOffice(true); }} className="bg-white p-2 rounded-full text-orange-500 hover:text-orange-600 shadow-sm"><Edit size={16}/></button>
                                    <button onClick={() => handleDeleteOffice(office.id)} className="bg-white p-2 rounded-full text-red-500 hover:text-red-600 shadow-sm"><Trash2 size={16}/></button>
                                </div>
                            </div>
                            <div className="p-4">
                                <h4 className="font-bold text-dies-dark mb-1">{office.name}</h4>
                                <p className="text-xs text-gray-500 mb-2">{office.address}</p>
                                <div className="flex items-center gap-2 text-xs text-dies-blue font-bold">
                                    <Phone size={12} /> {office.phone}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>

      {/* MODAL: APPLICATION DETAILS */}
      {selectedApplication && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                 <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="text-xl font-bold text-dies-dark">
                          {selectedApplication.type === 'advisor' ? 'Danışman Başvurusu' : 'Ofis Başvurusu'}
                      </h3>
                      <button onClick={() => setSelectedApplication(null)} className="p-2 hover:bg-gray-100 rounded-full">
                          <X size={24} className="text-gray-500" />
                      </button>
                 </div>
                 <div className="p-6 space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                         <div><p className="text-xs text-gray-400 uppercase font-bold">Ad Soyad</p><p className="font-bold">{selectedApplication.data.firstName} {selectedApplication.data.lastName}</p></div>
                         <div><p className="text-xs text-gray-400 uppercase font-bold">Telefon</p><p className="font-bold">{selectedApplication.data.phone}</p></div>
                         <div><p className="text-xs text-gray-400 uppercase font-bold">Email</p><p className="font-bold break-all">{selectedApplication.data.email}</p></div>
                         <div><p className="text-xs text-gray-400 uppercase font-bold">Tarih</p><p className="font-bold">{selectedApplication.data.date}</p></div>
                         
                         {selectedApplication.type === 'advisor' && (
                             <>
                                <div><p className="text-xs text-gray-400 uppercase font-bold">Eğitim</p><p className="font-bold">{selectedApplication.data.education}</p></div>
                                <div><p className="text-xs text-gray-400 uppercase font-bold">Deneyim</p><p className="font-bold">{selectedApplication.data.experience}</p></div>
                             </>
                         )}

                         {selectedApplication.type === 'office' && (
                             <>
                                <div><p className="text-xs text-gray-400 uppercase font-bold">Şehir</p><p className="font-bold">{selectedApplication.data.city}</p></div>
                                <div><p className="text-xs text-gray-400 uppercase font-bold">Meslek</p><p className="font-bold">{selectedApplication.data.profession}</p></div>
                                <div className="col-span-2"><p className="text-xs text-gray-400 uppercase font-bold">Yatırım Bütçesi</p><p className="font-bold">{selectedApplication.data.budget || '-'}</p></div>
                             </>
                         )}
                     </div>
                     
                     {/* Details Section for Office Applications mostly */}
                     <div className="mt-4 pt-4 border-t border-gray-100">
                         <p className="text-xs text-gray-400 uppercase font-bold mb-2">Ek Açıklamalar</p>
                         <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 min-h-[80px]">
                             {selectedApplication.data.details || "Açıklama girilmemiş."}
                         </div>
                     </div>

                     <div className="flex gap-3 pt-4">
                        <button onClick={() => handleApplicationStatus(selectedApplication.data.id, selectedApplication.type, 'approved')} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold">Onayla</button>
                        <button onClick={() => handleApplicationStatus(selectedApplication.data.id, selectedApplication.type, 'rejected')} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-bold">Reddet</button>
                     </div>
                 </div>
             </div>
          </div>
      )}

      {/* MODAL: CREATE/EDIT OFFICE */}
      {isEditingOffice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="text-xl font-bold text-dies-dark">{currentOffice.id ? 'Ofis Düzenle' : 'Yeni Ofis Ekle'}</h3>
                      <button onClick={() => setIsEditingOffice(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={24} className="text-gray-500" /></button>
                  </div>
                  <form onSubmit={handleSaveOffice} className="p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><label className="text-xs font-bold text-gray-500 block mb-1">Ofis Adı</label><input required value={currentOffice.name || ''} onChange={e => setCurrentOffice({...currentOffice, name: e.target.value})} className={inputClass} /></div>
                          <div><label className="text-xs font-bold text-gray-500 block mb-1">Şehir</label><input required value={currentOffice.city || ''} onChange={e => setCurrentOffice({...currentOffice, city: e.target.value})} className={inputClass} /></div>
                          <div><label className="text-xs font-bold text-gray-500 block mb-1">Telefon</label><input required value={currentOffice.phone || ''} onChange={e => setCurrentOffice({...currentOffice, phone: e.target.value})} className={inputClass} /></div>
                          <div><label className="text-xs font-bold text-gray-500 block mb-1">Whatsapp</label><input value={currentOffice.whatsapp || ''} onChange={e => setCurrentOffice({...currentOffice, whatsapp: e.target.value})} className={inputClass} /></div>
                      </div>
                      <div><label className="text-xs font-bold text-gray-500 block mb-1">Adres</label><textarea required value={currentOffice.address || ''} onChange={e => setCurrentOffice({...currentOffice, address: e.target.value})} className={inputClass} rows={2} /></div>
                      <div><label className="text-xs font-bold text-gray-500 block mb-1">Resim URL</label><input required value={currentOffice.image || ''} onChange={e => setCurrentOffice({...currentOffice, image: e.target.value})} className={inputClass} placeholder="https://..." /></div>
                      <div><label className="text-xs font-bold text-gray-500 block mb-1">Harita URL (Google Maps)</label><input value={currentOffice.locationUrl || ''} onChange={e => setCurrentOffice({...currentOffice, locationUrl: e.target.value})} className={inputClass} /></div>
                      <div><label className="text-xs font-bold text-gray-500 block mb-1">Açıklama</label><textarea value={currentOffice.description || ''} onChange={e => setCurrentOffice({...currentOffice, description: e.target.value})} className={inputClass} rows={3} /></div>
                      
                      <button type="submit" className="w-full bg-dies-blue text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition-colors">Kaydet</button>
                  </form>
              </div>
          </div>
      )}

      {/* ADVISOR LISTINGS MODAL (Existing) */}
      {selectedAdvisorForListings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                      <div>
                          <h3 className="text-xl font-bold text-dies-dark">{selectedAdvisorForListings.name} - İlanları</h3>
                          <p className="text-sm text-gray-500">Toplam {getUserListingCount(selectedAdvisorForListings.id)} ilan bulunuyor.</p>
                      </div>
                      <button onClick={() => setSelectedAdvisorForListings(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                          <X size={24} className="text-gray-500" />
                      </button>
                  </div>
                  <div className="p-6 overflow-y-auto">
                      {getAdvisorListings(selectedAdvisorForListings.id).length > 0 ? (
                          <div className="space-y-4">
                              {getAdvisorListings(selectedAdvisorForListings.id).map(p => (
                                  <div key={p.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50">
                                      <img src={p.image} className="w-16 h-16 object-cover rounded-lg" alt={p.title} />
                                      <div className="flex-1">
                                          <h4 className="font-bold text-sm text-dies-dark mb-1">{p.title}</h4>
                                          <p className="text-xs text-gray-500">{p.price.toLocaleString()} {p.currency} • {p.district}</p>
                                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase mt-1 inline-block ${p.type === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                              {p.type}
                                          </span>
                                      </div>
                                      <div className="flex gap-2">
                                          <button onClick={() => { setSelectedAdvisorForListings(null); navigate(`/ilan/${p.id}`); }} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100" title="Görüntüle"><Eye size={16} /></button>
                                          <button onClick={() => { setSelectedAdvisorForListings(null); handleEditListing(p); }} className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100" title="Düzenle"><Edit size={16} /></button>
                                          <button onClick={() => handleDeleteListing(p.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Sil"><Trash2 size={16} /></button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="text-center py-12 text-gray-400">
                              <p>Bu danışmana ait ilan bulunmamaktadır.</p>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
