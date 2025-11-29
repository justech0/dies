import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, CheckCircle, Flame, Armchair, Building } from 'lucide-react';
import { Property } from '../types';
import { MOCK_ADVISORS } from '../services/mockData';
import { useTheme } from './ThemeContext';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const advisor = MOCK_ADVISORS.find(a => a.id === property.advisorId);

  const handleClick = () => {
      navigate(`/ilan/${property.id}`);
  };

  const isSold = property.type === 'Satıldı' || property.type === 'Kiralandı';

  // Aggregate key features for display
  const displayFeatures = [
    property.heatingType,
    property.isFurnished ? 'Eşyalı' : undefined,
    property.balconyCount ? `${property.balconyCount} Balkon` : undefined,
    property.buildingAge && property.buildingAge !== '0' ? `${property.buildingAge} Yıllık` : (property.buildingAge === '0' ? 'Sıfır Bina' : undefined),
    ...(property.features || [])
  ].filter((f): f is string => !!f);

  return (
    <div 
        onClick={handleClick}
        className={`group cursor-pointer rounded-xl overflow-hidden border transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full relative hover:shadow-2xl ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800 hover:border-dies-red/50' : 'bg-white border-gray-100 hover:border-dies-red/50 shadow-md'}`}
    >
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <img 
            src={property.image} 
            alt={property.title} 
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isSold ? 'grayscale' : ''}`}
        />
        <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider text-white rounded shadow-lg ${
                property.type === 'Satılık' ? 'bg-dies-red' : 
                property.type === 'Kiralık' ? 'bg-blue-600' : 
                'bg-gray-800'
            }`}>
                {property.type}
            </span>
        </div>
        {!isSold && (
            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/90 to-transparent">
                <div className="text-white font-bold text-xl">
                    {property.price.toLocaleString('tr-TR')} {property.currency}
                </div>
            </div>
        )}
        {isSold && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-white text-3xl font-black uppercase -rotate-12 border-4 border-white px-4 py-2">
                    {property.type.toUpperCase()}
                </div>
             </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-2">
             <span className="text-xs text-gray-500 uppercase tracking-wide">{property.category}</span>
             <span className="text-xs text-gray-500">{property.date}</span>
        </div>
        <h3 className={`font-bold text-lg mb-2 leading-tight transition-colors line-clamp-2 ${theme === 'dark' ? 'text-white group-hover:text-dies-red' : 'text-gray-900 group-hover:text-dies-red'}`}>
            {property.title}
        </h3>
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
            <MapPin size={14} className="text-dies-red" />
            <span className="truncate">{property.location} {property.district && `- ${property.district}`}</span>
        </div>

        {/* Basic Specs */}
        <div className={`flex items-center justify-between border-t py-4 ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-100'}`}>
            <div className="flex items-center gap-3">
                {property.bedrooms && (
                    <div className="flex items-center gap-1 text-gray-500 text-xs" title="Yatak Odası">
                        <Bed size={14} />
                        <span>{property.bedrooms}</span>
                    </div>
                )}
                {property.bathrooms !== undefined && property.bathrooms > 0 && (
                    <div className="flex items-center gap-1 text-gray-500 text-xs" title="Banyo">
                        <Bath size={14} />
                        <span>{property.bathrooms}</span>
                    </div>
                )}
                <div className="flex items-center gap-1 text-gray-500 text-xs" title="Alan">
                    <Square size={14} />
                    <span>{property.area} m²</span>
                </div>
            </div>
        </div>
        
        {/* Features Preview Section */}
        {displayFeatures.length > 0 && (
             <div className="mb-4">
                 <div className="flex flex-wrap gap-2 h-16 overflow-hidden content-start">
                     {displayFeatures.slice(0, 5).map((f, i) => (
                         <span key={i} className={`text-[10px] px-2 py-1 rounded-full flex items-center gap-1 border ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                             <CheckCircle size={10} className="text-dies-red" /> {f}
                         </span>
                     ))}
                     {displayFeatures.length > 5 && (
                         <span className="text-[10px] text-gray-500 mt-1 flex items-center">+{displayFeatures.length - 5} daha</span>
                     )}
                 </div>
             </div>
        )}

        {/* Advisor Footer */}
        <div className={`flex items-center justify-between pt-4 border-t mt-auto ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-100'}`}>
             <div className="flex items-center gap-2">
                <img src={advisor?.image} alt={advisor?.name} className="w-8 h-8 rounded-full object-cover border border-gray-500" />
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase">Danışman</span>
                    <span className={`text-xs font-medium truncate max-w-[150px] ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {advisor?.name}
                    </span>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};