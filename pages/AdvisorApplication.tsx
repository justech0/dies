import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';

export const AdvisorApplication = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would send data to your PHP backend
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="text-white w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Başvurunuz Alındı!</h2>
        <p className="text-gray-400 max-w-md">
            Gayrimenkul danışmanı başvurunuz bize ulaştı. Ekibimiz en kısa sürede sizinle iletişime geçecektir.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Gayrimenkul Danışmanı Ol</h1>
            <p className="text-gray-400">DİES Ailesine katılın, kariyerinize güçlü bir başlangıç yapın.</p>
        </div>

        <div className="bg-zinc-900 p-8 md:p-12 rounded-2xl border border-zinc-800 shadow-2xl relative overflow-hidden">
            {/* Top decoration */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-dies-red to-red-900"></div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-300">Ad</label>
                        <input required type="text" placeholder="Adınız" className="w-full bg-black/50 border border-zinc-700 rounded-lg p-3 text-white focus:border-dies-red focus:outline-none transition-colors" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-300">Soyad</label>
                        <input required type="text" placeholder="Soyadınız" className="w-full bg-black/50 border border-zinc-700 rounded-lg p-3 text-white focus:border-dies-red focus:outline-none transition-colors" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-300">E-posta</label>
                        <input required type="email" placeholder="ornek@email.com" className="w-full bg-black/50 border border-zinc-700 rounded-lg p-3 text-white focus:border-dies-red focus:outline-none transition-colors" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-300">Telefon</label>
                        <input required type="tel" placeholder="05XX XXX XX XX" className="w-full bg-black/50 border border-zinc-700 rounded-lg p-3 text-white focus:border-dies-red focus:outline-none transition-colors" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-300">Doğum Tarihi</label>
                        <input type="date" className="w-full bg-black/50 border border-zinc-700 rounded-lg p-3 text-white focus:border-dies-red focus:outline-none transition-colors" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-300">Eğitim Durumu</label>
                        <select className="w-full bg-black/50 border border-zinc-700 rounded-lg p-3 text-white focus:border-dies-red focus:outline-none transition-colors">
                            <option>Seçiniz</option>
                            <option>Lise</option>
                            <option>Ön Lisans</option>
                            <option>Lisans</option>
                            <option>Yüksek Lisans</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-300">Daha önce emlak sektöründe çalıştınız mı?</label>
                    <div className="flex gap-6 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="experience" className="accent-dies-red" />
                            <span className="text-white">Evet</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="experience" className="accent-dies-red" />
                            <span className="text-white">Hayır</span>
                        </label>
                    </div>
                </div>

                <div className="space-y-2">
                     <label className="flex items-start gap-3 cursor-pointer mt-4">
                        <input required type="checkbox" className="mt-1 accent-dies-red w-4 h-4" />
                        <span className="text-gray-400 text-sm">
                            Kişisel verilerimin işlenmesine ilişkin aydınlatma metnini okudum ve onaylıyorum.
                        </span>
                     </label>
                </div>

                <button type="submit" className="w-full bg-dies-red hover:bg-red-700 text-white font-bold py-4 rounded-lg transition-all transform hover:scale-[1.01] shadow-lg mt-6">
                    BAŞVURU YAP
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};
