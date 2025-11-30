import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MOCK_ADVISORS, MOCK_PROPERTIES } from '../services/mockData';
import { PropertyCard } from '../components/PropertyCard';
import { Phone, Mail, MessageCircle, MapPin } from 'lucide-react';
import { useTheme } from '../components/ThemeContext';
import { DiesLogoIcon } from '../components/Icons';

export const AdvisorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'about' | 'portfolio'>('portfolio');
  
  const advisor = MOCK_ADVISORS.find(a => a.id === parseInt(id || '0'));
  
  if (!advisor) return <div className="pt-32 text-center">Danışman Bulunamadı</div>;
  
  const listings = MOCK_PROPERTIES.filter(p => p.advisorId === advisor.id);

  // Clean phone number for WhatsApp link
  const whatsappNumber = advisor.phone.replace(/[^0-9]/g, '');

  return (
    <div className={`min-h-screen pb-20 pt-32 ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4">
        
        {/* PROFILE CARD */}
        <div className={`rounded-2xl overflow-hidden shadow-xl mb-8 ${theme === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-gray-200'}`}>
            <div className="flex flex-col md:flex-row">
                
                {/* Left: Image */}
                <div className="w-full md:w-1/3 lg:w-1/4 relative">
                    <div className="aspect-[3/4] md:aspect-auto md:h-full relative">
                        <img 
                            src={advisor.image} 
                            alt={advisor.name} 
                            className="w-full h-full object-cover"
                        />
                        {/* Dies Logo Watermark */}
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-2 rounded-lg shadow-lg">
                            <DiesLogoIcon className="w-8 h-8 text-black" />
                        </div>
                    </div>
                </div>

                {/* Right: Info & Actions */}
                <div className="flex-1 p-8 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h1 className={`text-3xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{advisor.name}</h1>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-dies-red font-bold uppercase tracking-wide text-sm">{advisor.role}</span>
                                <span className="text-gray-400 text-xs">•</span>
                                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Dies Emlak Gayrimenkul</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 mb-8">
                        <div className="flex items-center gap-3 text-sm">
                            <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-zinc-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                <MapPin size={16} />
                            </div>
                            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Batman, Merkez</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-zinc-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                <Mail size={16} />
                            </div>
                            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>info@diesemlak.com</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-auto">
                        <a 
                            href={`tel:${advisor.phone}`} 
                            className="flex items-center justify-center gap-2 bg-dies-red hover:bg-red-700 text-white py-3 rounded-lg font-bold transition-colors shadow-lg shadow-dies-red/20"
                        >
                            <Phone size={18} />
                            Bana Ulaşın
                        </a>
                        <a 
                            href={`https://wa.me/${whatsappNumber}?text=Merhaba, ilanlarınız hakkında bilgi almak istiyorum.`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-colors shadow-lg shadow-green-600/20"
                        >
                            <MessageCircle size={18} />
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
                <div className={`flex border-b mb-8 ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`}>
                    <button 
                        onClick={() => setActiveTab('portfolio')}
                        className={`px-8 py-4 font-bold text-sm uppercase tracking-wide border-b-2 transition-colors ${activeTab === 'portfolio' ? 'border-dies-red text-dies-red' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Portföylerim <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full ml-2">{listings.length}</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('about')}
                        className={`px-8 py-4 font-bold text-sm uppercase tracking-wide border-b-2 transition-colors ${activeTab === 'about' ? 'border-dies-red text-dies-red' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Hakkımda
                    </button>
                </div>

                {/* Tab Content */}
                <div className="min-h-[400px]">
                    {activeTab === 'portfolio' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {listings.length > 0 ? (
                                listings.map(p => <PropertyCard key={p.id} property={p} />)
                            ) : (
                                <div className="col-span-full text-center py-20 text-gray-500">
                                    Aktif ilan bulunmamaktadır.
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'about' && (
                        <div className={`p-8 rounded-xl border ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
                            <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Biyografi</h3>
                            <p className={`leading-relaxed whitespace-pre-line ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                {advisor.about || "Danışman hakkında detaylı bilgi bulunmamaktadır."}
                            </p>
                            
                            <div className="mt-8 pt-8 border-t border-gray-700/10">
                                <h4 className={`font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Uzmanlık Alanları</h4>
                                <div className="flex flex-wrap gap-2">
                                    {['Lüks Konut', 'Ticari Gayrimenkul', 'Yatırım Danışmanlığı', 'Arsa', 'Proje Satış'].map((tag, i) => (
                                        <span key={i} className={`px-4 py-2 rounded-lg text-sm font-medium ${theme === 'dark' ? 'bg-zinc-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                                            {tag}
                                        </span>
                                    ))}
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
