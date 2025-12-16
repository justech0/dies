
import React, { useState } from 'react';
// @ts-ignore
import { MemoryRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ThemeProvider } from './components/ThemeContext';
import { AuthProvider, useAuth } from './components/AuthContext';
import { Home } from './pages/Home';
import { Listings } from './pages/Listings';
import { ListingDetail } from './pages/ListingDetail';
import { AdvisorApplication } from './pages/AdvisorApplication';
import { OfficeApplication } from './pages/OfficeApplication';
import { AdvisorDetail } from './pages/AdvisorDetail';
import { CreateListing } from './pages/CreateListing';
import { AdminDashboard } from './pages/AdminDashboard';
import { Profile } from './pages/Profile';
import { Offices } from './pages/Offices';
import { Advisors } from './pages/Advisors';
import { Lock, Mail, Phone, User as UserIcon, ArrowRight, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from './services/api';

const MotionH2 = motion.h2 as any;
const MotionDiv = motion.div as any;

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'user'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isLogin) {
                // Real Login API Call
                const response = await api.auth.login({
                    email: formData.email,
                    password: formData.password
                });
                
                login(response.user, response.token);
                
                if (response.user.role === 'admin') {
                    navigate('/admin');
                } else if (response.user.role === 'advisor') {
                    navigate('/profil');
                } else {
                    navigate('/');
                }
            } else {
                // Real Register API Call
                const response = await api.auth.register({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password
                });
                
                login(response.user, response.token);
                navigate('/');
            }
        } catch (err) {
            console.error("Auth error", err);
            setError((err as Error).message || 'İşlem başarısız oldu.');
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "w-full pl-10 p-4 rounded-xl border border-gray-200 bg-gray-50 text-dies-dark outline-none focus:ring-2 focus:ring-dies-blue focus:bg-white transition-all";
    const labelClass = "block text-sm font-bold mb-2 ml-1 text-dies-slate";

    return (
        <MotionDiv 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="pt-32 pb-20 flex justify-center px-4 min-h-[80vh] items-center bg-gray-50/50"
        >
            <div className="w-full max-w-lg">
                {/* Login Form */}
                <div className="w-full p-8 md:p-10 rounded-3xl bg-white shadow-soft border border-gray-100">
                    
                    <div className="text-center mb-8">
                        <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UserIcon className="text-dies-blue w-8 h-8" />
                        </div>
                        <MotionH2 
                            key={isLogin ? 'login-title' : 'register-title'}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl font-extrabold text-dies-dark mb-2"
                        >
                            {isLogin ? 'Hoşgeldiniz' : 'Hesap Oluştur'}
                        </MotionH2>
                        <p className="text-gray-400 font-medium">
                            {isLogin ? 'Hesabınıza giriş yapın.' : 'Dies ayrıcalıklarına katılın.'}
                        </p>
                    </div>

                    <div className="flex p-1.5 rounded-xl mb-8 bg-gray-100">
                        <button 
                            onClick={() => { setIsLogin(true); setError(''); }}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-white text-dies-blue shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Giriş Yap
                        </button>
                        <button 
                            onClick={() => { setIsLogin(false); setError(''); }}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-white text-dies-blue shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Kayıt Ol
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <AnimatePresence mode="popLayout">
                            {!isLogin && (
                                <MotionDiv
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-5 overflow-hidden"
                                >
                                    <div>
                                        <label className={labelClass}>Ad Soyad</label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-3 top-4 text-gray-400" size={20} />
                                            <input name="name" required type="text" placeholder="Adınız Soyadınız" value={formData.name} onChange={handleChange} className={inputClass} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Telefon</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-4 text-gray-400" size={20} />
                                            <input name="phone" required type="tel" placeholder="05XX XXX XX XX" value={formData.phone} onChange={handleChange} className={inputClass} />
                                        </div>
                                    </div>
                                </MotionDiv>
                            )}
                        </AnimatePresence>

                        <div>
                            <label className={labelClass}>E-posta</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-4 text-gray-400" size={20} />
                                <input name="email" required type="email" placeholder="ornek@email.com" value={formData.email} onChange={handleChange} className={inputClass} />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Şifre</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-4 text-gray-400" size={20} />
                                <input name="password" required type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} className={inputClass} />
                            </div>
                        </div>

                        <button 
                            disabled={isLoading}
                            type="submit" 
                            className="w-full bg-dies-blue hover:bg-blue-900 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-900/20 transform transition hover:scale-[1.02] flex items-center justify-center gap-2 mt-4"
                        >
                            {isLoading ? <Loader className="animate-spin" /> : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')}
                            {!isLoading && <ArrowRight size={20} />}
                        </button>
                    </form>
                </div>
            </div>
        </MotionDiv>
    );
};

// Seperate component for Routes to use useLocation
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/ilanlar" element={<Listings />} />
        <Route path="/ilan/:id" element={<ListingDetail />} />
        <Route path="/danisman-ol" element={<AdvisorApplication />} />
        <Route path="/ofis-basvuru" element={<OfficeApplication />} />
        <Route path="/giris" element={<Login />} />
        <Route path="/danisman/:id" element={<AdvisorDetail />} />
        <Route path="/danismanlar" element={<Advisors />} />
        <Route path="/ofislerimiz" element={<Offices />} />
        <Route path="/ilan-ver" element={<CreateListing />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/profil" element={<Profile />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Layout>
            <AnimatedRoutes />
          </Layout>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
