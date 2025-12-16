
import React, { useState } from 'react';
import { useTheme } from '../components/ThemeContext';
import { CheckCircle, Building, User, Mail, Phone, Calendar, BookOpen, MapPin, Briefcase, ArrowRight, Loader } from 'lucide-react';
// @ts-ignore
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export const OfficeApplication = () => {
  const { theme } = useTheme();
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data: any = {};
    formData.forEach((value, key) => (data[key] = value));

    try {
        await api.applications.submitOffice(data);
        setSubmitted(true);
        window.scrollTo(0, 0);
    } catch (error) {
        console.error("Submission failed", error);
        alert("Başvuru gönderilirken bir hata oluştu.");
    } finally {
        setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 pt-20">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-xl animate-bounce">
            <CheckCircle className="text-white w-12 h-12" />
        </div>
        <h2 className="text-4xl font-extrabold text-dies-dark mb-4">Başvurunuz Alındı!</h2>
        <p className="text-gray-500 max-w-md text-lg leading-relaxed mb-8">
            Ofis açma (Bayilik) başvurunuz bize ulaştı. Franchise departmanımız başvurunuzu değerlendirdikten sonra sizinle iletişime geçecektir.
        </p>
        <Link to="/" className="bg-dies-blue text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-900 transition-all">
            Anasayfaya Dön
        </Link>
      </div>
    );
  }

  const inputClass = `w-full p-4 rounded-xl border outline-none transition-all ${theme === 'dark' ? 'bg-black border-zinc-700 text-white focus:border-dies-blue' : 'bg-white border-gray-300 text-gray-900 focus:border-dies-blue focus:ring-4 focus:ring-blue-500/10'}`;
  const labelClass = `block text-sm font-bold mb-2 ml-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50">
      <div className="container mx-auto px-4">
        
        <div className="flex flex-col lg:flex-row gap-12 items-start">
            {/* Form Section */}
            <div className="flex-1 w-full">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-dies-dark mb-2">Ofis Başvuru Formu</h1>
                    <p className="text-gray-500">Dies Gayrimenkul ailesine katılarak kendi ofisinizi açın.</p>
                </div>

                <div className="bg-white p-8 md:p-10 rounded-3xl shadow-soft border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Ad</label>
                                <input required name="firstName" type="text" placeholder="Adınız" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Soyad</label>
                                <input required name="lastName" type="text" placeholder="Soyadınız" className={inputClass} />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Email adresiniz</label>
                            <input required name="email" type="email" placeholder="ornek@email.com" className={inputClass} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <label className={labelClass}>Telefon</label>
                                <input required name="phone" type="tel" placeholder="05XX XXX XX XX" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Talep Edilen Şehir/Bölge</label>
                                <input required name="city" type="text" placeholder="Şehir giriniz" className={inputClass} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Mevcut Meslek</label>
                                <input name="profession" type="text" placeholder="Mesleğiniz" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Yatırım Bütçesi</label>
                                <select name="budget" className={inputClass}>
                                    <option>Seçiniz</option>
                                    <option>500.000 TL - 1.000.000 TL</option>
                                    <option>1.000.000 TL - 2.500.000 TL</option>
                                    <option>2.500.000 TL ve üzeri</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Eklemek İstedikleriniz (Opsiyonel)</label>
                            <textarea name="details" rows={4} className={inputClass} placeholder="Bize kendinizden ve hedeflerinizden bahsedin..."></textarea>
                        </div>

                        <button disabled={isLoading} type="submit" className="w-full bg-dies-blue hover:bg-blue-900 text-white font-bold text-lg py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2">
                             {isLoading ? <Loader className="animate-spin" /> : <>BAŞVURU GÖNDER <ArrowRight size={20} /></>}
                        </button>
                    </form>
                </div>
            </div>

            {/* Sidebar Info */}
            <div className="hidden lg:block w-96 sticky top-32">
                <div className="bg-dies-blue text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                    {/* Decorative Blob */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    
                    <h3 className="text-2xl font-bold mb-6">Neden Dies?</h3>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <CheckCircle className="shrink-0 mt-1 text-dies-red" />
                            <span className="text-blue-100 text-sm">Güçlü marka bilinirliği ve kurumsal kimlik.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle className="shrink-0 mt-1 text-dies-red" />
                            <span className="text-blue-100 text-sm">Geniş portföy ağı ve CRM altyapısı.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle className="shrink-0 mt-1 text-dies-red" />
                            <span className="text-blue-100 text-sm">Hukuk ve eğitim desteği.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle className="shrink-0 mt-1 text-dies-red" />
                            <span className="text-blue-100 text-sm">Bölge koruması ve yüksek kazanç modeli.</span>
                        </li>
                    </ul>

                    <div className="mt-8 pt-8 border-t border-white/20">
                        <div className="flex items-center gap-3">
                            <Phone className="text-dies-red" />
                            <div>
                                <p className="text-xs text-blue-200 uppercase tracking-wide">Franchise Destek Hattı</p>
                                <p className="font-bold text-lg">+90 543 868 26 68</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
