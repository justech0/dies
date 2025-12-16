
# DİES GAYRİMENKUL - FULL STACK PHP & MYSQL ENTEGRASYON KILAVUZU (V2)

Bu doküman, güncellenen React Frontend mimarisine (%100 uyumlu) uygun olarak hazırlanmış veritabanı şemasını ve PHP API uç noktalarını içerir.

---

## BÖLÜM 1: MYSQL VERİTABANI ŞEMASI (Schema)

Aşağıdaki SQL tabloları, `types.ts` dosyasındaki veri tiplerini karşılayacak şekilde tasarlanmıştır.

### 1. Kullanıcılar ve Yetkilendirme (`users`)
Sisteme giriş yapan herkes (Admin, Danışman, Normal Üye) bu tabloda tutulur.
*   `id` (INT, PK, AI)
*   `name` (VARCHAR)
*   `email` (VARCHAR, Unique)
*   `password_hash` (VARCHAR)
*   `phone` (VARCHAR)
*   `role` (ENUM: 'admin', 'advisor', 'user')
*   `image` (VARCHAR) - Profil fotoğrafı URL
*   `social_instagram` (VARCHAR)
*   `social_facebook` (VARCHAR)
*   `created_at` (DATETIME)

### 2. Danışman Detayları (`advisors`)
Rolü 'advisor' olan kullanıcıların ekstra bilgilerini tutar. `users` tablosu ile 1-1 ilişkilidir.
*   `user_id` (INT, FK -> users.id)
*   `is_founder` (BOOLEAN) - Kurucu ortak mı?
*   `about` (TEXT) - Biyografi
*   `specializations` (JSON) - Örn: ["Ticari", "Lüks Konut"]
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
*   `phone2` (VARCHAR)
*   `whatsapp` (VARCHAR)
*   `working_hours` (VARCHAR)
*   `location_url` (VARCHAR) - Google Maps Linki
*   `is_headquarters` (BOOLEAN)
*   `image` (VARCHAR) - Ana resim
*   `gallery` (JSON) - Diğer resimler
*   `description` (TEXT)

### 4. Konum Veritabanı (`locations`)
İl/İlçe/Mahalle hiyerarşisi.
*   **`cities`**: `id`, `name`
*   **`districts`**: `id`, `city_id`, `name`
*   **`neighborhoods`**: `id`, `district_id`, `name`

### 5. Gayrimenkuller (`properties`)
Frontend `CreateListing` formuyla tam uyumlu yapı.
*   `id` (INT, PK, AI)
*   `advisor_id` (INT, FK -> users.id)
*   `title` (VARCHAR)
*   `description` (TEXT)
*   `price` (DECIMAL)
*   `currency` (ENUM: 'TL', 'USD', 'EUR')
*   **Konum:**
    *   `province` (VARCHAR) - Frontend şehir ismini gönderiyor
    *   `district` (VARCHAR)
    *   `neighborhood` (VARCHAR)
    *   `location_display` (VARCHAR) - Örn: "Batman, Gültepe"
*   **Kategorizasyon:**
    *   `category` (ENUM: 'Konut', 'Ticari', 'Arsa')
    *   `type` (ENUM: 'Satılık', 'Kiralık', 'Satıldı', 'Kiralandı', 'pending')
*   **Detaylar:**
    *   `bedrooms` (VARCHAR) - Örn: "3+1"
    *   `bathrooms` (INT)
    *   `area_gross` (INT)
    *   `area_net` (INT)
    *   `building_age` (VARCHAR) - Örn: "0", "1-5"
    *   `heating_type` (VARCHAR) - Örn: "Kombi", "Merkezi"
    *   `floor_location` (VARCHAR)
    *   `total_floors` (INT)
    *   `balcony_count` (INT)
    *   `is_furnished` (BOOLEAN)
    *   `is_in_complex` (BOOLEAN)
    *   `has_balcony` (BOOLEAN)
*   **Medya & Linkler:**
    *   `image` (VARCHAR) - Kapak resmi
    *   `images` (JSON) - Tüm resimlerin URL dizisi
    *   `sahibinden_link` (VARCHAR)
*   `features` (JSON) - Seçilen özellikler dizisi Örn: ["Asansör", "Otopark"]
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
*   `details` (JSON) - Başvuru tipine göre değişen diğer alanlar (eğitim, bütçe, meslek vb.)
*   `created_at` (DATETIME)

---

## BÖLÜM 2: PHP API ENDPOINT YAPISI

API istekleri `services/api.ts` dosyasına göre yapılandırılmıştır. Tüm istekler JSON formatında yanıt dönmelidir.

### 1. Auth (`api_auth.php`)
*   `?action=login` (POST): Email ve şifre alır. Başarılıysa `{ user: {...}, token: "..." }` döner.
*   `?action=register` (POST): Yeni kullanıcı oluşturur. Varsayılan rol 'user' olmalıdır.
*   `?action=me` (GET): Header'daki "Authorization: Bearer [token]" bilgisini okur ve kullanıcı detayını döner.

### 2. İlanlar (`api_properties.php`)
*   `?action=list` (GET):
    *   Filtreleri URL parametresi olarak alır: `status`, `type` (category), `minPrice`, `maxPrice`, `district`, `advisorId`, `is_featured`.
    *   **ÖNEMLİ:** Listeleme yaparken `users` tablosuyla JOIN işlemi yaparak `advisorName` ve `advisorImage` alanlarını da her ilan objesine eklemelidir.
*   `?action=detail&id=ID` (GET): Tekil ilan detayı.
*   `?action=create` (POST): İlan oluşturur. Eğer user role != admin ise `status` = 'pending' olmalıdır.
*   `?action=update` (POST): İlan günceller.
*   `?action=delete` (POST): İlan siler.

### 3. Konumlar (`api_locations.php`)
*   `?type=cities`: Tüm illeri döner.
*   `?type=districts&city_id=ID`: İle ait ilçeleri döner.
*   `?type=neighborhoods&district_id=ID`: İlçeye ait mahalleleri döner.

### 4. Dosya Yükleme (`api_upload.php`)
*   POST Method. `files[]` adında `FormData` alır.
*   Resimleri sunucuya kaydeder.
*   Dönüş Formatı: `{ "urls": ["http://site.com/uploads/resim1.jpg", ...] }`

### 5. Admin Paneli (`api_admin.php`)
Admin yetkisi kontrolü yapılmalıdır.
*   `?action=stats` (GET): `{ totalUsers, activeListings, pendingListings }` döner.
*   `?action=pending_listings` (GET): `status='pending'` olan ilanları döner.
*   `?action=approve_listing` (POST): İlanın statüsünü 'Satılık' veya 'Kiralık' (orijinal tipine göre) yapar.
*   `?action=reject_listing` (POST): İlanı siler veya reddedildi statüsüne çeker.
*   `?action=users` (GET): Tüm kullanıcıları listeler.
*   `?action=change_role` (POST): Kullanıcı rolünü günceller.

### 6. Başvurular (`api_applications.php`)
*   `?action=advisor_application` (POST): Danışmanlık başvurusunu `applications` tablosuna `type='advisor'` olarak ve detayları JSON içine gömerek kaydeder.
*   `?action=office_application` (POST): Ofis başvurusunu `applications` tablosuna `type='office'` olarak kaydeder.

### 7. Danışmanlar ve Ofisler
*   `api_advisors.php?action=list`: Rolü 'advisor' olan kullanıcıları ve 'advisors' tablosundaki detaylarını JOIN yaparak döner.
*   `api_offices.php?action=list`: Ofisleri listeler.

---

## NOTLAR
1.  **CORS:** React uygulaması farklı bir port veya domainden çalışıyorsa `Access-Control-Allow-Origin: *` header'ı eklenmelidir.
2.  **Resimler:** `Upload` işlemi sırasında resimlerin sıkıştırılması ve WebP formatına çevrilmesi performans için önerilir (Frontend bunu kısmen yapıyor ancak sunucu tarafı da desteklemelidir).
3.  **Güvenlik:** SQL Injection koruması için mutlaka PDO Prepared Statements kullanılmalıdır.
