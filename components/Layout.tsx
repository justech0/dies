import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Phone, Instagram, Facebook, User as UserIcon, Building, MapPin, Moon, Sun, PlusCircle, LogOut, LayoutDashboard } from 'lucide-react';
import { DiesLogoIcon } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './ThemeContext';
import { useAuth } from './AuthContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Anasayfa', path: '/' },
    { name: 'İlanlar', path: '/ilanlar' },
    { name: 'Ofislerimiz', path: '/ofislerimiz' },
    { name: 'Danışmanlarımız', path: '/danismanlar' },
  ];

  const isDark = theme === 'dark';
  
  // Navbar Background
  const navBgClass = isScrolled 
    ? (isDark ? 'bg-dies-black/95 border-b border-gray-800' : 'bg-white/95 border-b border-gray-200 shadow-sm') 
    : 'bg-transparent py-6';

  // Text Color
  const textColorClass = isDark ? 'text-white' : 'text-black';
  const logoColorClass = isDark ? 'text-white' : 'text-black';
  
  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-300 ${navBgClass}`}>
        <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3 group">
            {/* Icon */}
            <div className="relative">
               <DiesLogoIcon className={`w-12 h-12 ${logoColorClass}`} />
            </div>
            
            {/* Text Stack */}
            <div className="flex flex-col justify-center -space-y-1">
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold tracking-tighter text-dies-red">Dies</span>
                    <span className={`text-2xl font-light tracking-tight ${textColorClass}`}>Emlak</span>
                </div>
                <span className={`text-[10px] tracking-[0.35em] uppercase font-medium ml-0.5 ${textColorClass} opacity-80`}>
                    GAYRİMENKUL
                </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                className={`text-sm font-bold uppercase tracking-wide transition-colors hover:text-dies-red ${textColorClass}`}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Theme Toggle */}
            <button 
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-colors ${isScrolled ? (isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100') : 'hover:bg-white/10'}`}
            >
                {isDark ? (
                  <Sun size={20} className="text-dies-red" />
                ) : (
                  <Moon size={20} className="text-dies-red" />
                )}
            </button>

            {user ? (
                <div className="flex items-center gap-4">
                     {user.role === 'admin' && (
                         <Link to="/admin" className="text-dies-red font-bold text-sm flex items-center gap-1">
                             <LayoutDashboard size={16} /> Panel
                         </Link>
                     )}
                     <div className={`text-sm font-medium ${textColorClass}`}>
                         Merhaba, {user.name}
                     </div>
                     <button onClick={logout} className="text-red-500 hover:text-red-600" title="Çıkış Yap">
                         <LogOut size={20} />
                     </button>
                     <Link 
                        to="/ilan-ver"
                        className="flex items-center gap-2 bg-dies-red text-white px-5 py-2 rounded-full font-bold hover:bg-red-700 transition-all transform hover:scale-105 text-sm shadow-md"
                    >
                        <PlusCircle size={16} />
                        İlan Ekle
                    </Link>
                </div>
            ) : (
                <div className="flex items-center gap-3">
                    <Link 
                        to="/giris"
                        className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold transition-all transform hover:scale-105 text-sm shadow-md
                            ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-dies-black text-white hover:bg-gray-800'}`}
                    >
                        <UserIcon size={16} />
                        Giriş
                    </Link>
                </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="lg:hidden flex items-center gap-4">
             <button 
                onClick={toggleTheme}
                className={`p-2 rounded-full`}
            >
                {isDark ? <Sun size={20} className="text-dies-red" /> : <Moon size={20} className="text-dies-red" />}
            </button>
            <button 
                onClick={() => setIsMobileMenuOpen(true)} 
                className={`p-2 transition-colors ${textColorClass}`}
            >
                <Menu size={32} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className={`fixed inset-0 z-[60] flex flex-col ${isDark ? 'bg-dies-black' : 'bg-white'}`}
          >
            <div className={`p-6 flex justify-between items-center border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="flex items-center gap-2">
                 <DiesLogoIcon className={`w-10 h-10 ${logoColorClass}`} />
                 <div className="flex flex-col -space-y-1">
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-extrabold text-dies-red">Dies</span>
                        <span className={`text-xl font-light ${textColorClass}`}>Emlak</span>
                    </div>
                 </div>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className={`p-2 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}>
                <X size={32} />
              </button>
            </div>
            
            <div className="flex flex-col p-8 space-y-6 overflow-y-auto">
              {user && (
                   <div className="mb-4 pb-4 border-b border-gray-700/20">
                       <p className={`text-lg font-medium ${textColorClass}`}>Merhaba, {user.name}</p>
                       {user.role === 'admin' && (
                            <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-dies-red font-bold block mt-2">
                                Yönetici Paneli
                            </Link>
                       )}
                   </div>
              )}
            
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-2xl font-bold transition-all ${isDark ? 'text-white hover:text-dies-red' : 'text-gray-900 hover:text-dies-red'}`}
                >
                  {link.name}
                </Link>
              ))}
              
              <hr className={`${isDark ? 'border-gray-800' : 'border-gray-200'} my-4`} />
              
              {user ? (
                  <>
                    <Link 
                        to="/ilan-ver" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-xl font-bold text-dies-red flex items-center gap-2"
                    >
                        <PlusCircle /> İlan Ver
                    </Link>
                    <button 
                        onClick={() => { logout(); setIsMobileMenuOpen(false); }} 
                        className={`text-xl font-medium text-left ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                        Çıkış Yap
                    </button>
                  </>
              ) : (
                 <Link 
                    to="/giris"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-xl font-medium text-dies-red"
                 >
                    Giriş Yap / Üye Ol
                 </Link>
              )}

              <div className="mt-auto pt-12">
                <p className="text-gray-500 text-sm uppercase tracking-widest mb-4">İletişim</p>
                <div className={`flex items-center gap-3 mb-2 ${textColorClass}`}>
                    <Phone size={18} className="text-dies-red" />
                    <span>+90 543 868 26 68</span>
                </div>
                <div className="flex gap-4 mt-4">
                    <a href="https://www.instagram.com/diesgayrimenkul/" target="_blank" rel="noreferrer" className="text-dies-red hover:opacity-80">
                        <Instagram size={24} />
                    </a>
                    <a href="https://www.facebook.com/diesgayrimenkul/" target="_blank" rel="noreferrer" className="text-dies-red hover:opacity-80">
                        <Facebook size={24} />
                    </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Footer = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <footer className={`${isDark ? 'bg-dies-black border-gray-900 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'} pt-20 pb-6 border-t`}>
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-transparent rounded">
                   <DiesLogoIcon className={`w-12 h-12 ${isDark ? 'text-white' : 'text-gray-900'}`} />
                </div>
                <div className="flex flex-col -space-y-1">
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold text-dies-red">Dies</span>
                        <span className={`text-2xl font-light ${isDark ? 'text-white' : 'text-black'}`}>Emlak</span>
                    </div>
                    <span className={`text-[10px] tracking-[0.35em] uppercase font-medium ml-0.5 ${isDark ? 'text-white' : 'text-black'} opacity-80`}>
                        GAYRİMENKUL
                    </span>
                </div>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              Batman'da konut, arsa ve ticari gayrimenkulde güvenilir danışmanlık. Hayalinizdeki mülke Dies güvencesiyle ulaşın.
            </p>
            <div className="flex gap-4">
                <a href="https://www.instagram.com/diesgayrimenkul/" target="_blank" rel="noreferrer" className={`w-10 h-10 rounded-full flex items-center justify-center hover:bg-dies-red hover:text-white transition-colors ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-black shadow-sm border border-gray-200'}`}>
                    <Instagram size={18} />
                </a>
                <a href="https://www.facebook.com/diesgayrimenkul/" target="_blank" rel="noreferrer" className={`w-10 h-10 rounded-full flex items-center justify-center hover:bg-dies-red hover:text-white transition-colors ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-black shadow-sm border border-gray-200'}`}>
                    <Facebook size={18} />
                </a>
                <a href="https://diesgayrimenkul.sahibinden.com/" target="_blank" rel="noreferrer" className={`w-10 h-10 rounded-full flex items-center justify-center hover:bg-yellow-400 hover:text-black transition-colors ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-black shadow-sm border border-gray-200'}`}>
                    <Building size={18} />
                </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={`font-bold mb-6 uppercase tracking-wider text-sm ${isDark ? 'text-white' : 'text-black'}`}>Hızlı Erişim</h3>
            <ul className="space-y-3 text-sm">
                <li><Link to="/ilanlar?type=satilik" className="hover:text-dies-red transition-colors">Satılık Konutlar</Link></li>
                <li><Link to="/ilanlar?type=kiralik" className="hover:text-dies-red transition-colors">Kiralık Konutlar</Link></li>
                <li><Link to="/ilanlar?cat=arsa" className="hover:text-dies-red transition-colors">Arsa & Yatırım</Link></li>
                <li><Link to="/danismanlar" className="hover:text-dies-red transition-colors">Danışmanlarımız</Link></li>
                <li><Link to="/ofislerimiz" className="hover:text-dies-red transition-colors">Ofislerimiz</Link></li>
            </ul>
          </div>

           {/* Contact */}
           <div>
            <h3 className={`font-bold mb-6 uppercase tracking-wider text-sm ${isDark ? 'text-white' : 'text-black'}`}>İletişim</h3>
            <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                   <a href="https://maps.app.goo.gl/CsFkuohU5wpcnTBC9" target="_blank" rel="noreferrer" className="flex items-start gap-3 hover:text-dies-red transition-colors">
                      <MapPin className="text-dies-red shrink-0 mt-1" size={16} />
                      <span>Bahçelievler, Mimar Sinan Cd., Batman</span>
                   </a>
                </li>
                <li className="flex items-center gap-3">
                    <Phone className="text-dies-red shrink-0" size={16} />
                    <span>Abdurrahman Tayğav: +90 543 868 26 68</span>
                </li>
                <li className="flex items-center gap-3">
                    <Phone className="text-dies-red shrink-0" size={16} />
                    <span>İsmail Demirbilek: +90 505 996 96 12</span>
                </li>
            </ul>
          </div>

          {/* Map */}
          <div className="h-48 w-full rounded-xl overflow-hidden bg-gray-200 relative group shadow-lg">
            <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3148.5258233321806!2d41.13082377516564!3d37.8947704719553!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x400b47c6e367302b%3A0x6a4e4709257db75b!2sBATMAN%20D%C4%B0ES%20EMLAK%20%26%20GAYR%C4%B0MENKUL!5e0!3m2!1str!2str!4v1763740477579!5m2!1str!2str" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale group-hover:grayscale-0 transition-all duration-500"
            ></iframe>
          </div>

        </div>

        <div className={`border-t pt-6 flex flex-col md:flex-row justify-between items-center gap-4 ${isDark ? 'border-gray-800' : 'border-gray-300'}`}>
            <p className="text-xs">© 2025 Dies Gayrimenkul. Tüm hakları saklıdır.</p>
            <a 
                href="https://bilincreklam.com" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2 text-xs hover:text-dies-red transition-colors"
            >
                <span>Design & Development by</span>
                <span className="font-bold">Bilinç Reklam</span>
            </a>
        </div>
      </div>
    </footer>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();
  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${theme === 'dark' ? 'bg-dies-black text-white' : 'bg-gray-100 text-gray-900'}`}>
      <Navbar />
      <main className="flex-grow pt-0">
        {children}
      </main>
      <Footer />
    </div>
  );
};