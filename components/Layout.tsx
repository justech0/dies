
import React, { useState, useEffect } from 'react';
// @ts-ignore
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Phone, Instagram, Facebook, User as UserIcon, Building, MapPin, PlusCircle, LogOut, LayoutDashboard, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthContext';
import { DiesLogoIcon } from './Icons';

const MotionDiv = motion.div as any;

const BrandLogo = () => (
    <div className="flex items-center gap-2 transition-transform hover:scale-105">
        <DiesLogoIcon className="h-14 w-auto" />
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
    ? 'bg-gradient-to-b from-black/50 to-transparent py-5' 
    : 'glass-nav shadow-soft py-3';

  // White text on transparent header, Blue text on sticky/white header
  const textClasses = isHome && !isScrolled
    ? 'text-white hover:text-gray-200 drop-shadow-md'
    : 'text-dies-blue hover:text-dies-red';

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-300 ${navbarClasses}`}>
        <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
          {/* Logo Section - Added white background on Hero for logo visibility */}
          <Link to="/" className={`flex-shrink-0 transition-all duration-300 ${isHome && !isScrolled ? 'bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1 shadow-lg' : ''}`}>
             <BrandLogo />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                className={`text-sm font-bold uppercase tracking-wide transition-colors ${textClasses}`}
              >
                {link.name}
              </Link>
            ))}
            
            {user ? (
                <div className={`flex items-center gap-4 ml-4 pl-4 border-l ${isHome && !isScrolled ? 'border-white/30' : 'border-gray-200'}`}>
                     {user.role === 'admin' && (
                         <Link to="/admin" className={`${textClasses} font-bold text-sm flex items-center gap-1`}>
                             <LayoutDashboard size={16} /> Panel
                         </Link>
                     )}
                     <Link to="/profil" className={`text-sm font-bold ${textClasses}`}>
                         {user.name}
                     </Link>
                     <button onClick={handleLogout} className={`${isHome && !isScrolled ? 'text-white/70 hover:text-white' : 'text-gray-400 hover:text-dies-red'}`} title="Çıkış Yap">
                         <LogOut size={20} />
                     </button>
                     <Link 
                        to="/ilan-ver"
                        className="flex items-center gap-2 bg-dies-red text-white px-5 py-2.5 rounded-full font-bold hover:bg-red-700 transition-all transform hover:scale-105 text-sm shadow-lg shadow-dies-red/20"
                    >
                        <PlusCircle size={16} />
                        İlan Ekle
                    </Link>
                </div>
            ) : (
                <div className="flex items-center gap-3 ml-4">
                    <Link 
                        to="/giris"
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all transform hover:scale-105 text-sm shadow-lg ${
                            isHome && !isScrolled 
                            ? 'bg-white text-dies-blue hover:bg-gray-100' 
                            : 'bg-dies-blue text-white hover:bg-blue-900'
                        }`}
                    >
                        <UserIcon size={16} />
                        Giriş Yap
                    </Link>
                </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="lg:hidden flex items-center gap-4">
            <button 
                onClick={() => setIsMobileMenuOpen(true)} 
                className={`p-2 transition-colors ${isHome && !isScrolled ? 'text-white' : 'text-dies-blue'}`}
            >
                <Menu size={32} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <MotionDiv 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 z-[60] flex flex-col bg-white"
          >
            <div className="p-6 flex justify-between items-center border-b border-gray-100">
              <div className="flex-shrink-0">
                  <BrandLogo />
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-dies-blue hover:text-dies-red">
                <X size={32} />
              </button>
            </div>
            
            <div className="flex flex-col p-8 space-y-6 overflow-y-auto h-full">
              {user && (
                   <div className="mb-4 pb-4 border-b border-gray-100">
                       <p className="text-lg font-bold text-dies-dark">Merhaba, {user.name}</p>
                       <Link to="/profil" onClick={() => setIsMobileMenuOpen(false)} className="text-sm text-dies-blue mt-1 block">Profilim</Link>
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
                  className="text-2xl font-bold text-dies-blue hover:text-dies-red transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              
              <hr className="border-gray-100 my-4" />
              
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
                        onClick={handleLogout}
                        className="text-xl font-medium text-left text-gray-500 hover:text-red-500"
                    >
                        Çıkış Yap
                    </button>
                  </>
              ) : (
                 <Link 
                    to="/giris"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-xl font-medium text-dies-blue"
                 >
                    Giriş Yap / Üye Ol
                 </Link>
              )}

              <div className="mt-auto pt-8">
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-4">İletişim</p>
                <div className="flex items-start gap-3 mb-4 text-dies-dark font-medium">
                    <Phone size={18} className="text-dies-red mt-1" />
                    <div className="flex flex-col gap-2">
                        <a href="tel:+905438682668" className="hover:text-dies-blue">+90 543 868 26 68</a>
                        <a href="tel:+905059969612" className="hover:text-dies-blue">+90 505 996 96 12</a>
                    </div>
                </div>
                <div className="flex gap-4 mt-6">
                    <a href="https://www.instagram.com/diesgayrimenkul/" target="_blank" rel="noreferrer" className="text-dies-blue hover:text-dies-red">
                        <Instagram size={28} />
                    </a>
                    <a href="https://www.facebook.com/diesgayrimenkul/" target="_blank" rel="noreferrer" className="text-dies-blue hover:text-dies-red">
                        <Facebook size={28} />
                    </a>
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
  return (
    <footer className="bg-dies-blue text-white pt-20 pb-8 border-t border-slate-800 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-dies-red/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand */}
          <div>
            <div className="mb-6 bg-white w-fit p-3 rounded-xl">
                 <div className="flex items-center gap-2">
                    <DiesLogoIcon className="h-10 w-auto" />
                 </div>
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
                    <Building size={18} />
                </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-6 uppercase tracking-wider text-sm text-dies-red">Hızlı Erişim</h3>
            <ul className="space-y-3 text-sm text-slate-300">
                <li><Link to="/ilanlar?type=satilik" className="hover:text-white hover:pl-2 transition-all">Satılık Konutlar</Link></li>
                <li><Link to="/ilanlar?type=kiralik" className="hover:text-white hover:pl-2 transition-all">Kiralık Konutlar</Link></li>
                <li><Link to="/ilanlar?cat=arsa" className="hover:text-white hover:pl-2 transition-all">Arsa & Yatırım</Link></li>
                <li><Link to="/danismanlar" className="hover:text-white hover:pl-2 transition-all">Danışmanlarımız</Link></li>
                <li><Link to="/ofislerimiz" className="hover:text-white hover:pl-2 transition-all">Ofislerimiz</Link></li>
            </ul>
          </div>

           {/* Contact */}
           <div>
            <h3 className="font-bold mb-6 uppercase tracking-wider text-sm text-dies-red">İletişim</h3>
            <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                   <a href="https://maps.app.goo.gl/CsFkuohU5wpcnTBC9" target="_blank" rel="noreferrer" className="flex items-start gap-3 hover:text-white transition-colors">
                      <MapPin className="text-dies-red shrink-0 mt-1" size={16} />
                      <span>Bahçelievler, Mimar Sinan Cd., Batman</span>
                   </a>
                </li>
                <li className="flex items-start gap-3">
                    <Phone className="text-dies-red shrink-0 mt-1" size={16} />
                    <div className="flex flex-col gap-1">
                        <a href="tel:+905438682668" className="hover:text-white transition-colors">+90 543 868 26 68</a>
                        <a href="tel:+905059969612" className="hover:text-white transition-colors">+90 505 996 96 12</a>
                    </div>
                </li>
                <li className="flex items-center gap-3">
                    <Mail className="text-dies-red shrink-0" size={16} />
                    <a href="mailto:info@diesgayrimenkul.com" className="hover:text-white transition-colors">info@diesgayrimenkul.com</a>
                </li>
            </ul>
          </div>

          {/* Map */}
          <div className="h-48 w-full rounded-xl overflow-hidden bg-white/5 relative group border border-white/10">
            <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3148.5258233321806!2d41.13082377516564!3d37.8947704719553!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x400b47c6e367302b%3A0x6a4e4709257db75b!2sBATMAN%20D%C4%B0ES%20EMLAK%20%26%20GAYR%C4%B0MENKUL!5e0!3m2!1str!2str!4v1763740477579!5m2!1str!2str" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale group-hover:grayscale-0 transition-all duration-500 opacity-80 group-hover:opacity-100"
            ></iframe>
          </div>

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
