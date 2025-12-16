
import React, { useState } from 'react';
// @ts-ignore
import { useParams } from 'react-router-dom';
import { MOCK_ADVISORS, MOCK_PROPERTIES } from '../services/mockData';
import { PropertyCard } from '../components/PropertyCard';
import { Phone, MessageCircle, MapPin, Award, Layout } from 'lucide-react';
import { DiesLogoIcon } from '../components/Icons';

export const AdvisorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'about' | 'portfolio'>('portfolio');
  
  const advisor = MOCK_ADVISORS.find(a => a.id === parseInt(id || '0'));
  
  if (!advisor) return <div className="pt-32 text-center">Danışman Bulunamadı</div>;
  
  const listings = MOCK_PROPERTIES.filter(p => p.advisorId === advisor.id);
  
  // Calculate Dynamic Stats
  const activeListingsCount = listings.filter(p => p.type !== 'Satıldı' && p.type !== 'Kiralandı' && p.type !== 'pending').length;
  const experienceYears = advisor.stats?.experience || 1; // Default fallback

  // Clean phone number for WhatsApp link
  const whatsappNumber = advisor.phone.replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen pb-20 pt-32 bg-gray-50">
      <div className="container mx-auto px-4">
        
        {/* PROFILE CARD */}
        <div className="rounded-3xl overflow-hidden shadow-xl mb-12 bg-white border border-gray-100">
            <div className="flex flex-col md:flex-row">
                
                {/* Left: Image */}
                <div className="w-full md:w-1/3 lg:w-1/4 relative bg-gray-200">
                    <div className="aspect-[3/4] md:aspect-auto md:h-full relative">
                        <img 
                            src={advisor.image} 
                            alt={advisor.name} 
                            className="w-full h-full object-cover"
                        />
                        {/* Dies Logo Watermark - Using the Component now */}
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-2 rounded-lg shadow-lg">
                             <DiesLogoIcon className="h-8 w-auto" />
                        </div>
                    </div>
                </div>

                {/* Right: Info & Actions */}
                <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
                    <div className="mb-6">
                        <h1 className="text-4xl font-extrabold mb-2 text-dies-dark">{advisor.name}</h1>
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <span className="bg-dies-red/10 text-dies-red px-3 py-1 rounded-full font-bold uppercase tracking-wide text-xs">{advisor.role}</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-500 font-medium">Dies Emlak Gayrimenkul</span>
                        </div>
                        
                        <div className="flex flex-col gap-3 text-gray-600 mb-8">
                            <div className="flex items-center gap-3">
                                <MapPin size={18} className="text-dies-blue" />
                                <span>Batman, Merkez Ofis</span>
                            </div>
                            
                            {/* Dynamic Stats in Header - Removed Sales Count */}
                            <div className="flex gap-6 mt-2">
                                <div className="flex items-center gap-2 text-dies-dark font-bold">
                                    <Layout size={18} className="text-dies-blue" />
                                    <span>{activeListingsCount} Aktif İlan</span>
                                </div>
                                <div className="flex items-center gap-2 text-dies-dark font-bold">
                                    <Award size={18} className="text-green-600" />
                                    <span>{experienceYears}+ Yıl Deneyim</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-auto">
                        <a 
                            href={`tel:${advisor.phone}`} 
                            className="flex items-center justify-center gap-2 bg-dies-blue hover:bg-blue-900 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 hover:-translate-y-1"
                        >
                            <Phone size={20} />
                            Hemen Ara
                        </a>
                        <a 
                            href={`https://wa.me/${whatsappNumber}?text=Merhaba, ilanlarınız hakkında bilgi almak istiyorum.`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fb855] text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-green-500/20 hover:-translate-y-1"
                        >
                            <MessageCircle size={20} />
                            WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </div>

        {/* CONTENT TABS */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Main Content Area */}
            <div className="lg:col-span-4">
                {/* Tabs Header */}
                <div className="flex justify-center md:justify-start border-b border-gray-200 mb-10">
                    <button 
                        onClick={() => setActiveTab('portfolio')}
                        className={`px-8 py-4 font-bold text-sm uppercase tracking-wider border-b-4 transition-all ${activeTab === 'portfolio' ? 'border-dies-blue text-dies-blue' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        Portföylerim <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full ml-2">{listings.length}</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('about')}
                        className={`px-8 py-4 font-bold text-sm uppercase tracking-wider border-b-4 transition-all ${activeTab === 'about' ? 'border-dies-blue text-dies-blue' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        Hakkımda
                    </button>
                </div>

                {/* Tab Content */}
                <div className="min-h-[400px]">
                    {activeTab === 'portfolio' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {listings.length > 0 ? (
                                listings.map(p => <PropertyCard key={p.id} property={p} />)
                            ) : (
                                <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="bg-gray-50 p-4 rounded-full mb-4">
                                        <Award size={32} />
                                    </div>
                                    <p>Şu an aktif ilan bulunmamaktadır.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'about' && (
                        <div className="bg-white p-10 rounded-2xl border border-gray-100 shadow-soft max-w-4xl mx-auto">
                            <h3 className="text-2xl font-bold mb-6 text-dies-dark">Profesyonel Biyografi</h3>
                            <p className="leading-8 text-gray-600 whitespace-pre-line text-lg">
                                {advisor.about || "Danışman hakkında detaylı bilgi bulunmamaktadır."}
                            </p>
                            
                            <div className="mt-10 pt-10 border-t border-gray-100">
                                <h4 className="font-bold mb-6 text-dies-dark uppercase tracking-wide text-sm">Uzmanlık Alanları</h4>
                                <div className="flex flex-wrap gap-3">
                                    {advisor.specializations && advisor.specializations.length > 0 ? advisor.specializations.map((tag, i) => (
                                        <span key={i} className="px-5 py-2.5 rounded-full text-sm font-bold bg-gray-50 text-dies-blue border border-gray-100 hover:bg-dies-blue hover:text-white transition-colors cursor-default">
                                            {tag}
                                        </span>
                                    )) : (
                                        <span className="text-gray-500 italic">Belirtilmemiş</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
