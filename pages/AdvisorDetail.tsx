import React from 'react';
import { useParams } from 'react-router-dom';
import { MOCK_ADVISORS, MOCK_PROPERTIES } from '../services/mockData';
import { PropertyCard } from '../components/PropertyCard';
import { Phone, Instagram, Facebook } from 'lucide-react';
import { useTheme } from '../components/ThemeContext';

export const AdvisorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { theme } = useTheme();
  const advisor = MOCK_ADVISORS.find(a => a.id === parseInt(id || '0'));
  
  if (!advisor) return <div className="pt-32 text-center">Danışman Bulunamadı</div>;
  const listings = MOCK_PROPERTIES.filter(p => p.advisorId === advisor.id);

  return (
    <div className="pb-20">
      <div className="relative bg-dies-red/90 py-20 pt-32">
         <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-10 relative z-10">
            <div className="w-48 h-48 rounded-full border-4 border-white shadow-2xl overflow-hidden flex-shrink-0">
                <img src={advisor.image} className="w-full h-full object-cover" alt={advisor.name} />
            </div>
            <div className="text-center md:text-left text-white">
                <h1 className="text-4xl font-bold mb-2">{advisor.name}</h1>
                <p className="text-xl opacity-90 mb-6">{advisor.role}</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    {/* Clickable Phone */}
                    <a href={`tel:${advisor.phone}`} className="bg-white text-dies-red px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-gray-100 transition-colors">
                        <Phone size={20} />
                        {advisor.phone}
                    </a>

                    {/* Social Media Links */}
                    {advisor.social?.instagram && (
                        <a 
                            href={advisor.social.instagram} 
                            target="_blank" 
                            rel="noreferrer"
                            className="bg-white/10 border border-white/30 text-white w-12 h-12 flex items-center justify-center rounded-full hover:bg-white hover:text-dies-red transition-all"
                            title="Instagram"
                        >
                            <Instagram size={24} />
                        </a>
                    )}
                    {advisor.social?.facebook && (
                        <a 
                            href={advisor.social.facebook} 
                            target="_blank" 
                            rel="noreferrer"
                            className="bg-white/10 border border-white/30 text-white w-12 h-12 flex items-center justify-center rounded-full hover:bg-white hover:text-dies-red transition-all"
                            title="Facebook"
                        >
                            <Facebook size={24} />
                        </a>
                    )}
                </div>
            </div>
         </div>
      </div>

      <div className="container mx-auto px-4 mt-12">
           <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Portföyüm</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {listings.map(p => <PropertyCard key={p.id} property={p} />)}
           </div>
      </div>
    </div>
  );
};