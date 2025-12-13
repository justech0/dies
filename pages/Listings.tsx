import React, { useState, useEffect } from 'react';
// @ts-ignore
import { useLocation } from 'react-router-dom';
import { PropertyCard } from '../components/PropertyCard';
import { AdvancedFilter } from '../components/AdvancedFilter';
import { MOCK_PROPERTIES } from '../services/mockData';
import { Property } from '../types';

export const Listings = () => {
  const location = useLocation();
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(MOCK_PROPERTIES);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const typeParam = params.get('type'); 
    const catParam = params.get('cat'); 
    const districtParam = params.get('district');

    let initialData = MOCK_PROPERTIES;
    
    if (typeParam) {
        const formattedType = typeParam.charAt(0).toUpperCase() + typeParam.slice(1);
        initialData = initialData.filter(p => p.type.toLowerCase() === formattedType.toLowerCase());
    }
    if (catParam) {
        const formattedCat = catParam.charAt(0).toUpperCase() + catParam.slice(1);
        initialData = initialData.filter(p => p.category.toLowerCase() === formattedCat.toLowerCase());
    }
    if (districtParam) {
        initialData = initialData.filter(p => p.location.toLowerCase().includes(districtParam.toLowerCase()));
    }
    setFilteredProperties(initialData);
  }, [location]);

  const handleFilter = (criteria: any) => {
    let result = MOCK_PROPERTIES;
    if (criteria.status !== 'Tümü') result = result.filter(p => p.type === criteria.status);
    if (criteria.type !== 'Tümü') result = result.filter(p => p.category === criteria.type);
    if (criteria.district) result = result.filter(p => p.location.toLowerCase().includes(criteria.district.toLowerCase()) || (p.district && p.district.toLowerCase().includes(criteria.district.toLowerCase())));
    if (criteria.roomCount !== 'Tümü') result = result.filter(p => p.bedrooms === criteria.roomCount);
    if (criteria.minPrice) result = result.filter(p => p.price >= parseInt(criteria.minPrice));
    if (criteria.maxPrice) result = result.filter(p => p.price <= parseInt(criteria.maxPrice));
    if (criteria.minArea) result = result.filter(p => p.area >= parseInt(criteria.minArea));
    if (criteria.maxArea) result = result.filter(p => p.area <= parseInt(criteria.maxArea));
    setFilteredProperties(result);
  };

  return (
    <div className="container mx-auto px-4 py-12 pt-32">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold mb-6 text-dies-dark text-center md:text-left">
            İlanlar
        </h1>
        <AdvancedFilter onFilter={handleFilter} />
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-dies-slate">
            Toplam <span className="text-dies-blue font-bold">{filteredProperties.length}</span> ilan listeleniyor
        </h2>
      </div>

      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProperties.map(prop => (
                <PropertyCard key={prop.id} property={prop} />
            ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="text-gray-400 text-xl mb-4">Aradığınız kriterlere uygun ilan bulunamadı.</div>
            <button 
                onClick={() => setFilteredProperties(MOCK_PROPERTIES)}
                className="text-dies-blue font-bold hover:underline"
            >
                Filtreleri Temizle
            </button>
        </div>
      )}
    </div>
  );
};