
import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { useTheme } from '../components/ThemeContext';
import { PropertyCard } from '../components/PropertyCard';
import { Camera, Save, Loader, Edit, Trophy, Clock, Trash2, CheckSquare, Square, CheckCircle, List, Facebook, Instagram, RefreshCcw } from 'lucide-react';
import { Property } from '../types';
import { api } from '../services/api';
// @ts-ignore
import { useNavigate } from 'react-router-dom';
import { compressToWebp } from '../utils/image';

export const Profile = () => {
  const { user, login } = useAuth(); 
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedListingIds, setSelectedListingIds] = useState<number[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [stats, setStats] = useState({ totalSales: 0, experience: 0 });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    instagram: '',
    facebook: '',
    specializations: '',
    about: ''
  });
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        instagram: user.instagram || '',
        facebook: user.facebook || '',
        specializations: (user as any).specializations ? (user as any).specializations.join(', ') : '',
        about: (user as any).about || ''
      });
      setPreviewUrl(user.image || '');
      if ((user as any).stats) setStats((user as any).stats);
      api.properties.getList({ advisorId: user.id }).then(setListings).catch(console.error);
    }
  }, [user]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setIsSavingProfile(true);
        const compressed = await compressToWebp(file, { quality: 0.75, maxDimension: 1200 });
        const form = new FormData();
        form.append('files[]', compressed);
        const res = await api.upload(form);
        if (res.urls.length > 0) {
          setPreviewUrl(res.urls[0]);
        }
      } catch (err) {
        console.error("Avatar upload failed", err);
      } finally {
        setIsSavingProfile(false);
      }
    }
  };

  const toggleListingSelection = (id: number) => {
    if (selectedListingIds.includes(id)) {
      setSelectedListingIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedListingIds(prev => [...prev, id]);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedListingIds.length === 0) return;
    if (window.confirm(`${selectedListingIds.length} adet ilanı silmek istediğinize emin misiniz?`)) {
      try {
        await Promise.all(selectedListingIds.map(id => api.properties.delete(id)));
        setListings(prev => prev.filter(p => !selectedListingIds.includes(p.id)));
        setSelectedListingIds([]);
      } catch (e) {
        alert("Silme işlemi sırasında hata oluştu.");
      }
    }
  };

  const handleMarkAsSold = async () => {
    if (selectedListingIds.length === 0) return;
    if (window.confirm(`${selectedListingIds.length} adet ilanı 'Satıldı' olarak işaretlemek istediğinize emin misiniz?`)) {
      try {
        await Promise.all(selectedListingIds.map(id => api.properties.update(id, { listing_state: 'sold' })));
        setListings(prev => prev.map(p => selectedListingIds.includes(p.id) ? { ...p, type: 'Satıldı' } : p));
        setSelectedListingIds([]);
      } catch (e) {
        alert("Güncelleme sırasında hata oluştu.");
      }
    }
  };
  
  const selectAll = () => {
    if (selectedListingIds.length === listings.length) {
      setSelectedListingIds([]);
    } else {
      setSelectedListingIds(listings.map(l => l.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const updatedData = {
        id: user!.id,
        ...formData,
        image: previewUrl,
        specializations: formData.specializations.split(',').map(s => s.trim()).filter(s => s),
      };
      const res = await api.auth.updateProfile(updatedData);
      login(res.user);
      alert("Profil başarıyla güncellendi.");
    } catch (error) {
      alert("Profil güncellenirken hata oluştu.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (!user) return <div className="pt-32 text-center">Lütfen giriş yapın.</div>;

  const inputClass = `w-full p-3 rounded-lg border outline-none text-sm transition-all focus:ring-2 focus:ring-blue-100 focus:border-dies-blue ${theme === 'dark' ? 'bg-black border-zinc-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`;
  const labelClass = `block text-xs font-bold mb-1.5 uppercase text-gray-500`;

  const activeListingsCount = listings.filter(p => p.type !== 'Satıldı' && p.type !== 'Kiralandı').length;

  return (
    <div className="container mx-auto px-4 py-12 pt-32 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-12 h-12 bg-red-50 text-dies-red rounded-xl flex items-center justify-center shrink-0">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">TOPLAM SATIŞ</p>
            <p className="text-3xl font-black text-dies-dark">{stats.totalSales}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-12 h-12 bg-blue-50 text-dies-blue rounded-xl flex items-center justify-center shrink-0">
            <List size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">AKTİF İLANLAR</p>
            <p className="text-3xl font-black text-dies-dark">{activeListingsCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">DENEYİM</p>
            <p className="text-3xl font-black text-dies-dark">{stats.experience} Yıl</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-32">
             <div className="flex flex-col items-center mb-8">
                <div className="relative group cursor-pointer w-32 h-32 mb-4">
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg ring-2 ring-gray-100">
                    <img src={previewUrl || 'https://via.placeholder.com/150'} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" size={24} />
                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                  </label>
                </div>
                <p className="text-xs text-gray-400">Değiştirmek için tıklayın</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div><label className={labelClass}>Ad Soyad</label><input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} /></div>
              <div><label className={labelClass}>Telefon</label><input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputClass} /></div>
              <div><label className={labelClass}>Uzmanlık Alanları</label><input value={formData.specializations} onChange={e => setFormData({...formData, specializations: e.target.value})} className={inputClass} placeholder="Ticari, Arsa..." /></div>
              <div><label className={labelClass}>Hakkımda</label><textarea rows={4} value={formData.about} onChange={e => setFormData({...formData, about: e.target.value})} className={inputClass} /></div>
              <button disabled={isSavingProfile} className="w-full bg-dies-blue hover:bg-blue-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 mt-4 transition-colors">
                {isSavingProfile ? <Loader className="animate-spin" size={18} /> : <Save size={18} />} Kaydet
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
             <div>
               <h2 className="text-xl font-bold text-dies-dark">İlanlarım ({listings.length})</h2>
               <p className="text-xs text-gray-400 mt-0.5">İlanlarınızı yönetin ve güncelleyin.</p>
             </div>
             <div className="flex gap-3 w-full sm:w-auto">
               <button onClick={() => { setIsSelectionMode(!isSelectionMode); setSelectedListingIds([]); }} className={`px-5 py-2.5 rounded-xl font-bold text-sm border transition-all ${isSelectionMode ? 'bg-gray-100 border-gray-200 text-gray-600' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                 {isSelectionMode ? 'İptal' : 'Toplu İşlem'}
               </button>
               <button onClick={() => navigate('/ilan-ver')} className="bg-dies-red text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg flex items-center justify-center gap-2">
                 <Edit size={16} /> Yeni İlan
               </button>
             </div>
          </div>

          {isSelectionMode && (
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4 w-full md:w-auto">
                 <button onClick={selectAll} className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 rounded-lg text-dies-blue font-bold text-sm hover:bg-blue-50 transition-colors">
                   {selectedListingIds.length === listings.length ? <CheckSquare size={18} /> : <Square size={18} />} Tümünü Seç
                 </button>
                 <span className="text-sm font-bold text-gray-600">{selectedListingIds.length} ilan seçildi</span>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button disabled={selectedListingIds.length === 0} onClick={handleMarkAsSold} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 bg-[#25D366] hover:bg-[#20b85a] text-white rounded-lg font-bold text-sm disabled:opacity-50 transition-all shadow-sm">
                  <CheckCircle size={16} /> Satıldı Yap
                </button>
                <button disabled={selectedListingIds.length === 0} onClick={handleDeleteSelected} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 bg-dies-red hover:bg-red-700 text-white rounded-lg font-bold text-sm disabled:opacity-50 transition-all shadow-sm">
                  <Trash2 size={16} /> Sil
                </button>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {listings.map(listing => (
              <div key={listing.id} className={`relative group transition-all duration-300 bg-white rounded-xl ${isSelectionMode && selectedListingIds.includes(listing.id) ? 'ring-2 ring-dies-blue transform scale-[0.99]' : ''}`}>
                {isSelectionMode && (
                  <div 
                    onClick={() => toggleListingSelection(listing.id)} 
                    className="absolute inset-0 z-30 cursor-pointer rounded-xl transition-colors bg-transparent hover:bg-dies-blue/5"
                  >
                    <div className="absolute top-3 left-3 bg-white rounded-md shadow-md">
                       <div className={`w-6 h-6 rounded-md flex items-center justify-center border-2 transition-all ${selectedListingIds.includes(listing.id) ? 'bg-dies-blue border-dies-blue' : 'border-gray-300'}`}>
                         {selectedListingIds.includes(listing.id) && <CheckSquare size={16} className="text-white" />}
                       </div>
                    </div>
                  </div>
                )}
                <PropertyCard property={listing} />
                {!isSelectionMode && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate('/ilan-ver', { state: { editingProperty: listing } }); }} 
                    className="absolute top-3 left-3 bg-white hover:bg-dies-blue hover:text-white text-dies-dark px-3 py-1.5 rounded-lg shadow-lg z-20 font-bold text-[10px] flex items-center gap-1.5 transition-colors border border-gray-100 uppercase tracking-wide"
                  >
                    <Edit size={12} /> DÜZENLE
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
