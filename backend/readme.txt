
# DİES GAYRİMENKUL - FULL STACK PHP & MYSQL ENTEGRASYON KILAVUZU

Bu doküman, React Frontend uygulamasını profesyonel bir PHP/MySQL Backend sistemine dönüştürmek için gerekli tüm adımları, veritabanı mimarisini ve API uç noktalarını detaylandırır.

---

## BÖLÜM 1: GELİŞMİŞ MYSQL VERİTABANI MİMARİSİ (Schema)

Sitenin dinamik çalışması için aşağıdaki tabloların oluşturulması gerekmektedir. Özellikle "Detaylı Filtreleme" ve "İlan Verme" kısımlarında Türkiye verileri (İl/İlçe/Mahalle) için ilişkisel tablo yapısı kullanılmalıdır.

### 1. Konum Veritabanı (Türkiye Verileri)
Statik JSON yerine, veritabanından dinamik çekilen yapı:
*   **`cities`** (iller):
    *   `id` (PK), `name` (örn: Batman, İstanbul), `plate_no` (örn: 72)
*   **`districts`** (ilçeler):
    *   `id` (PK), `city_id` (FK -> cities.id), `name` (örn: Merkez, Kozluk)
*   **`neighborhoods`** (mahalleler):
    *   `id` (PK), `district_id` (FK -> districts.id), `name` (örn: Kültür Mah, Belde Mah)

### 2. Kullanıcılar ve Yetkilendirme
*   **`users`**:
    *   `id`, `name`, `email`, `password_hash`, `role` ('admin', 'advisor', 'user'), `phone`, `image_url`, `created_at`
*   **`advisors`** (Ekstra detaylar):
    *   `user_id` (FK), `about_text`, `specializations` (JSON), `total_sales_count`

### 3. Gayrimenkuller (İlanlar)
*   **`properties`**:
    *   `id`, `advisor_id` (FK -> users.id), `title`, `price`, `currency`, `category` (Konut/Ticari/Arsa), `type` (Satılık/Kiralık)
    *   `city_id` (FK), `district_id` (FK), `neighborhood_id` (FK) -> *Konum tablosuna bağlı*
    *   `bedrooms`, `bathrooms`, `area_gross`, `area_net`, `building_age`, `heating_type`, `floor_location`
    *   `description`, `features` (JSON olarak saklanabilir: ["Balkon", "Asansör"]), `status` ('pending', 'active', 'sold', 'rejected')
    *   `created_at`, `updated_at`

### 4. Medya
*   **`property_images`**:
    *   `id`, `property_id` (FK), `image_url`, `is_cover` (Boolean), `sort_order`

### 5. Başvurular ve Diğerleri
*   **`applications`**: `id`, `type` ('advisor_application', 'office_application'), `name`, `phone`, `details` (JSON), `status`
*   **`offices`**: `id`, `name`, `city`, `address`, `phone`, `coordinates`
*   **`settings`**: `key` (örn: 'hero_title'), `value`

---

## BÖLÜM 2: PHP API DOSYALARI VE İŞLEVLERİ

Backend klasörü (`/api/`) altında oluşturulması gereken dosyalar ve içermesi gereken kod mantığı:

### A. Bağlantı ve Yardımcılar
1.  **`db.php`**: PDO kullanarak MySQL bağlantısını sağlar. CORS header'larını ayarlar (React'in erişimi için).
2.  **`functions.php`**: Güvenlik (Input sanitization), JWT Token doğrulama, JSON yanıt formatlama fonksiyonları.

### B. Konum Servisi (Detaylı Filtreleme İçin)
**Dosya:** `api_locations.php`
*   **GET /?type=cities**: `SELECT * FROM cities` döndürür. (İlan ver/Filtrele ili doldurur)
*   **GET /?type=districts&city_id=X**: Seçilen ile ait ilçeleri döndürür.
*   **GET /?type=neighborhoods&district_id=Y**: Seçilen ilçeye ait mahalleleri döndürür.

### C. İlan Yönetimi (İlan Ver & Listeleme)
**Dosya:** `api_properties.php`
*   **GET /list**:
    *   Parametreler: `?city=X&min_price=Y&room=Z...`
    *   SQL Mantığı: Gelen parametrelere göre dinamik `WHERE` sorgusu oluşturur. Sadece `status='active'` olanları çeker.
    *   Response: İlan listesi + kapak fotoğrafı + danışman adı.
*   **GET /detail?id=X**: İlanın tüm detaylarını, tüm resimlerini (`property_images` tablosundan) ve danışman iletişim bilgilerini çeker.
*   **POST /create**:
    *   React'tan gelen JSON verisini ve `features` dizisini alır.
    *   `properties` tablosuna ekler.
    *   Eğer kullanıcı 'admin' değilse `status` varsayılan olarak `'pending'` (Onay Bekliyor) olur.
*   **POST /update**: İlanı günceller.
*   **POST /delete**: İlanı siler (Soft delete önerilir: `is_deleted=1`).

### D. Dosya Yükleme (Resimler)
**Dosya:** `api_upload.php`
*   React `CreateListing.tsx` sayfasından gelen `FormData` (files[]) verisini karşılar.
*   Dosyaları sunucuda `/uploads/properties/` klasörüne benzersiz isimle kaydeder.
*   Geriye dosya URL'lerini JSON dizisi olarak döndürür.

### E. Admin Paneli (AdminDashboard)
**Dosya:** `api_admin.php` (Mutlaka Admin Token kontrolü yapılmalı)
*   **GET /dashboard-stats**:
    *   Toplam Üye, Yayındaki İlan, Bekleyen İlan sayılarını tek sorguda döndürür.
*   **GET /pending-listings**: `WHERE status = 'pending'` olan ilanları çeker.
*   **POST /approve-listing**: İlanın durumunu `'active'` yapar.
*   **POST /reject-listing**: İlanı reddeder veya siler.
*   **GET /users**: Tüm üyeleri listeler.
*   **POST /change-role**: Kullanıcıyı 'user' -> 'advisor' veya 'admin' yapar.

### F. Kimlik Doğrulama (Auth)
**Dosya:** `api_auth.php`
*   **POST /login**: Email/Şifre kontrolü. Başarılıysa User bilgisi ve Token döner.
*   **POST /register**: Yeni kayıt. Şifre `password_hash` ile şifrelenmeli.
*   **GET /me**: Token gönderildiğinde kullanıcının güncel bilgilerini döner.

---

## BÖLÜM 3: REACT FRONTEND ENTEGRASYONU (Yapılacaklar)

Backend hazırlandıktan sonra React tarafında yapılması gereken değişiklikler:

1.  **AdvancedFilter.tsx ve CreateListing.tsx:**
    *   `MOCK_DATA` kullanımı kaldırılacak.
    *   `useEffect` içinde `fetch('api/api_locations.php?type=cities')` çağrılacak.
    *   İl seçilince `api_locations.php?type=districts&city_id=...` çağrılıp ilçe dropdown'ı doldurulacak.

2.  **Home.tsx ve Listings.tsx:**
    *   İlanlar `fetch('api/api_properties.php')` ile çekilecek.

3.  **AdminDashboard.tsx:**
    *   Onay bekleyen ilanlar `api_admin.php` üzerinden çekilecek.
    *   "Onayla" butonu API'ye `POST` isteği atacak.

4.  **Resim Yükleme:**
    *   `CreateListing.tsx` içindeki dosya yükleme fonksiyonu, dosyaları doğrudan `api_upload.php` adresine POST etmeli ve dönen URL'leri form verisine eklemelidir.

---

Bu yapı, Dies Gayrimenkul'ü ölçeklenebilir, güvenli ve tamamen yönetilebilir bir platform haline getirecektir.
