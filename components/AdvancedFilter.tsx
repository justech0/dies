
import React, { useState } from 'react';
import { Filter, Search, RotateCcw } from 'lucide-react';
import { TURKEY_LOCATIONS } from '../services/mockData';

interface FilterProps {
  onFilter: (filters: any) => void;
}

export const AdvancedFilter: React.FC<FilterProps> = ({ onFilter }) => {
  const initialFilters = {
    status: 'Tümü',
    type: 'Tümü',
    province: '',
    district: '',
    neighborhood: '',
    minPrice: '',
    maxPrice: '',
    roomCount: 'Tümü',
    minArea: '',
    maxArea: '',
    heatingType: 'Tümü',
    buildingAge: 'Tümü',
    isFurnished: 'Tümü'
  };

  const [filters, setFilters] = useState(initialFilters);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'province') {
        setFilters({ ...filters, province: value, district: '', neighborhood: '' });
    } else if (name === 'district') {
        setFilters({ ...filters, district: value, neighborhood: '' });
    } else {
        setFilters({ ...filters, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(filters);
  };

  const handleClear = () => {
    setFilters(initialFilters);
    onFilter(initialFilters);
  };

  const inputClass = "w-full p-3 rounded-lg border border-gray-200 bg-gray-50 text-dies-dark font-medium placeholder-gray-400 focus:ring-2 focus:ring-dies-blue focus:bg-white focus:border-transparent outline-none transition-all";
  const labelClass = "block text-xs font-bold uppercase tracking-wider mb-2 text-dies-slate";

  const districts = filters.province ? Object.keys(TURKEY_LOCATIONS[filters.province] || {}) : [];
  const neighborhoods = (filters.province && filters.district) 
    ? TURKEY_LOCATIONS[filters.province][filters.district] 
    : [];

  return (
    <form onSubmit={handleSubmit} className="p-5 md:p-8 rounded-3xl shadow-soft bg-white border border-gray-100">
      <div className="flex items-center gap-2 mb-6 md:mb-8 pb-4 border-b border-gray-100">
        <div className="p-2 bg-blue-50 rounded-lg text-dies-blue"><Filter size={20} /></div>
        <h3 className="font-bold text-xl text-dies-dark">Detaylı Filtreleme</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div>
            <label className={labelClass}>İlan Durumu</label>
            <select name="status" value={filters.status} onChange={handleChange} className={inputClass}>
                <option value="Tümü">Tümü</option>
                <option value="Satılık">Satılık</option>
                <option value="Kiralık">Kiralık</option>
                <option value="Satıldı">Satıldı</option>
                <option value="Kiralandı">Kiralandı</option>
            </select>
        </div>
        <div>
            <label className={labelClass}>Gayrimenkul Tipi</label>
            <select name="type" value={filters.type} onChange={handleChange} className={inputClass}>
                <option value="Tümü">Tümü</option>
                <option value="Konut">Konut</option>
                <option value="Ticari">Ticari</option>
                <option value="Arsa">Arsa</option>
            </select>
        </div>
        <div>
            <label className={labelClass}>Oda Sayısı</label>
            <select name="roomCount" value={filters.roomCount} onChange={handleChange} className={inputClass}>
                <option value="Tümü">Tümü</option>
                <option value="1+0">1+0 (Stüdyo)</option>
                <option value="1+1">1+1</option>
                <option value="2+0">2+0</option>
                <option value="2+1">2+1</option>
                <option value="3+1">3+1</option>
                <option value="4+1">4+1</option>
                <option value="5+1">5+1 ve üzeri</option>
            </select>
        </div>
        <div>
            <label className={labelClass}>Eşyalı</label>
            <select name="isFurnished" value={filters.isFurnished} onChange={handleChange} className={inputClass}>
                <option value="Tümü">Tümü</option>
                <option value="Evet">Evet</option>
                <option value="Hayır">Hayır</option>
            </select>
        </div>

        <div>
            <label className={labelClass}>İl</label>
            <select name="province" value={filters.province} onChange={handleChange} className={inputClass}>
                <option value="">İl Seçiniz</option>
                {Object.keys(TURKEY_LOCATIONS).map(city => (
                    <option key={city} value={city}>{city}</option>
                ))}
            </select>
        </div>
        <div>
            <label className={labelClass}>İlçe</label>
            <select name="district" value={filters.district} onChange={handleChange} className={inputClass} disabled={!filters.province}>
                <option value="">İlçe Seçiniz</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
        </div>
        <div>
            <label className={labelClass}>Mahalle</label>
            <select name="neighborhood" value={filters.neighborhood} onChange={handleChange} className={inputClass} disabled={!filters.district}>
                <option value="">Mahalle Seçiniz</option>
                {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
        </div>
        <div>
            <label className={labelClass}>Isınma Tipi</label>
            <select name="heatingType" value={filters.heatingType} onChange={handleChange} className={inputClass}>
                <option value="Tümü">Tümü</option>
                <option value="Kombi">Doğalgaz (Kombi)</option>
                <option value="Merkezi">Merkezi Sistem</option>
                <option value="Yerden">Yerden Isıtma</option>
                <option value="Klima">Klima</option>
                <option value="Soba">Soba</option>
            </select>
        </div>

        <div className="lg:col-span-2">
            <label className={labelClass}>Fiyat Aralığı (TL)</label>
            <div className="flex flex-col sm:flex-row gap-3">
                <input type="number" name="minPrice" value={filters.minPrice} onChange={handleChange} placeholder="Min" className={inputClass} />
                <input type="number" name="maxPrice" value={filters.maxPrice} onChange={handleChange} placeholder="Max" className={inputClass} />
            </div>
        </div>
         <div className="lg:col-span-2">
            <label className={labelClass}>Metrekare (m²)</label>
            <div className="flex flex-col sm:flex-row gap-3">
                <input type="number" name="minArea" value={filters.minArea} onChange={handleChange} placeholder="Min" className={inputClass} />
                <input type="number" name="maxArea" value={filters.maxArea} onChange={handleChange} placeholder="Max" className={inputClass} />
            </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4">
        <button 
            type="button"
            onClick={handleClear}
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 px-6 py-4 rounded-xl font-bold transition-all w-full sm:w-auto"
        >
            <RotateCcw size={20} />
            Temizle
        </button>
        <button 
            type="submit" 
            className="flex items-center justify-center gap-2 bg-dies-red hover:bg-red-700 text-white px-10 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl w-full sm:w-auto"
        >
            <Search size={20} />
            Sonuçları Göster
        </button>
      </div>
    </form>
  );
};
