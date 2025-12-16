
# DİES GAYRİMENKUL - FULL STACK PHP & MYSQL ENTEGRASYON KILAVUZU (V3 - GÜNCEL)

Bu doküman, React Frontend mimarisinde yapılan son güncellemelerle (Arsa/Ticari kategori mantığı, Profil düzenleme, Toplu işlemler) tam uyumlu veritabanı şemasını ve API uç noktalarını içerir.

---

## BÖLÜM 1: MYSQL VERİTABANI ŞEMASI (Schema)

Aşağıdaki SQL tabloları, `types.ts` dosyasındaki veri tiplerini ve yeni eklenen alanları karşılayacak şekilde tasarlanmıştır.

### 1. Kullanıcılar (`users`)
Sisteme giriş yapan herkes (Admin, Danışman, Normal Üye) bu tabloda tutulur.
*   `id` (INT, PK, AI)
*   `name` (VARCHAR)
*   `email` (VARCHAR, Unique)
*   `password_hash` (VARCHAR)
*   `phone` (VARCHAR)
*   `role` (ENUM: 'admin', 'advisor', 'user')
*   `image` (VARCHAR) - Profil fotoğrafı URL
*   `instagram` (VARCHAR) - *Yeni*
*   `facebook` (VARCHAR) - *Yeni*
*   `created_at` (DATETIME)

### 2. Danışman Detayları (`advisors`)
Rolü 'advisor' olan kullanıcıların ekstra bilgilerini tutar. `users` tablosu ile 1-1 ilişkilidir.
*   `user_id` (INT, FK -> users.id)
*   `is_founder` (BOOLEAN) - Kurucu ortak mı?
*   `about` (TEXT) - Biyografi (*Frontend'de güncellenebilir*)
*   `specializations` (JSON) - Örn: ["Ticari", "Lüks Konut"] (*Frontend'de güncellenebilir*)
*   `sahibinden_link` (VARCHAR)
*   `experience_years` (INT)
*   `total_sales` (INT)

### 3. Ofisler (`offices`)
*   `id` (INT, PK, AI)
*   `name` (VARCHAR)
*   `city` (VARCHAR)
*   `district` (VARCHAR)
*   `address` (TEXT)
*   `phone` (VARCHAR)
*   `phone2` (VARCHAR) - *Yeni*
*   `whatsapp` (VARCHAR)
*   `working_hours` (VARCHAR)
*   `location_url` (VARCHAR) - Google Maps Linki
*   `is_headquarters` (BOOLEAN)
*   `image` (VARCHAR) - Ana resim (*Upload entegrasyonu*)
*   `gallery` (JSON) - Diğer resimler
*   `description` (TEXT) - *Yeni*

### 4. Konum Veritabanı (`locations`)
İl/İlçe/Mahalle hiyerarşisi.
*   **`cities`**: `id`, `name`
*   **`districts`**: `id`, `city_id`, `name`
*   **`neighborhoods`**: `id`, `district_id`, `name`

### 5. Gayrimenkuller (`properties`)
Frontend `CreateListing.tsx` formundaki dinamik yapıya (Kategori değişimi) uyumlu olmalıdır.
*   `id` (INT, PK, AI)
*   `advisor_id` (INT, FK -> users.id)
*   `title` (VARCHAR)
*   `description` (TEXT)
*   `price` (DECIMAL)
*   `currency` (ENUM: 'TL', 'USD', 'EUR')
*   **Konum:**
    *   `province` (VARCHAR)
    *   `district` (VARCHAR)
    *   `neighborhood` (VARCHAR)
    *   `location_display` (VARCHAR) - Örn: "Batman, Gültepe"
*   **Kategorizasyon:**
    *   `category` (ENUM: 'Konut', 'Ticari', 'Arsa')
    *   `type` (ENUM: 'Satılık', 'Kiralık', 'Satıldı', 'Kiralandı', 'pending')
*   **Detaylar (NULLABLE OLMALI - Arsa/Ticari için boş gelebilir):**
    *   `bedrooms` (VARCHAR, NULLABLE) - Örn: "3+1" (Sadece Konut/Ticari)
    *   `bathrooms` (INT, NULLABLE) - (Sadece Konut)
    *   `area_gross` (INT) - Brüt m² (Hepsi için zorunlu)
    *   `area_net` (INT) - Net m² (*Yeni Alan*)
    *   `building_age` (VARCHAR, NULLABLE) - (Sadece Konut/Ticari)
    *   `heating_type` (VARCHAR, NULLABLE) - (Sadece Konut/Ticari)
    *   `floor_location` (VARCHAR, NULLABLE)
    *   `total_floors` (INT, NULLABLE)
    *   `balcony_count` (INT, NULLABLE)
    *   `is_furnished` (BOOLEAN, NULLABLE) - Eşyalı mı?
    *   `is_in_complex` (BOOLEAN, NULLABLE)
    *   `has_balcony` (BOOLEAN, NULLABLE)
*   **Medya & Linkler:**
    *   `image` (VARCHAR) - Kapak resmi
    *   `images` (JSON) - Tüm resimlerin URL dizisi
    *   `sahibinden_link` (VARCHAR) - *Yeni*
*   `features` (JSON) - Seçilen özellikler dizisi Örn: ["Asansör", "İmarlı"]
*   `created_at` (DATETIME)
*   `is_featured` (BOOLEAN) - Anasayfa vitrin için

### 6. Başvurular (`applications`)
*   `id` (INT, PK, AI)
*   `type` (ENUM: 'advisor', 'office')
*   `first_name` (VARCHAR)
*   `last_name` (VARCHAR)
*   `email` (VARCHAR)
*   `phone` (VARCHAR)
*   `city` (VARCHAR)
*   `status` (ENUM: 'pending', 'approved', 'rejected')
*   `details` (JSON) - Eğitim durumu, bütçe, meslek, ek notlar vb.
*   `created_at` (DATETIME)

---

## BÖLÜM 2: PHP API ENDPOINT YAPISI

API istekleri `services/api.ts` dosyasına göre yapılandırılmıştır.

### 1. Auth (`api_auth.php`)
*   `?action=login` (POST): Email ve şifre alır. Başarılıysa `{ user: {...}, token: "..." }` döner.
*   `?action=register` (POST): Yeni kullanıcı oluşturur.
*   `?action=me` (GET): Token ile kullanıcı detayını döner.
*   **`?action=update_profile` (POST):** *YENİ*
    *   `Profile.tsx` sayfasından gelen istektir.
    *   Parametreler: `id`, `name`, `phone`, `instagram`, `facebook`, `about`, `specializations` (array), `image` (url).
    *   Hem `users` tablosunu hem de varsa `advisors` tablosunu güncellemelidir.

### 2. İlanlar (`api_properties.php`)
*   `?action=list` (GET):
    *   Parametreler: `status`, `type` (Konut/Arsa/Ticari), `minPrice`, `maxPrice`, `district`, `advisorId`, `is_featured`.
    *   **Not:** `advisorId` filtresi profil sayfasında danışmanın kendi ilanlarını listelemesi için kritiktir.
*   `?action=detail&id=ID` (GET): Tekil ilan detayı.
*   `?action=create` (POST): İlan oluşturur. Gelen veride `category` kontrol edilmeli, kategoriye göre boş gelen alanlar (`bedrooms` vb.) veritabanına `NULL` olarak kaydedilmelidir.
*   `?action=update` (POST):
    *   İlan günceller.
    *   Ayrıca **"Satıldı Olarak İşaretle"** özelliği için sadece `type` alanını güncelleyen istekleri de karşılamalıdır.
*   `?action=delete` (POST): İlan siler. Frontend'de çoklu silme işlemi döngü içinde bu ucu çağırarak yapılır.

### 3. Konumlar (`api_locations.php`)
*   `?type=cities`: Tüm illeri döner.
*   `?type=districts&city_id=ID`: İle ait ilçeleri döner.
*   `?type=neighborhoods&district_id=ID`: İlçeye ait mahalleleri döner.

### 4. Dosya Yükleme (`api_upload.php`)
*   POST Method. `files[]` adında `FormData` alır.
*   Frontend, resimleri göndermeden önce tarayıcıda WebP formatına çevirip %80 kaliteye sıkıştırmaktadır.
*   Backend, gelen dosyayı olduğu gibi kaydedip URL'ini dönmelidir.
*   Dönüş Formatı: `{ "urls": ["http://site.com/uploads/dosya.webp", ...] }`

### 5. Admin Paneli (`api_admin.php`)
*   `?action=stats` (GET): İstatistikler.
*   `?action=pending_listings` (GET): Onay bekleyen ilanlar (`status='pending'`).
*   `?action=approve_listing` (POST): İlanı yayına alır.
*   `?action=reject_listing` (POST): İlanı reddeder.
*   `?action=users` (GET): Kullanıcıları listeler.
*   `?action=change_role` (POST): Kullanıcı rolünü (user/advisor/admin) değiştirir.
*   `?action=applications` (GET): Başvuruları listeler (`type` parametresine göre).
*   `?action=manage_application` (POST): Başvuru durumunu günceller (`approved`/`rejected`).

### 6. Ofis Yönetimi (`api_offices.php`)
*   `?action=list` (GET): Ofisleri listeler.
*   `?action=create` (POST): Yeni ofis ekler.
*   `?action=update` (POST): Ofis bilgilerini günceller.
*   `?action=delete` (POST): Ofisi siler.

---

## NOTLAR
1.  **CORS:** React uygulaması ile API iletişimi için `Access-Control-Allow-Origin: *` ve `Access-Control-Allow-Methods: GET, POST, OPTIONS` başlıkları eklenmelidir.
2.  **Veri Tutarlılığı:** `api_auth.php?action=me` çağrıldığında, eğer kullanıcı bir danışmansa (role='advisor'), `advisors` tablosundaki `about`, `specializations` gibi alanlar da `user` objesine merge edilerek (birleştirilerek) dönülmelidir.
