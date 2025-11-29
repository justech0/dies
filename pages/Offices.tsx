import React from 'react';
import { useTheme } from '../components/ThemeContext';
import { MapPin, Phone, Mail, Clock, Coffee, Users, Award } from 'lucide-react';
import { DiesLogoIcon } from '../components/Icons';

export const Offices = () => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 pt-10">
           <h1 className={`text-4xl md:text-5xl font-extrabold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
               <span className="text-dies-red">Batman</span> Dies Gayrimenkul
           </h1>
           <p className="text-gray-500 max-w-2xl mx-auto text-lg">
               Batman'ın kalbinde, hayallerinizi gerçeğe dönüştüren profesyonel çözüm ortağınız.
           </p>
        </div>

        {/* Office Details Card */}
        <div className={`max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}`}>
           
           {/* Gallery Section */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 p-1 bg-gray-200">
               {/* Main Large Image (Exterior/Signage) */}
               <div className="lg:col-span-2 h-64 lg:h-96 relative overflow-hidden group">
                   <img 
                       src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200" 
                       alt="Dies Emlak Dış Cephe" 
                       className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                       <span className="text-white font-bold text-lg">Merkez Ofisimiz</span>
                   </div>
               </div>
               
               {/* Side Images Column */}
               <div className="flex flex-col gap-1 h-64 lg:h-96">
                   <div className="relative h-1/2 overflow-hidden group">
                        <img 
                            src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=800" 
                            alt="Dies Emlak Toplantı Odası" 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                   </div>
                   <div className="relative h-1/2 overflow-hidden group">
                        <img 
                            src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800" 
                            alt="Dies Emlak Danışma" 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                   </div>
               </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2">
               {/* Info Content */}
               <div className="p-10 flex flex-col justify-center">
                   <div className="flex items-center gap-3 mb-8">
                       <DiesLogoIcon className={`w-14 h-14 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                       <div className="flex flex-col -space-y-1">
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-extrabold text-dies-red">Dies</span>
                                <span className={`text-2xl font-light ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Emlak</span>
                            </div>
                            <span className={`text-[10px] tracking-[0.35em] uppercase font-medium ml-0.5 ${theme === 'dark' ? 'text-white' : 'text-black'} opacity-80`}>
                                GAYRİMENKUL
                            </span>
                       </div>
                   </div>

                   <div className="mb-8 space-y-4">
                       <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Hakkımızda</h3>
                       <p className="text-gray-500 leading-relaxed">
                           Modern ofisimiz, alanında uzman profesyonel ekibimiz ve misafirperver ortamımızla gayrimenkul ihtiyaçlarınız için buradayız. 
                           Batman'ın en merkezi konumunda, teknolojiyi ve konforu birleştiren çalışma alanımızda sizleri ağırlamaktan mutluluk duyarız. 
                           İster yatırım yapın, ister hayalinizdeki evi arayın; Dies güvencesiyle her adımda yanınızdayız.
                       </p>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/10 rounded-lg text-dies-red"><Users size={20} /></div>
                            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Profesyonel Ekip</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/10 rounded-lg text-dies-red"><Coffee size={20} /></div>
                            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Sıcak Ortam</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/10 rounded-lg text-dies-red"><Award size={20} /></div>
                            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Sektör Lideri</span>
                        </div>
                   </div>

                   <a href="https://maps.app.goo.gl/CsFkuohU5wpcnTBC9" target="_blank" rel="noreferrer" className="w-full bg-dies-red hover:bg-red-700 text-white font-bold py-4 rounded-xl text-center transition-colors shadow-lg">
                       Yol Tarifi Al
                   </a>
               </div>

               {/* Contact Details Column */}
               <div className={`p-10 border-t lg:border-t-0 lg:border-l ${theme === 'dark' ? 'border-zinc-800 bg-zinc-800/30' : 'border-gray-100 bg-gray-50'}`}>
                   <h3 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>İletişim Bilgileri</h3>
                   
                   <div className="space-y-8">
                       <div className="flex items-start gap-4">
                           <div className="p-3 bg-red-500/10 rounded-lg text-dies-red"><MapPin size={24} /></div>
                           <div>
                               <h4 className={`font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Adres</h4>
                               <p className="text-gray-500 text-sm">Bahçelievler, Mimar Sinan Cd.<br/>Batman, Türkiye</p>
                           </div>
                       </div>
                       <div className="flex items-start gap-4">
                           <div className="p-3 bg-red-500/10 rounded-lg text-dies-red"><Phone size={24} /></div>
                           <div>
                               <h4 className={`font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Telefon & WhatsApp</h4>
                               <div className="space-y-2">
                                   <a href="tel:+905438682668" className="block text-gray-500 hover:text-dies-red text-sm font-mono">+90 543 868 26 68</a>
                                   <a href="tel:+905059969612" className="block text-gray-500 hover:text-dies-red text-sm font-mono">+90 505 996 96 12</a>
                               </div>
                           </div>
                       </div>
                       <div className="flex items-start gap-4">
                           <div className="p-3 bg-red-500/10 rounded-lg text-dies-red"><Clock size={24} /></div>
                           <div>
                               <h4 className={`font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Çalışma Saatleri</h4>
                               <p className="text-gray-500 text-sm">Pazartesi - Cumartesi: 09:00 - 19:00</p>
                               <p className="text-gray-500 text-sm">Pazar: Kapalı</p>
                           </div>
                       </div>
                   </div>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
};