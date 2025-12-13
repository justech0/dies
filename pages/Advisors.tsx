import React from 'react';
// @ts-ignore
import { Link } from 'react-router-dom';
import { MOCK_ADVISORS } from '../services/mockData';
import { useTheme } from '../components/ThemeContext';
import { Phone, ChevronRight, Star, Briefcase, ArrowRight } from 'lucide-react';
import { DiesLogoIcon } from '../components/Icons';

export const Advisors = () => {
  const { theme } = useTheme();

  // Filter out admin roles if any exist in the mock data, though generally advisors are added here
  // Also ensuring we only show valid advisors
  const displayAdvisors = MOCK_ADVISORS.filter(advisor => advisor.role !== 'admin');

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-dies-blue'}`}>
            Uzman <span className="text-dies-blue">Danışmanlarımız</span>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Gayrimenkul yatırımlarınızda size en doğru yolu gösterecek profesyonel ekibimizle tanışın.
          </p>
        </div>

        {/* Recruitment Banner (New Position) */}
        <div className="mb-16 bg-gradient-to-r from-dies-blue to-blue-900 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl relative overflow-hidden">
             {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-dies-red/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
            
            <div className="relative z-10 flex items-center gap-6">
                <div className="hidden md:flex w-20 h-20 bg-white/10 rounded-2xl items-center justify-center backdrop-blur-sm border border-white/10 shadow-inner">
                    <Briefcase size={36} className="text-white" />
                </div>
                <div className="text-center md:text-left">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Ekibimize Katılın</h3>
                    <p className="text-blue-100 max-w-xl text-lg leading-relaxed">
                        Gayrimenkul sektöründe kariyer hedefliyor ve yüksek kazanç elde etmek istiyorsanız, Dies ailesi sizi bekliyor.
                    </p>
                </div>
            </div>
            
            <Link 
                to="/danisman-ol" 
                className="relative z-10 flex items-center gap-2 bg-white text-dies-blue px-8 py-4 rounded-xl font-bold hover:bg-dies-red hover:text-white transition-all shadow-lg whitespace-nowrap transform hover:-translate-y-1"
            >
                Başvuru Yap <ArrowRight size={20} />
            </Link>
        </div>

        {/* Advisors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {displayAdvisors.map((advisor) => (
            <div 
              key={advisor.id} 
              className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100 shadow-lg'}`}
            >
              {/* Badge/Logo Overlay */}
              <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow-sm">
                 <DiesLogoIcon className="w-6 h-6 text-black" />
              </div>

              {/* Image Section */}
              <div className="relative h-72 overflow-hidden bg-gray-200">
                <img 
                  src={advisor.image} 
                  alt={advisor.name} 
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                
                {/* Name on Image (Mobile/Design Choice) */}
                <div className="absolute bottom-0 left-0 w-full p-6 pt-12">
                   <h3 className="text-white text-xl font-bold leading-tight mb-1">{advisor.name}</h3>
                   <p className="text-gray-300 text-sm font-medium uppercase tracking-wide">{advisor.role}</p>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 pt-4 flex flex-col flex-grow">
                {/* Dies Branding Line */}
                <div className="flex items-center gap-1 mb-4 opacity-70">
                    <span className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Dies Emlak Gayrimenkul</span>
                </div>

                {/* Stars (Visual decoration) */}
                <div className="flex gap-1 mb-6">
                    {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-yellow-500 fill-yellow-500" />)}
                </div>

                <div className="mt-auto space-y-3">
                    <a href={`tel:${advisor.phone}`} className={`flex items-center gap-3 text-sm font-medium transition-colors ${theme === 'dark' ? 'text-gray-300 hover:text-dies-blue' : 'text-gray-600 hover:text-dies-blue'}`}>
                        <Phone size={16} className="text-dies-blue" />
                        {advisor.phone}
                    </a>
                    
                    <div className={`w-full h-px ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'}`}></div>

                    <Link 
                        to={`/danisman/${advisor.id}`}
                        className="flex items-center justify-between w-full group/btn"
                    >
                        <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-dies-blue'}`}>Profili İncele</span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-zinc-800 group-hover/btn:bg-dies-blue' : 'bg-gray-100 group-hover/btn:bg-dies-blue'}`}>
                            <ChevronRight size={16} className={`transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-600 group-hover/btn:text-white'}`} />
                        </div>
                    </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};