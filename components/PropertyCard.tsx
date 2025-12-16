
import React from 'react';
// @ts-ignore
import { useNavigate } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, CheckCircle } from 'lucide-react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const navigate = useNavigate();
  
  // Use advisor data from the API response (joined fields) or defaults
  const advisorName = property.advisorName || 'Dies Danışmanı';
  const advisorImage = property.advisorImage || 'https://via.placeholder.com/150';

  const handleClick = () => {
      navigate(`/ilan/${property.id}`);
  };

  const isSold = property.type === 'Satıldı' || property.type === 'Kiralandı';

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
        className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-soft hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] flex flex-col h-full relative border border-gray-100/50"
    >
      {/* Top Banner Stripe */}
      <div className={`h-1 w-full ${property.type === 'Satılık' ? 'bg-dies-red' : 'bg-dies-blue'}`}></div>

      {/* Image */}
      {/* Reduced height to h-64 for standard visual balance */}
      <div className="relative h-64 overflow-hidden">
        <img 
            src={property.image} 
            alt={property.title} 
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isSold ? 'grayscale' : ''}`}
        />
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
            <span className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white rounded-lg shadow-md backdrop-blur-sm ${
                property.type === 'Satılık' ? 'bg-dies-red/90' : 
                property.type === 'Kiralık' ? 'bg-dies-blue/90' : 
                property.type === 'Satıldı' ? 'bg-gray-900/95 border border-white/20' :
                'bg-gray-800'
            }`}>
                {property.type}
            </span>
        </div>

        {/* Price Tag Overlay */}
        {!isSold && (
            <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
                <div className="text-dies-blue font-extrabold text-lg">
                    {property.price.toLocaleString('tr-TR')} {property.currency}
                </div>
            </div>
        )}

        {isSold && (
             <div className="absolute inset-0 flex items-center justify-center bg-dies-blue/40 backdrop-blur-[1px]">
                <div className="text-white text-3xl font-black uppercase -rotate-12 border-4 border-white px-6 py-2 rounded-lg shadow-2xl bg-black/20">
                    {property.type.toUpperCase()}
                </div>
             </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-3">
             <span className="text-xs font-bold text-dies-red uppercase tracking-wide bg-red-50 px-2 py-1 rounded">{property.category}</span>
             <span className="text-xs text-dies-slate flex items-center gap-1">
                 {property.district}, {property.province}
             </span>
        </div>
        
        <h3 className="font-bold text-lg mb-4 leading-snug text-dies-dark group-hover:text-dies-blue transition-colors line-clamp-2">
            {property.title}
        </h3>

        {/* Key Metrics */}
        <div className="flex items-center gap-4 text-sm text-dies-slate mb-5 pb-5 border-b border-gray-100">
            {property.bedrooms && (
                <div className="flex items-center gap-1.5" title="Yatak Odası">
                    <Bed size={16} className="text-dies-blue" />
                    <span className="font-medium">{property.bedrooms}</span>
                </div>
            )}
            {property.bathrooms !== undefined && property.bathrooms > 0 && (
                <div className="flex items-center gap-1.5" title="Banyo">
                    <Bath size={16} className="text-dies-blue" />
                    <span className="font-medium">{property.bathrooms}</span>
                </div>
            )}
            <div className="flex items-center gap-1.5" title="Alan">
                <Square size={16} className="text-dies-blue" />
                <span className="font-medium">{property.area} m²</span>
            </div>
        </div>
        
        {/* Features Chips */}
        <div className="mb-4 flex flex-wrap gap-2 h-14 overflow-hidden content-start">
             {displayFeatures.slice(0, 4).map((f, i) => (
                 <span key={i} className="text-[10px] px-2 py-1 rounded-full flex items-center gap-1 bg-gray-50 text-gray-600 border border-gray-100">
                     <CheckCircle size={10} className="text-dies-blue" /> {f}
                 </span>
             ))}
        </div>

        {/* Advisor Footer */}
        <div className="flex items-center justify-between mt-auto pt-2">
             <div className="flex items-center gap-3">
                <img src={advisorImage} alt={advisorName} className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm" />
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">Danışman</span>
                    <span className="text-xs font-bold text-dies-dark truncate max-w-[140px]">
                        {advisorName}
                    </span>
                </div>
             </div>
             <div className="h-8 w-8 rounded-full bg-dies-light flex items-center justify-center text-dies-blue group-hover:bg-dies-blue group-hover:text-white transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
             </div>
        </div>
      </div>
    </div>
  );
};
