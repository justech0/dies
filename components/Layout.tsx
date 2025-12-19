
import React, { useState, useEffect } from 'react';
// @ts-ignore
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Phone, Instagram, Facebook, User as UserIcon, Building, MapPin, PlusCircle, LogOut, LayoutDashboard, Mail, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthContext';
import { DiesLogoIcon, SahibindenIcon } from './Icons';

const MotionDiv = motion.div as any;

interface BrandLogoProps {
  isTransparent: boolean;
  isHidden?: boolean;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ isTransparent, isHidden }) => (
  <div className={`
    flex items-center justify-center transition-all duration-200 hover:scale-105 
    px-2 py-1 md:px-3 md:py-1.5 rounded-lg border 
    ${isHidden ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100'}
    ${isTransparent 
      ? 'border-white/10 bg-white/5 backdrop-blur-sm shadow-sm' 
      : 'border-gray-100 bg-white shadow-soft'}
  `}>
    <DiesLogoIcon className="h-7 md:h-9 w-auto" />
  </div>
);

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { name: 'Anasayfa', path: '/' },
    { name: 'İlanlar', path: '/ilanlar' },
    { name: 'Ofislerimiz', path: '/ofislerimiz' },
    { name: 'Danışmanlarımız', path: '/danismanlar' },
  ];

  const navbarClasses = isHome && !isScrolled 
    ? 'bg-gradient-to-b from-black/50 to-transparent py-4 md:py-6' 
    : 'glass-nav shadow-soft py-2 md:py-3';

  const textClasses = isHome && !isScrolled
    ? 'text-white hover:text-white/80'
    : 'text-dies-blue hover:text-dies-red';

  const isTransparent = isHome && !isScrolled;

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-300 ${navbarClasses}`}>
        <div className="max-w-[1800px] mx-auto pl-2 md:pl-4 pr-4 md:pr-8 flex items-center justify-between h-full">
          
          <div className="flex-shrink-0">
            <Link to="/" className="transition-all duration-200 block">
               <BrandLogo isTransparent={isTransparent} isHidden={isMobileMenuOpen} />
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-8 xl:gap-12">
            <div className="flex items-center gap-6 xl:gap-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path} 
                  className={`text-[13px] font-extrabold uppercase tracking-widest transition-all hover:scale-105 ${textClasses}`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4 pl-8 border-l border-gray-100/20">
              {user ? (
                <>
                   {user.role === 'admin' && (
                     <Link to="/admin" className={`${textClasses} font-bold text-xs flex items-center gap-1.5 px-2`}>
                       <LayoutDashboard size={16} /> Panel
                     </Link>
                   )}
                   <Link to="/profil" className={`text-xs font-extrabold ${textClasses} px-2 whitespace-nowrap`}>
                     {user.name}
                   </Link>
                   <button onClick={handleLogout} className={`p-2 ${isHome && !isScrolled ? 'text-white/70 hover:text-white' : 'text-gray-400 hover:text-dies-red'}`} title="Çıkış Yap">
                     <LogOut size={18} />
                   </button>
                   <Link 
                      to="/ilan-ver"
                      className="flex items-center gap-2 bg-dies-red text-white px-6 py-2.5 rounded-full font-bold transition-all transform hover:scale-105 active:scale-95 text-xs shadow-lg shadow-dies-red/20 ml-2"
                  >
                      <PlusCircle size={16} />
                      İlan Ekle
                  </Link>
                </>
              ) : (
                <Link 
                  to="/giris"
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all transform hover:scale-105 text-[11px] shadow-md whitespace-nowrap ${
                    isHome && !isScrolled 
                    ? 'bg-white text-dies-blue hover:bg-gray-100' 
                    : 'bg-dies-blue text-white hover:bg-blue-900'
                  }`}
                >
                  <UserIcon size={14} />
                  Giriş Yap / Üye Ol
                </Link>
              )}
            </div>
          </div>

          <div className="lg:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(true)} 
              className={`p-2 transition-transform active:scale-90 ${isHome && !isScrolled ? 'text-white' : 'text-dies-blue'}`}
            >
              <Menu size={32} />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <MotionDiv 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] flex flex-col bg-white"
          >
            {/* MOBİL BAŞLIK: LOGO - BUTON - KAPAT */}
            <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-white shadow-sm">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="shrink-0">
                <DiesLogoIcon className="h-6 w-auto" />
              </Link>

              <div className="flex-1 flex justify-center px-4">
                {user ? (
                    <Link 
                        to="/profil" 
                        onClick={() => setIsMobileMenuOpen(false)} 
                        className="text-[9px] font-black text-dies-blue uppercase border border-dies-blue/30 bg-blue-50/50 px-4 py-1.5 rounded-full truncate max-w-[140px] shadow-sm flex items-center gap-2"
                    >
                        <UserIcon size={12} /> {user.name}
                    </Link>
                ) : (
                    <Link 
                        to="/giris" 
                        onClick={() => setIsMobileMenuOpen(false)} 
                        className="text-[9px] font-black text-white uppercase bg-dies-blue px-5 py-2 rounded-full shadow-md shadow-blue-900/10 active:scale-95 transition-transform whitespace-nowrap"
                    >
                        GİRİŞ YAP / ÜYE OL
                    </Link>
                )}
              </div>

              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="p-2 text-dies-blue hover:text-dies-red transition-colors shrink-0"
              >
                <X size={28} />
              </button>
            </div>
            
            <div className="flex flex-col p-6 md:p-10 space-y-6 overflow-y-auto h-full">
              {user && (
                <div className="mb-4 pb-4 border-b border-gray-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-dies-blue border border-blue-100">
                    <UserIcon size={24} />
                  </div>
                  <div>
                    <p className="text-lg font-black text-dies-dark tracking-tight">Hoşgeldiniz</p>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{user.name}</p>
                  </div>
                </div>
              )}
            
              <div className="space-y-4">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    to={link.path} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-3xl font-black text-dies-blue hover:text-dies-red transition-colors tracking-tighter"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
              
              <hr className="border-gray-100 my-4" />
              
              <div className="space-y-6">
                {user && (
                  <>
                    <Link 
                        to="/ilan-ver" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-xl font-bold text-dies-red flex items-center gap-3 bg-red-50 p-5 rounded-3xl border border-red-100 shadow-sm"
                    >
                        <PlusCircle size={22} /> İlan Yayınla
                    </Link>
                    
                    <button 
                        onClick={handleLogout}
                        className="text-lg font-bold text-left text-gray-400 hover:text-red-500 flex items-center gap-3 px-5"
                    >
                        <LogOut size={20} /> Çıkış Yap
                    </button>
                  </>
                )}
              </div>

              <div className="mt-auto pt-10 pb-6">
                 <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 text-center">İLETİŞİM HATLARIMIZ</p>
                    <div className="flex flex-col gap-4 mb-8">
                        <a href="tel:+905438682668" className="flex items-center gap-4 text-dies-blue font-black text-lg group">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-dies-blue shadow-sm border border-gray-100 group-active:scale-90 transition-transform">
                                <Phone size={18} />
                            </div>
                            +90 543 868 26 68
                        </a>
                        <a href="tel:+905059969612" className="flex items-center gap-4 text-dies-blue font-black text-lg group">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-dies-blue shadow-sm border border-gray-100 group-active:scale-90 transition-transform">
                                <Phone size={18} />
                            </div>
                            +90 505 996 96 12
                        </a>
                    </div>
                    <div className="flex justify-center gap-6 pt-4 border-t border-gray-100">
                        <a href="https://www.instagram.com/diesgayrimenkul/" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full flex items-center justify-center bg-white text-dies-blue hover:bg-dies-red hover:text-white transition-all shadow-sm border border-gray-100">
                            <Instagram size={24} />
                        </a>
                        <a href="https://www.facebook.com/diesgayrimenkul/" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full flex items-center justify-center bg-white text-dies-blue hover:bg-dies-red hover:text-white transition-all shadow-sm border border-gray-100">
                            <Facebook size={24} />
                        </a>
                        <a href="https://diesgayrimenkul.sahibinden.com/" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full flex items-center justify-center bg-white text-dies-blue hover:bg-yellow-500 hover:text-white transition-all shadow-sm border border-gray-100">
                            <SahibindenIcon className="text-xl" />
                        </a>
                    </div>
                 </div>
              </div>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </>
  );
};

const Footer = () => {
  const googleMapsUrl = "https://www.google.com/maps/search/?api=1&query=Dies+Gayrimenkul+Batman";

  return (
    <footer className="bg-dies-blue text-white pt-20 pb-8 border-t border-slate-800 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-dies-red/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          <div>
            <div className="mb-6 bg-white w-fit p-1.5 rounded-lg shadow-soft">
               <DiesLogoIcon className="h-8 w-auto" />
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Batman'da konut, arsa ve ticari gayrimenkulde güvenilir danışmanlık. Hayalinizdeki mülke Dies güvencesiyle ulaşın.
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/diesgayrimenkul/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-dies-red text-white transition-colors backdrop-blur-sm">
                <Instagram size={18} />
              </a>
              <a href="https://www.facebook.com/diesgayrimenkul/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-dies-red text-white transition-colors backdrop-blur-sm">
                <Facebook size={18} />
              </a>
              <a href="https://diesgayrimenkul.sahibinden.com/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-yellow-500 text-white transition-colors backdrop-blur-sm">
                <SahibindenIcon className="text-lg" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-6 uppercase tracking-wider text-sm text-dies-red">Hızlı Erişim</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li><Link to="/ilanlar?type=satilik" className="hover:text-white hover:pl-2 transition-all font-medium">Satılık Konutlar</Link></li>
              <li><Link to="/ilanlar?type=kiralik" className="hover:text-white hover:pl-2 transition-all font-medium">Kiralık Konutlar</Link></li>
              <li><Link to="/ilanlar?cat=arsa" className="hover:text-white hover:pl-2 transition-all font-medium">Arsa & Yatırım</Link></li>
              <li><Link to="/danismanlar" className="hover:text-white hover:pl-2 transition-all font-medium">Danışmanlarımız</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-6 uppercase tracking-wider text-sm text-dies-red">İletişim</h3>
            <ul className="space-y-4 text-sm text-slate-300">
              <li>
                  <a href={googleMapsUrl} target="_blank" rel="noreferrer" className="flex items-start gap-3 group hover:text-white transition-colors">
                     <MapPin className="text-dies-red shrink-0 mt-1" size={16} />
                     <span className="group-hover:underline">Bahçelievler, Mimar Sinan Cd., Batman</span>
                  </a>
              </li>
              <li className="flex items-center gap-3">
                  <Phone className="text-dies-red shrink-0" size={16} />
                  <a href="tel:+905438682668" className="hover:text-white transition-colors">+90 543 868 26 68</a>
              </li>
              <li className="flex items-center gap-3">
                  <Phone className="text-dies-red shrink-0" size={16} />
                  <a href="tel:+905059969612" className="hover:text-white transition-colors">+90 505 996 96 12</a>
              </li>
              <li className="flex items-center gap-3">
                  <Mail className="text-dies-red shrink-0" size={16} />
                  <a href="mailto:info@diesgayrimenkul.com" className="hover:text-white transition-colors">info@diesgayrimenkul.com</a>
              </li>
            </ul>
          </div>

          <a href={googleMapsUrl} target="_blank" rel="noreferrer" className="block h-48 w-full rounded-xl overflow-hidden bg-white/5 relative group border border-white/10 shadow-lg cursor-pointer">
            <div className="absolute inset-0 z-20 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="bg-white text-dies-blue px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <ExternalLink size={14} /> Haritada Aç
                </div>
            </div>
            <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3148.5258233321806!2d41.13082377516564!3d37.8947704719553!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x400b47c6e367302b%3A0x6a4e4709257db75b!2sBATMAN%20D%C4%B0ES%20EMLAK%20%26%20GAYR%C4%B0MENKUL!5e0!3m2!1str!2str!4v1763740477579!5m2!1str!2str" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={false}
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale group-hover:grayscale-0 transition-all duration-500 opacity-80 group-hover:opacity-100 pointer-events-none"
            ></iframe>
          </a>

        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500">
          <p className="text-xs">© 2025 Dies Gayrimenkul. Tüm hakları saklıdır.</p>
          <a 
            href="https://bilincreklam.com" 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center gap-2 text-xs hover:text-white transition-colors"
          >
            <span>Design & Development by</span>
            <span className="font-bold text-white">Bilinç Reklam</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-dies-light text-dies-dark">
      <Navbar />
      <main className="flex-grow pt-0">
        {children}
      </main>
      <Footer />
    </div>
  );
};
