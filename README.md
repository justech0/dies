
# Dies Gayrimenkul Platformu (V3.3)

Batman'ın öncü gayrimenkul danışmanlık platformu.

## 🚀 Başlangıç

### Gereksinimler
- Node.js (v18+)
- PHP (v8.1+) (Backend için)
- MySQL

### Kurulum

1. **Frontend**:
   ```bash
   npm install
   ```

2. **Çalıştırma**:
   ```bash
   npm run dev
   ```

3. **Build**:
   ```bash
   npm run build
   ```

## 🛠 Backend Entegrasyonu

Bu proje gerçek bir API üzerinden çalışacak şekilde yapılandırılmıştır. Backend geliştiricisi (Codex) için gerekli tüm teknik detaylar `BACKEND_SPEC_V3_3.md` dosyasında mevcuttur.

**Önemli**: `.env` dosyasında `VITE_API_URL` değişkenini backend adresinize göre ayarlayın.
Örn: `VITE_API_URL=http://localhost:8000`

## 💎 Özellikler
- **WebP Sıkıştırma**: Tüm yüklenen görseller frontend tarafında %75 kalite ile WebP formatına dönüştürülür.
- **Admin Kontrolü**: İlan onay süreci, kullanıcı rol yönetimi ve admin tarafından şifre sıfırlama.
- **Mobil Uyumlu**: Tamamen responsive tasarım.
- **Filtreleme**: İl/İlçe/Mahalle bazlı gelişmiş arama.
