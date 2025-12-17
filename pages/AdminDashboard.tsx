import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../components/ThemeContext';
import { useAuth } from '../components/AuthContext';
// @ts-ignore
import { Link, useNavigate } from 'react-router-dom';
import { Home, CheckCircle, XCircle, BarChart, Trash2, Clock, Users, Edit, Plus, Image as ImageIcon, Layout, Save, Settings, ShieldAlert, Building, FileText, Eye, MapPin, MessageCircle, Filter, Search, LogOut, Briefcase, UploadCloud, X, List, Phone, RefreshCw, Key, Copy } from 'lucide-react';
// @ts-ignore
import { AnimatePresence } from 'framer-motion';
import { Property, Advisor, Office, OfficeApplication, AdvisorApplication, User } from '../types';
import { api } from '../services/api';
import { compressToWebp } from '../utils/image';

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

  const openOfficeModal = (office?: Office) => {
    if (office) {
      setCurrentOffice(office);
      setPreviewImage(office.image);
    } else {
      setCurrentOffice({});
      setPreviewImage('');
    }
    setOfficeImageFile(null);
    setIsEditingOffice(true);
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

  const handleSaveOffice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingOffice(true);
    try {
      let imageUrl = currentOffice.image || '';
      if (officeImageFile) {
        const formData = new FormData();
        formData.append('files[]', officeImageFile);
        const res = await api.upload(formData);
        imageUrl = res.urls[0];
      }
      const officeData = { ...currentOffice, image: imageUrl };
      if (officeData.id) {
        await api.offices.update(officeData.id, officeData);
      } else {
        await api.offices.create(officeData);
      }
      await loadAdminData();
      setIsEditingOffice(false);
    } catch (error) {
      alert("Ofis kaydedilirken hata oluştu.");
    } finally {
      setIsSavingOffice(false);
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

  const inputClass = `w-full p-2.5 rounded-lg border text-sm bg-gray-50 border-gray-200 text-gray-900`;
  const displayUsers = userFilterType === 'all' ? users : users.filter(u => u.role === 'advisor');

  return (
    <div className="container mx-auto px-4 py-12 pt-32 min-h-screen relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Yönetim Paneli</h1>
            <p className="text-gray-500 text-sm mt-1">Hoşgeldin, <span className="font-bold text-dies-blue">{user.name}</span></p>
        </div>
        <button onClick={() => { logout(); navigate('/'); }} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-red-100"><LogOut size={16} /> Çıkış Yap</button>
      </div>

      <div className="flex overflow-x-auto gap-2 mb-8 border-b border-gray-200 pb-1 scrollbar-hide">
        <button onClick={() => setActiveTab('overview')} className={`px-6 py-3 font-bold rounded-t-lg whitespace-nowrap ${activeTab === 'overview' ? 'bg-dies-blue text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Genel Bakış</button>
        <button onClick={() => setActiveTab('approvals')} className={`px-6 py-3 font-bold rounded-t-lg whitespace-nowrap ${activeTab === 'approvals' ? 'bg-dies-blue text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Başvurular & Onaylar</button>
        <button onClick={() => setActiveTab('users')} className={`px-6 py-3 font-bold rounded-t-lg whitespace-nowrap ${activeTab === 'users' ? 'bg-dies-blue text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Kullanıcılar</button>
        <button onClick={() => setActiveTab('offices')} className={`px-6 py-3 font-bold rounded-t-lg whitespace-nowrap ${activeTab === 'offices' ? 'bg-dies-blue text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Ofisler</button>
        <button onClick={() => setActiveTab('all-listings')} className={`px-6 py-3 font-bold rounded-t-lg whitespace-nowrap ${activeTab === 'all-listings' ? 'bg-dies-blue text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Tüm İlanlar</button>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 min-h-[500px]">
        
        {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-3xl font-extrabold text-dies-blue">{users.length}</p>
                    <span className="font-bold text-gray-700">Üye</span>
                </div>
                <div className="p-6 bg-green-50 rounded-xl border border-green-100">
                    <p className="text-3xl font-extrabold text-green-600">{allListings.filter(p => p.type !== 'pending').length}</p>
                    <span className="font-bold text-gray-700">Aktif İlan</span>
                </div>
                <div className="p-6 bg-yellow-50 rounded-xl border border-yellow-100">
                    <p className="text-3xl font-extrabold text-yellow-600">{pendingListings.length}</p>
                    <span className="font-bold text-gray-700">Bekleyen Onay</span>
                </div>
                 <div className="p-6 bg-purple-50 rounded-xl border border-purple-100">
                    <p className="text-3xl font-extrabold text-purple-600">{advisorApplications.length + officeApplications.length}</p>
                    <span className="font-bold text-gray-700">Başvurular</span>
                </div>
            </div>
        )}

        {activeTab === 'users' && (
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2"><Users /> Kullanıcı Yönetimi</h3>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button onClick={() => setUserFilterType('all')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${userFilterType === 'all' ? 'bg-white shadow text-dies-dark' : 'text-gray-500'}`}>Tümü</button>
                        <button onClick={() => setUserFilterType('advisor')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${userFilterType === 'advisor' ? 'bg-white shadow text-dies-blue' : 'text-gray-500'}`}>Danışmanlar</button>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="border-b text-gray-400 text-xs uppercase tracking-wider font-bold">
                                <th className="pb-3 pl-2">ID</th>
                                <th className="pb-3">Ad Soyad</th>
                                <th className="pb-3">E-posta</th>
                                <th className="pb-3">Rol</th>
                                <th className="pb-3 text-right pr-4">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {displayUsers.map(u => (
                                <tr key={u.id} className="hover:bg-gray-50">
                                    <td className="py-3 pl-2 text-gray-500 text-sm">#{u.id}</td>
                                    <td className="py-3 font-bold text-dies-dark flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                            {u.image ? <img src={u.image} className="w-full h-full object-cover" /> : <Users size={16} className="text-gray-500" />}
                                        </div>
                                        {u.name}
                                    </td>
                                    <td className="py-3 text-gray-600 text-sm">{u.email}</td>
                                    <td className="py-3">
                                        <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)} className="p-1 border rounded text-xs font-bold" disabled={u.id === user.id}>
                                            <option value="user">User</option>
                                            <option value="advisor">Advisor</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td className="py-3 text-right pr-4">
                                        <div className="flex justify-end gap-2">
                                          <button onClick={() => handleAdminResetPassword(u.id, u.name)} className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-dies-blue hover:text-white transition-all" title="Şifre Sıfırla">
                                              <Key size={16} />
                                          </button>
                                          <button onClick={() => setSelectedAdvisorForListings(u)} className="p-2 bg-blue-50 text-dies-blue rounded-lg hover:bg-dies-blue hover:text-white transition-all" title="İlanları Gör">
                                              <List size={16} />
                                          </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {activeTab === 'all-listings' && (
            <div>
                 <div className="mb-4 flex gap-2">
                     <input placeholder="Ara (Başlık veya ID)..." className={inputClass} value={listingFilters.term} onChange={e => setListingFilters({...listingFilters, term: e.target.value})} />
                     <button onClick={handleListingFilter} className="bg-dies-blue text-white px-6 py-2 rounded-lg font-bold">Ara</button>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead><tr className="border-b text-xs font-bold uppercase text-gray-400"><th className="pb-2">Başlık</th><th className="pb-2">Fiyat</th><th className="pb-2">Durum</th><th className="pb-2 text-right">İşlem</th></tr></thead>
                        <tbody>
                            {filteredListings.map(p => (
                                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="py-3 font-medium text-sm">{p.title}</td>
                                    <td className="py-3 font-bold text-dies-blue">{p.price.toLocaleString()} TL</td>
                                    <td className="py-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${p.type === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{p.type}</span></td>
                                    <td className="py-3 text-right whitespace-nowrap pr-2">
                                        <button onClick={() => navigate(`/ilan/${p.id}`)} className="text-blue-600 mr-3 hover:text-blue-800"><Eye size={18} /></button>
                                        <button onClick={() => handleEditListing(p)} className="text-orange-500 mr-3 hover:text-orange-700"><Edit size={18} /></button>
                                        <button onClick={() => handleDeleteListing(p.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>
        )}

        {activeTab === 'approvals' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-yellow-600"><Clock size={20} /> İlan Onayları</h3>
                <div className="space-y-3">
                    {pendingListings.map(p => (
                        <div key={p.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <p className="font-bold text-sm mb-1 line-clamp-1">{p.title}</p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold mb-3">{p.advisorName || 'Sistem'}</p>
                            <div className="flex gap-2">
                                <button onClick={() => navigate(`/ilan/${p.id}`)} className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-bold">İncele</button>
                                <button onClick={() => handleApproveListing(p.id)} className="flex-1 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-bold">Onayla</button>
                                <button onClick={() => handleRejectListing(p.id)} className="flex-1 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-bold">Red</button>
                            </div>
                        </div>
                    ))}
                    {pendingListings.length === 0 && <p className="text-xs text-gray-400 italic">Bekleyen onay bulunmuyor.</p>}
                </div>
            </div>
            {/* Advisor Applications */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-blue-600"><Briefcase size={20} /> Danışman Başvuruları</h3>
                <div className="space-y-3">
                  {advisorApplications.map(app => (
                    <div key={app.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <p className="font-bold text-sm mb-1">{app.firstName} {app.lastName}</p>
                      <p className="text-xs text-gray-500 mb-3">{app.phone}</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleApplicationStatus(app.id, 'approved')} className="flex-1 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-bold">Kabul</button>
                        <button onClick={() => handleApplicationStatus(app.id, 'rejected')} className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-xs font-bold">Red</button>
                      </div>
                    </div>
                  ))}
                  {advisorApplications.length === 0 && <p className="text-xs text-gray-400 italic">Yeni başvuru bulunmuyor.</p>}
                </div>
            </div>
          </div>
        )}
      </div>

      {/* GENERATED PASSWORD MODAL */}
      <AnimatePresence>
        {generatedPassModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 text-dies-blue rounded-full flex items-center justify-center mx-auto mb-6">
                <Key size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Şifre Sıfırlandı</h3>
              <p className="text-sm text-gray-500 mb-6"><span className="font-bold text-dies-dark">{generatedPassModal.userName}</span> için oluşturulan yeni şifre aşağıdadır.</p>
              
              <div className="bg-gray-100 p-4 rounded-xl flex items-center justify-between gap-2 mb-4">
                <code className="text-lg font-black text-dies-blue tracking-wider">{generatedPassModal.password}</code>
                <button onClick={() => copyToClipboard(generatedPassModal.password!)} className="p-2 text-gray-400 hover:text-dies-blue"><Copy size={20}/></button>
              </div>
              
              <p className="text-[10px] text-red-500 font-bold uppercase mb-8">DİKKAT: BU ŞİFRE BİR DAHA GÖSTERİLMEYECEKTİR.</p>
              
              <button onClick={() => setGeneratedPassModal({ open: false })} className="w-full bg-dies-dark text-white py-3 rounded-lg font-bold">Kapat</button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
