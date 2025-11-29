import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MOCK_PROPERTIES, MOCK_ADVISORS } from '../services/mockData';
import { Property } from '../types';
import { MapPin, Bed, Bath, Square, Phone, CheckCircle, ChevronLeft, ChevronRight, Image as ImageIcon, Maximize2, X, AlertTriangle } from 'lucide-react';
import { useTheme } from '../components/ThemeContext';

export const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { theme } = useTheme();
  const [property, setProperty] = useState<Property | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
        const found = MOCK_PROPERTIES.find(p => p.id === parseInt(id));
        setProperty(found || null);
    }
  }, [id]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!isFullScreen && !property) return;
        
        if (e.key === 'ArrowRight') nextSlide();
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'Escape') setIsFullScreen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen, property, currentImageIndex]);

  if (!property) return <div className="min-h-screen flex items-center justify-center pt-20">Yükleniyor...</div>;

  const advisor = MOCK_ADVISORS.find(a => a.id === property.advisorId);
  
  // Create a gallery array including the main image and any additional images
  const allImages = property.images && property.images.length > 0 
    ? (property.image ? [property.image, ...property.images.filter(img => img !== property.image)] : property.images)
    : [property.image];
    
  // Deduplicate images just in case
  const uniqueImages = Array.from(new Set(allImages));

  const nextSlide = () => {
    setCurrentImageIndex((prev) => (prev === uniqueImages.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? uniqueImages.length - 1 : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="pb-20">
        {/* FULL SCREEN MODAL */}
        {isFullScreen && (
            <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
                <button 
                    onClick={() => setIsFullScreen(false)}
                    className="absolute top-4 right-4 text-white hover:text-dies-red z-50 p-2"
                >
                    <X size={32} />
                </button>

                <div className="relative w-full h-full flex items-center justify-center">
                    <img 
                        src={uniqueImages[currentImageIndex]} 
                        alt={`Full screen ${currentImageIndex}`} 
                        className="max-w-full max-h-full object-contain"
                    />
                    
                     {uniqueImages.length > 1 && (
                        <>
                            <button 
                                onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                                className="absolute left-4 bg-black/50 hover:bg-dies-red text-white p-3 rounded-full transition-all"
                            >
                                <ChevronLeft size={32} />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                                className="absolute right-4 bg-black/50 hover:bg-dies-red text-white p-3 rounded-full transition-all"
                            >
                                <ChevronRight size={32} />
                            </button>
                        </>
                    )}
                    
                    <div className="absolute bottom-4 bg-black/50 text-white px-4 py-2 rounded-full">
                        {currentImageIndex + 1} / {uniqueImages.length}
                    </div>
                </div>
            </div>
        )}

        {/* Hero / Gallery Section */}
        <div className="w-full h-[50vh] md:h-[60vh] relative group bg-black">
            
            {/* Main Image */}
            <div className="w-full h-full relative cursor-pointer" onClick={() => setIsFullScreen(true)}>
                <img 
                    src={uniqueImages[currentImageIndex]} 
                    alt={property.title} 
                    className="w-full h-full object-cover transition-opacity duration-500" 
                />
                
                {/* Full Screen Trigger */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                     <div className="bg-black/40 backdrop-blur-sm text-white px-4 py-2 rounded-full flex items-center gap-2">
                         <Maximize2 size={20} /> Tam Ekran
                     </div>
                </div>

                {/* Navigation Arrows (Only if multiple images) */}
                {uniqueImages.length > 1 && (
                    <>
                        <button 
                            onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                            className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/50 hover:bg-dies-red text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 z-20"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                            className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/50 hover:bg-dies-red text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 z-20"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}
            </div>

            {/* Gradient Overlay for Text Visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90 pointer-events-none"></div>
            
            {/* Property Info Overlay */}
            <div className="absolute bottom-0 w-full container mx-auto px-4 pb-8 z-10 flex flex-col md:flex-row items-end justify-between gap-4">
                 <div className="flex-1 pointer-events-auto">
                     <span className={`inline-block px-4 py-1 mb-3 text-sm font-bold uppercase rounded text-white ${property.type === 'Satılık' ? 'bg-dies-red' : 'bg-blue-600'}`}>
                        {property.type}
                     </span>
                     <h1 className="text-2xl md:text-5xl font-bold text-white mb-2 leading-tight drop-shadow-md">{property.title}</h1>
                     <div className="flex items-center gap-4">
                         <div className="text-3xl md:text-4xl font-bold text-white drop-shadow-md">
                             {property.price.toLocaleString('tr-TR')} {property.currency}
                         </div>
                         <div className="hidden md:flex items-center gap-2 text-white/80">
                             <MapPin size={18} />
                             {property.location}
                         </div>
                     </div>
                 </div>

                 {/* Thumbnails (Desktop) */}
                 {uniqueImages.length > 1 && (
                     <div className="hidden md:flex gap-2 p-2 bg-black/40 backdrop-blur-sm rounded-xl max-w-md overflow-x-auto pointer-events-auto">
                         {uniqueImages.map((img, idx) => (
                             <button 
                                key={idx} 
                                onClick={() => goToSlide(idx)}
                                className={`relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${currentImageIndex === idx ? 'border-dies-red scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
                             >
                                 <img src={img} alt={`Slide ${idx}`} className="w-full h-full object-cover" />
                             </button>
                         ))}
                     </div>
                 )}
            </div>
            
            {/* Image Counter Badge */}
            {uniqueImages.length > 1 && (
                <div className="absolute top-24 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 z-10 backdrop-blur-sm">
                    <ImageIcon size={14} />
                    {currentImageIndex + 1} / {uniqueImages.length}
                </div>
            )}
        </div>

        <div className="container mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                {/* Details Grid */}
                <div className={`p-6 rounded-xl border flex justify-around text-center ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
                     <div><Square className="text-dies-red mx-auto mb-1" /><span className={theme === 'dark'?'text-white':'text-black'}>{property.area} m²</span></div>
                     <div><Bed className="text-dies-red mx-auto mb-1" /><span className={theme === 'dark'?'text-white':'text-black'}>{property.bedrooms}</span></div>
                     <div><Bath className="text-dies-red mx-auto mb-1" /><span className={theme === 'dark'?'text-white':'text-black'}>{property.bathrooms}</span></div>
                </div>

                <div className={`p-8 rounded-xl border ${theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-gray-200'}`}>
                    <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Açıklama</h3>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-line leading-relaxed`}>{property.description}</p>
                </div>

                <div className={`p-8 rounded-xl border ${theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-gray-200'}`}>
                    <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Özellikler</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {property.features.map((f, i) => (
                            <div key={i} className="flex items-center gap-2"><CheckCircle size={16} className="text-dies-red flex-shrink-0" /><span className={theme === 'dark'?'text-gray-300':'text-gray-700'}>{f}</span></div>
                        ))}
                    </div>
                </div>

                {/* Missed Opportunities Section */}
                <div className={`mt-12 p-8 rounded-xl border ${theme === 'dark' ? 'bg-zinc-900/30 border-zinc-800' : 'bg-gray-50 border-gray-200'}`}>
                     <div className="flex items-center gap-2 mb-4">
                         <AlertTriangle className="text-yellow-500" />
                         <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Kaçırdığınız Fırsatlar</h3>
                     </div>
                     <p className="text-sm text-gray-500 mb-6">Bu bölgede yakın zamanda satılan veya kiralanan benzer portföyler.</p>
                     
                     <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
                         {MOCK_PROPERTIES.filter(p => p.type === 'Satıldı' || p.type === 'Kiralandı').slice(0, 5).map(soldProp => (
                             <div key={soldProp.id} className="min-w-[250px] rounded-lg overflow-hidden border opacity-75 grayscale hover:grayscale-0 transition-all">
                                 <div className="h-32 relative">
                                     <img src={soldProp.image} className="w-full h-full object-cover" />
                                     <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                         <span className="text-white font-bold border-2 border-white px-2 py-1 -rotate-12 uppercase">{soldProp.type}</span>
                                     </div>
                                 </div>
                                 <div className={`p-3 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
                                     <h4 className={`text-sm font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{soldProp.title}</h4>
                                     <p className="text-xs text-gray-500">{soldProp.price.toLocaleString()} {soldProp.currency}</p>
                                 </div>
                             </div>
                         ))}
                     </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className={`p-6 rounded-xl border sticky top-24 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200 shadow-lg'}`}>
                    <div className="flex items-center gap-4 mb-6">
                        <img src={advisor?.image} className="w-16 h-16 rounded-full object-cover border-2 border-dies-red" alt={advisor?.name} />
                        <div>
                            <div className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{advisor?.name}</div>
                            <div className="text-dies-red text-xs uppercase font-medium">{advisor?.role}</div>
                        </div>
                    </div>
                    {/* Clickable Phone */}
                    <a href={`tel:${advisor?.phone}`} className="flex items-center justify-center gap-2 w-full bg-dies-red text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors">
                        <Phone size={18} /> {advisor?.phone}
                    </a>
                    
                    {advisor?.sahibindenLink && (
                        <a href={advisor.sahibindenLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full mt-3 bg-yellow-400 text-black py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors">
                            Sahibinden Profili
                        </a>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};