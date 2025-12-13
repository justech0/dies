
import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { useTheme } from '../components/ThemeContext';
import { PropertyCard } from '../components/PropertyCard';
import { Camera, Save, Loader, AlertTriangle, Edit, Trophy, Layout, Clock, FileText, Trash2, CheckSquare, Square, CheckCircle } from 'lucide-react';
import { Property } from '../types';
import { MOCK_ADVISORS, MOCK_PROPERTIES } from '../services/mockData';
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
    
    // Get mock advisor data to display stats if the user corresponds to a mock advisor
    const existingAdvisor = MOCK_ADVISORS.find(a => a.id === user?.id);
    const mockAdvisorData = existingAdvisor || { stats: { totalSales: 0, activeListings: 0, experience: 0 }};

    // Form State
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        instagram: user?.instagram || '',
        facebook: user?.facebook || '',
        // Advisor specific fields
        about: existingAdvisor?.about || '',
        specializations: existingAdvisor?.specializations ? existingAdvisor.specializations.join(', ') : ''
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>(user?.image || '');

    useEffect(() => {
        if (user) {
            // Filter from the GLOBAL Mutable MOCK_PROPERTIES to ensure sync
            const userListings = MOCK_PROPERTIES.filter(p => p.advisorId === user.id);
            setListings(userListings);
        }
    }, [user]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
            setPreviewUrl(URL.createObjectURL(e.target.files[0]));
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

    const handleDeleteSelected = () => {
        if (selectedListingIds.length === 0) return;

        if (window.confirm(`${selectedListingIds.length} adet ilanı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) {
            // 1. Update Global Mock Data (Remove items)
            // Mutating MOCK_PROPERTIES in place to ensure changes reflect in Home/Listings
            for (let i = MOCK_PROPERTIES.length - 1; i >= 0; i--) {
                if (selectedListingIds.includes(MOCK_PROPERTIES[i].id)) {
                    MOCK_PROPERTIES.splice(i, 1);
                }
            }

            // 2. Update Local State
            setListings(prev => prev.filter(p => !selectedListingIds.includes(p.id)));
            
            // 3. Reset Selection
            setSelectedListingIds([]);
            setIsSelectionMode(false);
            
            alert("Seçilen ilanlar başarıyla silindi.");
        }
    };

    const handleMarkAsSold = () => {
        if (selectedListingIds.length === 0) return;

        if (window.confirm(`${selectedListingIds.length} adet ilanı 'Satıldı' olarak işaretlemek istediğinize emin misiniz?`)) {
            // 1. Update Global Mock Data
            MOCK_PROPERTIES.forEach(p => {
                if (selectedListingIds.includes(p.id)) {
                    p.type = 'Satıldı';
                }
            });

            // 2. Update Local State
            setListings(prev => prev.map(p => {
                if (selectedListingIds.includes(p.id)) {
                    return { ...p, type: 'Satıldı' };
                }
                return p;
            }));

            // 3. Reset Selection
            setSelectedListingIds([]);
            setIsSelectionMode(false);
            
            alert("Seçilen ilanlar 'Satıldı' olarak güncellendi.");
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

        // Simulate API call
        setTimeout(() => {
            // Update local user context
            login({ 
                ...user!, 
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                instagram: formData.instagram,
                facebook: formData.facebook,
                image: previewUrl // In real app this would be the URL returned from server
            });

            // Sync with Global Mock Data so Advisors page updates
            const advisorIndex = MOCK_ADVISORS.findIndex(a => a.id === user?.id);
            const specs = formData.specializations.split(',').map(s => s.trim()).filter(s => s);
            
            if (advisorIndex !== -1) {
                MOCK_ADVISORS[advisorIndex] = {
                    ...MOCK_ADVISORS[advisorIndex],
                    name: formData.name,
                    phone: formData.phone,
                    image: previewUrl || MOCK_ADVISORS[advisorIndex].image,
                    about: formData.about,
                    specializations: specs,
                    social: {
                        ...MOCK_ADVISORS[advisorIndex].social,
                        instagram: formData.instagram,
                        facebook: formData.facebook
                    }
                };
            } else if (user?.role === 'advisor') {
                 // New Advisor being registered/updated in Mock Data
                 MOCK_ADVISORS.push({
                     id: user.id,
                     name: formData.name,
                     role: 'Gayrimenkul Danışmanı',
                     phone: formData.phone || '',
                     image: previewUrl || '',
                     about: formData.about,
                     specializations: specs,
                     stats: { totalSales: 0, activeListings: 0, experience: 0 },
                     social: { instagram: formData.instagram, facebook: formData.facebook }
                 });
            }

            alert("Profil güncellendi!");
            setIsLoading(false);
        }, 1000);
    };

    if (!user) return <div className="pt-32 text-center">Lütfen giriş yapın.</div>;

    const inputClass = `w-full p-3 rounded-lg border outline-none ${theme === 'dark' ? 'bg-black border-zinc-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`;
    const labelClass = `block text-sm font-bold mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`;

    return (
        <div className="container mx-auto px-4 py-12 pt-32">
            <h1 className={`text-3xl font-bold mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Profilim</h1>

            {/* Advisor Stats (Only for admin or advisors) */}
            {(user.role === 'admin' || user.role === 'advisor') && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-3 bg-red-100 text-dies-red rounded-lg"><Trophy size={24} /></div>
                        <div>
                            <p className="text-sm text-gray-500 font-bold uppercase">Toplam Satış</p>
                            <p className="text-2xl font-extrabold text-dies-dark">{mockAdvisorData.stats?.totalSales}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-dies-blue rounded-lg"><Layout size={24} /></div>
                        <div>
                            <p className="text-sm text-gray-500 font-bold uppercase">Aktif İlanlar</p>
                            <p className="text-2xl font-extrabold text-dies-dark">{listings.length || mockAdvisorData.stats?.activeListings}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-lg"><Clock size={24} /></div>
                        <div>
                            <p className="text-sm text-gray-500 font-bold uppercase">Deneyim</p>
                            <p className="text-2xl font-extrabold text-dies-dark">{mockAdvisorData.stats?.experience} Yıl</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Edit Form */}
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
                            <p className="text-xs text-gray-500">Değiştirmek için fotoğrafa tıklayın</p>
                        </div>

                        <div>
                            <label className={labelClass}>Ad Soyad</label>
                            <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Telefon</label>
                            <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputClass} placeholder="+90..." />
                        </div>
                        
                        {/* Advisor Specific Fields */}
                        {user.role === 'advisor' && (
                            <>
                                <div>
                                    <label className={labelClass}>Uzmanlık Alanları</label>
                                    <input 
                                        value={formData.specializations} 
                                        onChange={e => setFormData({...formData, specializations: e.target.value})} 
                                        className={inputClass} 
                                        placeholder="Konut, Ticari, Arsa (Virgülle ayırın)" 
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Hakkımda (Biyografi)</label>
                                    <textarea 
                                        value={formData.about} 
                                        onChange={e => setFormData({...formData, about: e.target.value})} 
                                        className={inputClass} 
                                        rows={4}
                                        placeholder="Kendinizden bahsedin..." 
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label className={labelClass}>Instagram Linki</label>
                            <input value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} className={inputClass} placeholder="https://instagram.com/..." />
                        </div>
                        <div>
                            <label className={labelClass}>Facebook Linki</label>
                            <input value={formData.facebook} onChange={e => setFormData({...formData, facebook: e.target.value})} className={inputClass} placeholder="https://facebook.com/..." />
                        </div>

                        <button disabled={isLoading} className="w-full bg-dies-blue text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 mt-4 hover:bg-blue-800">
                            {isLoading ? <Loader className="animate-spin" /> : <Save size={18} />}
                            Değişiklikleri Kaydet
                        </button>
                    </form>
                </div>

                {/* My Listings */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                         <div>
                             <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>İlanlarım ({listings.length})</h2>
                             <p className="text-xs text-gray-500">İlanlarınızı buradan yönetebilir ve düzenleyebilirsiniz.</p>
                         </div>
                         <div className="flex gap-2 w-full sm:w-auto">
                            {listings.length > 0 && (
                                <button 
                                    onClick={() => {
                                        if (isSelectionMode) {
                                            // If cancelling selection mode
                                            setIsSelectionMode(false);
                                            setSelectedListingIds([]);
                                        } else {
                                            setIsSelectionMode(true);
                                        }
                                    }}
                                    className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${isSelectionMode ? 'bg-gray-200 text-gray-700' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                                >
                                    {isSelectionMode ? 'Vazgeç' : 'Seç / İşlem Yap'}
                                </button>
                            )}

                             <button onClick={() => navigate('/ilan-ver')} className="bg-dies-red text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition-colors flex items-center gap-2">
                                 <Edit size={16} /> Yeni İlan
                             </button>
                         </div>
                    </div>

                    {/* Selection Controls */}
                    {isSelectionMode && (
                        <div className="flex flex-col md:flex-row justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-100 animate-fadeIn gap-4">
                            <div className="flex items-center gap-4">
                                <button onClick={selectAll} className="flex items-center gap-2 text-sm font-bold text-dies-blue hover:underline">
                                    {selectedListingIds.length === listings.length ? <CheckSquare size={18} /> : <Square size={18} />}
                                    Tümünü Seç
                                </button>
                                <span className="text-sm font-bold text-gray-600">{selectedListingIds.length} ilan seçildi</span>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                                <button 
                                    onClick={handleMarkAsSold} 
                                    disabled={selectedListingIds.length === 0}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${selectedListingIds.length > 0 ? 'bg-green-600 text-white hover:bg-green-700 shadow-md' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                >
                                    <CheckCircle size={16} /> Satıldı Olarak İşaretle
                                </button>
                                <button 
                                    onClick={handleDeleteSelected} 
                                    disabled={selectedListingIds.length === 0}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${selectedListingIds.length > 0 ? 'bg-red-600 text-white hover:bg-red-700 shadow-md' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                >
                                    <Trash2 size={16} /> Seçilenleri Sil
                                </button>
                            </div>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {listings.length > 0 ? (
                            listings.map(listing => (
                                <div key={listing.id} className={`relative group transition-all duration-300 ${isSelectionMode && selectedListingIds.includes(listing.id) ? 'ring-4 ring-dies-blue rounded-xl transform scale-95' : ''}`}>
                                    
                                    {/* Selection Overlay */}
                                    {isSelectionMode && (
                                        <div 
                                            onClick={() => toggleListingSelection(listing.id)}
                                            className="absolute inset-0 z-30 bg-white/20 hover:bg-white/40 cursor-pointer rounded-xl flex items-start justify-end p-3 transition-colors"
                                        >
                                            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${selectedListingIds.includes(listing.id) ? 'bg-dies-blue border-dies-blue' : 'bg-white border-gray-400'}`}>
                                                {selectedListingIds.includes(listing.id) && <CheckSquare size={16} className="text-white" />}
                                            </div>
                                        </div>
                                    )}

                                    <PropertyCard property={listing} />
                                    
                                    <div className={`absolute top-2 right-2 px-3 py-1 text-xs font-bold rounded shadow z-10 ${listing.type === 'pending' ? 'bg-yellow-500 text-black' : listing.type === 'Satıldı' ? 'bg-gray-800 text-white' : 'bg-green-600 text-white'}`}>
                                        {listing.type === 'pending' ? 'Onay Bekliyor' : listing.type === 'Satıldı' ? 'SATILDI' : 'Yayında'}
                                    </div>
                                    
                                    {!isSelectionMode && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent card click
                                                navigate('/ilan-ver', { state: { editingProperty: listing } });
                                            }}
                                            className="absolute top-2 left-2 bg-white text-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 hover:text-dies-blue transition-all z-20 flex items-center justify-center"
                                            title="İlanı Düzenle"
                                        >
                                            <Edit size={18} />
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className={`col-span-full p-8 rounded-xl border text-center ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
                                <AlertTriangle className="mx-auto mb-2 text-yellow-500" />
                                <p className="text-gray-500">Henüz ilanınız bulunmuyor.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
