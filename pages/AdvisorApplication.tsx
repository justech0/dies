
import React, { useState } from 'react';
import { CheckCircle, Briefcase, User, Mail, Phone, Calendar, BookOpen, Loader } from 'lucide-react';
import { api } from '../services/api';

export const AdvisorApplication = () => {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      birthDate: '',
      education: 'Lisans',
      experience: 'Hayır'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleRadioChange = (val: string) => {
      setFormData({...formData, experience: val});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        await api.applications.submitAdvisor(formData);
        setSubmitted(true);
    } catch (error) {
        console.error("Application error", error);
        alert("Başvuru sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.");
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
        <p className="text-gray-500 max-w-md text-lg leading-relaxed">
            Gayrimenkul danışmanı başvurunuz bize ulaştı. İnsan kaynakları ekibimiz başvurunuzu değerlendirdikten sonra en kısa sürede sizinle iletişime geçecektir.
        </p>
      </div>
    );
  }

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-dies-dark focus:border-dies-blue focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all font-medium placeholder-gray-400";
  const labelClass = "block text-sm font-bold text-gray-700 mb-2 ml-1";

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1.5 mb-4 rounded-full bg-blue-100 text-dies-blue text-xs font-bold uppercase tracking-widest">Kariyer</span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-dies-dark mb-6">Aramıza Katılın</h1>
            <p className="text-gray-500 text-lg">
                Gayrimenkul sektörünün lider markası <span className="text-dies-blue font-bold">DİES</span> ile kariyerinize güçlü bir başlangıç yapın.
                Sınırsız kazanç ve profesyonel çalışma ortamı sizi bekliyor.
            </p>
        </div>

        <div className="max-w-4xl mx-auto">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-soft border border-gray-100 relative overflow-hidden">
                
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-dies-blue/5 rounded-bl-[100px] pointer-events-none"></div>

                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className={labelClass}>Ad</label>
                            <div className="relative">
                                <User className="absolute left-4 top-4 text-gray-400" size={20} />
                                <input required name="firstName" value={formData.firstName} onChange={handleChange} type="text" placeholder="Adınız" className={`${inputClass} pl-12`} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Soyad</label>
                            <div className="relative">
                                <User className="absolute left-4 top-4 text-gray-400" size={20} />
                                <input required name="lastName" value={formData.lastName} onChange={handleChange} type="text" placeholder="Soyadınız" className={`${inputClass} pl-12`} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className={labelClass}>E-posta</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-4 text-gray-400" size={20} />
                                <input required name="email" value={formData.email} onChange={handleChange} type="email" placeholder="ornek@email.com" className={`${inputClass} pl-12`} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Telefon</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-4 text-gray-400" size={20} />
                                <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" placeholder="05XX XXX XX XX" className={`${inputClass} pl-12`} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className={labelClass}>Doğum Tarihi</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-4 text-gray-400" size={20} />
                                <input name="birthDate" value={formData.birthDate} onChange={handleChange} type="date" className={`${inputClass} pl-12`} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Eğitim Durumu</label>
                            <div className="relative">
                                <BookOpen className="absolute left-4 top-4 text-gray-400" size={20} />
                                <select name="education" value={formData.education} onChange={handleChange} className={`${inputClass} pl-12 appearance-none`}>
                                    <option>Seçiniz</option>
                                    <option>Lise</option>
                                    <option>Ön Lisans</option>
                                    <option>Lisans</option>
                                    <option>Yüksek Lisans</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
                        <label className="text-base font-bold text-dies-dark flex items-center gap-2 mb-4">
                            <Briefcase className="text-dies-blue" size={20} />
                            Daha önce emlak sektöründe çalıştınız mı?
                        </label>
                        <div className="flex gap-8">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-dies-blue flex items-center justify-center bg-white transition-colors">
                                    <input type="radio" name="experience" checked={formData.experience === 'Evet'} onChange={() => handleRadioChange('Evet')} className="appearance-none w-3 h-3 rounded-full checked:bg-dies-blue" />
                                </div>
                                <span className="text-gray-700 font-medium group-hover:text-dies-dark">Evet</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-dies-blue flex items-center justify-center bg-white transition-colors">
                                    <input type="radio" name="experience" checked={formData.experience === 'Hayır'} onChange={() => handleRadioChange('Hayır')} className="appearance-none w-3 h-3 rounded-full checked:bg-dies-blue" />
                                </div>
                                <span className="text-gray-700 font-medium group-hover:text-dies-dark">Hayır</span>
                            </label>
                        </div>
                    </div>

                    <div>
                         <label className="flex items-start gap-4 cursor-pointer mt-4 group">
                            <div className="mt-1">
                                <input required type="checkbox" className="w-5 h-5 rounded border-gray-300 text-dies-blue focus:ring-dies-blue" />
                            </div>
                            <span className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-700 transition-colors">
                                Kişisel verilerimin işlenmesine ilişkin aydınlatma metnini okudum ve onaylıyorum. Başvurumun değerlendirilmesi amacıyla bilgilerimin kaydedilmesini kabul ediyorum.
                            </span>
                         </label>
                    </div>

                    <button disabled={isLoading} type="submit" className="w-full bg-dies-blue hover:bg-blue-900 text-white font-bold text-lg py-5 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2">
                        {isLoading ? <Loader className="animate-spin" /> : 'BAŞVURU YAP'}
                    </button>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};
