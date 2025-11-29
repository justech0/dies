import React, { useState } from 'react';
import { useTheme } from '../components/ThemeContext';
import { useAuth } from '../components/AuthContext';
import { Home, CheckCircle, XCircle, BarChart, Trash2, Clock, Users } from 'lucide-react';
import { MOCK_PROPERTIES, MOCK_ADVISORS } from '../services/mockData';

export const AdminDashboard = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'users'>('overview');

  // Mock logic for the dashboard view
  const pendingListings = [
    { id: 999, title: 'Onay Bekleyen Daire', user: 'Ahmet Y.', date: '2024-05-25', price: 3000000 },
    { id: 998, title: 'Sahibinden Satılık Arsa', user: 'Mehmet K.', date: '2024-05-24', price: 1200000 }
  ];

  if (!user || user.role !== 'admin') {
      return <div className="pt-32 text-center">Erişim izniniz yok.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12 pt-32">
      <div className="flex justify-between items-center mb-8">
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Yönetici Paneli</h1>
        <div className="bg-dies-red px-4 py-2 rounded-lg text-white font-bold text-sm">Admin: {user.name}</div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200 shadow-sm'}`}>
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-500/20 rounded-lg text-blue-500"><Home size={24}/></div>
                <span className="text-green-500 text-xs font-bold">+2 bu hafta</span>
            </div>
            <div className={`text-3xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>142</div>
            <div className="text-gray-500 text-sm">Toplam İlan</div>
        </div>
        <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200 shadow-sm'}`}>
             <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-yellow-500/20 rounded-lg text-yellow-500"><Clock size={24}/></div>
                <span className="text-yellow-500 text-xs font-bold">İşlem Gerekli</span>
            </div>
            <div className={`text-3xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{pendingListings.length}</div>
            <div className="text-gray-500 text-sm">Onay Bekleyen</div>
        </div>
        <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200 shadow-sm'}`}>
             <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-500/20 rounded-lg text-purple-500"><Users size={24}/></div>
            </div>
            <div className={`text-3xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{MOCK_ADVISORS.length}</div>
            <div className="text-gray-500 text-sm">Aktif Danışman</div>
        </div>
        <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200 shadow-sm'}`}>
             <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-green-500/20 rounded-lg text-green-500"><BarChart size={24}/></div>
            </div>
            <div className={`text-3xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>12</div>
            <div className="text-gray-500 text-sm">Bu Ay Satılan</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-700/20">
          <button onClick={() => setActiveTab('overview')} className={`pb-3 px-2 font-bold ${activeTab === 'overview' ? 'text-dies-red border-b-2 border-dies-red' : 'text-gray-500'}`}>Genel Bakış</button>
          <button onClick={() => setActiveTab('listings')} className={`pb-3 px-2 font-bold ${activeTab === 'listings' ? 'text-dies-red border-b-2 border-dies-red' : 'text-gray-500'}`}>Tüm İlanlar</button>
          <button onClick={() => setActiveTab('users')} className={`pb-3 px-2 font-bold ${activeTab === 'users' ? 'text-dies-red border-b-2 border-dies-red' : 'text-gray-500'}`}>Kullanıcılar</button>
      </div>

      {/* Content Area */}
      <div className={`rounded-xl overflow-hidden border ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
          {activeTab === 'overview' && (
              <div className="p-6">
                  <h3 className={`font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Onay Bekleyen İlanlar</h3>
                  <div className="overflow-x-auto">
                      <table className="w-full text-left">
                          <thead>
                              <tr className="text-gray-500 text-sm border-b border-gray-700/20">
                                  <th className="pb-3 pl-4">İlan Başlığı</th>
                                  <th className="pb-3">Kullanıcı</th>
                                  <th className="pb-3">Tarih</th>
                                  <th className="pb-3">Fiyat</th>
                                  <th className="pb-3 text-right pr-4">İşlemler</th>
                              </tr>
                          </thead>
                          <tbody className="text-sm">
                              {pendingListings.map(item => (
                                  <tr key={item.id} className={`border-b border-gray-700/10 hover:bg-gray-500/5`}>
                                      <td className={`py-4 pl-4 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.title}</td>
                                      <td className="text-gray-500">{item.user}</td>
                                      <td className="text-gray-500">{item.date}</td>
                                      <td className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.price.toLocaleString()} TL</td>
                                      <td className="text-right pr-4">
                                          <div className="flex justify-end gap-2">
                                              <button className="bg-green-500 hover:bg-green-600 text-white p-1 rounded"><CheckCircle size={18}/></button>
                                              <button className="bg-red-500 hover:bg-red-600 text-white p-1 rounded"><XCircle size={18}/></button>
                                          </div>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}

          {activeTab === 'listings' && (
             <div className="p-6">
                  <div className="flex justify-between mb-4">
                      <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Aktif İlanlar</h3>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="w-full text-left">
                          <thead>
                              <tr className="text-gray-500 text-sm border-b border-gray-700/20">
                                  <th className="pb-3 pl-4">Başlık</th>
                                  <th className="pb-3">Kategori</th>
                                  <th className="pb-3">Konum</th>
                                  <th className="pb-3 text-right pr-4">İşlem</th>
                              </tr>
                          </thead>
                          <tbody className="text-sm">
                              {MOCK_PROPERTIES.map(item => (
                                  <tr key={item.id} className={`border-b border-gray-700/10 hover:bg-gray-500/5`}>
                                      <td className={`py-3 pl-4 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.title}</td>
                                      <td className="text-gray-500">{item.type} / {item.category}</td>
                                      <td className="text-gray-500">{item.location}</td>
                                      <td className="text-right pr-4">
                                           <button className="text-red-500 hover:text-red-700"><Trash2 size={18}/></button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
             </div>
          )}
      </div>
    </div>
  );
};