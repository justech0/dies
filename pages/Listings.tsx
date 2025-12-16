
import React, { useState, useEffect } from 'react';
// @ts-ignore
import { useLocation } from 'react-router-dom';
import { PropertyCard } from '../components/PropertyCard';
import { AdvancedFilter } from '../components/AdvancedFilter';
import { api } from '../services/api';
import { Property } from '../types';
import { Loader } from 'lucide-react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

// Stagger Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    },
    exit: { opacity: 0 }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
};

export const Listings = () => {
  const location = useLocation();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Function to build query object and fetch data
  const fetchProperties = async (criteria: any = {}) => {
      setIsLoading(true);
      try {
          // Merge URL params with manual filter criteria
          const params = new URLSearchParams(location.search);
          const initialFilters: any = {};
          
          if (params.get('type')) initialFilters.status = params.get('type') === 'satilik' ? 'Satılık' : 'Kiralık';
          if (params.get('cat')) initialFilters.type = params.get('cat') === 'arsa' ? 'Arsa' : (params.get('cat') === 'ticari' ? 'Ticari' : 'Konut');
          if (params.get('district')) initialFilters.district = params.get('district');

          const finalFilters = { ...initialFilters, ...criteria };
          
          const result = await api.properties.getList(finalFilters);
          setProperties(result);
      } catch (error) {
          console.error("Error fetching properties", error);
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
    fetchProperties();
  }, [location.search]);

  const handleFilter = (criteria: any) => {
    fetchProperties(criteria);
  };

  return (
    <MotionDiv 
        className="container mx-auto px-4 py-12 pt-32"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, y: -20 }}
    >
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold mb-6 text-dies-dark text-center md:text-left">
            İlanlar
        </h1>
        <AdvancedFilter onFilter={handleFilter} />
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-dies-slate">
            Toplam <span className="text-dies-blue font-bold">{properties.length}</span> ilan listeleniyor
        </h2>
      </div>

      {isLoading ? (
          <div className="flex justify-center py-20">
              <Loader className="animate-spin text-dies-blue w-12 h-12" />
          </div>
      ) : properties.length > 0 ? (
        <MotionDiv 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
            {properties.map(prop => (
                <MotionDiv key={prop.id} variants={itemVariants}>
                    <PropertyCard property={prop} />
                </MotionDiv>
            ))}
        </MotionDiv>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="text-gray-400 text-xl mb-4">Aradığınız kriterlere uygun ilan bulunamadı.</div>
            <button 
                onClick={() => fetchProperties({})}
                className="text-dies-blue font-bold hover:underline"
            >
                Filtreleri Temizle
            </button>
        </div>
      )}
    </MotionDiv>
  );
};
