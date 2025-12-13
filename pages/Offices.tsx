
import React, { useState } from 'react';
import { useTheme } from '../components/ThemeContext';
import { MapPin, Phone, Mail, Clock, Building, Users, Award, MessageCircle, ArrowRight, Plus } from 'lucide-react';
import { DiesLogoIcon } from '../components/Icons';
// @ts-ignore
import { Link } from 'react-router-dom';
import { MOCK_OFFICES } from '../services/mockData';

export const Offices = () => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="container mx-auto px-4">
        
        {/* Banner: Open Your Office */}
        <div className="mt-8 mb-16 bg-gradient-to-r from-gray-900 to-dies-blue rounded-3xl p-6 md:p-12 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-dies-red text-white text-xs font-bold uppercase tracking-widest rounded-full mb-4">
                        <Building size={12} /> Franchise
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Kendi Ofisini Aç</h2>
                    <p className="text-gray-300 max-w-xl text-lg">
                        Dies Gayrimenkul'ün güçlü marka çatısı altında kendi başarı hikayeni yaz. 
                        Profesyonel destek ve geniş ağımızla kendi ofisinin patronu ol.
                    </p>
                </div>
                <Link 
                    to="/ofis-basvuru" 
                    className="w-full md:w-auto text-center flex-shrink-0 bg-white text-dies-blue hover:bg-dies-red hover:text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 group"
                >
                    Ofis Açmak İstiyorum <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
           <h1 className={`text-4xl md:text-5xl font-extrabold mb-4 ${theme === 'dark' ? 'text-white' : 'text-dies-blue'}`}>
               <span className="text-dies-blue">Dies</span> Ofislerimiz
           </h1>
           <p className="text-gray-500 max-w-2xl mx-auto text-lg">
               Türkiye'nin farklı noktalarındaki modern ofislerimizle hizmetinizdeyiz.
           </p>
        </div>

        {/* Office List */}
        <div className="space-y-16">
            {MOCK_OFFICES.map((office) => (
                <div key={office.id} className={`max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}`}>
                    {/* Gallery Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 p-1 bg-gray-200">
                        {/* Main Large Image */}
                        <div className="lg:col-span-2 h-64 lg:h-96 relative overflow-hidden group">
                            <img 
                                src={office.image} 
                                alt={`${office.name} Dış Cephe`} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {office.isHeadquarters && (
                                <div className="absolute top-4 left-4 bg-dies-red text-white text-xs font-bold px-3 py-1 rounded shadow-md uppercase tracking-wide">
                                    Merkez Ofis
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                                <span className="text-white font-bold text-lg">{office.name}</span>
                            </div>
                        </div>
                        
                        {/* Side Images Column */}
                        <div className="flex flex-col gap-1 h-64 lg:h-96">
                            {office.gallery && office.gallery.length > 0 ? (
                                <>
                                    <div className="relative h-1/2 overflow-hidden group">
                                            <img 
                                                src={office.gallery[0]} 
                                                alt="Ofis İçi" 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                    </div>
                                    <div className="relative h-1/2 overflow-hidden group">
                                            <img 
                                                src={office.gallery[1] || office.gallery[0]} 
                                                alt="Ofis Detay" 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                    </div>
                                </>
                            ) : (
                                <div className="h-full bg-gray-100 flex items-center justify-center text-gray-400">Görsel Yok</div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Info Content */}
                        <div className="p-6 md:p-10 flex flex-col justify-center">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                                        <DiesLogoIcon className="h-10 w-auto object-contain" />
                                </div>
                                <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-dies-blue'}`}>{office.name}</h3>
                            </div>

                            <p className="text-gray-500 leading-relaxed mb-8">
                                Profesyonel ekibimiz ve modern çalışma alanımızla {office.district}, {office.city} konumunda hizmetinizdeyiz. 
                                Gayrimenkul ihtiyaçlarınız için ofisimize bekleriz.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/10 rounded-lg text-dies-blue"><Users size={18} /></div>
                                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Profesyonel Ekip</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/10 rounded-lg text-dies-blue"><Building size={18} /></div>
                                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Merkezi Konum</span>
                                    </div>
                            </div>

                            <a href={office.locationUrl} target="_blank" rel="noreferrer" className="w-full bg-dies-blue hover:bg-blue-800 text-white font-bold py-3.5 rounded-xl text-center transition-colors shadow-md flex items-center justify-center gap-2">
                                <MapPin size={18} /> Yol Tarifi Al
                            </a>
                        </div>

                        {/* Contact Details Column */}
                        <div className={`p-6 md:p-10 border-t lg:border-t-0 lg:border-l ${theme === 'dark' ? 'border-zinc-800 bg-zinc-800/30' : 'border-gray-100 bg-gray-50'}`}>
                            <h3 className={`text-lg font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-dies-blue'}`}>İletişim Bilgileri</h3>
                            
                            <div className="space-y-6">
                                <a href={office.locationUrl} target="_blank" rel="noreferrer" className="flex items-start gap-4 group cursor-pointer">
                                    <div className="p-2.5 bg-blue-500/10 rounded-lg text-dies-blue group-hover:bg-dies-blue group-hover:text-white transition-colors"><MapPin size={20} /></div>
                                    <div>
                                        <h4 className={`font-bold mb-1 text-sm group-hover:text-dies-red transition-colors ${theme === 'dark' ? 'text-white' : 'text-dies-blue'}`}>Adres</h4>
                                        <p className="text-gray-500 text-sm group-hover:text-dies-dark transition-colors">{office.address}</p>
                                    </div>
                                </a>
                                
                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 bg-blue-500/10 rounded-lg text-dies-blue"><Phone size={20} /></div>
                                    <div className="w-full">
                                        <h4 className={`font-bold mb-1 text-sm ${theme === 'dark' ? 'text-white' : 'text-dies-blue'}`}>Telefon & WhatsApp</h4>
                                        <div className="space-y-2">
                                            <a href={`tel:${office.phone}`} className="flex items-center gap-2 text-gray-500 hover:text-dies-blue text-sm font-mono transition-colors">
                                                <span className="font-bold">Ofis:</span> {office.phone}
                                            </a>
                                            {office.whatsapp && (
                                                <a href={`https://wa.me/${office.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-500 hover:text-green-600 text-sm font-mono transition-colors">
                                                        <MessageCircle size={16} className="text-green-500" />
                                                        <span>{office.whatsapp}</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 bg-blue-500/10 rounded-lg text-dies-blue"><Clock size={20} /></div>
                                    <div>
                                        <h4 className={`font-bold mb-1 text-sm ${theme === 'dark' ? 'text-white' : 'text-dies-blue'}`}>Çalışma Saatleri</h4>
                                        <p className="text-gray-500 text-sm">{office.workingHours}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
