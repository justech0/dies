
# DİES GAYRİMENKUL - FULL STACK PHP ENTEGRASYON REHBERİ

Bu rehber, React (Frontend) uygulamasını gerçek bir MySQL veritabanına ve PHP Backend sistemine bağlamak için yapılması gereken tüm adımları ve yazılması gereken kod parçacıklarını içerir.

Sistem tamamen birbirine bağlı (Relational) çalışacak şekilde tasarlanmalıdır.

---

## 1. VERİTABANI YAPISI (SQL)
İlk olarak `schema.sql` dosyasını oluşturup phpMyAdmin'de import etmelisiniz. Tablolar birbirine `Foreign Key` ile bağlı olmalıdır.

*   **users:** (id, name, email, password_hash, role, phone, image, created_at)
*   **properties:** (id, title, price, ... , advisor_id [FK->users.id], status ['pending','active'], created_at)
*   **property_images:** (id, property_id [FK], image_url, is_cover) -> Çoklu resim için.
*   **offices:** (id, name, city, district, ...)
*   **applications:** (id, type ['advisor','office'], name, phone, status, ...)
*   **site_settings:** (id, key, value) -> Hero resmi, vitrin ayarları vb.

---

## 2. GEREKLİ PHP API DOSYALARI VE İŞLEVLERİ

Aşağıdaki dosyaları `backend/api/` klasörü altında oluşturmalısınız.

### A. Genel Ayarlar
*   **`config.php`**: Veritabanı bağlantısı (PDO) ve CORS ayarlarını (React ile iletişim için) içerir.
*   **`utils.php`**: Ortak fonksiyonlar (JSON response formatlama, Güvenlik/Sanitization fonksiyonları).

### B. Kimlik Doğrulama (Auth) & Profil
**Dosya:** `api_auth.php`
1.  **POST /login**: E-posta ve şifreyi kontrol et. Başarılıysa User objesini ve (opsiyonel) JWT token döndür.
2.  **POST /register**: Yeni kullanıcı kaydı. Şifreyi `password_hash()` ile şifrele. Varsayılan rol: 'user'.
3.  **POST /update-profile**: 
    *   Kullanıcının kendi bilgilerini güncellemesi.
    *   Şifre değişimi varsa yeniden hashle.
    *   Profil resmi yüklenirse `api_upload.php` ile işle ve URL'i kaydet.

### C. İlan Yönetimi (Properties)
**Dosya:** `api_properties.php`
1.  **GET /list**: 
    *   Tüm onaylı (`status='active'`) ilanları çek.
    *   Filtreleme parametrelerini (il, ilçe, fiyat aralığı, oda sayısı) SQL `WHERE` koşullarına ekle.
    *   İlişkili `advisor_id` üzerinden kullanıcı verisini `JOIN` ile çek.
2.  **GET /detail?id=X**: Tek bir ilanın tüm detaylarını, resimlerini ve danışman bilgisini çek.
3.  **POST /create**: 
    *   Yeni ilan ekle.
    *   Eğer ekleyen `role='user'` ise `status='pending'` (Onay Bekliyor) yap.
    *   Eğer ekleyen `admin` veya `advisor` ise `status='active'` yap.
    *   Çoklu resim yollarını `property_images` tablosuna kaydet.
4.  **POST /update**: İlanı güncelle (Sadece ilanın sahibi veya Admin yapabilir).
5.  **POST /delete**: İlanı sil (Sadece ilanın sahibi veya Admin yapabilir).

### D. Dosya Yükleme Servisi (Önemli)
**Dosya:** `api_upload.php`
1.  React'tan gelen `FormData` (resim dosyaları) verisini al.
2.  Dosyayı sunucuda `uploads/` klasörüne taşı.
3.  Dosya adını benzersiz yap (örn: `uniqid() . '.jpg'`).
4.  Geriye dosyanın tam URL'ini döndür (örn: `https://site.com/uploads/resim123.jpg`).
*   *Not:* İlan ekleme ve Profil resmi güncelleme sayfaları bu servisi kullanacak.

### E. Admin Paneli & Yönetim
**Dosya:** `api_admin.php` (Sadece Admin yetkisi ile erişilebilir olmalı)
1.  **GET /stats**: Dashboard'daki sayaçlar (Toplam üye, bekleyen ilan, toplam satış vb.) için `COUNT` sorguları.
2.  **GET /users**: Tüm kullanıcıları listele.
3.  **POST /update-user-role**: Bir kullanıcının rolünü (User <-> Advisor <-> Admin) değiştir. Rol `advisor` olunca `advisors` tablosuna (veya user detaylarına) ekleme yap.
4.  **GET /pending-properties**: Onay bekleyen (`status='pending'`) ilanları listele.
5.  **POST /approve-property**: İlanın durumunu `active` yap.
6.  **POST /reject-property**: İlanı sil veya durumunu `rejected` yap.
7.  **GET /applications**: Ofis ve Danışman başvurularını listele.
8.  **POST /manage-application**: Başvuruyu onayla/reddet.

### F. Ofisler ve Danışmanlar
**Dosya:** `api_offices.php`
*   CRUD işlemleri (Ekle, Listele, Düzenle, Sil).
*   Ofis resimleri için `api_upload.php` entegrasyonu.

**Dosya:** `api_advisors.php`
*   **GET /list**: Rolü `advisor` olan kullanıcıları ve istatistiklerini çek.
*   **GET /detail**: Danışmanın detaylarını ve ona ait ilanları (`properties` tablosundan) çek.

### G. Site Ayarları
**Dosya:** `api_settings.php`
*   Hero görseli, başlık, vitrin ilanlarının ID'leri gibi ayarları veritabanından okuma ve yazma (Admin only).

---

## 3. REACT ENTEGRASYONU (FRONTEND)

Backend hazır olduktan sonra React tarafında `services/mockData.ts` yerine gerçek API çağrıları yazılmalıdır.

**Örnek: İlan Ekleme (CreateListing.tsx)**
```javascript
const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Önce Resimleri Yükle
    const formDataImages = new FormData();
    images.forEach(img => formDataImages.append('files[]', img));
    
    const uploadRes = await fetch('api/api_upload.php', { method: 'POST', body: formDataImages });
    const uploadedUrls = await uploadRes.json(); // ['url1.jpg', 'url2.jpg']

    // 2. İlan Verisini Gönder
    const propertyData = {
        title: form.title,
        price: form.price,
        images: uploadedUrls,
        advisorId: user.id, // AuthContext'ten gelen ID
        ...diğerAlanlar
    };

    const res = await fetch('api/api_properties.php?action=create', {
        method: 'POST',
        body: JSON.stringify(propertyData)
    });
    
    if(res.ok) alert("İlan eklendi!");
};
```

**Örnek: Profil ve İlanlarım İlişkisi**
*   `Profile.tsx` sayfasında `useEffect` ile `api_properties.php?advisor_id={user.id}` isteği atarak, sadece giriş yapan kullanıcının ilanlarını listelemelisiniz.

---

Bu yapı kurulduğunda siteniz tamamen dinamik, veritabanı destekli ve yönetim paneli üzerinden yönetilebilir profesyonel bir Emlak platformu olacaktır.
