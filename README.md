Front end :)
## 🛠 Backend Spec

Bu proje gerçek bir API üzerinden çalışacak şekilde yapılandırılmıştır. Backend geliştiricisi için gerekli tüm teknik detaylar `BACKEND_SPEC_V3_4.md` dosyasında mevcuttur. diğer detaylar promptta verilecektir.

**API Bağlantısı**: `.env` dosyasında `VITE_API_URL` değişkenini backend adresinize göre ayarlayın.
Örn: `VITE_API_URL=https://api.diesgayrimenkul.com`

## 💎 Temel Özellikler
- **Gerçek Zamanlı Veri**: Artık mock data içermez, tüm veriler API üzerinden gelir.
- **Smart Navbar**: Logo ve menü öğeleri en uygun görsel dengede gruplandırıldı.
- **WebP Sıkıştırma**: Yüklenen tüm görseller %75 kalite ile istemci tarafında optimize edilir.
- **Hata Yönetimi**: API 404/500 hataları için zarif boş-stateler ve mesajlar.
- **Admin Kontrolü**: Kullanıcı şifrelerini güvenli bir şekilde sıfırlama ve rol yönetimi.
