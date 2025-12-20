# Dies Gayrimenkul PHP API

Bu klasör, Vite/React frontend'i bozmadan `/api` altında çalışan PHP 8 + MySQL API uygulamasıdır.

## Kurulum
1. `cd api`
2. `cp .env.example .env` dosyasını doldurun (DB_HOST / DB_NAME / DB_USER / DB_PASS / JWT_SECRET zorunlu). Yanlış env anahtarları bağlantıyı kırar.
3. Tek veritabanı kurulumu: boş bir MySQL veritabanı oluşturun ve `database/dies_full_schema_with_locations.sql` dosyasını phpMyAdmin veya mysql CLI ile içe aktarın. Ek bir `schema.sql`/`database.sql` **kullanmayın**; eski dosyalar kaldırıldı. Şema güncellemesi gerekiyorsa `api/database_patch_v3_4.sql` dosyasını çalıştırın (deleted_at, currency, founder vb. alanlar eklenir).
4. Üretim kurulumu için vendor klasörünü oluşturun:
   ```bash
   cd api
   composer install --no-dev --optimize-autoloader
   ```
   - Hostinger gibi composer olmayan ortamlarda vendor'ı lokalde oluşturup `api/vendor` klasörünü sunucuya yükleyebilirsiniz.
   - `vendor` yoksa API 500 döndürür.
5. `uploads` klasörünün yazılabilir olduğundan emin olun; yoksa uygulama ilk açılışta otomatik oluşturur. `api/error.txt` de yazılabilir olmalıdır.
6. Web sunucusu kuralları:
   - Kök `.htaccess`: `/api` isteklerini bypass edip diğer her şeyi `index.html`'e yönlendirir (SPA fallback).
   - `api/.htaccess`: gerçek dosyaları (uploads vb.) hariç tüm istekleri `api/index.php`'ye yönlendirir ve Authorization header'ını PHP'ye taşır.

## Önemli Yol Notu
Frontend `VITE_API_URL + /api` kullanır. Router şu sırayla davranır:
- `REQUEST_URI` içindeki query string temizlenir.
- Başındaki `/api` prefix'i çıkarılır.
- Kalan path router'a verilir. Yanlış strip işlemi 404/500 hatalarına yol açar.

## CORS
`FRONTEND_URL` tanımlıysa sadece o origin'e izin verilir; yoksa `*` döner. Preflight istekler 200 döner.

> Öneri: FRONTEND_URL değerini mutlaka ayarlayın (örn. `https://domain.com`) ve Vite tarafında `VITE_API_URL` = aynı domain.

## Loglama
Hatalar `api/error.txt` dosyasına `[timestamp] request_id method path user_id message stack` formatında yazılır. Token gibi hassas veriler maskeleme ile korunur.

## Varsayılan Yönetici
SQL seed içerisinde `admin@dies.local / admin123` kullanıcısı bulunur. Üretimde bu şifreyi mutlaka değiştirin.

## Hızlı Sağlık Kontrolü
1) `https://domain.com/api/locations/cities` → JSON dönmeli.
2) `https://domain.com/api/auth/login` → POST bekler, 405 dönmez (route varlığı doğrulanır).
3) `.env` veya DB hatalı ise 500 + `api/error.txt` logu üretmeli (hata detaylarını logda, kullanıcıya JSON zarfta).
