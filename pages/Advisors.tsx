import React, { useEffect, useState } from 'react';
// @ts-ignore
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Advisor } from '../types';
import { useTheme } from '../components/ThemeContext';
import { Phone, ChevronRight, Users, Inbox } from 'lucide-react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  },
  exit: { opacity: 0, y: -20 }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const Advisors = () => {
  const { theme } = useTheme();
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
      setIsLoading(true);
      api.advisors.getList()
        .then(res => {
          if (res && Array.isArray(res)) setAdvisors(res);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
  }, []);

  // Filter out regular advisors only for display if needed, 
  // but let's show all approved advisors in production
  const displayAdvisors = advisors.filter(advisor => 
      advisor.role !== 'admin' && 
      !advisor.role.toLowerCase().includes('admin')
  );

  return (
    <MotionDiv 
      initial="hidden"
      animate="show"
      exit="exit"
      variants={containerVariants}
      className="min-h-screen pt-28 md:pt-32 pb-20 bg-gray-50"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-dies-blue'}`}>
            Uzman <span className="text-dies-blue">Danışmanlarımız</span>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base">
            Gayrimenkul yatırımlarınızda size en doğru yolu gösterecek profesyonel ekibimizle tanışın.
          </p>
        </div>

        {isLoading ? (
           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
             {[1, 2, 4, 4].map(i => (
               <div key={i} className="h-80 rounded-2xl bg-gray-200 animate-pulse"></div>
             ))}
           </div>
        ) : displayAdvisors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {displayAdvisors.map((advisor) => (
              <MotionDiv 
                key={advisor.id} 
                variants={itemVariants}
                className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 flex flex-col group hover:shadow-2xl transition-all duration-300"
              >
                {/* Image Section */}
                <div className="relative h-64 md:h-72 w-full bg-gray-200">
                  <img 
                    src={advisor.image || 'https://via.placeholder.com/400x500'} 
                    alt={advisor.name} 
                    className="w-full h-full object-cover object-top"
                  />
                  
                  {/* Dark Gradient Overlay & Text */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent">
                       <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-white text-lg md:text-xl font-bold mb-1">{advisor.name}</h3>
                          <p className="text-gray-300 text-[10px] md:text-xs font-bold uppercase tracking-wider">{advisor.role}</p>
                       </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex flex-col gap-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">DIES EMLAK GAYRİMENKUL</p>
                  
                  <a href={`tel:${advisor.phone}`} className="flex items-center gap-2 text-dies-blue text-sm font-bold hover:text-dies-red transition-colors mt-1">
                      <Phone size={16} />
                      {advisor.phone}
                  </a>

                  <div className="mt-3 pt-4 border-t border-gray-100">
                      <Link 
                          to={`/danisman/${advisor.id}`}
                          className="flex items-center justify-between w-full bg-gray-50 hover:bg-gray-100 text-dies-blue px-4 py-3 rounded-xl transition-colors group/btn"
                      >
                          <span className="text-sm font-bold">Profili İncele</span>
                          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
                              <ChevronRight size={14} />
                          </div>
                      </Link>
                  </div>
                </div>
              </MotionDiv>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 text-center">
              <Inbox className="text-gray-300 w-16 h-16 mb-4" />
              <h3 className="text-xl font-bold text-dies-dark mb-1">Danışman bulunamadı</h3>
              <p className="text-gray-400">Ekibimiz genişlemeye devam ediyor.</p>
          </div>
        )}
      </div>
    </MotionDiv>
  );
};
