
import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../components/ThemeContext';
import { useAuth } from '../components/AuthContext';
// @ts-ignore
import { Link, useNavigate } from 'react-router-dom';
// Add User as UserIcon to imports from lucide-react
import { Home, CheckCircle, XCircle, BarChart, Trash2, Clock, Users, User as UserIcon, Edit, Plus, Image as ImageIcon, Layout, Save, Settings, ShieldAlert, Building, FileText, Eye, MapPin, MessageCircle, Filter, Search, LogOut, Briefcase, UploadCloud, X, List, Phone, RefreshCw, Key, Copy, MoreVertical } from 'lucide-react';
// @ts-ignore
import { AnimatePresence, motion } from 'framer-motion';
import { Property, Advisor, Office, OfficeApplication, AdvisorApplication, User } from '../types';
import { api } from '../services/api';
import { compressToWebp } from '../utils/image';

const MotionDiv = motion.div as any;

export const AdminDashboard = () => {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'approvals' | 'all-listings' | 'users' | 'offices' | 'settings'>('overview');
  const [userFilterType, setUserFilterType] = useState<'all' | 'advisor'>('all');
  const [selectedAdvisorForListings, setSelectedAdvisorForListings] = useState<User | null>(null);
  const [generatedPassModal, setGeneratedPassModal] = useState<{ open: boolean, password?: string, userName?: string }>({ open: false });

  const [isEditingOffice, setIsEditingOffice] = useState(false);
  const [currentOffice, setCurrentOffice] = useState<Partial<Office>>({});
  const [officeImageFile, setOfficeImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSavingOffice, setIsSavingOffice] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stats, setStats] = useState<any>({});
  const [pendingListings, setPendingListings] = useState<Property[]>([]);
  const [allListings, setAllListings] = useState<Property[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [officeApplications, setOfficeApplications] = useState<OfficeApplication[]>([]);
  const [advisorApplications, setAdvisorApplications] = useState<AdvisorApplication[]>([]);

  const [listingFilters, setListingFilters] = useState({ term: '', status: '' });
  const [filteredListings, setFilteredListings] = useState<Property[]>([]);

  const loadAdminData = async () => {
    try {
      const [statsData, pending, allListingsData, usersData, officesData, advisorApps, officeApps] = await Promise.all([
        api.admin.getStats().catch(() => ({})),
        api.admin.getPendingListings().catch(() => []),
        api.properties.getList().catch(() => []), 
        api.admin.getUsers().catch(() => []),
        api.offices.getList().catch(() => []),
        api.admin.getAdvisorApplications().catch(() => []),
        api.admin.getOfficeApplications().catch(() => [])
      ]);

      setStats(statsData);
      setPendingListings(pending);
      setAllListings(allListingsData);
      setFilteredListings(allListingsData);
      setUsers(usersData);
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

  const handleOfficeImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsCompressing(true);
      try {
        const compressedFile = await compressToWebp(e.target.files[0], { quality: 0.75, maxDimension: 1600 });
        setOfficeImageFile(compressedFile);
        setPreviewImage(URL.createObjectURL(compressedFile));
      } catch (error) {
        console.error("Compression failed", error);
        alert("Resim işlenirken hata oluştu.");
      } finally {
        setIsCompressing(false);
      }
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="pt-40 text-center px-4">
          <ShieldAlert size={64} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Yetkisiz Erişim</h2>
          <p className="text-gray-500">Bu sayfayı görüntülemek için Yönetici yetkisine sahip olmalısınız.</p>
      </div>
    );
  }

  const handleApproveListing = async (id: number) => {
    if(window.confirm("Bu ilanı yayına almak istiyor musunuz?")) {
      try {
        await api.admin.approveListing(id);
        loadAdminData();
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
      loadAdminData();
    } catch (e) {
      alert("Reddetme başarısız oldu.");
    }
  };

  const handleDeleteListing = async (id: number) => {
    if (window.confirm("Bu ilanı silmek istediğinize emin misiniz?")) {
      try {
        await api.properties.delete(id);
        loadAdminData();
      } catch (e) {
        alert("Silme işlemi başarısız.");
      }
    }
  };

  const handleEditListing = (property: Property) => {
    navigate('/ilan-ver', { state: { editingProperty: property } });
  };

  const handleApplicationStatus = async (id: number, status: string) => {
    if (window.confirm(`Başvuruyu ${status === 'approved' ? 'onaylamak' : 'reddetmek'} istiyor musunuz?`)) {
      try {
        await api.admin.manageApplication(id, status);
        loadAdminData();
      } catch (e) {
        alert("İşlem başarısız.");
      }
    }
  };

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

  const handleAdminResetPassword = async (userId: number, userName: string) => {
    if (window.confirm(`${userName} için yeni bir şifre oluşturmak istiyor musunuz? Mevcut şifre geçersiz olacaktır.`)) {
      try {
        const res = await api.admin.resetUserPassword(userId);
        setGeneratedPassModal({ open: true, password: res.generatedPassword, userName });
      } catch (e) {
        alert("Şifre sıfırlama hatası.");
      }
    }
  };

  const handleListingFilter = () => {
    let results = allListings;
    if (listingFilters.term) {
      const term = listingFilters.term.toLowerCase();
      results = results.filter(p => p.title.toLowerCase().includes(term) || p.id.toString() === term);
    }
    setFilteredListings(results);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Şifre kopyalandı.");
  };

  const inputClass = `w-full p-3 rounded-xl border text-sm bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-dies-blue outline-none transition-all`;
  const displayUsers = userFilterType === 'all' ? users : users.filter(u => u.role === 'advisor');

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 pt-28 md:pt-32 min-h-screen relative bg-gray-50/30">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div className="w-full">
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Yönetim Paneli</h1>
            <p className="text-gray-500 text-sm mt-1">Hoşgeldin, <span className="font-bold text-dies-blue">{user.name}</span></p>
        </div>
        <button onClick={() => { logout(); navigate('/'); }} className="w-full md:w-auto bg-red-50 text-red-600 px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-colors border border-red-100"><LogOut size={16} /> Çıkış Yap</button>
      </div>

      {/* Tab Menu - Scrollable on Mobile */}
      <div className="flex overflow-x-auto gap-1 mb-8 bg-white p-1 rounded-2xl shadow-soft border border-gray-100 scrollbar-hide">
        {[
          { id: 'overview', label: 'Genel Bakış', icon: BarChart },
          { id: 'approvals', label: 'Onaylar', icon: Clock },
          { id: 'users', label: 'Kullanıcılar', icon: Users },
          { id: 'all-listings', label: 'İlanlar', icon: List },
          { id: 'offices', label: 'Ofisler', icon: Building },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)} 
            className={`flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-xl transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-dies-blue text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[500px]">
        
        {activeTab === 'overview' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-soft">
                    <p className="text-3xl font-black text-dies-blue mb-1">{users.length}</p>
                    <span className="font-bold text-xs text-gray-400 uppercase tracking-widest">Üye Sayısı</span>
                </div>
                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-soft">
                    <p className="text-3xl font-black text-green-600 mb-1">{allListings.filter(p => p.type !== 'pending').length}</p>
                    <span className="font-bold text-xs text-gray-400 uppercase tracking-widest">Aktif İlan</span>
                </div>
                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-soft">
                    <p className="text-3xl font-black text-yellow-600 mb-1">{pendingListings.length}</p>
                    <span className="font-bold text-xs text-gray-400 uppercase tracking-widest">Bekleyen</span>
                </div>
                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-soft">
                    <p className="text-3xl font-black text-purple-600 mb-1">{advisorApplications.length + officeApplications.length}</p>
                    <span className="font-bold text-xs text-gray-400 uppercase tracking-widest">Başvuru</span>
                </div>
            </div>
        )}

        {activeTab === 'users' && (
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-soft">
                    <h3 className="text-lg font-black text-dies-dark flex items-center gap-2"><Users size={20} /> Kullanıcılar</h3>
                    <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
                        <button onClick={() => setUserFilterType('all')} className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-xs font-bold transition-all ${userFilterType === 'all' ? 'bg-white shadow text-dies-dark' : 'text-gray-500'}`}>Tümü</button>
                        <button onClick={() => setUserFilterType('advisor')} className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-xs font-bold transition-all ${userFilterType === 'advisor' ? 'bg-white shadow text-dies-blue' : 'text-gray-500'}`}>Danışmanlar</button>
                    </div>
                </div>
                
                {/* Mobile Friendly User Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayUsers.map(u => (
                        <div key={u.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft flex flex-col justify-between hover:shadow-md transition-all">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                                    {u.image ? <img src={u.image} className="w-full h-full object-cover" /> : <UserIcon size={24} className="text-dies-blue" />}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-dies-dark truncate">{u.name}</h4>
                                    <p className="text-xs text-gray-400 font-medium truncate">{u.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <select 
                                  value={u.role} 
                                  onChange={(e) => handleRoleChange(u.id, e.target.value)} 
                                  className="bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-bold border-none outline-none focus:ring-2 focus:ring-dies-blue"
                                  disabled={u.id === user.id}
                                >
                                    <option value="user">Üye</option>
                                    <option value="advisor">Danışman</option>
                                    <option value="admin">Yönetici</option>
                                </select>
                                <div className="flex gap-2">
                                  <button onClick={() => handleAdminResetPassword(u.id, u.name)} className="p-2.5 bg-gray-50 text-gray-500 rounded-xl hover:bg-dies-blue hover:text-white transition-all" title="Şifre Sıfırla">
                                      <Key size={16} />
                                  </button>
                                  <button onClick={() => setSelectedAdvisorForListings(u)} className="p-2.5 bg-blue-50 text-dies-blue rounded-xl hover:bg-dies-blue hover:text-white transition-all" title="İlanları Gör">
                                      <List size={16} />
                                  </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {activeTab === 'all-listings' && (
            <div className="space-y-4">
                 <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-soft">
                     <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input placeholder="İlan başlığı veya ID ile ara..." className={`${inputClass} pl-10`} value={listingFilters.term} onChange={e => setListingFilters({...listingFilters, term: e.target.value})} />
                     </div>
                     <button onClick={handleListingFilter} className="bg-dies-blue text-white px-8 py-3 rounded-xl font-black uppercase tracking-wider text-sm shadow-lg shadow-blue-900/20">İlanları Filtrele</button>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredListings.map(p => (
                        <div key={p.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft flex flex-col justify-between group">
                            <div className="flex justify-between items-start mb-3">
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${p.type === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                    {p.type === 'pending' ? 'Onay Bekliyor' : p.type}
                                </span>
                                <span className="text-xs font-bold text-dies-blue">#{p.id}</span>
                            </div>
                            <h4 className="font-bold text-dies-dark mb-4 line-clamp-2 group-hover:text-dies-blue transition-colors">{p.title}</h4>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <p className="font-black text-dies-blue">{p.price.toLocaleString()} TL</p>
                                <div className="flex gap-1">
                                    <button onClick={() => navigate(`/ilan/${p.id}`)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Eye size={18} /></button>
                                    <button onClick={() => handleEditListing(p)} className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"><Edit size={18} /></button>
                                    <button onClick={() => handleDeleteListing(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                 </div>
            </div>
        )}

        {activeTab === 'approvals' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
                <h3 className="font-black text-xl mb-6 flex items-center gap-2 text-dies-dark"><Clock size={24} className="text-yellow-500" /> İlan Onayları</h3>
                <div className="space-y-4">
                    {pendingListings.map(p => (
                        <div key={p.id} className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                            <div className="flex justify-between items-start mb-4">
                                optical-center
                                <div>
                                    <p className="font-bold text-dies-dark line-clamp-1 mb-1">{p.title}</p>
                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{p.advisorName || 'İSİMSİZ DANIŞMAN'}</p>
                                </div>
                                <span className="font-black text-dies-blue text-xs">{p.price.toLocaleString()} TL</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => navigate(`/ilan/${p.id}`)} className="flex-1 py-3 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-black uppercase transition-all">Görüntüle</button>
                                <button onClick={() => handleApproveListing(p.id)} className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-black uppercase transition-all">Onayla</button>
                                <button onClick={() => handleRejectListing(p.id)} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-black uppercase transition-all">Red</button>
                            </div>
                        </div>
                    ))}
                    {pendingListings.length === 0 && (
                        <div className="text-center py-10">
                            <CheckCircle size={48} className="mx-auto text-green-200 mb-4" />
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Bekleyen ilan bulunmuyor.</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-soft">
                <h3 className="font-black text-xl mb-6 flex items-center gap-2 text-dies-dark"><Briefcase size={24} className="text-blue-500" /> Başvurular</h3>
                <div className="space-y-4">
                  {[...advisorApplications, ...officeApplications].map((app: any) => (
                    <div key={app.id} className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="font-bold text-dies-dark mb-1">{app.firstName} {app.lastName}</p>
                            <p className="text-xs text-gray-500 font-medium">{app.phone} • {app.email}</p>
                        </div>
                        <span className="bg-blue-100 text-dies-blue text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">{app.type === 'advisor' ? 'Danışman' : 'Ofis'}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleApplicationStatus(app.id, 'approved')} className="flex-1 py-3 bg-dies-blue hover:bg-blue-900 text-white rounded-xl text-xs font-black uppercase transition-all">Kabul Et</button>
                        <button onClick={() => handleApplicationStatus(app.id, 'rejected')} className="flex-1 py-3 bg-white border border-gray-200 text-gray-500 rounded-xl text-xs font-black uppercase transition-all">Reddet</button>
                      </div>
                    </div>
                  ))}
                  {advisorApplications.length === 0 && officeApplications.length === 0 && (
                      <div className="text-center py-10">
                          <CheckCircle size={48} className="mx-auto text-blue-200 mb-4" />
                          <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Yeni başvuru bulunmuyor.</p>
                      </div>
                  )}
                </div>
            </div>
          </div>
        )}
      </div>

      {/* GENERATED PASSWORD MODAL - Full Screen on Mobile */}
      <AnimatePresence>
        {generatedPassModal.open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md">
            <MotionDiv 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white rounded-none sm:rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center h-full sm:h-auto flex flex-col justify-center"
            >
              <div className="w-20 h-20 bg-blue-50 text-dies-blue rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Key size={40} />
              </div>
              <h3 className="text-2xl font-black mb-2 tracking-tighter">Şifre Sıfırlandı</h3>
              <p className="text-sm text-gray-500 mb-8 font-medium">
                <span className="font-bold text-dies-dark">{generatedPassModal.userName}</span> için yeni erişim şifresi:
              </p>
              
              <div className="bg-gray-100 p-5 rounded-2xl flex items-center justify-between gap-4 mb-6 border border-gray-200 group">
                <code className="text-2xl font-black text-dies-blue tracking-widest">{generatedPassModal.password}</code>
                <button onClick={() => copyToClipboard(generatedPassModal.password!)} className="p-3 text-gray-400 hover:text-dies-blue hover:bg-white rounded-xl transition-all"><Copy size={24}/></button>
              </div>
              
              <div className="bg-red-50 p-4 rounded-xl mb-10">
                <p className="text-[11px] text-red-600 font-black uppercase tracking-widest leading-relaxed">BU ŞİFREYİ ŞİMDİ KOPYALAYIN. BİR DAHA GÖSTERİLMEYECEKTİR.</p>
              </div>
              
              <button onClick={() => setGeneratedPassModal({ open: false })} className="w-full bg-dies-dark text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl transition-transform active:scale-95">PANELİ KAPAT</button>
            </MotionDiv>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
