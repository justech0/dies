import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { useTheme } from '../components/ThemeContext';
import { PropertyCard } from '../components/PropertyCard';
import { Camera, Save, Loader, AlertTriangle, Edit } from 'lucide-react';
import { Property } from '../types';
import { useNavigate } from 'react-router-dom';

export const Profile = () => {
    const { user, login } = useAuth(); // login used to update context
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [listings, setListings] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        instagram: user?.instagram || '',
        facebook: user?.facebook || '',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>(user?.image || '');

    useEffect(() => {
        if (user) {
            // Fetch User's Listings from API
            fetch(`/api/listings.php?user_id=${user.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                         // Transform API data to match Property interface
                         const formatted: Property[] = data.data.map((item: any) => ({
                             ...item,
                             image: item.main_image || 'https://via.placeholder.com/400',
                             price: parseFloat(item.price),
                             area: parseInt(item.area_gross)
                         }));
                         setListings(formatted);
                    }
                })
                .catch(err => console.error("Failed to load listings", err));
        }
    }, [user]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
            setPreviewUrl(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const data = new FormData();
        data.append('action', 'update_profile');
        data.append('user_id', user!.id.toString());
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('phone', formData.phone);
        data.append('instagram', formData.instagram);
        data.append('facebook', formData.facebook);
        if (imageFile) {
            data.append('image', imageFile);
        }

        try {
            const res = await fetch('/api/auth.php', {
                method: 'POST',
                body: data
            });
            const result = await res.json();
            if (result.success) {
                // Update local user context
                login({ ...user, ...result.user });
                alert("Profil güncellendi!");
            } else {
                alert(result.message || "Bir hata oluştu");
            }
        } catch (error) {
            alert("Sunucu bağlantı hatası.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return <div className="pt-32 text-center">Lütfen giriş yapın.</div>;

    const inputClass = `w-full p-3 rounded-lg border outline-none ${theme === 'dark' ? 'bg-black border-zinc-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`;
    const labelClass = `block text-sm font-bold mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`;

    return (
        <div className="container mx-auto px-4 py-12 pt-32">
            <h1 className={`text-3xl font-bold mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Profilim</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Edit Form */}
                <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'} h-fit`}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-dies-red mb-4">
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
                        <div>
                            <label className={labelClass}>Instagram Linki</label>
                            <input value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} className={inputClass} placeholder="https://instagram.com/..." />
                        </div>
                        <div>
                            <label className={labelClass}>Facebook Linki</label>
                            <input value={formData.facebook} onChange={e => setFormData({...formData, facebook: e.target.value})} className={inputClass} placeholder="https://facebook.com/..." />
                        </div>

                        <button disabled={isLoading} className="w-full bg-dies-red text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 mt-4 hover:bg-red-700">
                            {isLoading ? <Loader className="animate-spin" /> : <Save size={18} />}
                            Değişiklikleri Kaydet
                        </button>
                    </form>
                </div>

                {/* My Listings */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>İlanlarım ({listings.length})</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {listings.length > 0 ? (
                            listings.map(listing => (
                                <div key={listing.id} className="relative group">
                                    <PropertyCard property={listing} />
                                    <div className={`absolute top-2 right-2 px-3 py-1 text-xs font-bold rounded shadow z-10 ${listing.type === 'pending' ? 'bg-yellow-500 text-black' : 'bg-green-600 text-white'}`}>
                                        {listing.type === 'pending' ? 'Onay Bekliyor' : 'Yayında'}
                                    </div>
                                    
                                    <button
                                        onClick={() => navigate('/ilan-ver', { state: { editingProperty: listing } })}
                                        className="absolute top-2 left-2 bg-white text-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 hover:text-dies-red transition-all z-20 flex items-center justify-center"
                                        title="İlanı Düzenle"
                                    >
                                        <Edit size={18} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className={`p-8 rounded-xl border text-center ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
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