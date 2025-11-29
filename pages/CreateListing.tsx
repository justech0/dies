import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../components/ThemeContext';
import { CheckCircle, Lock, X, Image as ImageIcon, Loader, ArrowRight, UploadCloud, RefreshCw } from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { TURKEY_LOCATIONS } from '../services/mockData';
import { Property } from '../types';

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
  
  // Image State
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  // Location Data State
  const [locationsData, setLocationsData] = useState<any>(TURKEY_LOCATIONS);
  const [locationState, setLocationState] = useState({
      province: '',
      district: '',
      neighborhood: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      // Fetch locations from backend if available
      fetch('/api/locations.php')
        .then(res => res.json())
        .then(data => {
            if(Object.keys(data).length > 0) {
                setLocationsData(data);
            }
        })
        .catch(err => console.log('Using default locations'));
  }, []);

  useEffect(() => {
      if (editingProperty) {
          // Pre-fill location state
          setLocationState({
              province: editingProperty.province || '',
              district: editingProperty.district || '',
              neighborhood: editingProperty.neighborhood || ''
          });

          // Pre-fill images (existing URLs)
          const existingImages = editingProperty.images && editingProperty.images.length > 0 
            ? editingProperty.images 
            : (editingProperty.image ? [editingProperty.image] : []);
          
          setPreviews(existingImages);
      }
  }, [editingProperty]);

  // Auth Check
  if (!isAuthenticated) {
      return (
          <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 pt-20">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                  <Lock className="text-dies-red w-10 h-10" />
              </div>
              <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Giriş Yapmanız Gerekiyor</h2>
              <div className="flex gap-4">
                  <Link to="/giris" className="bg-dies-red text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition-colors">
                      Giriş Yap
                  </Link>
              </div>
          </div>
      );
  }

  // --- Image Compression Logic ---
  const compressImage = async (file: File): Promise<File> => {
    // 10MB Limit
    const MAX_SIZE = 10 * 1024 * 1024; 
    
    if (file.size <= MAX_SIZE) {
        return file;
    }

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            // Resize logic to keep max dimension reasonable
            const MAX_DIMENSION = 2500;
            if (width > height) {
                if (width > MAX_DIMENSION) {
                    height *= MAX_DIMENSION / width;
                    width = MAX_DIMENSION;
                }
            } else {
                if (height > MAX_DIMENSION) {
                    width *= MAX_DIMENSION / height;
                    height = MAX_DIMENSION;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(file);
                return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob((blob) => {
                if (!blob) {
                    resolve(file);
                    return;
                }
                const compressedFile = new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                });
                resolve(compressedFile);
            }, 'image/jpeg', 0.8); // 80% quality
        };
        img.onerror = (err) => reject(err);
    });
  };

  // Unified function to process files (from input or drop)
  const processFiles = async (files: File[]) => {
      if (images.length + files.length > 15) {
          alert("En fazla 15 fotoğraf yükleyebilirsiniz.");
          return;
      }

      setIsCompressing(true);
      try {
          const processedFiles = await Promise.all(files.map(compressImage));
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

  // --- Drag and Drop Handlers ---
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      
      if (e.dataTransfer.files) {
          const droppedFiles = Array.from(e.dataTransfer.files) as File[];
          // Filter for images only
          const imageFiles = droppedFiles.filter(file => file.type.startsWith('image/'));
          if (imageFiles.length > 0) {
              processFiles(imageFiles);
          }
      }
  };

  const removeImage = (indexToRemove: number) => {
      // Calculate existing images count (previews - new images)
      const existingCount = previews.length - images.length;

      // Remove from previews
      setPreviews(prev => prev.filter((_, i) => i !== indexToRemove));

      // If the removed image is a NEW image (index >= existingCount)
      if (indexToRemove >= existingCount) {
          const imageIndex = indexToRemove - existingCount;
          setImages(prev => prev.filter((_, i) => i !== imageIndex));
      }
      // If it's an existing image, we just remove from previews. 
      // In a real app, you might want to add it to a 'deletedImages' array to send to backend.
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

    const formData = new FormData(e.target as HTMLFormElement);
    images.forEach((file) => formData.append(`images[]`, file));
    formData.append('user_id', user!.id.toString());
    if (editingProperty) {
        formData.append('id', editingProperty.id.toString());
        formData.append('action', 'update');
    } else {
        formData.append('action', 'create');
    }
    
    formData.append('province', locationState.province);
    formData.append('district', locationState.district);
    formData.append('neighborhood', locationState.neighborhood);

    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setUploadProgress(percentComplete);
        }
    };

    xhr.onload = () => {
        if (xhr.status === 200) {
            try {
                const result = JSON.parse(xhr.responseText);
                if (result.success) {
                    setCreatedId(result.id || editingProperty?.id);
                    setSubmitted(true);
                } else {
                    alert("Hata: " + result.message);
                }
            } catch (e) {
                // Mock success for demo if API fails
                setCreatedId(editingProperty?.id || 101);
                setSubmitted(true);
            }
        } else {
            alert("Yükleme sırasında bir hata oluştu.");
        }
        setIsLoading(false);
    };

    xhr.onerror = () => {
        alert("Bağlantı hatası.");
        setIsLoading(false);
    };

    xhr.open("POST", "/api/listings.php");
    xhr.send(formData);
  };

  if (isLoading && !submitted) {
      return (
          <div className="min-h-[80vh] flex flex-col items-center justify-center pt-20 px-4">
              <div className="relative w-24 h-24 mb-6">
                 <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle className="text-gray-200 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"></circle>
                    <circle className="text-dies-red progress-ring__circle stroke-current" strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" strokeDasharray={`${uploadProgress * 2.51} 251`}></circle>
                 </svg>
                 <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                     {Math.round(uploadProgress)}%
                 </div>
              </div>

              <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>İlan {editingProperty ? 'Güncelleniyor' : 'Gönderiliyor'}...</h2>
              <p className="text-gray-500 mb-6 text-center">Lütfen sayfayı kapatmayın.</p>
              
              <div className="w-full max-w-md bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
                 <div className="bg-dies-red h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
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
        
        <button 
            onClick={() => navigate(`/ilan/${createdId}`)}
            className="flex items-center gap-2 bg-dies-red text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition-colors"
        >
            İlana Git <ArrowRight size={20} />
        </button>
      </div>
    );
  }

  const inputClass = `w-full p-3 rounded-lg border transition-all focus:ring-2 focus:ring-dies-red outline-none 
  ${theme === 'dark' 
    ? 'bg-black/50 border-zinc-700 text-white placeholder-zinc-500' 
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`;

  const labelClass = `block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <div className="container mx-auto px-4 py-12 pt-32">
        <div className="max-w-4xl mx-auto">
            <h1 className={`text-3xl font-bold mb-8 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {editingProperty ? 'İlanı Düzenle' : 'Yeni İlan Oluştur'}
            </h1>
            <form onSubmit={handleSubmit} className={`p-8 rounded-2xl shadow-xl ${theme === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-gray-100'}`}>
                
                <div className="space-y-6">
                    <div>
                        <label className={labelClass}>İlan Başlığı</label>
                        <input required type="text" name="title" defaultValue={editingProperty?.title} className={inputClass} placeholder="Örn: Gültepe'de Satılık Lüks Daire" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className={labelClass}>İl</label>
                            <select required name="province" value={locationState.province} onChange={handleLocationChange} className={inputClass}>
                                <option value="">Seçiniz</option>
                                {Object.keys(locationsData).map(city => <option key={city} value={city}>{city}</option>)}
                            </select>
                        </div>
                        <div>
                             <label className={labelClass}>İlçe</label>
                             <select required name="district" value={locationState.district} onChange={handleLocationChange} className={inputClass}>
                                 <option>Seçiniz</option>
                                 {locationState.province && locationsData[locationState.province] && Object.keys(locationsData[locationState.province]).map(d => <option key={d} value={d}>{d}</option>)}
                             </select>
                        </div>
                        <div>
                             <label className={labelClass}>Mahalle</label>
                             <select required name="neighborhood" value={locationState.neighborhood} onChange={handleLocationChange} className={inputClass}>
                                 <option>Seçiniz</option>
                                 {locationState.province && locationState.district && locationsData[locationState.province][locationState.district].map((n: string) => <option key={n} value={n}>{n}</option>)}
                             </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClass}>Fiyat (TL)</label>
                            <input required name="price" type="number" min="0" defaultValue={editingProperty?.price} className={inputClass} />
                        </div>
                        <div>
                             <label className={labelClass}>Kategori</label>
                             <select name="category" defaultValue={editingProperty?.category} className={inputClass}>
                                 <option value="Konut">Konut</option>
                                 <option value="Ticari">Ticari</option>
                                 <option value="Arsa">Arsa</option>
                             </select>
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
                        <div>
                             <label className={labelClass}>Oda Sayısı</label>
                             <select name="bedrooms" defaultValue={editingProperty?.bedrooms} className={inputClass}>
                                 <option>1+1</option>
                                 <option>2+1</option>
                                 <option>3+1</option>
                                 <option>4+1</option>
                                 <option>4.5+1</option>
                                 <option>5+1</option>
                             </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        <div>
                             <label className={labelClass}>Eşyalı mı?</label>
                             <select name="is_furnished" defaultValue={editingProperty?.isFurnished ? "1" : "0"} className={inputClass}>
                                 <option value="0">Hayır</option>
                                 <option value="1">Evet</option>
                             </select>
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
                        <label className={labelClass}>Fotoğraflar</label>
                        <div 
                            onClick={() => !isCompressing && fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 relative 
                                ${theme === 'dark' ? 'border-zinc-700 hover:border-dies-red hover:bg-zinc-800' : 'border-gray-300 hover:border-dies-red hover:bg-gray-50'} 
                                ${isCompressing ? 'opacity-50 cursor-not-allowed' : ''}
                                ${isDragging ? 'border-dies-red bg-dies-red/5 scale-[1.02]' : ''}
                            `}
                        >
                            {isCompressing ? (
                                <div className="flex flex-col items-center justify-center text-dies-red">
                                    <RefreshCw className="animate-spin mb-2 w-10 h-10" />
                                    <p className="font-bold">Fotoğraflar İşleniyor...</p>
                                </div>
                            ) : (
                                <>
                                    <UploadCloud className={`mx-auto mb-2 w-12 h-12 ${isDragging ? 'text-dies-red' : 'text-gray-400'}`} />
                                    <p className="font-bold text-lg mb-1">Fotoğrafları Buraya Sürükleyin veya Seçin</p>
                                    <p className="text-gray-500 text-sm">JPG, PNG (Max 15 Fotoğraf)</p>
                                    <p className="text-xs text-gray-400 mt-2">10MB üzeri görseller otomatik sıkıştırılır.</p>
                                </>
                            )}
                            <input disabled={isCompressing} ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                        </div>
                        
                        {previews.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
                                {previews.map((src, i) => (
                                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-dies-red/50 bg-black/50">
                                        <img src={src} className="w-full h-full object-cover" alt={`Preview ${i}`} />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button type="button" onClick={() => removeImage(i)} className="bg-red-600 text-white p-2 rounded-full transform hover:scale-110 transition-transform">
                                                <X size={16}/>
                                            </button>
                                        </div>
                                        {i === 0 && (
                                            <div className="absolute top-2 left-2 bg-dies-red text-white text-[10px] font-bold px-2 py-1 rounded">
                                                KAPAK
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button disabled={isCompressing} type="submit" className={`w-full bg-dies-red text-white py-4 rounded-lg font-bold hover:bg-red-700 shadow-lg transform transition hover:scale-[1.01] flex items-center justify-center gap-2 ${isCompressing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                         <CheckCircle size={20} /> {editingProperty ? 'DEĞİŞİKLİKLERİ KAYDET' : 'İLANI YAYINLA'}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};