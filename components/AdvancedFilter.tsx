
import React, { useState, useEffect } from 'react';
import { Filter, Search, RotateCcw, Home, MapPin, Building2, SquareStack, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';

interface FilterProps {
  onFilter: (filters: any) => void;
}

export const AdvancedFilter: React.FC<FilterProps> = ({ onFilter }) => {
  const [isExpanded, setIsExpanded] = useState(false);
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
    isFurnished: 'Tümü',
    floorLocation: 'Tümü',
    hasBalcony: 'Tümü'
  };

  const [filters, setFilters] = useState(initialFilters);
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);

  useEffect(() => {
      api.locations.getCities().then(setCities).catch(console.error);
  }, []);

  useEffect(() => {
      if (filters.province) {
          const city = cities.find(c => c.name === filters.province || c.id.toString() === filters.province);
          if (city) {
              api.locations.getDistricts(city.id).then(setDistricts).catch(console.error);
          }
      } else {
          setDistricts([]);
      }
      setNeighborhoods([]);
  }, [filters.province, cities]);

  useEffect(() => {
      if (filters.district) {
          const dist = districts.find(d => d.name === filters.district || d.id.toString() === filters.district);
          if (dist) {
              api.locations.getNeighborhoods(dist.id).then(setNeighborhoods).catch(console.error);
          }
      } else {
          setNeighborhoods([]);
      }
  }, [filters.district, districts]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (e.target.type === 'number' && parseFloat(value) < 0) return;

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

  const inputClass = "w-full p-4 md:p-3 rounded-xl border border-gray-200 bg-gray-50 text-dies-dark font-semibold placeholder-gray-400 focus:ring-2 focus:ring-dies-blue focus:bg-white focus:border-transparent outline-none transition-all text-sm";
  const labelClass = "block text-[10px] md:text-[11px] font-black uppercase tracking-wider mb-2 text-dies-slate flex items-center gap-1.5";

  const floorOptions = ["Bodrum Kat", "Giriş Kat", "Bahçe Katı", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11-20", "21+"];

  return (
    <div className="w-full">
      {/* FILTER HEADER / BUTTON */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 md:p-6 bg-white rounded-2xl md:rounded-3xl shadow-soft border border-gray-100 group transition-all hover:shadow-md"
      >
        <div className="flex items-center gap-3 md:gap-4">
          <div className={`p-2.5 md:p-3 rounded-xl transition-all duration-300 ${isExpanded ? 'bg-dies-blue text-white' : 'bg-blue-50 text-dies-blue'}`}>
            <Filter size={20} className="md:w-6 md:h-6" />
          </div>
          <div className="text-left">
            <h3 className="font-black text-lg md:text-xl text-dies-dark tracking-tight leading-none mb-1">Detaylı Arama</h3>
            <p className="hidden md:block text-xs text-dies-slate font-medium">Hayalinizdeki gayrimenkulü filtreleyin</p>
            <p className="md:hidden text-[10px] text-dies-slate font-medium">Kriterlerinizi belirleyin</p>
          </div>
        </div>
        <div className="p-1.5 md:p-2 rounded-full bg-gray-50 text-gray-400 group-hover:bg-gray-100 transition-colors">
            {isExpanded ? <ChevronUp size={20} className="md:w-6 md:h-6" /> : <ChevronDown size={20} className="md:w-6 md:h-6" />}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.form 
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.4, ease: "circOut" }}
            onSubmit={handleSubmit} 
            className="overflow-hidden p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-xl bg-white border border-gray-100"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 md:gap-y-5">
              {/* Temel Bilgiler */}
              <div>
                  <label className={labelClass}><Home size={14}/> İlan Durumu</label>
                  <select name="status" value={filters.status} onChange={handleChange} className={inputClass}>
                      <option value="Tümü">Tümü</option>
                      <option value="Satılık">Satılık</option>
                      <option value="Kiralık">Kiralık</option>
                  </select>
              </div>
              <div>
                  <label className={labelClass}><Building2 size={14}/> Gayrimenkul Tipi</label>
                  <select name="type" value={filters.type} onChange={handleChange} className={inputClass}>
                      <option value="Tümü">Tümü</option>
                      <option value="Konut">Konut</option>
                      <option value="Ticari">Ticari</option>
                      <option value="Arsa">Arsa</option>
                  </select>
              </div>
              <div>
                  <label className={labelClass}><SquareStack size={14}/> Oda Sayısı</label>
                  <select name="roomCount" value={filters.roomCount} onChange={handleChange} className={inputClass}>
                      <option value="Tümü">Tümü</option>
                      <option value="1+0">1+0</option>
                      <option value="1+1">1+1</option>
                      <option value="2+1">2+1</option>
                      <option value="3+1">3+1</option>
                      <option value="4+1">4+1</option>
                      <option value="5+1 ve üzeri">5+1 ve üzeri</option>
                  </select>
              </div>
              <div>
                  <label className={labelClass}>Eşya Durumu</label>
                  <select name="isFurnished" value={filters.isFurnished} onChange={handleChange} className={inputClass}>
                      <option value="Tümü">Tümü</option>
                      <option value="Evet">Eşyalı</option>
                      <option value="Hayır">Eşyasız</option>
                  </select>
              </div>

              {/* Konum */}
              <div>
                  <label className={labelClass}><MapPin size={14}/> İl</label>
                  <select name="province" value={filters.province} onChange={handleChange} className={inputClass}>
                      <option value="">İl Seçiniz</option>
                      {cities.map(city => (
                          <option key={city.id} value={city.name}>{city.name}</option>
                      ))}
                  </select>
              </div>
              <div>
                  <label className={labelClass}>İlçe</label>
                  <select name="district" value={filters.district} onChange={handleChange} className={inputClass} disabled={!filters.province}>
                      <option value="">İlçe Seçiniz</option>
                      {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
              </div>
              <div>
                  <label className={labelClass}>Mahalle</label>
                  <select name="neighborhood" value={filters.neighborhood} onChange={handleChange} className={inputClass} disabled={!filters.district}>
                      <option value="">Mahalle Seçiniz</option>
                      {neighborhoods.map(n => <option key={n.id} value={n.name}>{n.name}</option>)}
                  </select>
              </div>
              <div>
                  <label className={labelClass}>Bulunduğu Kat</label>
                  <select name="floorLocation" value={filters.floorLocation} onChange={handleChange} className={inputClass}>
                      <option value="Tümü">Tümü</option>
                      {floorOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
              </div>

              {/* Teknik Özellikler */}
              <div>
                  <label className={labelClass}>Balkon</label>
                  <select name="hasBalcony" value={filters.hasBalcony} onChange={handleChange} className={inputClass}>
                      <option value="Tümü">Tümü</option>
                      <option value="Evet">Var</option>
                      <option value="Hayır">Yok</option>
                  </select>
              </div>
              <div>
                  <label className={labelClass}>Isınma</label>
                  <select name="heatingType" value={filters.heatingType} onChange={handleChange} className={inputClass}>
                      <option value="Tümü">Tümü</option>
                      <option value="Kombi">Kombi</option>
                      <option value="Merkezi">Merkezi</option>
                      <option value="Yerden">Yerden Isıtma</option>
                  </select>
              </div>

              <div className="sm:col-span-2">
                  <label className={labelClass}>Fiyat Aralığı (₺)</label>
                  <div className="flex gap-2 md:gap-3">
                      <input type="number" min="0" name="minPrice" value={filters.minPrice} onChange={handleChange} placeholder="Min" className={inputClass} />
                      <input type="number" min="0" name="maxPrice" value={filters.maxPrice} onChange={handleChange} placeholder="Max" className={inputClass} />
                  </div>
              </div>

              <div className="sm:col-span-2">
                  <label className={labelClass}>Metrekare (m²)</label>
                  <div className="flex gap-2 md:gap-3">
                      <input type="number" min="0" name="minArea" value={filters.minArea} onChange={handleChange} placeholder="Min" className={inputClass} />
                      <input type="number" min="0" name="maxArea" value={filters.maxArea} onChange={handleChange} placeholder="Max" className={inputClass} />
                  </div>
              </div>
            </div>

            <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-3 md:gap-4">
              <button 
                  type="submit" 
                  className="flex-grow order-1 sm:order-2 flex items-center justify-center gap-3 bg-dies-blue hover:bg-blue-900 text-white py-4 rounded-xl md:rounded-2xl font-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 uppercase tracking-widest text-xs md:text-sm"
              >
                  <Search size={18} className="md:w-5 md:h-5" /> İlanları Listele
              </button>
              <button 
                  type="button"
                  onClick={handleClear}
                  className="order-2 sm:order-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-500 py-4 px-6 md:px-8 rounded-xl md:rounded-2xl font-black transition-all uppercase tracking-widest text-xs md:text-sm"
              >
                  <RotateCcw size={16} className="md:w-[18px] md:h-[18px]" /> Temizle
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};
