
import React, { useState } from 'react';
import { useTheme } from '../components/ThemeContext';
import { CheckCircle, Building, User, Mail, Phone, Calendar, BookOpen, MapPin, Briefcase, ArrowRight } from 'lucide-react';
// @ts-ignore
import { Link } from 'react-router-dom';

export const OfficeApplication = () => {
  const { theme } = useTheme();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API submission
    setTimeout(() => {
        setSubmitted(true);
        window.scrollTo(0, 0);
    }, 1000);
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
                                <input required type="text" placeholder="Adınız" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Soyad</label>
                                <input required type="text" placeholder="Soyadınız" className={inputClass} />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Email adresiniz</label>
                            <input required type="email" placeholder="ornek@email.com" className={inputClass} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <div className="md