import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ThemeProvider } from './components/ThemeContext';
import { AuthProvider } from './components/AuthContext';
import { Home } from './pages/Home';
import { Listings } from './pages/Listings';
import { ListingDetail } from './pages/ListingDetail';
import { AdvisorApplication } from './pages/AdvisorApplication';
import { AdvisorDetail } from './pages/AdvisorDetail';
import { CreateListing } from './pages/CreateListing';
import { AdminDashboard } from './pages/AdminDashboard';
import { Profile } from './pages/Profile';
import { useTheme } from './components/ThemeContext';
import { useAuth } from './components/AuthContext'; 
import { User, Lock, Mail, Phone, User as UserIcon, ArrowRight, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Login/Register Component
const Login = () => {
    const { theme } = useTheme();
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
        role: 'user' // Default registration role
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // API Simulation / Real Call
        try {
            const data = new FormData();
            data.append('action', isLogin ? 'login' : 'register');
            data.append('email', formData.email);
            data.append('password', formData.password);
            
            if (!isLogin) {
                data.append('name', formData.name);
                data.append('phone', formData.phone);
                data.append('role', 'user'); // Force user role for public registration
            }

            const response = await fetch('/api/auth.php', {
                method: 'POST',
                body: data
            });

            const result = await response.json();

            if (result.success) {
                // Login successful (or registration successful and auto-login)
                login(result.user);
                navigate('/'); // Redirect to home
            } else {
                setError(result.message || 'Bir hata oluştu.');
            }
        } catch (err) {
            console.error(err);
            // Fallback for demo if API is not running
            if (formData.email === 'test@dies.com') {
                login({ id: 1, name: 'Demo User', email: 'test@dies.com', role: 'admin', phone: '', image: '', instagram: '', facebook: '' });
                navigate('/');
            } else {
                 setError('Sunucu bağlantısı kurulamadı. Lütfen tekrar deneyin.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = `w-full pl-10 p-3 rounded-lg border outline-none transition-all focus:ring-2 focus:ring-dies-red ${theme === 'dark' ? 'bg-black/50 border-zinc-700 text-white placeholder-zinc-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`;
    const labelClass = `block text-sm font-bold mb-1 ml-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`;

    return (
        <div className="pt-32 pb-20 flex justify-center px-4">
            <div className={`w-full max-w-md p-8 rounded-2xl border shadow-2xl ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
                
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.h2 
                        key={isLogin ? 'login-title' : 'register-title'}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                    >
                        {isLogin ? 'Tekrar Hoşgeldiniz' : 'Aramıza Katılın'}
                    </motion.h2>
                    <p className="text-gray-500 text-sm">
                        {isLogin ? 'Hesabınıza giriş yaparak devam edin.' : 'DİES dünyasının ayrıcalıklarından yararlanın.'}
                    </p>
                </div>

                {/* Toggle */}
                <div className={`flex p-1 rounded-lg mb-8 ${theme === 'dark' ? 'bg-black' : 'bg-gray-100'}`}>
                    <button 
                        onClick={() => { setIsLogin(true); setError(''); }}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${isLogin ? 'bg-dies-red text-white shadow-lg' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Giriş Yap
                    </button>
                    <button 
                        onClick={() => { setIsLogin(false); setError(''); }}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${!isLogin ? 'bg-dies-red text-white shadow-lg' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Kayıt Ol
                    </button>
                </div>

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm font-medium text-center"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {!isLogin && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4 overflow-hidden"
                            >
                                <div>
                                    <label className={labelClass}>Ad Soyad</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                        <input 
                                            name="name" 
                                            required 
                                            type="text" 
                                            placeholder="Adınız Soyadınız" 
                                            value={formData.name}
                                            onChange={handleChange}
                                            className={inputClass} 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Telefon</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                        <input 
                                            name="phone" 
                                            required 
                                            type="tel" 
                                            placeholder="05XX XXX XX XX" 
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className={inputClass} 
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div>
                        <label className={labelClass}>E-posta</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input 
                                name="email" 
                                required 
                                type="email" 
                                placeholder="ornek@email.com" 
                                value={formData.email}
                                onChange={handleChange}
                                className={inputClass} 
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Şifre</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input 
                                name="password" 
                                required 
                                type="password" 
                                placeholder="••••••••" 
                                value={formData.password}
                                onChange={handleChange}
                                className={inputClass} 
                            />
                        </div>
                    </div>

                    <button 
                        disabled={isLoading}
                        type="submit" 
                        className="w-full bg-dies-red hover:bg-red-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-dies-red/20 transform transition hover:scale-[1.02] flex items-center justify-center gap-2 mt-6"
                    >
                        {isLoading ? <Loader className="animate-spin" /> : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')}
                        {!isLoading && <ArrowRight size={20} />}
                    </button>
                </form>
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
              <Route path="/giris" element={<Login />} />
              <Route path="/danisman/:id" element={<AdvisorDetail />} />
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