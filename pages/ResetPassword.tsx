
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, CheckCircle, Loader, AlertCircle } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

const MotionDiv = motion.div as any;

export const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(location.search);
    const token = query.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            setError('Sıfırlama anahtarı (token) eksik. Lütfen e-postadaki linki kontrol edin.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Şifreler birbiriyle eşleşmiyor.');
            return;
        }

        if (password.length < 8) {
            setError('Şifre en az 8 karakter olmalıdır.');
            return;
        }

        setIsLoading(true);
        try {
            await api.auth.resetPassword({ token, new_password: password });
            setIsSuccess(true);
        } catch (err) {
            setError((err as Error).message || 'Şifre sıfırlanamadı. Bağlantı geçersiz veya süresi dolmuş olabilir.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-[80vh] pt-32 flex justify-center items-center px-4">
                <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-soft border border-gray-100 text-center">
                    <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-dies-dark mb-4">Şifre Güncellendi</h2>
                    <p className="text-gray-500 mb-8">Yeni şifrenizle giriş yapabilirsiniz.</p>
                    <Link to="/giris" className="w-full bg-dies-blue hover:bg-blue-900 text-white py-4 rounded-xl font-bold block transition-all">Giriş Yap</Link>
                </div>
            </div>
        );
    }

    return (
        <MotionDiv 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-[80vh] pt-32 flex justify-center items-center px-4"
        >
            <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl shadow-soft border border-gray-100">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-extrabold text-dies-dark mb-2">Yeni Şifre Belirle</h2>
                    <p className="text-gray-400">Güvenliğiniz için güçlü bir şifre seçin.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold flex items-start gap-3">
                        <AlertCircle className="shrink-0 mt-0.5" size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold mb-2 ml-1 text-dies-slate">Yeni Şifre</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-4 text-gray-400" size={20} />
                            <input 
                                required 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-12 p-4 rounded-xl border border-gray-200 bg-gray-50 text-dies-dark outline-none focus:ring-2 focus:ring-dies-blue transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2 ml-1 text-dies-slate">Şifre Tekrar</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-4 text-gray-400" size={20} />
                            <input 
                                required 
                                type="password" 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-12 p-4 rounded-xl border border-gray-200 bg-gray-50 text-dies-dark outline-none focus:ring-2 focus:ring-dies-blue transition-all"
                            />
                        </div>
                    </div>

                    <button 
                        disabled={isLoading || !token}
                        type="submit" 
                        className="w-full bg-dies-blue hover:bg-blue-900 text-white py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader className="animate-spin" /> : <><ArrowRight size={18} /> Şifreyi Güncelle</>}
                    </button>
                </form>
            </div>
        </MotionDiv>
    );
};
