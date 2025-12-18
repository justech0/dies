# Dies Gayrimenkul PHP API

Vite/React frontend tarafından tüketilen üretim seviyesinde PHP 8 + MySQL API.

## Kurulum
1. Gerekli paketleri yükleyin:
   ```bash
   cd api
   composer install
   ```
2. Ortam değişkenlerini ayarlayın:
   ```bash
   cp .env.example .env
   ```
   `DB_*`, `APP_URL`, `FRONTEND_URL`, `JWT_SECRET` ve opsiyonel SMTP bilgilerini doldurun.
3. Veritabanını hazırlayın:
   ```bash
   # Şema
   mysql -u <user> -p <db_name> < ../database/schema.sql
   # Lokasyon datası
   mysql -u <user> -p <db_name> < ../dies_locations_full.sql
   ```
4. Web sunucusunu `/api` altında çalışacak şekilde yapılandırın (Apache için `.htaccess` eklendi).
5. Yükleme klasörü izinlerini verin:
   ```bash
   mkdir -p api/uploads
   chmod -R 775 api/uploads
   ```

## Çalışma Mantığı
- API base: `{VITE_API_URL}/api` (frontend boşsa `/api`).
- Tüm yanıtlar JSON zarfında döner: `{ success: true|false, data|error }`.
- CORS ve preflight (OPTIONS) otomatik 200 döner.
- Kimlik doğrulama JWT (HS256) ile Bearer header üzerinden yapılır.
- Şifreler `password_hash/password_verify` ile tutulur.

## Önemli Bağımlılıklar
- `vlucas/phpdotenv` – ortam değişkenleri
- `firebase/php-jwt` – JWT
- `phpmailer/phpmailer` – SMTP (opsiyonel, yoksa sessiz geçer)

## Endpoint Özeti
- **Auth:** `POST /auth/login`, `POST /auth/register`, `GET /auth/me`, `POST /auth/update-profile`, `POST /auth/forgot-password`, `POST /auth/reset-password`
- **Locations:** `GET /locations/cities`, `GET /locations/districts?city_id=`, `GET /locations/neighborhoods?district_id=`
- **Properties:** `GET /properties`, `GET /properties/:id`, `POST /properties` (JWT), `POST /properties/:id` (JWT), `DELETE /properties/:id` (JWT)
- **Upload:** `POST /upload` (JWT, multipart)
- **Admin:** `GET /admin/stats`, `GET /admin/properties/pending`, `POST /admin/properties/:id/approve`, `POST /admin/properties/:id/reject`, `GET /admin/users`, `POST /admin/users/:id/role`, `POST /admin/users/:id/reset-password`, `GET /admin/applications`, `POST /admin/applications/:id`
- **Advisors:** `GET /advisors`, `GET /advisors/:id`
- **Offices:** `GET /offices`, `POST /offices` (admin), `POST /offices/:id` (admin), `DELETE /offices/:id` (admin)
- **Applications:** `POST /applications/advisor`, `POST /applications/office`

## Kabul Kriterleri
- JWT ile register/login/me akışı çalışır.
- İlan ekleme: user → pending, advisor/admin → approved.
- Admin pending onay/red uçları çalışır.
- Listing state güncellemesi frontend’de `type` alanına yansır (Satıldı/Kiralandı/pending).
- Lokasyon uçları `dies_locations_full.sql` yüklemesi ile çalışır ve cache header içerir.
- Upload MIME/size kontrolleri 5MB limitli, sonuç URL’leri `/api/uploads/YYYY/MM/...` olarak döner.
- Admin kullanıcı şifre sıfırlama uçları yeni şifre döndürür.
- Forgot/reset password akışı token tablosu üzerinden işler (mail opsiyonel).
