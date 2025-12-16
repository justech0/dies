
import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { useTheme } from '../components/ThemeContext';
import { PropertyCard } from '../components/PropertyCard';
import { Camera, Save, Loader, AlertTriangle, Edit, Trophy, Layout, Clock, Trash2, CheckSquare, Square, CheckCircle } from 'lucide-react';
import { Property } from '../types';
import { api } from '../services/api';
// @ts-ignore
import { useNavigate } from 'react-router-dom';

export const Profile = () => {
    const { user, login } = useAuth(); // login used to update context
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [listings, setListings] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Selection State for Deletion
    const [selectedListingIds, setSelectedListingIds] = useState<number[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    
    // Advisor Stats (Mock for now, or fetch from API if available for user)
    // In a real scenario, api.auth.me() would return these stats if user is advisor
    const advisorStats = { totalSales: 0, activeListings: 0, experience: 0 }; 

    // Form State
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        instagram: user?.instagram || '',
        facebook: user?.facebook || '',
    });
    const [previewUrl, setPreviewUrl] = useState<string>(user?.image || '');

    useEffect(() => {
        if (user) {
            // Fetch listings for this user
            api.properties.getList({ advisorId: user.id }).then(setListings).catch(console.error);
        }
    }, [user]);

    // Handle File Upload for Avatar
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPreviewUrl(URL.createObjectURL(file)); // Immediate preview
            
            // Upload immediately
            const form = new FormData();
            form.append('files[]', file);
            try {
                const res = await api.upload(form);
                if (res.urls.length > 0) {
                    setPreviewUrl(res.urls[0]); // Update with server URL
                    // Optionally trigger profile update here or wait for "Save"
                }
            } catch (err) {
                console.error("Avatar upload failed", err);
            }
        }
    };

    // --- DELETION & UPDATE LOGIC ---
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
                setIsSelectionMode(false);
            } catch (e) {
                alert("Silme işlemi sırasında hata oluştu.");
            }
        }
    };

    const handleMarkAsSold = async () => {
        if (selectedListingIds.length === 0) return;
        if (window.confirm(`${selectedListingIds.length} adet ilanı 'Satıldı' olarak işaretlemek istediğinize emin misiniz?`)) {
            try {
                await Promise.all(selectedListingIds.map(id => api.properties.update(id, { type: 'Satıldı' })));
                setListings(prev => prev.map(p => selectedListingIds.includes(p.id) ? { ...p, type: 'Satıldı' } : p));
                setSelectedListingIds([]);
                setIsSelectionMode(false);
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

    // --- FORM SUBMIT ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Note: We need a dedicated profile update endpoint. 
        // Assuming api.auth.me update or similar, but simplified here:
        // We'll just update context state for UI, assuming backend sync via a hypothetical endpoint
        // or just logging it since 'api_auth.php?action=update_profile' wasn't explicitly defined in readme.
        // We'll assume the user object in context is refreshed on next reload or we manually update it.
        
        setTimeout(() => {
             login({ ...user!, ...formData, image: previewUrl });
             alert("Profil güncellendi (Simülasyon)");
             setIsLoading(false);
        }, 500);
    };

    if (!user) return <div className="pt-32 text-center">Lütfen giriş yapın.</div>;

    const inputClass = `w-full p-3 rounded-lg border outline-none ${theme === 'dark' ? 'bg-black border-zinc-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`;
    const labelClass = `block text-sm font-bold mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`;

    return (
        <div className="container mx-auto px-4 py-12 pt-32">
            <h1 className={`text-3xl font-bold mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Profilim</h1>

            {(user.role === 'admin' || user.role === 'advisor') && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-3 bg-red-100 text-dies-red rounded-lg"><Trophy size={24} /></div>
                        <div><p className="text-sm text-gray-500 font-bold uppercase">Toplam Satış</p><p className="text-2xl font-extrabold text-dies-dark">{advisorStats.totalSales}</p></div>
                    </div>
                    {/* ... other stats could go here ... */}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'} h-fit`}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-dies-blue mb-4">
                                <img src={previewUrl || 'https://via.placeholder.com/150'} alt="Profile" className="w-full h-full object-cover" />
                                <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer transition-opacity">
                                    <Camera className="text-white" />
                                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                </label>
                            </div>
                        </div>

                        <div><label className={labelClass}>Ad Soyad</label><input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} /></div>
                        <div><label className={labelClass}>Telefon</label><input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputClass} placeholder="+90..." /></div>
                        
                        <button disabled={isLoading} className="w-full bg-dies-blue text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 mt-4 hover:bg-blue-800">
                            {isLoading ? <Loader className="animate-spin" /> : <Save size={18} />} Değişiklikleri Kaydet
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                         <div><h2 className="text-xl font-bold">İlanlarım ({listings.length})</h2></div>
                         <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                            {listings.length > 0 && (
                                <button onClick={() => { setIsSelectionMode(!isSelectionMode); setSelectedListingIds([]); }} className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all flex-grow sm:flex-grow-0 justify-center ${isSelectionMode ? 'bg-gray-200 text-gray-700' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                                    {isSelectionMode ? 'Vazgeç' : 'Seç / İşlem Yap'}
                                </button>
                            )}
                             <button onClick={() => navigate('/ilan-ver')} className="bg-dies-red text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition-colors flex items-center gap-2 flex-grow sm:flex-grow-0 justify-center"><Edit size={16} /> Yeni İlan</button>
                         </div>
                    </div>

                    {isSelectionMode && (
                        <div className="flex flex-col md:flex-row justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-100 animate-fadeIn gap-4">
                            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                                <button onClick={selectAll} className="flex items-center gap-2 text-sm font-bold text-dies-blue hover:underline">
                                    {selectedListingIds.length === listings.length ? <CheckSquare size={18} /> : <Square size={18} />} Tümünü Seç
                                </button>
                                <span className="text-sm font-bold text-gray-600">{selectedListingIds.length} ilan seçildi</span>
                            </div>
                            <div className="flex flex-wrap gap-2 w-full md:w-auto">
                                <button onClick={handleMarkAsSold} disabled={selectedListingIds.length === 0} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-sm bg-green-600 text-white disabled:opacity-50"><CheckCircle size={16} /> Satıldı</button>
                                <button onClick={handleDeleteSelected} disabled={selectedListingIds.length === 0} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-sm bg-red-600 text-white disabled:opacity-50"><Trash2 size={16} /> Sil</button>
                            </div>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {listings.map(listing => (
                            <div key={listing.id} className={`relative group transition-all duration-300 ${isSelectionMode && selectedListingIds.includes(listing.id) ? 'ring-4 ring-dies-blue rounded-xl transform scale-95' : ''}`}>
                                {isSelectionMode && (
                                    <div onClick={() => toggleListingSelection(listing.id)} className="absolute inset-0 z-30 bg-white/20 hover:bg-white/40 cursor-pointer rounded-xl flex items-start justify-end p-3 transition-colors">
                                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${selectedListingIds.includes(listing.id) ? 'bg-dies-blue border-dies-blue' : 'bg-white border-gray-400'}`}>
                                            {selectedListingIds.includes(listing.id) && <CheckSquare size={16} className="text-white" />}
                                        </div>
                                    </div>
                                )}
                                <PropertyCard property={listing} />
                                <div className={`absolute top-2 right-2 px-3 py-1 text-xs font-bold rounded shadow z-10 ${listing.type === 'pending' ? 'bg-yellow-500 text-black' : 'bg-green-600 text-white'}`}>
                                    {listing.type === 'pending' ? 'Onay Bekliyor' : listing.type}
                                </div>
                                
                                {/* Explicit Edit Button for Profile Page */}
                                {!isSelectionMode && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); navigate('/ilan-ver', { state: { editingProperty: listing } }); }} 
                                        className="absolute top-2 left-2 bg-white hover:bg-dies-blue hover:text-white text-dies-dark px-4 py-2 rounded-lg shadow-lg z-20 font-bold text-xs flex items-center gap-2 transition-colors border border-gray-100"
                                    >
                                        <Edit size={14} /> DÜZENLE
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
