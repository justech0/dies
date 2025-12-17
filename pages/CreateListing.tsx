
import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../components/ThemeContext';
import { CheckCircle, Lock, X, Image as ImageIcon, Loader, ArrowRight, UploadCloud, RefreshCw } from 'lucide-react';
import { useAuth } from '../components/AuthContext';
// @ts-ignore
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Property } from '../types';
import { api } from '../services/api';
import { compressToWebp } from '../utils/image';

export const CreateListing = () => {
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const editingProperty = location.state?.editingProperty as Property | undefined;

  const [submitted, setSubmitted] = useState(false);
  const [createdId, setCreatedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);

  const [locationState, setLocationState] = useState({
    province: '',
    district: '',
    neighborhood: ''
  });

  const [category, setCategory] = useState<string>('Konut');

  const availableFeatures = [
    "Çelik Kapı", "Parke Zemin", "Duşakabin", "Ebeveyn Banyosu", 
    "Asansör", "Balkon", "Isı Yalıtımı", "Kablo TV", "Uydu", 
    "Otopark", "Güvenlik", "Görüntülü Diafon", "Ankastre Mutfak",
    "Kiler", "Vestiyer", "Yangın Merdiveni", "Kapıcı", 
    "İmarlı", "Köşe Parsel", "Ana Cadde", "Depolu", "Yük Asansörü"
  ];
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.locations.getCities().then(setCities).catch(console.error);
  }, []);

  useEffect(() => {
    if (editingProperty) {
      setLocationState({
        province: editingProperty.province || '',
        district: editingProperty.district || '',
        neighborhood: editingProperty.neighborhood || ''
      });

      const existingImages = editingProperty.images && editingProperty.images.length > 0 
        ? editingProperty.images 
        : (editingProperty.image ? [editingProperty.image] : []);
      setPreviews(existingImages);
      setSelectedFeatures(editingProperty.features || []);
      setCategory(editingProperty.category || 'Konut');
    }
  }, [editingProperty]);

  useEffect(() => {
    if (locationState.province) {
      const city = cities.find(c => c.name === locationState.province);
      if (city) {
        api.locations.getDistricts(city.id).then(setDistricts).catch(console.error);
      }
    } else {
      setDistricts([]);
    }
    if (!editingProperty || locationState.province !== editingProperty.province) {
      setNeighborhoods([]);
    }
  }, [locationState.province, cities]);

  useEffect(() => {
    if (locationState.district) {
      const dist = districts.find(d => d.name === locationState.district);
      if (dist) {
        api.locations.getNeighborhoods(dist.id).then(setNeighborhoods).catch(console.error);
      }
    } else {
      setNeighborhoods([]);
    }
  }, [locationState.district, districts]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 pt-20">
        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6">
          <Lock className="text-dies-blue w-10 h-10" />
        </div>
        <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Giriş Yapmanız Gerekiyor</h2>
        <div className="flex gap-4">
          <Link to="/giris" className="bg-dies-blue text-white px-8 py-3 rounded-full font-bold hover:bg-blue-900 transition-colors">
            Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  const processFiles = async (files: File[]) => {
    if (previews.length + files.length > 15) {
      alert("En fazla 15 fotoğraf yükleyebilirsiniz.");
      return;
    }
    setIsCompressing(true);
    try {
      const processedFiles = await Promise.all(
        files.map(file => compressToWebp(file, { quality: 0.75, maxDimension: 1920 }))
      );
      setImages(prev => [...prev, ...processedFiles]);
      const newPreviews = processedFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    } catch (error) {
      console.error("Compression failed", error);
      alert("Fotoğraf işlenirken hata oluştu.");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files) as File[];
      processFiles(newFiles);
    }
  };

  const handleFeatureToggle = (feature: string) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(prev => prev.filter(f => f !== feature));
    } else {
      setSelectedFeatures(prev => [...prev, feature]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files) as File[];
      const imageFiles = droppedFiles.filter(file => file.type.startsWith('image/'));
      if (imageFiles.length > 0) processFiles(imageFiles);
    }
  };

  const removeImage = (indexToRemove: number) => {
    const numExisting = previews.length - images.length;
    setPreviews(prev => prev.filter((_, i) => i !== indexToRemove));
    if (indexToRemove >= numExisting) {
      const fileIndex = indexToRemove - numExisting;
      setImages(prev => prev.filter((_, i) => i !== fileIndex));
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'province') {
      setLocationState({ province: value, district: '', neighborhood: '' });
    } else if (name === 'district') {
      setLocationState(prev => ({ ...prev, district: value, neighborhood: '' }));
    } else {
      setLocationState(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (previews.length === 0) {
      alert("Lütfen en az bir fotoğraf yükleyin.");
      return;
    }
    
    setIsLoading(true);
    setUploadProgress(0);

    try {
      let uploadedUrls: string[] = [];
      const existingUrls = previews.filter(url => url.startsWith('http'));
      
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach(file => formData.append('files[]', file));
        const interval = setInterval(() => setUploadProgress(prev => Math.min(prev + 10, 90)), 200);
        const uploadRes = await api.upload(formData);
        uploadedUrls = uploadRes.urls;
        clearInterval(interval);
      }

      const finalImages = [...existingUrls, ...uploadedUrls];
      setUploadProgress(100);

      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      
      const propertyData = {
        title: formData.get('title'),
        price: Number(formData.get('price')),
        currency: 'TL',
        province: locationState.province,
        district: locationState.district,
        neighborhood: locationState.neighborhood,
        category: category,
        listing_intent: formData.get('listing_intent') || 'sale',
        image: finalImages[0],
        images: finalImages,
        bedrooms: category === 'Konut' ? formData.get('bedrooms') : undefined,
        bathrooms: category === 'Konut' ? Number(formData.get('bathrooms')) : undefined,
        area_gross: Number(formData.get('area')),
        area_net: Number(formData.get('net_area')),
        advisorId: user?.id,
        sahibindenLink: formData.get('sahibinden_link'),
        description: formData.get('description'),
        features: selectedFeatures,
        buildingAge: category === 'Konut' ? formData.get('building_age') : undefined,
        heatingType: category === 'Konut' ? formData.get('heating_type') : undefined,
        isFurnished: category === 'Konut' ? formData.get('is_furnished') === '1' : false,
      };

      if (editingProperty) {
        await api.properties.update(editingProperty.id, propertyData);
        setCreatedId(editingProperty.id);
      } else {
        const res = await api.properties.create(propertyData);
        setCreatedId(res.id);
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Submission error", error);
      alert("İlan gönderilirken bir hata oluştu: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !submitted) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center pt-20 px-4">
        <div className="relative w-24 h-24 mb-6">
           <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle className="text-gray-200 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"></circle>
              <circle className="text-dies-blue progress-ring__circle stroke-current" strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" strokeDasharray={`${uploadProgress * 2.51} 251`}></circle>
           </svg>
           <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
               {Math.round(uploadProgress)}%
           </div>
        </div>
        <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>İlan {editingProperty ? 'Güncelleniyor' : 'Gönderiliyor'}...</h2>
        <div className="w-full max-w-md bg-gray-200 rounded-full h-2.5 overflow-hidden">
           <div className="bg-dies-blue h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 pt-20">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 bg-green-500/20 animate-bounce`}>
            <CheckCircle className="text-green-500 w-12 h-12" />
        </div>
        
        <h2 className={`text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>İşlem Başarılı!</h2>
        <p className="text-gray-500 max-w-md mb-8">
            İlanınız başarıyla {editingProperty ? 'güncellendi' : 'oluşturuldu'}.
        </p>
        
        <div className="flex gap-4">
            <button onClick={() => navigate(`/ilan/${createdId}`)} className="bg-green-600 text-white px-8 py-3 rounded-full font-bold hover:bg-green-700 transition-colors">İlanı Görüntüle</button>
            <button onClick={() => navigate(`/profil`)} className="bg-gray-200 text-gray-800 px-8 py-3 rounded-full font-bold hover:bg-gray-300 transition-colors">Profilime Dön</button>
        </div>
      </div>
    );
  }

  const inputClass = `w-full p-3 rounded-lg border transition-all focus:ring-2 focus:ring-dies-blue outline-none 
  ${theme === 'dark' ? 'bg-black/50 border-zinc-700 text-white placeholder-zinc-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`;
  const labelClass = `block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`;

  const isResidental = category === 'Konut';

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 pt-32">
      <div className="max-w-4xl mx-auto">
        <h1 className={`text-3xl font-bold mb-8 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {editingProperty ? 'İlanı Düzenle' : 'Yeni İlan Oluştur'}
        </h1>
        <form onSubmit={handleSubmit} className={`p-5 md:p-8 rounded-2xl shadow-xl ${theme === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-gray-100'}`}>
          <div className="space-y-6">
            <div>
              <label className={labelClass}>İlan Başlığı</label>
              <input required type="text" name="title" defaultValue={editingProperty?.title} className={inputClass} placeholder="Örn: Gültepe'de Satılık Lüks Daire" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                 <label className={labelClass}>Kategori</label>
                 <select name="category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                   <option value="Konut">Konut</option>
                   <option value="Ticari">Ticari</option>
                   <option value="Arsa">Arsa</option>
                 </select>
              </div>
              <div>
                <label className={labelClass}>İlan Türü</label>
                <select name="listing_intent" defaultValue={editingProperty?.type === 'Kiralık' ? 'rent' : 'sale'} className={inputClass}>
                  <option value="sale">Satılık</option>
                  <option value="rent">Kiralık</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>İl</label>
                <select required name="province" value={locationState.province} onChange={handleLocationChange} className={inputClass}>
                  <option value="">Seçiniz</option>
                  {cities.map(city => <option key={city.id} value={city.name}>{city.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                 <label className={labelClass}>İlçe</label>
                 <select required name="district" value={locationState.district} onChange={handleLocationChange} className={inputClass}>
                   <option>Seçiniz</option>
                   {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                 </select>
              </div>
              <div>
                 <label className={labelClass}>Mahalle</label>
                 <select required name="neighborhood" value={locationState.neighborhood} onChange={handleLocationChange} className={inputClass}>
                   <option>Seçiniz</option>
                   {neighborhoods.map(n => <option key={n.id} value={n.name}>{n.name}</option>)}
                 </select>
              </div>
              <div>
                <label className={labelClass}>Fiyat (TL)</label>
                <input required name="price" type="number" min="0" defaultValue={editingProperty?.price} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelClass}>Brüt m²</label>
                <input required name="area" type="number" min="0" defaultValue={editingProperty?.area} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Net m²</label>
                <input required name="net_area" type="number" min="0" defaultValue={editingProperty?.netArea} className={inputClass} />
              </div>
              {isResidental && (
                <div>
                  <label className={labelClass}>Banyo Sayısı</label>
                  <input name="bathrooms" type="number" min="0" defaultValue={editingProperty?.bathrooms || 1} className={inputClass} />
                </div>
              )}
            </div>
            
            {isResidental && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className={labelClass}>Oda Sayısı</label>
                    <select name="bedrooms" defaultValue={editingProperty?.bedrooms} className={inputClass}>
                      <option>1+0 (Stüdyo)</option>
                      <option>1+1</option>
                      <option>2+1</option>
                      <option>3+1</option>
                      <option>4+1</option>
                      <option>4.5+1</option>
                      <option>5+1</option>
                      <option>5+2</option>
                      <option>6+1</option>
                      <option>Villa Tipi</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Isıtma Tipi</label>
                    <select name="heating_type" defaultValue={editingProperty?.heatingType} className={inputClass}>
                      <option>Kombi (Doğalgaz)</option>
                      <option>Merkezi</option>
                      <option>Yerden Isıtma</option>
                      <option>Klima</option>
                      <option>Soba</option>
                      <option>Yok</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Bina Yaşı</label>
                    <select name="building_age" defaultValue={editingProperty?.buildingAge} className={inputClass}>
                      <option>0</option>
                      <option>1-5</option>
                      <option>5-10</option>
                      <option>10-20</option>
                      <option>20+</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Eşyalı mı?</label>
                  <select name="is_furnished" defaultValue={editingProperty?.isFurnished ? "1" : "0"} className={inputClass}>
                    <option value="0">Hayır</option>
                    <option value="1">Evet</option>
                  </select>
                </div>
              </>
            )}

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <label className={`${labelClass} mb-4 text-lg`}>Özellikler</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {availableFeatures.map(feature => (
                  <label key={feature} className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedFeatures.includes(feature) ? 'bg-dies-blue border-dies-blue' : 'bg-white border-gray-400 group-hover:border-dies-blue'}`}>
                      {selectedFeatures.includes(feature) && <CheckCircle size={14} className="text-white" />}
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={selectedFeatures.includes(feature)}
                      onChange={() => handleFeatureToggle(feature)}
                    />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className={labelClass}>Sahibinden Linki (Opsiyonel)</label>
              <input type="url" name="sahibinden_link" defaultValue={editingProperty?.sahibindenLink} className={inputClass} placeholder="https://shbd.io/..." />
            </div>

            <div>
              <label className={labelClass}>Açıklama</label>
              <textarea name="description" rows={5} defaultValue={editingProperty?.description} className={inputClass} placeholder="İlan detayları..."></textarea>
            </div>

            <div>
              <label className={labelClass}>Fotoğraflar (WebP %75 Sıkıştırma)</label>
              <div 
                onClick={() => !isCompressing && fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 relative 
                  ${theme === 'dark' ? 'border-zinc-700 hover:border-dies-blue hover:bg-zinc-800' : 'border-gray-300 hover:border-dies-blue hover:bg-gray-50'} 
                  ${isCompressing ? 'opacity-50 cursor-not-allowed' : ''}
                  ${isDragging ? 'border-dies-blue bg-dies-blue/5 scale-[1.02]' : ''}
                `}
              >
                {isCompressing ? (
                  <div className="flex flex-col items-center justify-center text-dies-blue">
                    <RefreshCw className="animate-spin mb-2 w-10 h-10" />
                    <p className="font-bold">Fotoğraflar İşleniyor...</p>
                  </div>
                ) : (
                  <>
                    <UploadCloud className={`mx-auto mb-2 w-12 h-12 ${isDragging ? 'text-dies-blue' : 'text-gray-400'}`} />
                    <p className="font-bold text-lg mb-1">Sürükle veya Seç</p>
                    <p className="text-gray-500 text-sm">JPG, PNG (Max 15)</p>
                  </>
                )}
                <input disabled={isCompressing} ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>
              
              {previews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
                  {previews.map((src, i) => (
                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-dies-blue/50 bg-black/50">
                      <img src={src} className="w-full h-full object-cover" alt={`Preview ${i}`} />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" onClick={() => removeImage(i)} className="bg-red-600 text-white p-2 rounded-full transform hover:scale-110 transition-transform">
                          <X size={16}/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button disabled={isCompressing || isLoading} type="submit" className={`w-full bg-dies-blue text-white py-4 rounded-lg font-bold hover:bg-blue-800 shadow-lg transform transition hover:scale-[1.01] flex items-center justify-center gap-2 ${isCompressing ? 'opacity-50 cursor-not-allowed' : ''}`}>
               {isLoading ? <Loader className="animate-spin" /> : <><CheckCircle size={20} /> {editingProperty ? 'KAYDET' : 'İLANI YAYINLA'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
