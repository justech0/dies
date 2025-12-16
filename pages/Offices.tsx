
import React, { useState, useEffect } from 'react';
import { useTheme } from '../components/ThemeContext';
import { MapPin, Phone, Clock, Users, Building, ArrowRight } from 'lucide-react';
// @ts-ignore
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Office } from '../types';
import { DiesLogoIcon } from '../components/Icons';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

export const Offices = () => {
  const { theme } = useTheme();
  const [offices, setOffices] = useState<Office[]>([]);

  useEffect(() => {
      api.offices.getList().then(setOffices).catch(console.error);
  }, []);

  return (
    <MotionDiv 
        className="min-h-screen pt-24 md:pt-20 pb-20 bg-gray-50"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
    >
      <div className="container mx-auto px-4">
        
        {/* Banner */}
        <div className="mt-4 md:mt-8 mb-8 md:mb-12 bg-gradient-to-r from-gray-900 to-dies-blue rounded-3xl p-6 md:p-12 relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-white/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 text-center md:text-left">
                 <div>
                     <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-2 md:mb-4">Kendi Ofisini Aç</h2>
                     <p className="text-gray-300 max-w-xl text-sm md:text-lg">Dies Gayrimenkul'ün güçlü marka çatısı altında kendi başarı hikayeni yaz.</p>
                 </div>
                 <Link to="/ofis-basvuru" className="w-full md:w-auto text-center flex-shrink-0 bg-white text-dies-blue hover:bg-dies-red hover:text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 text-sm md:text-base">Ofis Açmak İstiyorum <ArrowRight size={18} /></Link>
             </div>
        </div>

        <div className="text-center mb-8 md:mb-12">
           <h1 className={`text-3xl md:text-4xl font-extrabold mb-4 text-dies-blue`}>
               Ofislerimiz
           </h1>
        </div>

        <div className="space-y-8 md:space-y-12">
            {offices.map((office) => (
                <div key={office.id} className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    
                    {/* Top Section: Images Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 h-[250px] md:h-[500px]">
                        {/* Main Large Image (Left, Spans 2 cols on desktop) */}
                        <div className="md:col-span-2 relative h-full group overflow-hidden">
                            <img src={office.image} alt={office.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            
                            {/* Overlay Badge */}
                            <div className="absolute top-4 left-4 md:top-6 md:left-6">
                                <span className="bg-dies-red text-white px-3 py-1 md:px-4 md:py-2 rounded font-bold text-[10px] md:text-xs uppercase tracking-wider shadow-md">
                                    {office.isHeadquarters ? 'Merkez Ofis' : 'Şube Ofis'}
                                </span>
                            </div>

                            {/* Title Overlay */}
                            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4 md:p-8">
                                <h3 className="text-white text-xl md:text-2xl font-bold">{office.name}</h3>
                            </div>
                        </div>

                        {/* Right Column: Two smaller images (Hidden on mobile for space) */}
                        <div className="hidden md:flex flex-col h-full border-l border-white/20">
                             {/* Small Image 1 */}
                             <div className="h-1/2 relative overflow-hidden group border-b border-white/20">
                                 {office.gallery && office.gallery[0] ? (
                                    <img src={office.gallery[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                 ) : (
                                    <div className="w-full h-full bg-gray-200"></div>
                                 )}
                             </div>
                             {/* Small Image 2 */}
                             <div className="h-1/2 relative overflow-hidden group">
                                 {office.gallery && office.gallery[1] ? (
                                    <img src={office.gallery[1]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                 ) : (
                                     <div className="w-full h-full bg-gray-200"></div>
                                 )}
                             </div>
                        </div>
                    </div>

                    {/* Bottom Section: Info Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Left Info: Description & Logo */}
                        <div className="p-6 md:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-gray-100">
                            <div>
                                <div className="flex items-center gap-4 mb-4 md:mb-6">
                                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white border border-gray-100 rounded-xl flex items-center justify-center p-1 shadow-sm">
                                        <DiesLogoIcon className="w-full h-auto" />
                                    </div>
                                    <h3 className="text-lg md:text-xl font-bold text-dies-blue">{office.name}</h3>
                                </div>
                                <p className="text-gray-500 leading-relaxed mb-6 text-sm">
                                    {office.description || "Profesyonel ekibimiz ve modern çalışma alanımızla hizmetinizdeyiz. Gayrimenkul ihtiyaçlarınız için ofisimize bekleriz."}
                                </p>
                                
                                <div className="flex flex-wrap gap-2 md:gap-4 mb-6 md:mb-8">
                                    <div className="flex items-center gap-2 bg-blue-50 text-dies-blue px-3 py-2 rounded-lg text-xs font-bold">
                                        <Users size={14} /> Profesyonel Ekip
                                    </div>
                                    <div className="flex items-center gap-2 bg-blue-50 text-dies-blue px-3 py-2 rounded-lg text-xs font-bold">
                                        <Building size={14} /> Merkezi Konum
                                    </div>
                                </div>
                            </div>

                            <a 
                                href={office.locationUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="w-full bg-dies-blue hover:bg-blue-900 text-white py-3 md:py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl text-sm md:text-base"
                            >
                                <MapPin size={18} /> Yol Tarifi Al
                            </a>
                        </div>

                        {/* Right Info: Contact Details */}
                        <div className="p-6 md:p-10 bg-gray-50/50 flex flex-col justify-center">
                            <h4 className="text-dies-blue font-bold text-lg mb-4 md:mb-6">İletişim Bilgileri</h4>
                            
                            <div className="space-y-4 md:space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-dies-blue flex items-center justify-center flex-shrink-0">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-dies-blue mb-1">Adres</p>
                                        <p className="text-sm text-gray-600">{office.address}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-dies-blue flex items-center justify-center flex-shrink-0">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-dies-blue mb-1">Telefon & WhatsApp</p>
                                        <div className="flex flex-col text-sm text-gray-600 font-medium">
                                            {/* Labels updated to 'Ofis' for both as requested for HQ */}
                                            <a href={`tel:${office.phone}`}>Ofis: {office.phone}</a>
                                            {office.phone2 && <a href={`tel:${office.phone2}`}>Ofis: {office.phone2}</a>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-dies-blue flex items-center justify-center flex-shrink-0">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-dies-blue mb-1">Çalışma Saatleri</p>
                                        <p className="text-sm text-gray-600">{office.workingHours}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </MotionDiv>
  );
};
