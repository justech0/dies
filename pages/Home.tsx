import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Home as HomeIcon, TrendingUp, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { MOCK_PROPERTIES, MOCK_ADVISORS } from '../services/mockData';
import { PropertyCard } from '../components/PropertyCard';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../components/ThemeContext';

export const Home = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  // Duplicate mock properties to demonstrate scrolling effect since we only have 3 items
  const featuredProperties = [...MOCK_PROPERTIES, ...MOCK_PROPERTIES, ...MOCK_PROPERTIES]; 
  const founders = MOCK_ADVISORS.filter(a => a.isFounder);
  const [searchTerm, setSearchTerm] = useState('');
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/ilanlar?district=${searchTerm}`);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
        const { current } = scrollContainerRef;
        const scrollAmount = 350; // Card width + gap approximation
        if (direction === 'left') {
            current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    }
  };

  return (
    <div className="w-full">
      {/* HERO SECTION */}
      <section className="relative h-[85vh] w-full flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax feel */}
        <div className="absolute inset-0 z-0">
            <img 
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070" 
                alt="Modern Architecture" 
                className="w-full h-full object-cover object-center opacity-60"
            />
            <div className={`absolute inset-0 bg-gradient-to-b ${theme === 'dark' ? 'from-black/70 via-black/40 to-dies-black' : 'from-gray-900/60 via-gray-900/20 to-gray-50'}`}></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <h2 className="text-dies-red font-bold tracking-[0.2em] uppercase mb-4 text-sm md:text-base">Dies Emlak Gayrimenkul</h2>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
                    Hayalinizdeki <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Yaşama Adım Atın</span>
                </h1>
                <p className="text-gray-200 max-w-2xl mx-auto mb-10 text-sm md:text-lg font-light">
                    Güvenilir danışmanlık, geniş portföy ve profesyonel hizmet anlayışıyla gayrimenkul yatırımlarınıza değer katıyoruz.
                </p>
            </motion.div>

            {/* Search Bar */}
            <motion.form 
                onSubmit={handleSearch}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white/10 backdrop-blur-md p-2 rounded-full max-w-3xl mx-auto border border-white/20 flex flex-col md:flex-row gap-2 shadow-2xl"
            >
                <div className="flex-grow px-6 py-3 flex items-center">
                    <Search className="text-gray-300 mr-3" />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Konum, proje veya ilan no arayın..." 
                        className="bg-transparent border-none outline-none text-white placeholder-gray-300 w-full"
                    />
                </div>
                <button 
                    type="submit"
                    className="bg-dies-red hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold transition-all uppercase tracking-wide text-sm md:text-base"
                >
                    İlan Ara
                </button>
            </motion.form>
        </div>
      </section>

      {/* FEATURED LISTINGS (Carousel) */}
      <section className={`py-20 ${theme === 'dark' ? 'bg-dies-black' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className={`text-3xl md:text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Öne Çıkan <span className="text-dies-red">İlanlar</span></h2>
                    <p className="text-gray-500">En yeni ve en popüler portföylerimizi inceleyin.</p>
                </div>
                
                {/* Carousel Controls */}
                <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                        <button 
                            onClick={() => scroll('left')}
                            className={`p-3 rounded-full border transition-all ${theme === 'dark' ? 'border-zinc-700 hover:bg-zinc-800 text-white' : 'border-gray-300 hover:bg-white text-black hover:shadow-md'}`}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button 
                            onClick={() => scroll('right')}
                            className={`p-3 rounded-full border transition-all ${theme === 'dark' ? 'border-zinc-700 hover:bg-zinc-800 text-white' : 'border-gray-300 hover:bg-white text-black hover:shadow-md'}`}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                    <Link to="/ilanlar" className={`hidden md:flex items-center gap-2 font-medium hover:text-dies-red transition-colors ml-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Tümünü Gör <ArrowRight size={20} />
                    </Link>
                </div>
            </div>
            
            {/* Scroll Container */}
            <div 
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto pb-8 snap-x scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {featuredProperties.map((prop, index) => (
                    <div key={`${prop.id}-${index}`} className="min-w-[85vw] md:min-w-[350px] lg:min-w-[380px] snap-center">
                        <PropertyCard property={prop} />
                    </div>
                ))}
            </div>

            <div className="mt-4 text-center md:hidden">
                <Link to="/ilanlar" className="inline-flex items-center gap-2 text-white bg-zinc-800 px-6 py-3 rounded-lg hover:bg-zinc-700">
                    Tüm İlanları Gör <ArrowRight size={18} />
                </Link>
            </div>
        </div>
      </section>

      {/* STATS / FEATURES */}
      <section className={`py-16 border-y ${theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-gray-200'}`}>
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`flex flex-col items-center text-center p-6 rounded-2xl border hover:border-dies-red/30 transition-colors group ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-gray-50 border-gray-200 shadow-sm'}`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${theme === 'dark' ? 'bg-black' : 'bg-white shadow-md'}`}>
                    <Shield className="text-dies-red w-8 h-8" />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Güvenilir Danışmanlık</h3>
                <p className="text-gray-500 text-sm">Sektörde yılların verdiği tecrübe ile şeffaf ve dürüst hizmet.</p>
            </div>
            <div className={`flex flex-col items-center text-center p-6 rounded-2xl border hover:border-dies-red/30 transition-colors group ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-gray-50 border-gray-200 shadow-sm'}`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${theme === 'dark' ? 'bg-black' : 'bg-white shadow-md'}`}>
                    <HomeIcon className="text-dies-red w-8 h-8" />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Geniş Portföy</h3>
                <p className="text-gray-500 text-sm">Her bütçeye ve ihtiyaca uygun yüzlerce konut ve ticari seçenek.</p>
            </div>
            <div className={`flex flex-col items-center text-center p-6 rounded-2xl border hover:border-dies-red/30 transition-colors group ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-gray-50 border-gray-200 shadow-sm'}`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${theme === 'dark' ? 'bg-black' : 'bg-white shadow-md'}`}>
                    <TrendingUp className="text-dies-red w-8 h-8" />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Doğru Yatırım</h3>
                <p className="text-gray-500 text-sm">Piyasa analizi ve uzman görüşleri ile kazançlı yatırım fırsatları.</p>
            </div>
        </div>
      </section>

      {/* FOUNDERS / TEAM TEASER */}
      <section className={`py-20 relative overflow-hidden ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}`}>
        <div className={`absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l pointer-events-none ${theme === 'dark' ? 'from-black/50 to-transparent' : 'from-gray-100/50 to-transparent'}`}></div>
        <div className="container mx-auto px-4">
             <h2 className={`text-3xl md:text-4xl font-bold text-center mb-16 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Kurucu <span className="text-dies-red">Ortaklar</span></h2>
             
             <div className="flex flex-wrap justify-center gap-10">
                {founders.map(founder => (
                    <Link to={`/danisman/${founder.id}`} key={founder.id} className={`p-6 rounded-2xl border flex flex-col items-center w-full md:w-1/3 lg:w-1/4 hover:translate-y-[-10px] transition-transform duration-300 shadow-2xl shadow-dies-red/5 ${theme === 'dark' ? 'bg-black border-zinc-800' : 'bg-white border-gray-200 shadow-lg'}`}>
                        <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-dies-red mb-6">
                            <img src={founder.image} alt={founder.name} className="w-full h-full object-cover" />
                        </div>
                        <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{founder.name}</h3>
                        <span className="text-dies-red text-xs uppercase font-bold tracking-wider my-2 text-center">{founder.role}</span>
                        <p className="text-gray-500 text-lg font-mono">{founder.phone}</p>
                        <div className="mt-4 bg-dies-red/10 text-dies-red px-4 py-1 rounded-full text-xs font-bold">
                            Profili İncele
                        </div>
                    </Link>
                ))}
             </div>
        </div>
      </section>

      {/* WHY JOIN BANNER */}
      <section className="py-20 bg-gradient-to-r from-dies-red to-red-900 relative">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="text-white max-w-xl">
                <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Kariyerine DİES ile Yön Ver</h2>
                <p className="text-white/80 text-lg mb-8">
                    Gayrimenkul sektöründe kendi işinin patronu ol, yüksek kazanç ve prestijli bir kariyer için aramıza katıl.
                </p>
                <Link to="/danisman-ol" className="bg-white text-dies-red px-8 py-4 rounded-lg font-bold shadow-lg hover:shadow-xl hover:bg-gray-100 transition-all inline-flex items-center gap-2">
                    Başvuru Formu <ArrowRight size={20} />
                </Link>
            </div>
            <div className="hidden md:block">
                 {/* Abstract graphic or image */}
                 <div className="w-64 h-64 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center border border-white/30">
                    <span className="text-6xl font-black text-white/90">DİES</span>
                 </div>
            </div>
        </div>
      </section>
    </div>
  );
};