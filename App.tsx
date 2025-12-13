
import React, { useState } from 'react';
// @ts-ignore
import { MemoryRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
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
import { User, Lock, Mail, Phone, User as UserIcon, ArrowRight, Loader, Info, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_USERS } from './services/mockData';

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

        // Simulation Authentication Logic
        setTimeout(() => {
            if (isLogin) {
                // Find user in MOCK_USERS database
                const foundUser = MOCK_USERS.find(u => u.email.toLowerCase() === formData.email.toLowerCase());
                
                // Simple password check simulation (matches email prefix + 123 for demo)
                const mockPassword = formData.email.split('@')[0] + '123';
                
                if (foundUser && formData.password === mockPassword) {
                    login(foundUser);
                    if (foundUser.role === 'admin') {
                        navigate('/admin');
                    } else if (foundUser.role === 'advisor') {
                        navigate('/profil');
                    } else {
                        navigate('/');
                    }
                } else {
                    setError('E-posta veya şifre hatalı. (Demo: admin123, user123...)');
                    setIsLoading(false);
                }
            } else {
                // Registration simulation
                const newUser: any = { 
                    id: Math.floor(Math.random() * 10000) + 1000, 
                    name: formData.name, 
                    email: formData.email, 
                    role: 'user', 
                    type: 'user',
                    phone: formData.phone, 
                    image: '' 
                };
                
                // Add to mock DB so Admin can see them
                MOCK_USERS.push(newUser);
                
                login(newUser);
                navigate('/');
            }
        }, 1000);
    };

    const inputClass = "w-full pl-10 p-4 rounded-xl border border-gray-200 bg-gray-50 text-dies-dark outline-none focus:ring-2 focus:ring-dies-blue focus:bg-white transition-all";
    const labelClass = "block text-sm font-bold mb-2 ml-1 text-dies-slate";

    return (
        <div className="pt-32 pb-20 flex justify-center px-4 min-h-[80vh] items-center bg-gray-50/50">
            <div className="flex flex-col lg:flex-row gap-8 max-w-5xl w-full">
                
                {/* Credentials Info Box (For Demo) */}
                <div className="lg:w-1/3 order-2 lg:order-1">
                    <div className="bg-blue-900 text-white p-8 rounded-3xl shadow-xl h-full flex flex-col justify-center">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Info /> Demo Giriş Bilgileri
                        </h3>
                        <div className="space-y-6">
                            <div className="bg-blue-800/50 p-4 rounded-xl border border-blue-700">
                                <span className="text-xs font-bold text-blue-300 uppercase block mb-1">Yönetici (Tam Yetki)</span>
                                <div className="font-mono text-sm">admin@dies.com</div>
                                <div className="font-mono text-sm text-blue-200">admin123</div>
                            </div>
                            <div className="bg-blue-800/50 p-4 rounded-xl border border-blue-700">
                                <span className="text-xs font-bold text-blue-300 uppercase block mb-1">Danışman (İlan Onay & İstatistik)</span>
                                <div className="font-mono text-sm">advisor@dies.com</div>
                                <div className="font-mono text-sm text-blue-200">advisor123</div>
                            </div>
                            <div className="bg-blue-800/50 p-4 rounded-xl border border-blue-700">
                                <span className="text-xs font-bold text-blue-300 uppercase block mb-1">Normal Kullanıcı (İlan Ekleme)</span>
                                <div className="font-mono text-sm">user@dies.com</div>
                                <div className="font-mono text-sm text-blue-200">user123</div>
                            </div>
                        </div>
                        <p className="mt-6 text-sm text-blue-200 opacity-80">
                            Rolleri test etmek için yukarıdaki bilgileri kullanabilirsiniz.
                        </p>
                    </div>
                </div>

                {/* Login Form */}
                <div className="lg:w-2/3 w-full p-8 md:p-10 rounded-3xl bg-white shadow-soft border border-gray-100 order-1 lg:order-2">
                    
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
        </div>
    );
};

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Layout>
            <Routes>
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
          </Layout>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
