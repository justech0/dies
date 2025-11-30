# Kod Tabanı Analizi

## Sayfa ve Bölümler
- **Ana sayfa**: `pages/Home.tsx` kahraman alanı, öne çıkan ilanlar karuseli (`PropertyCard` bileşeniyle), kurucu ortaklar bölümü ve aksiyon çağrıları içerir.
- **İlan listesi**: `pages/Listings.tsx` (Vite/React rotası `/ilanlar`) PropertyCard bileşenini liste verisi için kullanır.
- **İlan detay**: `pages/ListingDetail.tsx` tek ilana ait görseller, danışman bilgisi ve öne çıkan hizmetler içerir.
- **İlan oluşturma**: `pages/CreateListing.tsx` çok görselli form, `/api/listings.php` POST çağrısı ve `/api/locations.php` GET çağrısı yapar.
- **Danışmanlar**: `pages/AdvisorDetail.tsx` ve `pages/AdvisorApplication.tsx` danışman profilleri ve başvuru akışını sunar.
- **Profil**: `pages/Profile.tsx` kullanıcı bilgileri ve `/api/listings.php?user_id=` sorgusunu kullanan ilan listesi bölümüne sahip.
- **Auth ekranı**: `App.tsx` içinde `Login` bileşeni `/api/auth.php` POST isteğiyle giriş/kayıt işlemleri için hazır form alanlarını sağlar.

## Kart Tasarımları
- **İlan kartı**: `components/PropertyCard.tsx` görsel, tip etiketi, fiyat ve danışman satırı dahil tüm HTML yapısını içerir.
- **Ofis/Danışman kartları**: Kurucu ekip ve danışman blokları `pages/Home.tsx` ve `pages/AdvisorDetail.tsx` içinde mevcut; ofisler `pages/Home.tsx` “Kurucu Ortaklar” ve diğer bölümler için benzer grid yapıları kullanır.

## Mimari Özet
- Arayüz, Vite tabanlı **React** SPA; Tailwind sınıflarıyla statik mock veriler (`services/mockData.ts`) üzerinden çalışıyor.
- Backend entegrasyonu için planlanan PHP API uçları `api/auth.php`, `api/listings.php`, `api/locations.php` gibi yollarla çağrılıyor fakat içerikleri boştaydı.

## Backend Genişletme Noktaları
- HTML/CSS tasarımına dokunmadan veri akışı için PHP uçları: `/api/auth.php` (giriş/kayıt), `/api/listings.php` (ilan CRUD), `/api/locations.php` (lokasyon veri kaynağı), `/api/stats.php` (özet istatistik).
- Rol bazlı panel sayfaları: `/admin/*`, `/consultant/*`, `/user/*` PHP şablonları ile oluşturuldu; mevcut SPA tasarımına paralel basit form/detay ekranları.
