
import React, { useEffect, useState } from 'react';
// @ts-ignore
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { Property, Advisor, User } from '../types';
import { MapPin, Bed, Bath, Square, Phone, CheckCircle, ChevronLeft, ChevronRight, Image as ImageIcon, Maximize2, X, AlertTriangle, MessageCircle } from 'lucide-react';

export const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [advisor, setAdvisor] = useState<Advisor | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const prop = await api.properties.getDetail(id);
            setProperty(prop);
            
            if (prop && prop.advisorId) {
                // Try to fetch advisor details
                try {
                    const adv = await api.advisors.getDetail(prop.advisorId);
                    setAdvisor(adv);
                } catch (e) {
                    console.warn("Could not fetch advisor detail", e);
                }
            }
        } catch (error) {
            console.error("Failed to fetch property", error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
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

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-20">Yükleniyor...</div>;
  if (!property) return <div className="min-h-screen flex items-center justify-center pt-20">İlan bulunamadı.</div>;

  // Contact Info Logic
  const contactName = advisor ? advisor.name : 'İlan Sahibi';
  const contactRole = advisor ? advisor.role : 'Gayrimenkul Danışmanı';
  const contactImage = advisor ? advisor.image : 'https://via.placeholder.com/150';
  const contactPhone = advisor ? advisor.phone : '';
  const contactSahibinden = advisor?.sahibindenLink;

  // Prepare WhatsApp Link
  const cleanPhone = contactPhone ? contactPhone.replace(/[^0-9]/g, '') : '';
  const whatsappLink = `https://wa.me/${cleanPhone}?text=Merhaba, ${property.title} (İlan No: ${property.id}) hakkında bilgi almak istiyorum.`;

  
  const allImages = property.images && property.images.length > 0 
    ? (property.image ? [property.image, ...property.images.filter(img => img !== property.image)] : property.images)
    : [property.image];
    
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
    <div className="pb-20 bg-gray-50">
        {/* FULL SCREEN MODAL */}
        {isFullScreen && (
            <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4">
                <button 
                    onClick={() => setIsFullScreen(false)}
                    className="absolute top-4 right-4 text-white hover:text-dies-blue z-50 p-2 bg-black/30 rounded-full"
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
                                className="absolute left-2 md:left-4 bg-black/50 hover:bg-dies-blue text-white p-2 md:p-3 rounded-full transition-all"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                                className="absolute right-2 md:right-4 bg-black/50 hover:bg-dies-blue text-white p-2 md:p-3 rounded-full transition-all"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </>
                    )}
                    
                    <div className="absolute bottom-4 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                        {currentImageIndex + 1} / {uniqueImages.length}
                    </div>
                </div>
            </div>
        )}

        {/* Hero / Gallery Section */}
        <div className="w-full h-[50vh] md:h-[65vh] relative group bg-gray-900">
            
            {/* Main Image */}
            <div className="w-full h-full relative cursor-pointer" onClick={() => setIsFullScreen(true)}>
                <img 
                    src={uniqueImages[currentImageIndex]} 
                    alt={property.title} 
                    className="w-full h-full object-cover transition-opacity duration-500" 
                />
                
                {/* Full Screen Trigger */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                     <div className="bg-black/60 backdrop-blur-sm text-white px-6 py-3 rounded-full flex items-center gap-2 font-bold shadow-2xl transform scale-105">
                         <Maximize2 size={20} /> Fotoğrafları İncele
                     </div>
                </div>

                {/* Navigation Arrows (Hidden on mobile usually swipe is preferred, but arrows ok for now) */}
                {uniqueImages.length > 1 && (
                    <>
                        <button 
                            onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                            className="absolute top-1/2 left-2 md:left-4 -translate-y-1/2 bg-white/20 hover:bg-dies-blue text-white p-2 md:p-3 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 backdrop-blur-md z-20"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                            className="absolute top-1/2 right-2 md:right-4 -translate-y-1/2 bg-white/20 hover:bg-dies-blue text-white p-2 md:p-3 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 backdrop-blur-md z-20"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </>
                )}
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 pointer-events-none"></div>
            
            {/* Property Info Overlay */}
            <div className="absolute bottom-0 w-full container mx-auto px-4 pb-6 md:pb-8 z-10 flex flex-col md:flex-row items-end justify-between gap-4">
                 <div className="flex-1 pointer-events-auto w-full">
                     <span className={`inline-block px-3 py-1 mb-2 text-xs md:text-sm font-bold uppercase tracking-wider rounded text-white shadow-lg ${property.type === 'Satılık' ? 'bg-dies-red' : 'bg-dies-blue'}`}>
                        {property.type}
                     </span>
                     <h1 className="text-2xl md:text-5xl font-extrabold text-white mb-2 leading-tight drop-shadow-xl line-clamp-2 md:line-clamp-none">{property.title}</h1>
                     <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 mt-2 md:mt-4">
                         <div className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg w-fit bg-white/10 px-3 py-1 md:px-4 md:py-2 rounded-lg backdrop-blur-sm">
                             {property.price.toLocaleString('tr-TR')} {property.currency}
                         </div>
                         <div className="flex items-center gap-2 text-white/90 font-medium text-sm md:text-base">
                             <MapPin size={16} className="text-dies-red" />
                             {property.location}
                         </div>
                     </div>
                 </div>

                 {/* Thumbnails (Desktop) */}
                 {uniqueImages.length > 1 && (
                     <div className="hidden md:flex gap-2 p-2 bg-white/10 backdrop-blur-md rounded-xl max-w-md overflow-x-auto pointer-events-auto border border-white/20">
                         {uniqueImages.map((img, idx) => (
                             <button 
                                key={idx} 
                                onClick={() => goToSlide(idx)}
                                className={`relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${currentImageIndex === idx ? 'border-dies-red scale-105 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'}`}
                             >
                                 <img src={img} alt={`Slide ${idx}`} className="w-full h-full object-cover" />
                             </button>
                         ))}
                     </div>
                 )}
            </div>
            
            <div className="absolute top-24 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 z-10 backdrop-blur-sm border border-white/10">
                <ImageIcon size={14} />
                {currentImageIndex + 1} / {uniqueImages.length}
            </div>
        </div>

        <div className="container mx-auto px-4 mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
                {/* Details Grid */}
                <div className="p-6 md:p-8 rounded-2xl bg-white border border-gray-100 shadow-soft flex justify-around text-center divide-x divide-gray-100">
                     <div className="px-2 md:px-4"><Square className="text-dies-blue mx-auto mb-2 w-6 h-6 md:w-8 md:h-8" /><span className="text-dies-dark font-bold text-base md:text-lg block">{property.area} m²</span><span className="text-[10px] md:text-xs text-gray-400 uppercase">Brüt Alan</span></div>
                     <div className="px-2 md:px-4"><Bed className="text-dies-blue mx-auto mb-2 w-6 h-6 md:w-8 md:h-8" /><span className="text-dies-dark font-bold text-base md:text-lg block">{property.bedrooms}</span><span className="text-[10px] md:text-xs text-gray-400 uppercase">Oda</span></div>
                     <div className="px-2 md:px-4"><Bath className="text-dies-blue mx-auto mb-2 w-6 h-6 md:w-8 md:h-8" /><span className="text-dies-dark font-bold text-base md:text-lg block">{property.bathrooms}</span><span className="text-[10px] md:text-xs text-gray-400 uppercase">Banyo</span></div>
                </div>

                <div className="p-6 md:p-8 rounded-2xl bg-white border border-gray-100 shadow-soft">
                    <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-dies-dark border-b border-gray-100 pb-4">Açıklama</h3>
                    <p className="text-gray-600 whitespace-pre-line leading-relaxed text-base md:text-lg">{property.description}</p>
                </div>

                <div className="p-6 md:p-8 rounded-2xl bg-white border border-gray-100 shadow-soft">
                    <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-dies-dark border-b border-gray-100 pb-4">Özellikler</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 md:gap-y-4 gap-x-4 md:gap-x-8">
                        {property.features.map((f, i) => (
                            <div key={i} className="flex items-center gap-2 md:gap-3">
                                <div className="bg-blue-50 p-1 rounded-full">
                                    <CheckCircle size={14} className="text-dies-blue flex-shrink-0 md:w-4 md:h-4" />
                                </div>
                                <span className="text-gray-700 font-medium text-sm md:text-base">{f}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Info Alert */}
                <div className="mt-8 md:mt-12 p-6 md:p-8 rounded-2xl bg-gray-100 border border-gray-200">
                     <div className="flex items-center gap-3 mb-4">
                         <AlertTriangle className="text-dies-blue" />
                         <h3 className="text-lg md:text-xl font-bold text-dies-dark">Bilgilendirme</h3>
                     </div>
                     <p className="text-xs md:text-sm text-gray-500">
                         İlan bilgileri ilan sahibi tarafından girilmiştir. Dies Gayrimenkul hatalı bilgilerden sorumlu tutulamaz. Detaylı bilgi için danışmanımızla iletişime geçiniz.
                     </p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-lg sticky top-24 md:top-28">
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                        <img src={contactImage} className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-4 border-gray-50 shadow-sm" alt={contactName} />
                        <div>
                            <div className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-wide">İlan Danışmanı</div>
                            <div className="font-bold text-lg md:text-xl text-dies-dark">{contactName}</div>
                            <div className="text-dies-red text-xs md:text-sm font-bold">{contactRole}</div>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <a href={`tel:${contactPhone}`} className="flex items-center justify-center gap-3 w-full bg-dies-blue text-white py-3 md:py-4 rounded-xl font-bold hover:bg-blue-900 transition-all shadow-lg shadow-blue-900/20 text-sm md:text-base">
                            <Phone size={18} /> Hemen Ara
                        </a>

                        {/* WhatsApp Button */}
                        <a 
                            href={whatsappLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-3 w-full bg-[#25D366] text-white py-3 md:py-4 rounded-xl font-bold hover:bg-[#20b85a] transition-all shadow-lg shadow-green-500/20 text-sm md:text-base"
                        >
                            <MessageCircle size={18} /> Mesaj Gönder
                        </a>
                        
                        {contactSahibinden && (
                            <a href={contactSahibinden} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full bg-[#FFE800] text-black py-3 md:py-4 rounded-xl font-bold hover:bg-yellow-400 transition-colors shadow-md text-sm md:text-base">
                                Sahibinden Profili
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
