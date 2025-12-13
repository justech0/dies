
import React, { useEffect, useState } from 'react';
// @ts-ignore
import { useParams } from 'react-router-dom';
import { MOCK_PROPERTIES, MOCK_ADVISORS, MOCK_USERS } from '../services/mockData';
import { Property, Advisor, User } from '../types';
import { MapPin, Bed, Bath, Square, Phone, CheckCircle, ChevronLeft, ChevronRight, Image as ImageIcon, Maximize2, X, AlertTriangle, MessageCircle } from 'lucide-react';

export const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
        // Find property in the mutable mock data
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

  // Contact Info Logic: Try to find an Advisor first, if not, find the User (for regular user listings)
  const advisor = MOCK_ADVISORS.find(a => a.id === property.advisorId);
  const userContact = !advisor ? MOCK_USERS.find(u => u.id === property.advisorId) : null;
  
  // Normalize contact data for display
  const contactName = advisor ? advisor.name : (userContact ? userContact.name : 'İlan Sahibi');
  const contactRole = advisor ? advisor.role : 'İlan Sahibi';
  const contactImage = advisor ? advisor.image : (userContact?.image || 'https://via.placeholder.com/150');
  const contactPhone = advisor ? advisor.phone : (userContact?.phone || '');
  const contactSahibinden = advisor?.sahibindenLink;

  // Prepare WhatsApp Link
  const cleanPhone = contactPhone.replace(/[^0-9]/g, '');
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
            <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
                <button 
                    onClick={() => setIsFullScreen(false)}
                    className="absolute top-4 right-4 text-white hover:text-dies-blue z-50 p-2"
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
                                className="absolute left-4 bg-black/50 hover:bg-dies-blue text-white p-3 rounded-full transition-all"
                            >
                                <ChevronLeft size={32} />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                                className="absolute right-4 bg-black/50 hover:bg-dies-blue text-white p-3 rounded-full transition-all"
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

                {/* Navigation Arrows */}
                {uniqueImages.length > 1 && (
                    <>
                        <button 
                            onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                            className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/20 hover:bg-dies-blue text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-md z-20"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                            className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/20 hover:bg-dies-blue text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-md z-20"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 pointer-events-none"></div>
            
            {/* Property Info Overlay */}
            <div className="absolute bottom-0 w-full container mx-auto px-4 pb-8 z-10 flex flex-col md:flex-row items-end justify-between gap-4">
                 <div className="flex-1 pointer-events-auto">
                     <span className={`inline-block px-4 py-1.5 mb-3 text-sm font-bold uppercase tracking-wider rounded text-white shadow-lg ${property.type === 'Satılık' ? 'bg-dies-red' : 'bg-dies-blue'}`}>
                        {property.type}
                     </span>
                     <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 leading-tight drop-shadow-xl">{property.title}</h1>
                     <div className="flex items-center gap-6 mt-4">
                         <div className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                             {property.price.toLocaleString('tr-TR')} {property.currency}
                         </div>
                         <div className="hidden md:flex items-center gap-2 text-white/90 font-medium">
                             <MapPin size={20} className="text-dies-red" />
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

        <div className="container mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                {/* Details Grid */}
                <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-soft flex justify-around text-center divide-x divide-gray-100">
                     <div className="px-4"><Square className="text-dies-blue mx-auto mb-2 w-8 h-8" /><span className="text-dies-dark font-bold text-lg block">{property.area} m²</span><span className="text-xs text-gray-400 uppercase">Brüt Alan</span></div>
                     <div className="px-4"><Bed className="text-dies-blue mx-auto mb-2 w-8 h-8" /><span className="text-dies-dark font-bold text-lg block">{property.bedrooms}</span><span className="text-xs text-gray-400 uppercase">Oda</span></div>
                     <div className="px-4"><Bath className="text-dies-blue mx-auto mb-2 w-8 h-8" /><span className="text-dies-dark font-bold text-lg block">{property.bathrooms}</span><span className="text-xs text-gray-400 uppercase">Banyo</span></div>
                </div>

                <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-soft">
                    <h3 className="text-2xl font-bold mb-6 text-dies-dark border-b border-gray-100 pb-4">Açıklama</h3>
                    <p className="text-gray-600 whitespace-pre-line leading-relaxed text-lg">{property.description}</p>
                </div>

                <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-soft">
                    <h3 className="text-2xl font-bold mb-6 text-dies-dark border-b border-gray-100 pb-4">Özellikler</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                        {property.features.map((f, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="bg-blue-50 p-1 rounded-full">
                                    <CheckCircle size={16} className="text-dies-blue flex-shrink-0" />
                                </div>
                                <span className="text-gray-700 font-medium">{f}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Similar Sold Properties */}
                <div className="mt-12 p-8 rounded-2xl bg-gray-100 border border-gray-200">
                     <div className="flex items-center gap-3 mb-4">
                         <AlertTriangle className="text-dies-blue" />
                         <h3 className="text-xl font-bold text-dies-dark">Bölgedeki Piyasa Analizi</h3>
                     </div>
                     <p className="text-sm text-gray-500 mb-6">Bu bölgede yakın zamanda işlem gören benzer mülkler.</p>
                     
                     <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                         {MOCK_PROPERTIES.filter(p => (p.type === 'Satıldı' || p.type === 'Kiralandı') && p.id !== property.id).slice(0, 5).map(soldProp => (
                             <div key={soldProp.id} className="min-w-[260px] rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all border border-gray-200">
                                 <div className="h-36 relative grayscale opacity-90">
                                     <img src={soldProp.image} className="w-full h-full object-cover" alt={soldProp.title} />
                                     <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                         <span className="text-white font-extrabold border-2 border-white px-3 py-1 -rotate-12 uppercase tracking-widest">{soldProp.type}</span>
                                     </div>
                                 </div>
                                 <div className="p-4">
                                     <h4 className="text-sm font-bold truncate text-dies-dark mb-1">{soldProp.title}</h4>
                                     <p className="text-sm text-dies-blue font-bold">{soldProp.price.toLocaleString()} {soldProp.currency}</p>
                                 </div>
                             </div>
                         ))}
                     </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-lg sticky top-28">
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                        <img src={contactImage} className="w-20 h-20 rounded-full object-cover border-4 border-gray-50 shadow-sm" alt={contactName} />
                        <div>
                            <div className="text-xs text-gray-400 font-bold uppercase tracking-wide">İlan Danışmanı</div>
                            <div className="font-bold text-xl text-dies-dark">{contactName}</div>
                            <div className="text-dies-red text-sm font-bold">{contactRole}</div>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <a href={`tel:${contactPhone}`} className="flex items-center justify-center gap-3 w-full bg-dies-blue text-white py-4 rounded-xl font-bold hover:bg-blue-900 transition-all shadow-lg shadow-blue-900/20">
                            <Phone size={20} /> Hemen Ara
                        </a>

                        {/* WhatsApp Button */}
                        <a 
                            href={whatsappLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-3 w-full bg-[#25D366] text-white py-4 rounded-xl font-bold hover:bg-[#20b85a] transition-all shadow-lg shadow-green-500/20"
                        >
                            <MessageCircle size={20} /> Mesaj Gönder
                        </a>
                        
                        {contactSahibinden && (
                            <a href={contactSahibinden} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full bg-[#FFE800] text-black py-4 rounded-xl font-bold hover:bg-yellow-400 transition-colors shadow-md">
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
