
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send, CheckCircle, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const MotionDiv = motion.div as any;

export const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await api.auth.forgotPassword(email);
            setIsSubmitted(true);
        } catch (err) {
            setError((err as Error).message || 'E-posta gönderilemedi.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-[80vh] pt-32 flex justify-center items-center px-4">
                <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-soft border border-gray-100 text-center">
                    <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-dies-dark mb-4">Talep Alındı</h2>
                    <p className="text-gray-500 mb-8">
                        Eğer sistemde kayıtlı bir hesabınız varsa, şifre sıfırlama bağlantısı e-posta adresinize gönderilmiştir.
                    </p>
                    <Link to="/giris" className="inline-flex items-center gap-2 text-dies-blue font-bold hover:text-dies-red">
                        <ArrowLeft size={18} /> Giriş Sayfasına Dön
                    </Link>
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
                    <h2 className="text-3xl font-extrabold text-dies-dark mb-2">Şifremi Unuttum</h2>
                    <p className="text-gray-400">Şifrenizi sıfırlamak için kayıtlı e-posta adresinizi girin.</p>
                </div>

                {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold mb-2 ml-1 text-dies-slate">E-posta Adresi</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-4 text-gray-400" size={20} />
                            <input 
                                required 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ornek@email.com"
                                className="w-full pl-12 p-4 rounded-xl border border-gray-200 bg-gray-50 text-dies-dark outline-none focus:ring-2 focus:ring-dies-blue transition-all"
                            />
                        </div>
                    </div>

                    <button 
                        disabled={isLoading}
                        type="submit" 
                        className="w-full bg-dies-blue hover:bg-blue-900 text-white py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader className="animate-spin" /> : <><Send size={18} /> Sıfırlama Bağlantısı Gönder</>}
                    </button>

                    <div className="text-center mt-6">
                        <Link to="/giris" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-dies-blue">
                            <ArrowLeft size={16} /> Geri Dön
                        </Link>
                    </div>
                </form>
            </div>
        </MotionDiv>
    );
};
