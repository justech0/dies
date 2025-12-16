
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Home as HomeIcon, TrendingUp, Shield } from 'lucide-react';
import { api } from '../services/api';
import { Property, Advisor } from '../types';
import { PropertyCard } from '../components/PropertyCard';
// @ts-ignore
import { Link, useNavigate } from 'react-router-dom';

const MotionDiv = motion.div as any;
const MotionForm = motion.form as any;

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

export const Home = () => {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [founders, setFounders] = useState<Advisor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Default fallback settings in case API fails or not set yet
  const [heroSettings, setHeroSettings] = useState({
      heroImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070',
      heroTitle: 'Yatırımlarınıza Değer Katıyoruz'
  });

  useEffect(() => {
    const fetchData = async () => {
        try {
            // 1. Fetch Featured Properties
            const props = await api.properties.getList({ is_featured: 1 });
            // Sort by date descending and take top 9
            const sorted = props.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 9);
            setFeaturedProperties(sorted);

            // 2. Fetch Advisors (Filter for founders/leaders if API returns role info)
            const allAdvisors = await api.advisors.getList();
            const founderList = allAdvisors.filter(a => a.isFounder || a.role.includes('Kurucu') || a.role.includes('Broker'));
            setFounders(founderList.length > 0 ? founderList : allAdvisors.slice(0, 3));

        } catch (error) {
            console.error("Failed to load home data", error);
        }
    };
    fetchData();
  }, []);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/ilanlar?district=${searchTerm}`);
  };

  return (
    <MotionDiv 
        className="w-full"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
    >
      {/* HERO SECTION */}
      <section className="relative h-[85vh] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
            <img 
                src={heroSettings.heroImage} 
                alt="Dies Emlak" 
                className="w-full h-full object-cover object-center"
            />
            {/* Dark Navy Blue Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-dies-blue/90 via-dies-blue/60 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-dies-light to-transparent h-24 mt-auto"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4">
            <div className="max-w-3xl w-full">
                <MotionDiv
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1 mb-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                        <span className="w-2 h-2 rounded-full bg-dies-red"></span>
                        <h2 className="text-white font-bold tracking-widest uppercase text-xs">Dies Gayrimenkul</h2>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white mb-6 leading-tight drop-shadow-2xl">
                        {heroSettings.heroTitle.split(' ').slice(0, 1)} <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-200">{heroSettings.heroTitle.split(' ').slice(1).join(' ')}</span>
                    </h1>
                    <p className="text-slate-100 text-base md:text-xl font-medium mb-10 max-w-2xl leading-relaxed drop-shadow-md">
                        Batman'ın en prestijli portföyü ve uzman kadrosu ile gayrimenkul süreçlerinizi güvenle yönetiyoruz.
                    </p>
                </MotionDiv>

                {/* Search Bar - Responsive Fix */}
                <MotionForm 
                    onSubmit={handleSearch}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-white p-2 rounded-3xl md:rounded-full shadow-2xl flex flex-col md:flex-row gap-2 w-full max-w-2xl"
                >
                    <div className="flex-grow px-4 md:px-6 py-3 md:py-4 flex items-center w-full">
                        <Search className="text-dies-blue mr-3 shrink-0" />
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Konum, proje veya ilan no..." 
                            className="bg-transparent border-none outline-none text-dies-dark placeholder-gray-400 w-full min-w-0 font-medium text-sm md:text-base"
                        />
                    </div>
                    <button 
                        type="submit"
                        className="bg-dies-red hover:bg-red-700 text-white px-8 md:px-10 py-3 md:py-4 rounded-full font-bold transition-all shadow-lg uppercase tracking-wide text-sm w-full md:w-auto shrink-0"
                    >
                        ARA
                    </button>
                </MotionForm>
            </div>
        </div>
      </section>

      {/* FEATURED LISTINGS - GRID LAYOUT */}
      {featuredProperties.length > 0 && (
          <section className="py-16 md:py-24 bg-dies-light">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-12 gap-4">
                    <div className="w-full md:w-auto">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-dies-dark mb-3">
                            Öne Çıkan <span className="text-dies-blue">Fırsatlar</span>
                        </h2>
                        <p className="text-dies-slate text-base md:text-lg">Portföyümüzdeki en güncel ve seçkin ilanlar.</p>
                    </div>
                    
                    <Link to="/ilanlar" className="w-full md:w-auto justify-center px-6 py-3 bg-white text-dies-blue font-bold rounded-full shadow-sm border border-gray-100 hover:shadow-md hover:text-dies-red transition-all flex items-center gap-2">
                        Tüm İlanları Gör <ArrowRight size={18} />
                    </Link>
                </div>
                
                {/* Updated grid to 3 columns on large screens for standard sizing */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredProperties.map((prop, index) => (
                        <MotionDiv 
                            key={`${prop.id}-${index}`}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="h-full"
                        >
                            <PropertyCard property={prop} />
                        </MotionDiv>
                    ))}
                </div>
            </div>
          </section>
      )}

      {/* VALUES */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {[
                    { icon: Shield, title: "Güvenilir Hizmet", desc: "Şeffaf süreç yönetimi ve kurumsal yaklaşım." },
                    { icon: HomeIcon, title: "Geniş Portföy", desc: "Her bütçeye uygun zengin gayrimenkul seçenekleri." },
                    { icon: TrendingUp, title: "Yüksek Kazanç", desc: "Doğru fiyatlandırma ve stratejik yatırım danışmanlığı." }
                ].map((item, idx) => (
                    <div key={idx} className="group p-6 md:p-8 rounded-2xl bg-dies-light hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-xl transition-all duration-300">
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white shadow-md flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-gray-50">
                            <item.icon className="text-dies-blue w-7 h-7 md:w-8 md:h-8" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-dies-dark mb-3">{item.title}</h3>
                        <p className="text-dies-slate leading-relaxed text-sm md:text-base">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* FOUNDERS / TEAM */}
      <section className="py-16 md:py-24 bg-dies-blue text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-dies-red/20 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="container mx-auto px-4 relative z-10">
             <div className="text-center mb-12 md:mb-16">
                 <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Kurucu Ortaklar</h2>
                 <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto">Sektörün öncü isimleri ile güvenilir yatırımın adresi.</p>
             </div>
             
             <div className="flex flex-wrap justify-center gap-8 md:gap-10">
                {founders.map((founder, i) => (
                    <Link to={`/danisman/${founder.id}`} key={founder.id} className="w-full md:w-auto">
                        <MotionDiv 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.2 }}
                            className="group relative w-full md:w-96 bg-white/10 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/10 hover:bg-white hover:border-white transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
                        >
                            <div className="w-32 h-32 md:w-36 md:h-36 mx-auto rounded-full p-1 bg-gradient-to-br from-dies-red to-dies-blue mb-6 group-hover:scale-105 transition-transform shadow-lg">
                                <img src={founder.image} alt={founder.name} className="w-full h-full object-cover rounded-full border-4 border-white" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-dies-dark mb-1 transition-colors whitespace-nowrap overflow-hidden text-ellipsis px-1">{founder.name}</h3>
                                <p className="text-dies-red font-bold uppercase tracking-widest text-xs mb-6 bg-white/10 inline-block px-3 py-1 rounded-full group-hover:bg-dies-red/10 group-hover:text-dies-red transition-colors">{founder.role}</p>
                                
                                <div className="inline-block px-6 py-2 rounded-full border border-white/30 text-white text-sm font-bold group-hover:bg-dies-blue group-hover:border-dies-blue group-hover:text-white transition-all">
                                    Profili İncele
                                </div>
                            </div>
                        </MotionDiv>
                    </Link>
                ))}
             </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
            <div className="bg-dies-light rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 shadow-inner border border-gray-100 text-center md:text-left">
                <div className="max-w-xl">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-dies-dark mb-4">Ekibimize Katılın</h2>
                    <p className="text-dies-slate text-base md:text-lg mb-8">
                        Gayrimenkul sektöründe kariyer hedefliyor ve yüksek kazanç elde etmek istiyorsanız, Dies ailesi sizi bekliyor.
                    </p>
                    <Link to="/danisman-ol" className="inline-flex items-center gap-2 bg-dies-blue text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-900 transition-all shadow-lg hover:shadow-xl">
                        Başvuru Yap <ArrowRight size={20} />
                    </Link>
                </div>
                <div className="hidden md:block">
                     <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-2xl border-8 border-white">
                        <HomeIcon className="text-dies-blue w-20 h-20" />
                     </div>
                </div>
            </div>
        </div>
      </section>
    </MotionDiv>
  );
};
